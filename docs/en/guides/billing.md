# Billing

HomeCloud **Billing** is a first-class console service (`/console/billing`). The console **Billing Explorer** uses Cost Explorer–style analysis (date range, trend, by-service) with HomeCloud design — it is not an AWS UI clone.

The meter stores **quantities only**. Billing does `Usage × net USD catalog price = Charge`. VAT is a separate invoice line — never baked into SKU prices. Homelab still issues invoices. Card payment is **not** enabled — Mark paid is manual only.

**Compute** list prices come from the Compute catalog: provider wholesale → operator FX (EURUSD) → GTM markup in the **2×–4×** band (default **2×**). Machine hours use the **fulfilled Offering/SKU** (`offering_id`), snapshotted in USD. Other services (SO, MQ, Mail, …) may still use temporary placeholder rates until they have wholesale.

### Compute meters

| Metric | What is billed |
|--------|----------------|
| `compute.machine.hours` | RUNNING machine × time, at the offering-derived snapshot |
| `compute.volume.gb_hours` | Volume GiB × time |
| `compute.snapshot.gb_hours` | Snapshot GiB × time |
| `compute.lb.hours` | Active load balancer × time |
| `compute.vpc.hours` | Active VPC × time (often **$0** if the vendor network is free) |
| `compute.fip.hours` | Allocated Floating IP × time |
| `compute.egress.gb` | Observed Compute egress GiB |

Sticky public IPv4 on a NIC is not a reserved-IP SKU. Overlay gateways are not customer machines and are not billed. IPv6 address SKUs are not in this catalog.

**One formula, one line per SKU type.** Every Compute meter uses the same list-price pipeline: `FX(wholesale) × GTM markup (2×–4×)`. Billing prices each machine from its offering snapshot (add-ons from the published catalog), then **folds Explorer and invoice lines by metric** — not per VM or volume. Machine hours from many VMs become one `compute.machine.hours` row (blended unit price if offerings differ). Volume, snapshot, LB, VPC, FIP, and egress each get one quantity × catalog rate. The meter may still store `resource_arn` so snapshots can be applied; that is not a breakdown row.

Deleting a VM does **not** erase its metered hours. Billing still resolves the list price from the platform resource: sticky USD snapshot when present, otherwise the same FX × GTM markup from `offering_id` on `desired_spec`. Explorer and invoices stay **one `compute.machine.hours` line** (quantity-weighted blend if offerings differ). Days with usage stay on the chart; they are not $0 just because the inventory row is gone.

## How usage is recorded

Meter is the only ledger. It stores **quantities**, not prices. The user operation never waits on Meter.

`usage.refresh` is a **dirty hint only** — it never creates a usage event. A worker claims the watermark (`lock → read last_size/last_at → calculate → write usage + watermark` in one transaction), so duplicate refreshes do not duplicate charges. The hint is published on the internal subject `hc.usage.refresh` (queue group), **not** on `hc.events.>` (browser SSE).

If the hint is dropped, the next **hourly checkpoint** or signed reconcile still reconstructs from durable state (fail-open).

```text
Business fact (commit) → return immediately
        ↓
mark dirty + usage.refresh  (identity only — not a bill)
        ↓
usage worker  (lock watermark → delta → usage_events + usage_daily + new watermark)
        ↓
Billing Explorer / invoice  ← usage_daily × catalog/snapshot
```

Raw `usage_events` remain for audit and reconcile. Opening Billing does **not** scan raw rows.

Three primitives only:

| Type | Meaning | When a row is written |
|------|---------|------------------------|
| A Occupancy | `from → to` | stop/delete or hourly checkpoint |
| B Size × time | `size × Δt` | size change or hourly checkpoint |
| C Counter | seq/id delta | after work, or drain (Mail / Functions) |

