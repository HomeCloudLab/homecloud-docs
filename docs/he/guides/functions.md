# Functions

Functions הן יחידות **serverless מנוהלות**. כותבים handler (Python 3.12 ו/או Node לפי הפלטפורמה), פורסים גרסאות בלתי משתנות, ומריצים אותן מהקונסול, CLI, SDK, HTTP, תורים או cron.

| פריט | ערך |
|------|--------|
| Console | **Functions** → `/console/functions` |
| Runtime host | `fn.{apex}` |
| Auth (invoke דרך CLI/SDK) | Access Key / סשן כמתועד לכל פקודה |

## מושגים

| מונח | משמעות |
|------|--------|
| **Function** | יחידה בשם עם הגדרות זיכרון/timeout |
| **Workspace** | קבצים ניתנים לעריכה בקונסול (עץ עבודה) |
| **Version** | פריסה ארוזה ובלתי משתנה (`$LATEST` מצביע על הנוכחית) |
| **Handler** | `module.callable` (דוגמה: `main.handler`) |
| **Trigger** | איך הפונקציה רצה: manual, HTTP, queue, cron |
| **Layer** | תלויות משותפות שנארזות פעם אחת ומצורפות |
| **Function URL** | נקודת קצה HTTP אופציונלית לפונקציה |

## הליכה בקונסול

### יצירה

1. פתחו **Functions** → **Create function**.  
2. בחרו שם תואם DNS, runtime, handler (ברירת מחדל לעיתים `main.handler`), זיכרון ו-timeout.  
3. הפלטפורמה מזריעה workspace התחלתי (למשל `main.py`).

### workspace של קוד

פתחו את לשונית **Code**:

- עץ רב־קבצים ועורך Monaco (בסגנון VS Code)  
- יצירה / שינוי שם / מחיקת קבצים ותיקיות; שמירה אוטומטית  
- Format, outline, problems, חיפוש  
- אינטליגנציית שפה (השלמות / אבחנות) כששירות השפה מחובר  

עבדו ב-workspace עד שמוכנים לפרוס — deploy אורז את מה שבעץ (עם כללי אריזה שמוציאים דברים כמו `.env` ומסמכי Markdown).

### Build & Deploy Preview

השתמשו ב-**Build & Deploy Preview** לפני פריסה אמיתית:

- מאשר runtime, handler וקובץ כניסה  
- מציג נתיבים כלולים מול מוחרגים וגודל חבילה  
- חוסם deploy כשאימות נכשל (חסר entrypoint וכו')

### פריסת גרסה

לחצו **Deploy version**. הפלטפורמה אורזת את ה-workspace לגרסה חדשה ובלתי משתנה ומעדכנת `$LATEST`. ארטיפקטים לעיתים נשמרים כ-URIs של `so://…` כש-Object Storage זמין.

Rollback זמין מלשונית **Versions** / API כשצריך חבילה קודמת.

### Invoke לבדיקה

פתחו **Invocations**:

1. ערכו את **Event JSON**.  
2. לחצו **Invoke**.  
3. בדקו סטטוס, תוצאה, משך ולוגים.

### Triggers

| סוג | מתי להשתמש |
|-----|------------|
| `manual` | invokes בדיקה מקונסול / API / CLI |
| `http` | קישור HTTP ציבורי או מאומת / Function URL |
| `queue` | צריכה מתור MQ |
| `cron` | לוח זמנים (ביטוי cron) |

צרו, הפעילו, השביתו ומחקו triggers בלשונית **Triggers** (או Events).

### Layers

צרפו שכבות תלויות משותפות בלשונית **Layers**. לשכבות Python כללו תיקיית `python/` ברמה העליונה (או ודאו ששורש השכבה ב-`PYTHONPATH`).

### Function URL

הפעילו Function URL מהבקרה הייעודית כשצריך נקודת כניסה HTTP יציבה. השביתו אותה כשהנקודה לא צריכה להיות נגישה יותר. CLI: `homecloud fn url`.

hostname מותאם לכתובת הזו מחובר מ-[Domains](domains.md) → **שירותים**, לא מדף הפונקציה.

### Configuration

הגדירו זיכרון, timeout, משתני סביבה ו**execution role** (ARN של תפקיד IAM) מלשוניות תצורה. Functions צריכות להניח **Role**, לא שם Access Key.

## CLI

```bash
homecloud fn list

homecloud fn invoke hello --payload '{"name":"Ada"}'
# or payload file:
homecloud fn invoke hello --payload-file event.json

homecloud fn url hello
homecloud fn logs hello
homecloud fn watch hello          # follow recent invocations / output
```

ראו [CLI `fn`](../cli/commands/fn.md) לדגלים.

## SDK

=== "Python"

    ```python
    from homecloud import HomeCloud

    client = HomeCloud.from_env()

    for fn in client.functions.list():
        print(fn["name"])

    result = client.functions.invoke("hello", {"name": "Ada"})
    print(result)

    print(client.functions.url("hello"))
    client.functions.enable_url("hello")
    client.functions.disable_url("hello")

    for line in client.functions.logs("hello"):
        print(line)
    ```

## דוגמת handler (Python)

```python
# main.py
def handler(event, context):
    name = (event or {}).get("name", "world")
    return {"ok": True, "message": f"Hello, {name}!"}
```

פרסו מהקונסול, ואז:

```bash
homecloud fn invoke hello --payload '{"name":"Ada"}'
```

## זרימות עבודה טיפוסיות

### נקודת קצה מיקרו של HTTP API

1. צרו פונקציה + deploy.  
2. הוסיפו trigger מסוג **http** או הפעילו **Function URL**.  
3. קראו ל-URL מהאפליקציה או מספק webhook.

### worker של תור

1. צרו תור MQ.  
2. הוסיפו trigger מסוג **queue** לפונקציה.  
3. פרסמו עם `homecloud mq send` או ה-SDK.

### משימה מתוזמנת

1. הוסיפו trigger מסוג **cron** עם הלוח זמנים שלכם.  
2. שמרו על handler אידמפוטנטי (משימות יכולות לחפוף אם ריצה איטית).

## טיפים ומלכודות

- Deploy יוצר **גרסה חדשה** — ה-workspace בעורך לבדו אינו חי עד שפורסים.  
- אל תשימו סודות בקבצי מקור; השתמשו ב-[Secrets](secrets.md) + IAM.  
- `execution_role` חייב להיות **ARN של Role** שמהימן ל-Functions.  
- השתמשו ב-Build Preview כדי לתפוס handlers חסרים לפני deploy.  
- גודל חבילה ושכבות משפיעים על התנהגות cold/warm — שמרו תלויות רזות.

## קשור

- [IAM](iam.md)  
- [Queues](queues.md)  
- [Object Storage](object-storage.md)  
- [CLI `fn`](../cli/commands/fn.md)  
- [Terraform](../terraform/index.md) (`homecloud_function` / `_function_url` — spec בלבד; בלי קבצי IDE)  
