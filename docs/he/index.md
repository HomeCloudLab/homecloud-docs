# תיעוד HomeCloud

התיעוד מסביר **איך להשתמש ב-HomeCloud** אחרי שפתחתם חשבון — בקונסול הווב, עם ה-CLI, ומהאפליקציות שלכם דרך ה-SDK.

הוא מיועד ל**בעלי חשבון, מפתחים ו-DevOps** שבונים ומריצים עומסים על הפלטפורמה. זה לא מדריך הנדסה פנימי.

**אתר חי:** [https://docs.web.holab.abrdns.com](https://docs.web.holab.abrdns.com)

## מה אפשר לעשות

| רוצים… | התחילו כאן |
|--------|------------|
| לפתוח חשבון ולהתחבר | [פתיחת חשבון](getting-started/accounts.md) |
| להבין את מבנה הקונסול | [שימוש בקונסול](getting-started/console.md) |
| לאחסן ולסנכרן קבצים / אתרים סטטיים | [Object Storage (SO)](guides/object-storage.md) |
| לשלוח ולקבל הודעות | [Message Queues (MQ)](guides/queues.md) |
| להריץ PostgreSQL / MySQL / MongoDB | [Managed Databases (MDB)](guides/databases.md) |
| להריץ קוד serverless | [Functions](guides/functions.md) |
| לפרוס אפליקציה מתבנית | [Applications](guides/applications.md) |
| לדחוף תמונות Docker | [Image Registry (IR)](guides/registry.md) |
| לשלוח ולקרוא דוא״ל | [Mail](guides/mail.md) |
| לאוטומט עם סקריפטים | [CLI](cli/index.md) · [SDK](sdk/index.md) · [Terraform](terraform/index.md) |

## איך HomeCloud מאורגן (למשתמשים)

כל מה שיוצרים שייך ל**חשבון**. בתוך חשבון משתמשים בשירותים מסרגל הצד של הקונסול (Storage, Queues, Databases, Functions וכו').

יש שתי דרכים להתאמת זהות:

| איך עובדים | אישור | שימוש טיפוסי |
|------------|--------|--------------|
| קונסול בדפדפן, או `homecloud login` | שם משתמש + סיסמה (+ MFA) → סשן קצר־חיים | יצירת משאבים, הזמנת אנשים, ניהול הגדרות |
| סקריפטים, CI, אפליקציות, `homecloud so` / `mq` / Terraform | **Access Key** ID + secret | העלאת אובייקטים, פרסום הודעות, invoke לפונקציות, פרוויז'ן של תורים/באקטים |

יוצרים Access Keys פעם אחת בקונסול. אוטומציה בזמן ריצה לא מבקשת MFA.

## מסלול מומלץ

1. [מה זה HomeCloud?](getting-started/overview.md) — מודל מנטלי בשפה פשוטה  
2. [פתיחת חשבון](getting-started/accounts.md) — הרשמה והתחברות ראשונה  
3. [שימוש בקונסול](getting-started/console.md) — איפה דברים נמצאים  
4. [Access Keys](getting-started/access-keys.md) — אישורים ל-CLI ול-SDK  
5. בחרו [מדריך שירות](guides/index.md) למוצר שאתם צריכים  

## קונסולים ו-hostnames

הפלטפורמה שלכם משתמשת בדומיין apex אחד (לדוגמה `holab.abrdns.com`):

| משטח | hostname טיפוסי | מה זה |
|------|-----------------|-------|
| Console | `console.{apex}` | ממשק ווב ו-API של ה-control plane |
| Object Storage | `so.{apex}` | API לאובייקטים; אתרים ב-`{bucket}.web.{apex}` |
| Queues | `mq.{apex}` | API לתורים |
| Functions | `fn.{apex}` | runtime לפונקציות |
| Registry | `ir.{apex}` | תמונות קונטיינר פרטיות |
| Databases | `*.mdb.{apex}` | נקודות חיבור ל-DB מנוהל |
| Secrets | `secrets.{apex}` | data plane לסודות |

בדרך כלל פותחים את כתובת ה**קונסול** שהאדמין או דף ההרשמה נתנו. שאר ה-hostnames מופיעים במחרוזות חיבור, בהגדרות CLI ובקליינטי SDK.
