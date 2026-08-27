# אזורים (Regions)

**Region** הוא מקום של HomeCloud למשאבים (`homelab`, `eu-central`, …). זה **לא** שם ספק. ספקי קיבולת (Hetzner, Scaleway, OVH) נקשרים מאחורי ה-API — בוחרים `eu-central`, לא `fsn1`.

| פריט | ערך |
|------|--------|
| רשימה | `GET /api/v1/catalog/regions` |
| אזור אחד | `GET /api/v1/catalog/regions/{code}` |
| ברירת מחדל בחשבון | `accounts.default_region` (בדרך כלל `homelab`) |

## מה רואים

בורר האזור בקונסול מצמצם את Compute (ורשימות אזוריות אחרות) לקוד שנבחר. משתמשי Identity וחיוב נשארים גלובליים.

גם אזורי זמינות הם קודי HomeCloud (`homelab-a`, `eu-central-a`). ב-create שולחים `region_code` ו-`az_code` אופציונלי — לא slug של ספק.

## בידוד (פלטפורמה מול tenant)

בקווי ייצור ה-Event Bus משתמש ב-`PLATFORM_NATS_URL`. MQ של tenant משתמש ב-`TENANT_NATS_URL` / `NATS_URL`. ב-homelab `local` אפשר להשאיר NATS אחד עד cutover מפורש. אין fallback מאוטובוס הפלטפורמה ל-MQ של tenant.

מסדי נתונים לוגיים (`hc_control`, `hc_compute`, …) הם יחידת הבידוד לסכמה. ה-homelab עדיין רץ על Postgres אחד עד שמריצים את ה-runbook.

## שמות Compute

המוצר הוא **Compute**. Images הם מזהי HomeCloud: `ubuntu-24.04`, `debian-12`, `almalinux-9`. אחסון אובייקטים הוא **SO** (`so://`). מסדים מנוהלים הם **MDB**. רשת Compute פרטית משתמשת ב-**VPC** / **subnet** / IPv4 פרטי על NIC (לא שמות “network” של ספק).
