# SDK

SDK של HomeCloud ל-Python — גישה תכנותית עם Access Keys (בלי MFA אינטראקטיבי).

**מאגר:** [homecloud-sdk](https://github.com/HomeCloudLab/homecloud-sdk) · **גרסה:** 0.4.1

## התקנה

```bash
pip install homecloud-sdk
```

עד הפרסום ב-PyPI, התקנה מ-GitHub (מאגר פרטי דורש טוקן):

```bash
pip install "git+https://github.com/HomeCloudLab/homecloud-sdk.git"
# או checkout מקומי:
pip install -e ../homecloud-sdk
```

## התחלה מהירה

```python
from homecloud import HomeCloud

# CI / שרתים — Access Key בלבד
client = HomeCloud(
    access_key="HCAK...",
    secret_key="...",
)

# או סביבה: HC_ACCESS_KEY_ID / HC_SECRET_ACCESS_KEY
# client = HomeCloud.from_env()

# או ~/.homecloud/credentials (+ אופציונלי HC_PROFILE)
# client = HomeCloud()

client.so.upload("my-bucket", "./file.txt", key="docs/file.txt")
meta = client.so.head_object("my-bucket", "docs/file.txt")  # מטא־דאטה בלבד
client.mq.send("orders", {"id": 1})
```

### Async

```python
from homecloud import AsyncHomeCloud

async with AsyncHomeCloud.from_env() as client:
    meta = await client.so.head_object("my-bucket", "docs/file.txt")
    await client.mq.send("orders", {"id": 1})
```

`from homecloud_sdk import …` עדיין עובד לתאימות; מומלץ `from homecloud import …`.

## מודל אימות

| מי | איך | MFA |
|----|-----|-----|
| **SDK / אוטומציה** | Access Key + Secret (SigV1 data plane) | לא בבקשות |
| **CLI / משתמשים** | `homecloud login` → JWT | בזמן login / step-up |

יוצרים Access Keys פעם אחת בקונסולה (IAM). קריאות SDK בזמן ריצה לא מבקשות MFA.

ראו גם: [אימות CLI](../cli/authentication.md).

## פעולות לפי מישור

| API | אימות | הערות |
|-----|--------|--------|
| `so.upload` / `download` / `sync_*` / `list_objects` / `delete` / `head_object` | Access Key | נתיב ראשי |
| `so.get_object_uri` / `generate_presigned_url` | Access Key | URI ציבורי או URL מוגבל בזמן |
| `mq.send` / `receive` | Access Key | נתיב ראשי |
| `account_id()` | Access Key whoami | בלי JWT |
| `so.list_buckets` / `create_bucket` | Console JWT | ניהול |
| `queues.list` / `apps.list` / `accounts.*` | Console JWT | ניהול |

עוזרי login אינטראקטיביים (`login`, `login_browser`) מיועדים ל-CLI/כלים — לא לאוטומציה. ב-async אין prompt חוסם ל-MFA (אפשר להעביר `mfa_code`).

## פרופילים וסביבה

| משתנה | קיצור | השפעה |
|--------|--------|--------|
| `HOMECLOUD_PROFILE` | `HC_PROFILE` | פרופיל פעיל |
| `HOMECLOUD_ACCESS_KEY_ID` | `HC_ACCESS_KEY_ID` | מפתח |
| `HOMECLOUD_SECRET_ACCESS_KEY` | `HC_SECRET_ACCESS_KEY` | סוד |
| `HOMECLOUD_ACCOUNT_ID` | `HC_ACCOUNT_ID` | חשבון אופציונלי |
| `HOMECLOUD_APEX` | `HC_APEX` | דומיין פלטפורמה |

קובץ credentials: `~/.homecloud/credentials` (JSON multi-profile).

## קשר ל-CLI

[`homecloud-cli`](https://github.com/HomeCloudLab/homecloud-cli) הוא מעטפת Typer/Rich ש**תלויה** ב-`homecloud-sdk`. אין יותר העתקת מקור של ה-SDK בתוך ה-CLI.
