# שירותי הפלטפורמה

## SO — אחסון אובייקטים

- ‏API של אחסון אובייקטים בכתובת `https://so.{apex}`
- תואם ל-S3 Object API עבור לקוחות נפוצים
- אתרים סטטיים בכתובת `https://{bucket}.web.{apex}`
- Console: יצירת buckets, מדיניות, הגדרת אתר, ניהול גרסאות
- פרטי object ב-Console: URI להעתקה בפורמט `so://bucket/key` ל-CLI/SDK (ב-PowerShell עטפו במירכאות אם יש רווחים במפתח)
- **רשימה:** עמודים לפי continuation token (בלי "עמוד X מתוך Y" מזויף). List: **100 / 200 / 500**; Grid: **25 / 50 / 100**. מקסימום API `page_size` = **500**.
- **העלאה מרובה:** תור מקביליות (**1 / 5 / 10**, ברירת מחדל 5) עם Auto Retry, Pause/Resume והמשך אחרי reconnect. קובץ גדול בודד עדיין ב־**multipart** — לא נשבר.
- Lifecycle: ביטול העלאות multipart לא שלמות אחרי N ימים (MinIO ILM — לפי לוח זמנים, לא מיידי). אחרי שמירה, ה-API ממזג את הכלל שנשלח לתשובת GET כש-MinIO לא מחזיר `abort_incomplete_multipart_days` ב-read-back, כך שהממשק מציג את הערך שהגדרת.
- העלאה פעילה: אזהרה בסגירת טאב; ניווט פנימי מציע לבטל ולמחוק חלקים שכבר הועלו

## IR — Image Registry

- Registry OCI פרטי ב-`https://ir.{apex}/{account_short_id}/{repository}:{tag}`
- Control plane = מקור אמת ל-repos/מכסות/lifecycle; Zot שומר תוכן OCI על MinIO
- אימות: `docker login ir.{apex}` עם Access Key / secret (`ir:Push` / `ir:Pull`)
- Console: יצירת repositories, usage, lifecycle (keep last N + תגיות מוגנות)
- CLI: `homecloud ir login`, `homecloud ir repo list|create`, `homecloud ir usage`
- Digests immutable — מומלץ לפריסות production
- GHCR של הפלטפורמה נשאר ל-CI בלבד

## MQ — תורי הודעות

- תורים מגובי JetStream לכל חשבון
- Console: יצירה/מחיקה של תורים, DLQ, מדדים
- CLI: ‏`mq send`, `mq receive`

## MDB — מסדי נתונים מנוהלים

- ‏PostgreSQL, MySQL, MongoDB דרך אופרטורים
- גישה חיצונית דרך שער MDB + מסלולי TCP

## Secrets

- מאגר סודות לכל חשבון עם אימות Access Key

## Functions

- פונקציות Python 3.12 חמות עם workspace מרובה-קבצים, גרסאות, layers ו-triggers (HTTP / MQ / cron / manual)
- Invoke ב-control plane (`POST …/functions/{name}/invoke`); runtime מקומי או מרוחק דרך `functions_runtime_mode`
- ראו [Functions](functions.md)

## Mail

- מנוע Stalwart ב-K3s (HDD); Console + API ב-control plane
- Postgres שומר **metadata בלבד**; גופים ב-Stalwart
- קונסול: רשימת תיבות → Inbox / Sent / Compose לכל תיבה (כמו SO / Queues)
- Phase 1: דומיין פלטפורמה, תיבות, שליחה/קבלה, רמזי DNS בכרטיס השירות
- ראו [דואר](mail.md)

## Functions

- פונקציות Python 3.12 serverless מנוהלות עם סביבת קונסול בסגנון VS Code
- פריסת גרסאות בלתי משתנות; ארטיפקטים ב-`so://` כש-Object Storage זמין
- Invoke מקונסול/API; triggers: HTTP, MQ, cron, ידני; layers אופציונליים
- Data plane: `homecloud-fn` ב-`fn.holab.abrdns.com`
- ראו [פונקציות](functions.md)

## Console

- ממשק React לכל פעולות ה-control-plane
- **Kubernetes** — ממשק מבוסס namespaces (כמו buckets ב-SO / תורים ב-MQ): tenants רואים את `acc-{shortId}`; platform admin רואה גם namespaces מערכת (`homecloud`, `so`, `mq`, `mdb`, `kube-system`, …) ואת namespace החשבון שלו — לא namespaces של tenants אחרים
- **פוטר סטטוס** — שורה דקה וסטיקית בתחתית ה-shell: בריאות API (שמאל), הקשר נוכחי (מרכז), פעילויות ברקע (ימין). העלאות SO נפתחות בפוטר (לא toast חוסם); לחיצה על הצ'יפ מרחיבה התקדמות (קבצים, מהירות, bytes). מזעור ב-↓; סגירה ב-**X** — העלאה פעילה מציגה אישור ומבטלת חלקי multipart דרך בקר ההעלאה.
- IAM: משתמשים, תפקידים, מפתחות גישה, מדיניות — ראו [מודל אבטחה — Access Keys](access-keys-security.md)
