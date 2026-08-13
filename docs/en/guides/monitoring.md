# Monitoring

HomeCloud **Monitoring** is a first-class console service (`/console/monitoring`). It is **not** CloudWatch. Grafana is **not** the tenant UI.

Prometheus, Loki, and Alertmanager stay **behind the HomeCloud API**. You never receive engine URLs or cluster credentials.

| Item | Value |
|------|--------|
| Console | **Monitoring** → `/console/monitoring` |
| Catalog id | `monitoring` |
| Tabs | Overview · Metrics · Logs · Alerts |
| Log retention | **7 days** default (v1) |

## What you will see

- Default Compute charts: CPU, memory, disk, network
- Metrics and logs queries scoped to your `account_id`
- Alert rules; firing notifies the console via the Realtime Gateway

This is **your** resources — not platform-admin cluster health.

## CLI

```bash
homecloud monitoring workspace
homecloud monitoring dashboards
```

## Permissions

- `monitoring.read` — viewer+
- `monitoring.write` — developer+ (create alert rules)

## Related

- [Billing](billing.md)
- [Compute](compute.md)
