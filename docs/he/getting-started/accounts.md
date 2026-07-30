# חשבונות

כל **חשבון** ב-HomeCloud הוא namespace מבודד לאפליקציות, buckets, תורים ומסדי נתונים.

## פתיחת חשבון מבחוץ (עצמאי)

מבקרים יכולים לפתוח tenant חדש בלי מנהל פלטפורמה:

1. היכנסו ל-`https://console.{apex}/open-account` (גם מקישור במסך ההתחברות).
2. אמתו אימייל ב-OTP, בחרו שם משתמש/סיסמה, שם ו-slug לחשבון.
3. בחרו **מצב bootstrap**:
   - **Bare** — tenant + owner בלבד
   - **Minimal** (ברירת מחדל) — + namespace ב-Kubernetes (בלי פרויקט ברירת מחדל)
   - **Full** — ה-pipeline המלא של היום

לא נוצרים אוטומטית buckets, MDB, MQ, Secrets או Functions.

כיבוי: `PUBLIC_ACCOUNT_SIGNUP_ENABLED=false` ב-API.

## יצירה ע״י מנהל פלטפורמה

מנהלי פלטפורמה יכולים ליצור tenants תחת **Platform → Accounts**, עם אותם מצבי bootstrap (ברירת מחדל **full** כשלא צוין).

## Console

1. התחברות ב-`https://console.{apex}`
2. החלפת חשבון בסרגל העליון
3. הזמנת חברים דרך **IAM → Users**

## CLI

```bash
homecloud login --username alice
homecloud accounts list
homecloud accounts switch my-team
```
