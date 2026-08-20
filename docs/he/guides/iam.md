# IAM

IAM שולט **מי יכול לעשות מה** בחשבון: זהויות קונסול (משתמשים + קבוצות + מדיניות), Roles/Policies של data-plane, ו-Access Keys ל-CLI/SDK/Terraform.

| פריט | ערך |
|------|--------|
| Console | **IAM** → `/console/iam` (+ חברי חשבון / משתמשים) |

## שתי שכבות (אל תערבבו אותן)

### 1. גישת קונסול (אנשים) — קבוצות ומדיניות (ADR-053)

אנשים מקבלים הרשאות מ**צירופי מדיניות** ומ**חברות בקבוצות**, לא ממטריצת ארבעה תפקידים.

| תבנית גישה (הזמנה / יצירה) | קבוצת מערכת |
|---------------------------|-------------|
| Owner | `AccountOwners` |
| Admin | `AccountAdmins` |
| Builder | `Builders` |
| Reader | `Readers` |

אפשר להוסיף קבוצות ומדיניות מותאמות תחת **IAM → Groups / Policies**. הערכה: **Deny > Allow > Deny מרומז**. הענקה לאחרים דורשת **CanDelegate**.

הזמינו אנשים תחת **Account → Members** עם תבנית גישה. לדיבאג השתמשו ב-**Effective** וב-**Simulator**.

### קטלוג workspace

הקונסול מציג שירותים מ-`GET /api/v1/accounts/{id}/catalog` (קטלוג ששוחרר ∩ IAM). מוצרים שלא שוחררו מושמטים. שירות ששוחרר אבל לא הוענק נפתח כ-workspace ריק.

### 2. IAM של data-plane (אוטומציה)

| אובייקט | מטרה |
|---------|------|
| **Policies** | מסמכי `service:Action` + ARN (`Deny` גובר על `Allow`) |
| **Roles** | זהויות שניתן להניח (Functions משתמשות ב-Role ARN כ-`execution_role`) |
| **Access Keys** | אישורים ארוכי־חיים למשתמש; ההרשאות ממדיניות/קבוצות |

מזהי חשבון ב-ARN הם **מספר החשבון בן 12 ספרות**.

## Access Keys (credentials-first)

יצירה וביטול תחת **IAM → Access Keys**. מדריך מלא: [Access Keys](../getting-started/access-keys.md).

מפתחות משתמש יכולים לקרוא ל-APIs **ניהוליים** (רשימת buckets, תורים, …) ב-SigV1 כשהמדיניות Allow — בלי JWT של קונסול. `homecloud login` לדפדפן ול-step-up נדיר. ראו [אימות CLI](../cli/authentication.md).

Roles יכולים גם לסמוך על **GitHub Actions OIDC**. Terraform אז משתמש ב-`HC_ROLE_ARN` במקום מפתח ארוך־חיים. ראו [Terraform — GitHub OIDC](../terraform/index.md#github-oidc-no-long-lived-key).

## מדיניות

1. פתחו **Policies** → צרו או שכפלו starter מנוהל.  
2. צרפו את המדיניות למשתמש, קבוצה או Role.

## Roles ו-Functions

Functions חייבות להשתמש ב-**Role ARN** (לא בשם Access Key).

## Related

- [חשבון וצוות](account.md)
- [Access Keys](../getting-started/access-keys.md)
- [אימות CLI](../cli/authentication.md)
- [SDK](../sdk/index.md)
- [Terraform](../terraform/index.md)
