# שירותי הפלטפורמה

## SO — אחסון אובייקטים

- ‏API תואם S3 בכתובת `https://so.{apex}`
- אתרים סטטיים בכתובת `https://{bucket}.web.{apex}`
- Console: יצירת buckets, מדיניות, הגדרת אתר, ניהול גרסאות

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
- IAM: משתמשים, תפקידים, מפתחות גישה, מדיניות
