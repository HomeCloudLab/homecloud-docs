# Monitoring

**Monitoring** הוא שירות קונסול עצמאי (`/console/monitoring`). זה לא CloudWatch. Grafana אינו ה-UI לדייר.

Prometheus, Loki ו-Alertmanager נשארים **מאחורי ה-API**. אין לכם כתובות מנוע או הרשאות קלאסטר.

| פריט | ערך |
|------|------|
| קונסול | **Monitoring** → `/console/monitoring` |
| Catalog | `monitoring` |
| לשוניות | Overview · Metrics · Logs · Alerts |
| לוגים | **7 ימים** כברירת מחדל |

## מה תראו

- גרפי Compute: CPU, זיכרון, דיסק, רשת
- שאילתות מדדים ולוגים עם `account_id` שלכם
- כללי התראה; ירי מודיע בקונסול

זה המשאבים **שלכם** — לא בריאות הקלאסטר של מפעיל הפלטפורמה.

## CLI

```bash
homecloud monitoring workspace
homecloud monitoring dashboards
```

## Related

- [Billing](billing.md)
- [Compute](compute.md)
