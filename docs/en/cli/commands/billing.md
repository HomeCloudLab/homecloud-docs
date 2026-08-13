# billing / usage / monitoring

Management-plane commands (console JWT via `homecloud login`).

## usage

```bash
homecloud usage list
homecloud usage list --group-by service_id --output json
```

Returns **quantities only** — no prices. Usage is reconstructed from durable business state: time holdings use a `last_reported_at` watermark (elapsed time × size), Mail/Functions drain sent/invocation rows, and MQ publish/deliver meters JetStream sequence deltas. An hourly reconcile job writes signed corrections (including negative); it is not the measurement method.

## billing

```bash
homecloud billing summary
homecloud billing forecast --horizon 7
homecloud billing invoices
```

USD estimates. Homelab totals are `$0.00` until production list prices are set.

## monitoring

```bash
homecloud monitoring workspace
homecloud monitoring dashboards
```
