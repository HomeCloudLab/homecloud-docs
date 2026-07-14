# שירותי הפלטפורמה

## SO — אחסון אובייקטים

- ‏API תואם S3 בכתובת `https://so.{apex}`
- אתרים סטטיים בכתובת `https://{bucket}.web.{apex}`
- Console: יצירת buckets, מדיניות, הגדרת אתר, ניהול גרסאות
- פרטי object ב-Console: URI להעתקה בפורמט `so://bucket/key` ל-CLI/SDK (ב-PowerShell עטפו במירכאות אם יש רווחים במפתח)
- Lifecycle: ביטול העלאות multipart לא שלמות אחרי N ימים (MinIO ILM — לפי לוח זמנים, לא מיידי). אחרי שמירה, ה-API ממזג את הכלל שנשלח לתשובת GET כש-MinIO לא מחזיר `abort_incomplete_multipart_days` ב-read-back, כך שהממשק מציג את הערך שהגדרת.
- העלאה פעילה: אזהרה בסגירת טאב; ניווט פנימי מציע לבטל ולמחוק חלקים שכבר הועלו

## MQ — תורי הודעות

- תורים מגובי JetStream לכל חשבון
- Console: יצירה/מחיקה של תורים, DLQ, מדדים
- CLI: ‏`mq send`, `mq receive`

## MDB — מסדי נתונים מנוהלים

- ‏PostgreSQL, MySQL, MongoDB דרך אופרטורים
- גישה חיצונית דרך שער MDB + מסלולי TCP

## Secrets

- מאגר סודות לכל חשבון עם אימות Access Key

## Mail

- מנוע Stalwart ב-K3s (HDD); Console + API ב-control plane
- Postgres שומר **metadata בלבד**; גופים ב-Stalwart
- קונסול: רשימת תיבות → Inbox / Sent / Compose לכל תיבה (כמו SO / Queues)
- Phase 1: דומיין פלטפורמה, תיבות, שליחה/קבלה, רמזי DNS בכרטיס השירות
- ראו [דואר](mail.md)

## Console

- ממשק React לכל פעולות ה-control-plane
- **Kubernetes** — ממשק מבוסס namespaces (כמו buckets ב-SO / תורים ב-MQ): tenants רואים את `acc-{shortId}`; platform admin רואה גם namespaces מערכת (`homecloud`, `so`, `mq`, `mdb`, `kube-system`, …) ואת namespace החשבון שלו — לא namespaces של tenants אחרים
- **פוטר סטטוס** — שורה דקה וסטיקית בתחתית ה-shell: בריאות API (שמאל), הקשר נוכחי (מרכז), פעילויות ברקע (ימין). העלאות SO נפתחות בפוטר (לא toast חוסם); לחיצה על הצ'יפ מרחיבה התקדמות (קבצים, מהירות, bytes). מזעור ב-↓; סגירה ב-**X** — העלאה פעילה מציגה אישור ומבטלת חלקי multipart דרך בקר ההעלאה.
- IAM: משתמשים, תפקידים, מפתחות גישה, מדיניות — ראו [מודל אבטחה — Access Keys](access-keys-security.md)