| Service | Model |
|---------|--------|
| Compute machine, LB, FIP, VPC | A |
| Compute volume / snapshot | B |
| Compute egress | C |
| SO, IR, MQ backlog (`mq.gb_hours`) | B |
| MQ publish / deliver | C |
| Mail, Functions | C / drain |
| Secrets | A at account (quota/table, not a 60s cluster list) |
| MDB | A (instance hours) + B (storage) |
| Redis | A |

`mq.message_hours` is **not** billed in v1. There is no per-minute holdings writer.

```bash
# quantities only — no prices
homecloud usage list
homecloud usage list --group-by service_id --output json
```

PowerShell: the same commands (no quoting difference).

| Item | Value |
|------|--------|
| Console | **Billing** → `/console/billing` |
| Catalog id | `billing` (global — ignores the region switcher) |
| Currency | USD |
| Payments (v1) | Manual (platform admin marks paid). Stripe is the next adapter, not this release. |

## Billing Explorer

Single page — no separate Overview / Cost Explorer / Budgets routes.

| Area | Behavior |
|------|----------|
| **Date range** | Shadcn range calendar (presets + highlighted range). Days billed as UTC. |
| **Estimate** | Usage × catalog for the **selected range** |
| **Forecast** | Current calendar month, with a short basis line (run-rate + RUNNING hours) |
| **What is driving cost?** | Top services with a clear usage summary (e.g. avg GB stored) |
| **Cost over time** | Stacked bars **grouped by service**; Daily / Monthly. Each period has a **fixed slot** (inner chart scrolls sideways — bars never shrink to hairlines or stretch to fill the card). Monthly canvas is **at least 6 UTC months** through the current month (`$0` padding). |
| **Cost breakdown** | One row per service; expand for **SKU type** (machine hours, volume GB·h, …) — not per VM |
| **Invoices** | Generate on demand; Mark paid is manual |
| **Spend alerts** | Notify only — never stop or suspend resources |

Object Storage cost accumulates while objects exist (GB × time). A large SO figure after “recent” Monitoring activity usually means existing objects were metered across the selected days — not only new uploads.

### Timezone contract (v1)

Daily buckets are **UTC calendar days**. The explore API returns `"timezone": "UTC"`. The UI labels this explicitly. Per-account local timezone is not implemented yet.

### API

```http
GET /api/v1/accounts/{id}/billing/explore?from=&to=
```

Returns `timezone`, `estimate`, `daily_series`, `by_service`, `prices_are_placeholder`, `has_usage`, and `has_unpriced_usage`.

`GET …/billing/forecast` stays separate for the current month.

## Spend alerts vs hard caps

Spend alerts **notify only**. Crossing a threshold never stops Compute or suspends resources. There is **no hard spend limit** in v1. Resource quotas (machine count, etc.) remain a separate Identity/quotas control.

A background check runs about every **15 minutes** (`billing_alert_interval_seconds`). When the estimate is at or above the threshold:

1. Owners and admins get one **in-app** notification (bell + Notifications, source Billing) linking to **Billing → Alerts**.
2. The same people get **one email** (system mail). A failed send is not retried for that period.
3. SSE `spend.alert` refreshes the bell. The same fire does not write a second event type.

**Do not send twice in the same period.** Each alert stores `last_fired_period`. A **month** window fires at most once per UTC calendar month (`YYYY-MM`). A **week** window compares the last 7 days and fires at most once per ISO week (`YYYY-Www`). Two different alerts (week + month) can each fire independently.

| Window | Spend compared | Dedup period |
|--------|----------------|--------------|
| Calendar month (UTC) | Month-to-date estimate | Once that month |
| Last 7 days | Rolling 7-day estimate | Once that ISO week |

## CLI

```bash
homecloud usage list
homecloud billing summary
homecloud billing invoices
homecloud billing forecast --horizon 7
```

PowerShell: the same commands (no quoting difference).

## Permissions

- `billing.read` — viewer+
- `billing.write` — owner/admin (generate invoice, mark paid, manage alerts)

## Related

- [Monitoring](monitoring.md)
- [Compute](compute.md)
