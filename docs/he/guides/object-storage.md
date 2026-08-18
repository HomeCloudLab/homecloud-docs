# Object Storage (SO)

Object Storage שומר קבצים כ**אובייקטים** בתוך **buckets**. אין תיקיות אמיתיות — רק מפתחות אובייקט שעשויים להכיל `/` (למשל `photos/2026/img.jpg`).

השתמשו ב-SO לגיבויים, ארטיפקטי build, מדיה ו**אתרים סטטיים** שמוגשים ב-`https://{bucket}.web.{apex}`.

| פריט | ערך |
|------|--------|
| Console | **Object Storage** → `/console/storage` |
| API / CLI host | `https://so.{apex}` |
| URI scheme | `so://bucket/key` (לא `s3://`) |
| Auth (data plane) | Access Key |

## הליכה בקונסול

### יצירת bucket

1. פתחו **Object Storage**.  
2. לחצו **Create bucket**, בחרו שם בטוח ל-DNS, אשרו.  
3. פתחו את ה-bucket כדי לראות לשוניות: **Objects**, **Lifecycle**, **Versioning**, **Permissions**, **Website**.

### עיון והעלאת אובייקטים

1. פתחו את לשונית **Objects**.  
2. נווטו לפי prefix (הממשק מציג prefixes כמו תיקיות).  
3. **Upload** קובץ אחד או רבים. העלאות מרובות משתמשות בתור מקביליות (1 / 5 / 10 workers) עם השהיה, המשך וניסיון חוזר אוטומטי. קבצים בודדים גדולים משתמשים ב-multipart upload.  
4. ההתקדמות מופיעה ב**כותרת התחתונה** של הקונסול — אפשר למזער ולהמשיך לעבוד. סגירת הלשונית בזמן העלאות תזהיר; ביטול מפסיק חלקים שהועלו.

### מאפייני אובייקט

פתחו אובייקט → **Properties** כדי לראות גודל, סוג תוכן ו-URI **`so://bucket/key`** להעתקה. השתמשו ב-URI הזה ב-CLI/SDK. ב-PowerShell ציטטו URIs כשמפתחות מכילים רווחים:

```powershell
homecloud so cp "so://media/watch/spider noir/1/file.mkv" ".\file.mkv"
```

### אירוח אתר סטטי

1. פתחו את ה-bucket → **Website**.  
2. הפעילו אירוח אתר והגדירו מסמכי index / error (למשל `index.html`, `404.html`).  
3. העלו את קבצי האתר (או `homecloud so sync ./dist so://my-website/ --delete`).  
4. פתחו `https://{bucket}.web.{apex}`.

### Lifecycle, versioning, permissions

| לשונית | מטרה |
|--------|------|
| **Lifecycle** | לפוג אובייקטים או לבטל העלאות multipart שלא הושלמו אחרי N ימים |
| **Versioning** | לשמור גרסאות קודמות של מפתחות שנדרסו |
| **Permissions** | מדיניות bucket / כללי גישה לחשבון |

כללי Lifecycle נאכפים לפי לוח זמנים (לא ברגע השמירה).

### חיפוש

השתמשו בחיפוש bucket כשצריך למצוא מפתחות לפי שם/prefix ב-bucket גדול (ראו את עזרת Search בקונסול לפילטרים).

## CLI

דרישות קדם: [התקנה](../cli/install.md), [Access Key](../getting-started/access-keys.md). רשימת buckets דורשת `homecloud login`; העברות אובייקטים משתמשות ב-Access Key.

### רשימת buckets ואובייקטים

```bash
homecloud login --username alice
homecloud so ls-buckets

homecloud so ls media
homecloud so ls media --prefix photos/ --recursive
```

### העתקת קובץ אחד

=== "העלאה"

    ```bash
    homecloud so cp ./build.zip so://media/releases/build.zip
    ```

=== "הורדה"

    ```bash
    homecloud so cp so://media/releases/build.zip ./build.zip
    ```

### סנכרון תיקייה (נפוץ לאתרים סטטיים ולפריסות)

הכיוון עוקב אחרי סדר הארגומנטים. ברירת המחדל **דורסת** מפתחות תואמים.

