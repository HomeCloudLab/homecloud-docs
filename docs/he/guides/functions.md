# Functions

Functions הן יחידות **serverless מנוהלות**. כותבים handler (Python 3.12 ו/או Node לפי הפלטפורמה), פורסים גרסאות בלתי משתנות, ומריצים אותן מהקונסול, CLI, SDK, HTTP, תורים או cron.

| פריט | ערך |
|------|--------|
| Console | **Functions** → `/console/functions` |
| Function URL ללקוח | `{name}.func.{apex}` (אופציונלי; הפעילו Function URL) |
| Runtime פנימי | `fn.{apex}` (פלטפורמה בלבד — לא לאפליקציות) |
| Auth (invoke דרך CLI/SDK) | Access Key / סשן כמתועד לכל פקודה |

## מישורי גישה (אל תערבבו)

| מישור | Hostname | מי משתמש |
|-------|----------|----------|
| **קונסול / ניהול** | קונסול + management API | Test invoke עם JWT; מפעילים |
| **Function URL** | `{name}.func.{apex}` | אפליקציות ואינטגרציות (Access Key HMAC או ציבורי) |
| **Runtime פנימי** | `fn.{apex}` | workers של הפלטפורמה בלבד (בדומה ל-hosts פנימיים של SO) |

ה-hostnames האלה נשארים מופרדים במכוון — אין למזג אותם.

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
- **מעבדת שפה** (ניסיוני): מעבר ל-Pyright בדפדפן באותו לשונית Code להשוואה מול BasedPyright בשרת. בפרודקשן נשארים על מנוע השרת עד GO מתועד מה-spike.

עבדו ב-workspace עד שמוכנים לפרוס — deploy אורז את מה שבעץ (עם כללי אריזה שמוציאים דברים כמו `.env` ומסמכי Markdown).

### Build & Deploy Preview

השתמשו ב-**Build & Deploy Preview** לפני פריסה אמיתית:

