# מדריכים

מדריכים שלב־אחר־שלב לכל שירות מרכזי ב-HomeCloud. כל עמוד מכסה:

1. למה השירות מיועד (בשפה פשוטה)  
2. איך להשתמש בו ב**קונסול**  
3. איך לאוטומט עם ה-**CLI** וה-**SDK** כשרלוונטי  
4. מלכודות נפוצות  

## קטלוג

| מדריך | שירות | התחילו כאן אם אתם צריכים… |
|-------|-------|---------------------------|
| [Object Storage (SO)](object-storage.md) | SO | לאחסן קבצים, לסנכרן תיקיות, לארח אתר סטטי |
| [Message Queues (MQ)](queues.md) | MQ | לנתק workers, להשתמש ב-DLQ |
| [Managed Databases (MDB)](databases.md) | MDB | להריץ PostgreSQL, MySQL או MongoDB |
| [Compute](compute.md) | Compute | מכונות וירטואליות, Agent, volumes, operations |
| [אזורים](regions.md) | פלטפורמה | מקומות HomeCloud (`homelab`, `eu-central`), לא שמות ספק |
| [Redis](redis.md) | Redis | מטמון מנוהל |
| [Functions](functions.md) | FN | handlers ב-serverless עם triggers |
| [Applications](applications.md) | Apps | לפרוס מתבנית |
| [Kubernetes](kubernetes.md) | K8s | לבדוק ולהגדיל עומסי חשבון |
| [Image Registry (IR)](registry.md) | IR | תמונות Docker / OCI פרטיות |
| [Mail](mail.md) | Mail | תיבות דואר, תבניות, אוטומציות |
| [Secrets](secrets.md) | Secrets | לאחסן אישורים לאפליקציות ופונקציות |
| [IAM](iam.md) | IAM | תפקידים, מדיניות, Access Keys, תפקידי קונסול |
| [Domains & DNS](domains.md) | Domains | להביא דומיין משלכם |
| [SSL certificates](ssl.md) | SSL | לראות תעודות שהונפקו |
| [Billing](billing.md) | Billing | שימוש, אומדנים, חשבוניות, התראות הוצאה |
| [Monitoring](monitoring.md) | Monitoring | מדדים, לוגים, התראות |
| [Account & team](account.md) | Account | חברים, ביקורת, פרויקטים, אבטחה |
| [Terraform](../terraform/index.md) | IaC | פרוויז'ן של תורים ובאקטים מ-CI |

## תזכורת אימות

- **קונסול + `homecloud login`** — יצירה והגדרה של משאבים בדפדפן  
- **Access Key** — העברת נתונים, קריאה ל-APIs של זמן ריצה, ו(עם מפתח הקשור למשתמש) פרוויז'ן דרך [Terraform](../terraform/index.md)  

צרו מפתחות ב-[Access Keys](../getting-started/access-keys.md) לפני שניסיונות דוגמאות CLI באתר הזה.