| דגל | משמעות |
|-----|--------|
| *(none)* | דריסה כשהמקור מכיל את הקובץ |
| `--skip` | דילוג כשגודל היעד כבר תואם |
| `--delete` | גם הסרת עודפים ביעד (מראה) |
| `-j N` | העברות קבצים במקביל (ברירת מחדל 10, מקסימום 64) |

=== "העלאה מקומי → bucket"

    ```bash
    homecloud so sync ./dist so://my-website/
    homecloud so sync ./dist so://my-website/ --delete
    homecloud so sync ./dist so://my-website/ --skip -j 16
    ```

=== "הורדה bucket → מקומי"

    ```bash
    homecloud so sync so://docs/ ./site
    homecloud so sync so://docs/ ./site --delete
    ```

=== "באקט → באקט"

    ```bash
    homecloud so sync so://photos/ so://backup/photos/
    homecloud so sync so://src/ so://dest/ --delete --skip
    ```

=== "CI (סיכום JSON, בלי סרגל חי)"

    ```bash
    homecloud so sync ./dist so://my-website/ --delete --output json
    ```

### מחיקה

```bash
homecloud so rm so://media/old/file.txt
homecloud so rm so://media/old/ --recursive
```

מדריך דגלים מלא: [פקודות CLI `so`](../cli/commands/so.md).

## SDK

=== "Python"

    ```python
    from homecloud import HomeCloud

    client = HomeCloud.from_env()

    client.so.upload("docs", "./readme.md", key="readme.md")
    client.so.upload(
        "media",
        body=b"...",
        key="videos/clip.mp4",
        content_type="video/mp4",
    )

    meta = client.so.head_object("docs", "readme.md")  # metadata only
    client.so.download("docs", "readme.md", "./readme-copy.md")

    uri = client.so.get_object_uri("docs", "readme.md")
    # uri["so_uri"], uri["https_url"]

    url = client.so.generate_presigned_url("docs", "readme.md", expires_in=3600)

    client.so.sync("./dist", "so://my-website/", delete=True)
    client.so.sync("so://docs/", "./site")
    client.so.sync("so://photos/", "so://backup/photos/", delete=True)
    ```

=== "Python (async)"

    ```python
    from homecloud import AsyncHomeCloud

    async with AsyncHomeCloud.from_env() as client:
        await client.so.upload("docs", "./a.txt", key="a.txt")
        meta = await client.so.head_object("docs", "a.txt")
    ```

=== "Node.js"

    ```js
    const { HomeCloud } = require("@homecloud-platform/sdk");

    const client = HomeCloud.fromEnv();
    await client.so.putJson("docs", "a.json", { ok: true });
    ```

עוזרי ניהול כמו `list_buckets` / `create_bucket` בדרך כלל דורשים סשן JWT של קונסול (כמו `homecloud login`). העלאה/הורדה/סנכרון בזמן ריצה משתמשים רק ב-Access Key.

## זרימות עבודה טיפוסיות

### פריסת אתר סטטי מ-CI

1. צרו bucket `my-website`, הפעילו **Website**.  
2. צרו Access Key עם `so:*` (או מדיניות מוגבלת ל-bucket הזה).  
3. ב-CI:

```bash
export HC_ACCESS_KEY_ID=...
export HC_SECRET_ACCESS_KEY=...
export HC_APEX=holab.abrdns.com
homecloud so sync ./dist so://my-website/ --delete --output json
```

### שיתוף קישור הורדה זמני

השתמשו ב-`generate_presigned_url` ב-SDK, או הורידו דרך CLI והפיצו את הקובץ בעצמכם. העדיפו זמני תפוגה קצרים.

## טיפים ומלכודות

- העדיפו **`so://`** בכל מקום בתיעוד ובכלי HomeCloud — לא `s3://`.  
- מפתחות עם רווחים דורשים ציטוט ב-PowerShell.  
- `so sync` בלי `--skip` דורס במכוון (מאז CLI v0.2.15).  
- העלאות multipart שלא הושלמו אפשר לנקות בכלל abort של lifecycle.  
- שמות bucket צריכים להישאר בטוחים ל-DNS אם מפעילים אירוח אתר.

## קשור

- [CLI `so`](../cli/commands/so.md)  
- [SDK](../sdk/index.md)  
- [Access Keys](../getting-started/access-keys.md)  
- [Terraform](../terraform/index.md) (`homecloud_so_bucket`)  
