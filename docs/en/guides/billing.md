# Billing

HomeCloud **Billing** is a first-class console service (`/console/billing`). Overview has a calendar **Glance** (Spending + Forecast) and a **Billing Explorer** below for range analysis — Cost Explorer–style chart and breakdown with HomeCloud design, not an AWS UI clone.

The meter stores **quantities only**. Billing does `Usage × net USD catalog price = Charge`. VAT is a separate invoice line — never baked into SKU prices. Homelab still issues invoices. Card payment is **not** enabled — Mark paid is manual only.

**Compute** list prices come from the Compute catalog: provider wholesale → operator FX (EURUSD) → GTM markup in the **2×–4×** band (default **3×**). Machine hours use the **fulfilled Offering/SKU** (`offering_id`), snapshotted in USD. Other services (SO, MQ, Mail, …) may still use temporary placeholder rates until they have wholesale.

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

**One formula; Explorer can expand.** Every Compute meter uses `FX(wholesale) × GTM markup (2×–4×, default 3×)`. Invoice lines stay folded by metric. In the console, expand a Compute service row to see **per-resource** quantities (from a compact daily rollup — not a scan of every meter tick). A **Currently billable** strip shows what holdings are accruing *right now*, so historical machine hours in the range are not confused with live VMs.

Deleting a machine marks attached boot/data volumes as deleting so they **stop metering immediately**; purge then removes them. Detached volumes you keep remain billable until you delete them. Past machine hours stay on the chart with sticky/offering pricing.

Quantity is always wall-clock hours or GiB×time — never “effective hours” inflated by cost.

## How usage is recorded

Meter is the only ledger. It stores **quantities**, not prices. The user operation never waits on Meter.

`usage.refresh` is a **dirty hint only** — it never creates a usage event. A worker claims the watermark (`lock → read last_size/last_at → calculate → write usage + watermark` in one transaction), so duplicate refreshes do not duplicate charges. The hint is published on the internal subject `hc.usage.refresh` (queue group), **not** on `hc.events.>` (browser SSE).

If the hint is dropped, the next **hourly checkpoint** or signed reconcile still reconstructs from durable state (fail-open).

```text
Business fact (commit) → return immediately
        ↓
mark dirty + usage.refresh  (identity only — not a bill)
        ↓
usage worker  (lock watermark → delta → usage_events + usage_daily + usage_resource_daily + new watermark)
        ↓
Billing Explorer / invoice  ← usage_daily × catalog/snapshot
Explorer expand             ← usage_resource_daily × resolve
Currently billable          ← Compute holdings
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

## Billing Overview

Single page — Overview and Invoices tabs only (no separate Cost Explorer / Budgets routes).

### Glance (calendar truth)

Fixed at the top of Overview. Never follows the Explorer date range.

| Card | Behavior |
|------|----------|
| **Spending** | Current calendar month **MTD** and previous calendar month **Final** in one card. MoM compares MTD to the same elapsed period last month. |
| **Forecast** | Projected **full** cost of the current calendar month (existing forecast API). MoM vs previous month total. |
| **Currently billable** | Live holdings accruing now — separate from Explorer history. |

There is no Overview **Estimate** KPI and no Overview **VAT** KPI. VAT stays on invoices.

### Billing Explorer (user analysis)

Below Glance. Date range and granularity affect **only** the chart and breakdown.

| Area | Behavior |
|------|----------|
| **Date range** | Range calendar (presets + custom). Days billed as UTC. |
| **Granularity** | **Day** / **Week** / **Month** (week buckets are Monday-start UTC weeks from daily series) |
| **Cost over time** | Stacked bars **grouped by service**. Each period has a **fixed slot** (inner chart scrolls sideways). Monthly canvas is **at least 6 UTC months** through the current month (`$0` padding). |
| **Cost breakdown** | One row per service; expand for **SKU type**, then **totals per resource kind** |
| **Invoices** | Generate on demand; Mark paid is manual; VAT appears on invoice totals |
| **Spend alerts** | Notify only — never stop or suspend resources |

Object Storage cost accumulates while objects exist (GB × time). A large SO figure after “recent” Monitoring activity usually means existing objects were metered across the selected days — not only new uploads.

### Reading a Compute expand

Expanding Compute shows three levels, all views of the **same** amount — nothing is billed twice:

1. **SKU rows** — machine hours, volume GB·h, egress GB
2. **Resource-kind rows** — machines / volumes / snapshots / load balancers …, each with how many resources contributed in the range
3. **Top resources** (optional) — the biggest individual resources, marked *billing now* or *historical*; remaining resources stay folded into the kind totals

Volume quantity is capacity × time, so the helper line reads as **average total capacity** across the range (all volumes summed), not the size of one disk. Machine quantity is wall-clock hours.

### Days are the days it happened

Holdings usage is filed on the **UTC day it occurred**, including when a machine stops or a volume disappears from inventory: a multi-day backlog is split into one entry per day. If the cost chart ever shows a spike on today for resources that stopped earlier, the rollups predate this behavior — rebuild them:

```bash
# dry run
python scripts/rebuild_usage_rollups.py --from 2026-09-01 --to 2026-09-14
# write
python scripts/rebuild_usage_rollups.py --account <account-uuid> --from 2026-09-01 --to 2026-09-14 --apply
```

The script re-spreads `usage_events` (whose `source_id` carries the interval start) across the days each interval covers and rewrites `usage_daily` / `usage_resource_daily`. Amounts do not change — only which day they land on.

### Timezone contract (v1)

Daily buckets are **UTC calendar days**. The explore API returns `"timezone": "UTC"`. The UI labels this explicitly. Per-account local timezone is not implemented yet.

### API

```http
GET /api/v1/accounts/{id}/billing/explore?from=&to=
```

Returns `timezone`, `estimate`, `daily_series`, `by_service`, `prices_are_placeholder`, `has_usage`, and `has_unpriced_usage`.

```http
GET /api/v1/accounts/{id}/billing/explore/resources?metric=&from=&to=&limit=20
```

Returns `groups` (one aggregate per resource kind), `items` (top `limit` resources), `resource_count`, and `truncated`.

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
