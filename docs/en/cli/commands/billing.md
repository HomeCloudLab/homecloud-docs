# billing / usage / monitoring

Management-plane commands (console JWT via `homecloud login`).

## usage

```bash
homecloud usage list
homecloud usage list --group-by service_id --output json
```

Returns **quantities only** — no prices. The CLI reads daily SKU totals (`usage_daily`). Writers are a dirty worker plus an hourly checkpoint: `usage.refresh` is identity-only (not a bill). Time holdings use a locked `last_reported_at` watermark (elapsed time × size). Mail/Functions drain sent/invocation rows. MQ publish/deliver meters JetStream sequence deltas. An hourly reconcile job writes signed corrections (including negative); it is not the measurement method.

## billing

```bash
homecloud billing summary
homecloud billing forecast --horizon 7
homecloud billing invoices
```

USD estimates. **Compute** uses catalog list prices (wholesale × FX × 2×–4× markup; default 2×). Other services may still use placeholder rates. Mark paid is manual — card capture is not enabled yet.

## monitoring

```bash
homecloud monitoring workspace
homecloud monitoring dashboards
```
