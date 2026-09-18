# Secrets

Secrets מאחסנים ערכים רגישים (טוקני API, סיסמאות DB, מפתחות webhook) כרשומות בשם עם מפת **שטוחה** של מפתח/ערך (`string → string`). אפליקציות, Functions ומפעילים שולפים אותם בלי להקשיח סודות במקור.

| פריט | ערך |
|------|--------|
| Console | **Secrets** → `/console/secrets` |
| Data plane | `secrets.{apex}` (Access Key) |
| אחסון | Kubernetes Opaque Secret ב-namespace של החשבון (הצפנת etcd + TLS). מטא־נתונים ב-control plane; ערכים לא נשמרים כטקסט גלוי ב-Postgres. |

## הליכה בקונסול

### יצירה

1. פתחו **Secrets** → **Create**.  
2. בחרו שם (מזהה יציב שהאפליקציה תפנה אליו).  
3. אופציונלי: הגדירו זוגות מפתח/ערך ראשוניים.  
4. שמרו.

### לשונית Values

משטח אחד לצפייה ולעריכה:

1. פתחו את הסוד → **Values**.  
2. **Reveal** הוא מתג: הפעלה טוענת ומציגה ערכים (למשך הסשן בלבד).  
3. **Edit** עובד גם בלי Reveal — הקונסול שולף את המפה כחלק מהעריכה.  
4. עורך ברירת המחדל הוא **Table** (שורות מפתח/ערך כמו קודם). רחפו בין שורות ל־**`+`** להוספה.  
5. **Source** מחליף לטקסט JSON / ENV / YAML על אותה מפה שטוחה (מבנים מקוננים ומפתחות כפולים נדחים).  
6. **Save new version** מחליף את כל המפה. הסרת מפתחות דורשת אישור.

**Settings** לתיאור ומחיקה. דוגמאות API/SDK ב[תיעוד](../sdk/index.md) וב-[CLI](../cli/commands/secrets.md) — לא בלשונית בפרטי הסוד.

### מחיקה

מחקו סודות שאינם בשימוש כדי להפחית חשיפה. עדכנו צרכנים קודם כדי שפריסות לא יישברו.

## פורמטים (JSON / ENV / YAML)

כל המשטחים חולקים מודל אחד: מפה שטוחה של מחרוזות.

| פורמט | דוגמה |
|--------|---------|
| JSON | `{ "API_KEY": "…", "DATABASE_URL": "…" }` |
| ENV | `API_KEY=…` |
| YAML | `API_KEY: …` |

נדחים: אובייקטים/מערכים מקוננים, ערכי JSON שאינם מחרוזת, מפתחות כפולים.

## CLI

```bash
homecloud secrets create my-secret
homecloud secrets create my-secret API_KEY=test DB_HOST=db.internal
homecloud secrets create my-secret --format env --file .env
homecloud secrets get my-secret
homecloud secrets get my-secret --format env
homecloud secrets put my-secret --format env --file .env
homecloud secrets set my-secret API_KEY=rotated
```

`create` דורש Access Key (`homecloud configure`). `get` / `put` / `set` דורשים Access Key. `put` מחליף את **כל** הסוד. ראו [secrets CLI](../cli/commands/secrets.md).

## Access Keys ומדיניות

קריאה בזמן ריצה דרך ה-data plane דורשת Access Key (או תפקיד) עם פעולות `secrets:…`. הגבילו מדיניות ל-ARNs ספציפיים כשאפשר. ראו [IAM](iam.md).

## SDK

```python
from homecloud import HomeCloud

client = HomeCloud.from_env()
print(client.secrets.list())
client.secrets.create("my-secret", API_KEY="test")
print(client.secrets.get_value("my-secret"))
print(client.secrets.get_value("my-secret", "API_KEY"))
client.secrets.put_value("my-secret", {"API_KEY": "rotated"})  # החלפת כל המפה
client.secrets.put_value("my-secret", API_KEY="test", merge=True)  # upsert שדות
print(client.secrets.get_value("my-secret", format="env"))
client.secrets.put_value("my-secret", "API_KEY=x", format="env", merge=True)
```

קודקים (`json` | `env` | `yaml`) דרך `format=` ב-`get_value` / `put_value` (כמו `--format` ב-CLI). סטרינג בלי ירידת שורה בסוף תקין.

## טיפים

- לעולם אל תעלו ערכי סוד ל-git או תשימו אותם בקבצי מקור של Function.  
- השתמשו בסוד אחד לכל אינטגרציה כדי שסיבוב יהיה מוגבל.  
- אחרי סיבוב סיסמת DB ב-MDB, עדכנו את ה-Secret שהאפליקציה קוראת.

## קשור

- [CLI secrets](../cli/commands/secrets.md)  
- [IAM](iam.md)  
- [Databases](databases.md)  
- [Functions](functions.md)  
- [Applications](applications.md)  
- [Terraform](../terraform/index.md) (`homecloud_secret`)  
