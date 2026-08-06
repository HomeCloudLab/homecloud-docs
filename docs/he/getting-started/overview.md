# מה זה HomeCloud?

HomeCloud הוא control plane לענן פרטי: קונסול ווב אחד, CLI אחד ו-SDK אחד לשירותים שצריך כדי להריץ אפליקציות — אחסון, תורים, מסדי נתונים, פונקציות, קונטיינרים, דוא״ל ועוד.

עובדים בתוך **חשבון**. חשבון הוא workspace מבודד (ברוח דומה לחשבון AWS או לפרויקט GCP). משאבים שיוצרים — buckets, תורים, מסדי נתונים, אפליקציות — שייכים לחשבון הזה ואינם משותפים עם חשבונות אחרים אלא אם מעניקים גישה במפורש.

## למי זה מיועד

- **בעלי חשבון** שפתחו tenant וצריכים להזמין צוות  
- **מפתחים** שפורסים אפליקציות, דוחפים images או קוראים ל-APIs מהקוד  
- **DevOps / משתמשי פלטפורמה** שמאוטמטים עם ה-CLI ו-CI  

אם אתם מפעילים את *התשתית עצמה* של HomeCloud (צמתי K3s, Traefik, operators) — זה מחוץ להיקף כאן. המדריכים מניחים שהפלטפורמה כבר רצה ושיש לכם כתובת קונסול.

## שלוש דרכים לעבוד

### 1. קונסול ווב

פתחו `https://console.{apex}` (לדוגמה `https://console.holab.abrdns.com`).

השתמשו בקונסול כדי:

- ליצור ולעיין במשאבים (buckets, תורים, מסדי נתונים, פונקציות, …)  
- להזמין חברים ולנהל IAM  
- לערוך קוד פונקציות, לכתוב דוא״ל, לבדוק לוגים ומדדים  
- להעתיק מחרוזות חיבור ו-URIs מסוג `so://`  

כמעט לכל שירות יש דף רשימה ודף פרטים (אותו דפוס כמו «buckets → objects» או «queues → messages»).

### 2. CLI (`homecloud`)

התקינו פעם אחת ([התקנה](../cli/install.md)), ואז:

```bash
homecloud configure          # save Access Key for data-plane work
homecloud login              # browser/password session for management
homecloud so sync ./dist so://my-site/
homecloud mq send orders --body '{"id":1}'
homecloud fn invoke hello --payload '{"name":"Ada"}'
```

ראו את [מדריך ה-CLI](../cli/index.md).

### 3. SDK (Python / Node.js)

לאפליקציות ואוטומציה שלא אמורות לפתוח דפדפן:

```python
from homecloud import HomeCloud

client = HomeCloud.from_env()   # HC_ACCESS_KEY_ID / HC_SECRET_ACCESS_KEY
client.so.upload("docs", "./readme.md", key="readme.md")
client.mq.send("orders", {"id": 1})
```

ראו את [מדריך ה-SDK](../sdk/index.md).

## מודל מנטלי: control plane מול data plane

אין צורך באדריכלות הפנימית — רק בהבחנה הזו:

| Plane | דוגמאות | Auth |
|-------|---------|------|
| **Control plane** | יצירת bucket, רשימת תורים, הזמנת משתמש, פריסת גרסת פונקציה | סשן קונסול (`homecloud login`) או APIs ניהול עם JWT |
| **Data plane** | העלאת אובייקט, שליחת הודעה, משיכת image, invoke לפונקציה חמה | Access Key (בקשות חתומות) |

**כלל אצבע:** יצירה והגדרה של משאבים → קונסול / login. העברת נתונים בזמן ריצה → Access Key.

!!! note "מזהה החשבון אוטומטי"
    Access Keys כבר מוגבלים לחשבון אחד. ה-CLI וה-SDK מזהים את החשבון מהמפתח — אין צורך להעביר `account_id` בכל פקודה.

## שירותים במבט מהיר

| שירות | שם קצר | למה משתמשים בו |
|-------|--------|----------------|
| Object Storage | **SO** | קבצים, גיבויים, אתרים סטטיים (`so://bucket/key`) |
| Message Queues | **MQ** | משימות אסינכרוניות, fan-out, DLQ |
| Managed Databases | **MDB** | PostgreSQL, MySQL, MongoDB |
| Redis | **Redis** | מטמון מנוהל |
| Functions | **FN** | handlers ב-Python / Node ב-serverless |
| Applications | **Apps** | פריסה מתבנית (API, fullstack, static, worker) |
| Kubernetes | **K8s** | עיון והגדלת עומסים ב-namespace של החשבון |
| Image Registry | **IR** | תמונות OCI פרטיות (`docker push`) |
| Mail | **Mail** | תיבות דואר, תבניות, אוטומציות |
| Secrets | **Secrets** | ערכי סוד בשם לאפליקציות ופונקציות |
| IAM | **IAM** | תפקידים, מדיניות, Access Keys, תפקידי קונסול |
| Domains | **Domains** | הבאת דומיין משלכם + רשומות DNS |
| SSL | **SSL** | צפייה בתעודות שהונפקו לחשבון |

עמודי how-to מלאים נמצאים תחת [מדריכים](../guides/index.md).

## הצעדים הבאים

1. [פתיחת חשבון](accounts.md) (או קבלת הזמנה)  
2. [סיור בקונסול](console.md)  
3. [יצירת Access Key](access-keys.md) והתקנת ה-[CLI](../cli/install.md)  
4. עקבו אחרי מדריך שירות — התחילו ב-[Object Storage](../guides/object-storage.md) או ב-[Queues](../guides/queues.md) אם אינכם בטוחים  
