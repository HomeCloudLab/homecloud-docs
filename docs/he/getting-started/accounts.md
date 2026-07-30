# חשבונות

כל **חשבון** ב-HomeCloud הוא namespace מבודד לאפליקציות, buckets, תורים ומסדי נתונים.

## פתיחת חשבון מבחוץ (עצמאי)

מבקרים יכולים לפתוח tenant חדש בלי מנהל פלטפורמה — באותו דפוס שלבי כמו התחברות:

1. היכנסו ל-`https://console.{apex}/open-account` (גם מקישור במסך ההתחברות).
2. **אימייל** — קבלת קוד אימות.
3. **OTP** — הזנת הקוד בן 6 הספרות.
4. **פרטי התחברות** — שם חשבון, שם משתמש, סיסמה (+ אימות). ה-slug נגזר משם החשבון.
5. כניסה לקונסול כ־**בעל החשבון**. הזמנת משתמשים נוספים מאוחר יותר תחת **IAM → Users**.

הזרימה הציבורית יוצרת tenant במצב **bare** (חשבון + בעלים בלבד). אפליקציות, פרויקטים ומשאבים נוצרים אחר כך בתוך הקונסול לפי הצורך — לא בזמן ההרשמה.

כיבוי: `PUBLIC_ACCOUNT_SIGNUP_ENABLED=false` ב-API.

## יצירה ע״י מנהל פלטפורמה

מנהלי פלטפורמה יכולים ליצור tenants תחת **Platform → Accounts**, ולבחור שם **מצב bootstrap**:

- **Bare** — tenant + owner בלבד (כמו ההרשמה הציבורית)
- **Minimal** — + namespace ב-Kubernetes (בלי פרויקט ברירת מחדל)
- **Full** (ברירת מחדל ב-API של מנהל כשלא צוין) — namespace, מכסות, פרויקט ברירת מחדל, DNS

לא נוצרים אוטומטית buckets, MDB, MQ, Secrets או Functions באף מצב.

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
