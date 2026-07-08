# שירותי הפלטפורמה

## SO — אחסון אובייקטים

- ‏API תואם S3 בכתובת `https://so.{apex}`
- אתרים סטטיים בכתובת `https://{bucket}.web.{apex}`
- Console: יצירת buckets, מדיניות, הגדרת אתר, ניהול גרסאות
- פרטי object ב-Console: URI להעתקה בפורמט `so://bucket/key` ל-CLI/SDK (ב-PowerShell עטפו במירכאות אם יש רווחים במפתח)
- Lifecycle: ביטול העלאות multipart לא שלמות אחרי N ימים (MinIO ILM — לפי לוח זמנים, לא מיידי)
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

## Console

- ממשק React לכל פעולות ה-control-plane
- IAM: משתמשים, תפקידים, מפתחות גישה, מדיניות — ראו [מודל אבטחה — Access Keys](access-keys-security.md)
