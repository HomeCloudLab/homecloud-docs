# Billing

HomeCloud **Billing** is a first-class console service (`/console/billing`). The console **Billing Explorer** uses Cost Explorer–style analysis (date range, trend, by-service) with HomeCloud design — it is not an AWS UI clone.

The meter stores **quantities only**. Billing does `Usage × net USD catalog price = Charge`. VAT is a separate invoice line — never baked into SKU prices. Homelab still issues invoices. Current **list prices are temporary placeholders** (not final GTM rates) so Estimate / Forecast / Invoice show real money math. Card payment is **not** enabled — Mark paid is manual only.

## How usage is recorded

Meter is the only ledger. It stores **quantities**, not prices. The user operation never waits on Meter: if Meter is down, the durable business record still exists and the next drain or holdings tick writes the usage.

HomeCloud does **not** add an outbox table, a usage NATS stream, or a central billing scanner. Each SKU is reconstructed from state that already exists:

```text
Business fact (MailMessage, FunctionInvocation, JetStream seq, Compute / MinIO / IR / MDB / Redis / Secrets)
        ↓
usage drain or holdings worker  (same DB transaction as record_usage + watermark)
        ↓
Meter ledger (immutable)
        ↓
Billing Explorer (presentation only)
```

Billing never queries Compute, SO, Mail, or other service tables for cost. It only consumes Meter via `query_usage`.

| Service | What is measured | Cursor |
|---------|------------------|--------|
| Compute | RUNNING × time | timestamp |
| SO | bytes × time (live MinIO size) | timestamp |
| IR | storage bytes × time | timestamp |
| MDB | instance / storage × time | timestamp |
| Redis | instance × time | timestamp |
| Secrets | secrets × time | timestamp |
| MQ | publish / deliver | JetStream sequence |
| MQ | messages / bytes × time | timestamp |
| Mail | sent | row id (`mail.sent:{id}`) |
| Functions | invocation | invocation id (`fn.invoke:{id}`) |

**Time holdings** bill the gap since `last_reported_at`, not a fixed 60-second slot. If the worker wakes 7 minutes late, the interval is 7 minutes. If it was down for 17 minutes, the interval is 17 minutes. There is no hole.

**Mail and Functions** are a durable business record plus an idempotent drain. `MailMessage.status = sent` is the source of truth; the drain later calls `record_usage` with a deterministic `source_id`. A retry never invents a new UUID.

**MQ publish/deliver** meters JetStream sequence deltas (`current_seq − last_metered_seq`). The first observation sets the watermark without billing historical backlog.

**Reconcile** is a safety net, not the measurement method. It compares meter totals to inventory and writes a **signed** delta (positive or negative). The original row is never updated. Over-meter is corrected, not ignored.

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
| **Cost over time** | Stacked daily bars **grouped by service**; Cost / Usage toggle |
| **Cost breakdown** | One row per service; expand for metric / unit price / quantity |
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