- מאשר runtime, handler וקובץ כניסה  
- מציג נתיבים כלולים מול מוחרגים וגודל חבילה  
- חוסם deploy כשאימות נכשל (חסר entrypoint וכו')

### פריסת גרסה

לחצו **Deploy version**. הפלטפורמה אורזת את ה-workspace לגרסה חדשה ובלתי משתנה ומעדכנת `$LATEST`. ארטיפקטים לעיתים נשמרים כ-URIs של `so://…` כש-Object Storage זמין.

Rollback זמין מתוך סעיף **Versions** תחת לשונית **Code** / API כשצריך חבילה קודמת.

### Invoke לבדיקה

פתחו **Invocations**:

1. ערכו את **Event JSON**.  
2. לחצו **Invoke** — ה-API מחזיר מיד `pending` + `phase=queued` + מזהה (`async_mode`). Worker מוביל ב-control plane תופס את השורה (`running` / `preparing`) ומסיים את הריצה. זה שורד restart של ה-API (בניגוד ל-tasks בתהליך).  
3. הקונסול פותח את **עמוד הפירוט** של הריצה וזורם SSE (`…/logs/stream`) עם catch-up ואז לייב. `phase` מאמצע הריצה מ-FN משוקף ל-Postgres כשאפשר.  
4. רענון רך דרך Realtime (`function.invoke.*`); כש-Realtime כבוי ויש pending/running, soft-poll כל ~5 שניות.

כלי ops ברשימה:

- שורת מסננים אחת: status, trigger, טווח תאריכים וחיפוש עם debounce (על שורות שנטענו; UUID נמשך לרשימה)  
- עמודת **לוג אחרון** (מקוצר); התגובה רק בעמוד הפירוט  
- לחיצה על שורה → עמוד invocation ייעודי (סיכום, לוגים מעל תגובה)  
- שבב **Running now** — שאילתות מוגבלות ל-`status=running|pending` בלבד 

### Triggers

| סוג | מתי להשתמש |
|-----|------------|
| `manual` | invokes בדיקה מקונסול / API / CLI |
| `http` | קישור HTTP ציבורי או מאומת / Function URL |
| `queue` | צריכה מתור MQ |
| `cron` | לוח זמנים (ביטוי cron) |

צרו, הפעילו, השביתו ומחקו triggers בלשונית **Triggers**.

### Events (Event Bus)

מנויים בלשונית **Events**. בחרו מקור → אירוע → מסנני משאב אופציונליים. ל-SO נדרש באקט (קידומת אופציונלית עם הצעות נתיב). משימות: `item_id` / מפתח משימה; Compute: `machine_id` / `operation_id`; פונקציות: שם פונקציה. מסננים אופציונליים ריקים = התאמה ברמת החשבון לסוג האירוע.

### Layers

צרפו שכבות תלויות משותפות תחת **Configuration** (סעיף Layers). לשכבות Python כללו תיקיית `python/` ברמה העליונה (או ודאו ששורש השכבה ב-`PYTHONPATH`).

### Function URL

הפעילו Function URL מבקרת Overview כשצריך נקודת כניסה HTTP יציבה על `{name}.func.{apex}`. השביתו אותה כשהנקודה לא צריכה להיות נגישה יותר. CLI: `homecloud fn url`.

hostname מותאם לכתובת הזו מחובר מ-[Domains](domains.md) → **שירותים**, לא מדף הפונקציה.

### Configuration

הגדירו זיכרון, timeout, משתני סביבה, **resource bindings** (שמות לוגיים ל-mq / so / secrets / mail — ניתוב בלבד), ו-**execution role** (ARN של תפקיד IAM). הרשאות (Allow/Deny, קידומות, תנאים) נערכות על ה-role ב-[IAM Runtime](../guides/iam.md) — שם יוצרים או מצרפים מדיניות. אחרי שינוי bindings, צרו מחדש או עדכנו את ה-role אם המדיניות עלולה להיות ישנה.

## CLI

```bash
homecloud fn list

homecloud fn invoke hello --payload '{"name":"Ada"}'
# or payload file:
homecloud fn invoke hello --payload-file event.json

homecloud fn url hello
homecloud fn logs hello
homecloud fn logs hello --limit 20 --cursor '<next_cursor>'
homecloud fn watch hello          # מעקב SSE חי ל-invocation הבא
homecloud fn logs hello --id <id> --follow
```

### Observability ל-invocations

שלוש שכבות נפרדות:

| שכבה | מה | איפה |
|------|-----|------|
| **History (SoT)** | מטא-דאטה ברשימה + פירוט לפי id | Postgres דרך REST (`…/invocations`) |
| **Live stream** | stdout/stderr באמצע הרצה | SSE `…/logs/stream` (Platform NATS + באפר Redis ל-session catch-up) |
| **Persisted logs** | blob סופי מקוצר על שורת ה-invocation | Postgres (retention בסיסי בחינם) |

הרשימה בקונסול מתרעננת בעדינות על רמזי Realtime Gateway מסוג `function.invoke.*`. כש-Realtime כבוי ויש שורות pending/running, soft-poll כל ~5 שניות שומר על עדכניות (עדיין O(page) — בלי Follow poller על היסטוריה). חיפוש מורחב / retention ארוך (Loki/SO) הוא SKU עתידי — לא חלק מה-observability הבסיסי.

**Status מול phase מול warm**

| שדה | משמעות |
|-----|--------|
| `status` | תוצאה / סינון: `pending`, `running`, `succeeded`, `failed`, `timeout` |
| `phase` | באמצע הרצה בלבד: `queued` (התקבל, ממתין ל-worker דורבל) → `preparing` (STS/חבילה/extract) → `executing` (subprocess); `null` כשההרצה הסתיימה |
| `warm` | פגיעה במטמון של ה-executor — **לא** הוכחה שה-handler התחיל |

אל תסיקו מ־`warm=false` לבד שהקוד לא רץ. השתמשו ב־`phase` / לוגים / `error_message` כדי להפריד כשלי הכנה ב־control plane מכשלי runtime.

כשגרסת פונקציה נשמרת ב־Object Storage (`so://…`), ה־control plane מעביר את ה־URI ל־`homecloud-fn` וה־pod **מושך** את ה־zip בשלב `preparing` (דרך API פנימי). חבילות base64 נשארות נתמכות לגרסאות ישנות בלי URI.

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

    page = client.functions.logs("hello", limit=50)
    for row in page["items"]:
        print(row["id"], row["status"])
    if page.get("next_cursor"):
        page = client.functions.logs("hello", cursor=page["next_cursor"])
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
