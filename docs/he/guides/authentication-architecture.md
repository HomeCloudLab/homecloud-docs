# ארכיטקטורת אימות

איך HomeCloud מאמת קוראים ב־**קונסול**, **CLI** ו־**SDK** — ואיך הנתיב החם נשאר מהיר תחת מקביליות גבוהה (ADR-053).

## שני סוגי אישורים

| ערוץ | אישור | איפה נשמר | שימוש טיפוסי |
|------|--------|-----------|---------------|
| קונסול בדפדפן | JWT (24 שעות, בלי refresh) | `localStorage` (`homecloud_token`) | בני אדם, MFA |
| CLI אינטראקטיבי | JWT | `~/.homecloud/session` | `homecloud login` / MFA בדפדפן |
| CLI / SDK / Terraform | Access Key SigV1 | `~/.homecloud/credentials` | אוטומציה, CI, ניהול + data plane |
| Data plane (SO / MQ / …) | Access Key SigV1 | אותו קובץ credentials | אובייקטים / הודעות |

הרשאות תמיד מגיעות מ־**קבוצות ומדיניות IAM** על ה־principal — לא ממטריצת Owner/Admin/Builder/Reader. תבניות גישה בהזמנה/יצירה רק ממפות אנשים לקבוצות מערכת (`AccountOwners`, `AccountAdmins`, `Builders`, `Readers`).

## נתיב בקשה (קונסול או Access Key של משתמש)

```text
זהות (אימות JWT או SigV1 HMAC)
  → בדיקות חברות / חשבון
  → הבטחת קבוצות מערכת (fast-path אם כבר קיימות)
  → הרשאות אפקטיביות (מטמון Redis, ואז DB)
  → הנתיב: require_permission / require_console_iam
```

- **JWT**: פענוח → טעינת משתמש → בדיקת `session_version` + מכשיר.
- **Management SigV1**: אימות חתימה עם סוד ה־Access Key (מטמון Redis, Postgres ב־miss) → אותו pipeline ל־Access Keys של **משתמש**.
- **Data-plane SigV1**: `AccessKeyCache` ב־Redis + צילום IAM (נפרד מ־JWT של הקונסול).

## עקרונות קנה־מידה

1. **Seed פעם אחת** — קבוצות/מדיניות מערכת נוצרות רק כשחסרות; בקשות חמות בלי נעילות ו־commit.
2. **מטמון הרשאות אפקטיביות** — מפתח Redis לפי `account_id` + `user_id`, מתבטל כשמדיניות, קבוצות או חברויות משתנות (epoch לחשבון).
3. **מטמון Access Keys** — ניהול ו־data plane חולקים את אותו מטמון Redis; פענוח/DB רק ב־miss.
4. **בידוד דיירים** — מפתחות מטמון ונעילות לפי חשבון; עומס של חשבון אחד לא מסריאל חשבון אחר.
5. **אימות stateless** — קריפטו של JWT/SigV1 בלי DB; DB/Redis רק לחומר זהות ול־authz.

## Credentials-first ב־CLI / SDK

העדיפו Access Keys (`homecloud configure`). התחברות לקונסול לדפדפן ול־step-up נדיר (למשל passkeys). פירוט: [אימות CLI](../cli/authentication.md), [מדריך IAM](iam.md), [Access Keys](../getting-started/access-keys.md).
