# IAM

IAM שולט **מי יכול לעשות מה** בחשבון: משתמשי ותפקידי קונסול, מדיניות data-plane, ו-Access Keys שבשימוש CLI/SDK.

| פריט | ערך |
|------|--------|
| Console | **IAM** → `/console/iam` (+ חברי חשבון / משתמשים) |

## שתי שכבות (אל תערבבו אותן)

### 1. גישת קונסול (אנשים)

תפקידים כמו **Owner**, **Admin**, **Developer**, **Viewer** קובעים מי יכול לפתוח את הקונסול ולקרוא ל-APIs ניהול.

| תפקיד (טיפוסי) | כוונה |
|----------------|-------|
| Owner | שליטה מלאה, כולל פעולות חשבון מסוכנות |
| Admin | ניהול משאבים וחברים |
| Developer | בנייה ופריסה; אדמין מוגבל |
| Viewer | קריאה בלבד |

הזמינו אנשים תחת **Account → Members**. פרטים: [חשבון וצוות](account.md).

### קטלוג workspace

הקונסול מציג שירותים מ-`GET /api/v1/accounts/{id}/catalog` (קטלוג ששוחרר ∩ IAM). מוצרים שלא שוחררו מושמטים. שירות ששוחרר אבל לא הוענק נפתח כ-workspace ריק — לא כמסך Access Denied. API: לא שוחרר → `404 identity.service_unreleased`; לא הוענק → `403 identity.service_not_granted`.

### 2. IAM של data-plane (אוטומציה)

| אובייקט | מטרה |
|---------|------|
| **Policies** | מסמכים של `service:Action` + ARNs של משאבים (`Deny` גובר על `Allow`) |
| **Roles** | זהויות שניתן להניח (Functions משתמשות ב-ARN של Role כ-`execution_role`) |
| **Access Keys** | אישורים ארוכי־חיים למשתמש; ההרשאות מגיעות ממדיניות מצורפת |

מזהי חשבון ב-ARNs הם **מספר החשבון בן 12 הספרות**.

## Access Keys

צרו ובטלו תחת **IAM → Access Keys**. how-to מלא: [Access Keys](../getting-started/access-keys.md).

מפתחות בהיקף root / בעלים עשויים להיות רחבים — העדיפו מפתחות מוגבלים ל-CI.

## מדיניות

1. פתחו **Policies** → צרו או שכפלו starter מנוהל.  
2. starters שימושיים לעיתים כוללים דפוסים כמו צרכן MQ, קריאה/כתיבה SO, הרצת Function בסיסית.  
3. צרפו את המדיניות למשתמש או לתפקיד.

דוגמת מדיניות פריסת SO:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["so:ListBucket", "so:PutObject", "so:DeleteObject"],
      "Resource": [
        "arn:holab:so:::my-website",
        "arn:holab:so:::my-website/*"
      ]
    }
  ]
}
```

## תפקידים ו-Functions

Functions חייבות להשתמש ב-**ARN של Role לביצוע** (לא בשם Access Key).

1. צרו Role עם ההרשאות שהפונקציה צריכה (SO, MQ, Secrets, …).  
2. ודאו שמדיניות האמון מאפשרת ל-service account של Functions להניח אותו (principal בסגנון `arn:…:service-account/functions` — העתיקו את ה-principal המדויק מעוזר הקונסול אם מוצג).  
3. הגדירו את ה-ARN של ה-Role בתצורת הפונקציה.

## הגדרות אבטחה

תחת IAM / אבטחת חשבון:

- הפעילו **MFA** (TOTP או passkeys) לבני אדם  
- בדקו סשנים ובטלו סשנים גנובים  
- העדיפו סשני קונסול קצרי־חיים; שמרו Access Keys רק במקום שבו אוטומציה צריכה אותם  

ראו גם הערות MFA של הפלטפורמה אם המפעיל פרסם עמוד אבטחה לתמיכה ב-passkeys / התחזות.

## טיפים

- התחילו ממדיניות מנוהלת, ואז צמצמו.  
- הפרידו מפתחות לפי סביבה (dev/stage/prod).  
- סובבו מפתחות כשאנשים עוזבים או כשלוגי CI עלולים לדלוף אותם.  
- תפקיד Viewer בקונסול ≠ מדיניות data-plane ריקה — הגדירו את שניהם במכוון.

## קשור

- [Access Keys](../getting-started/access-keys.md)  
- [Functions](functions.md)  
- [חשבון וצוות](account.md)  
- [Terraform](../terraform/index.md) (P2: `homecloud_iam_policy` / `homecloud_iam_role` / `homecloud_iam_policy_attachment`)  
