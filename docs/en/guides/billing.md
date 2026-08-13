# Billing

HomeCloud **Billing** is a first-class console service (`/console/billing`). It is **not** Cost Explorer.

The meter stores **quantities only**. Billing does `Usage × net USD catalog price = Charge`. VAT is a separate invoice line — never baked into SKU prices. Homelab list prices are **$0**; invoices are still generated so the path Meter → Invoice → PDF (`so://billing/{account_id}/{period}.pdf`) can be tested.

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
Billing
```

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

## What you will see

- Month-to-date **Estimate**
- **Forecast** (7/30-day run-rate + remaining RUNNING machine hours) — labelled Estimate
- Usage totals by service/metric (no money on the usage API)
- Invoices including `$0.00` on homelab
- Spend alerts (notify only — they never stop Compute)

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
- `billing.write` — owner/admin (generate invoice, mark paid, alerts)

## Related

- [Monitoring](monitoring.md)
- [Compute](compute.md)
