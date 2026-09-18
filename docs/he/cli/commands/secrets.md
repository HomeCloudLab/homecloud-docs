# secrets

ערכי **Secrets** (data plane, Access Key). המודל הקנוני הוא מפה שטוחה `string → string`. JSON/YAML מקוננים ומפתחות כפולים נדחים.

- `put` **מחליף** את כל הסוד כברירת מחדל (מפתחות שלא נשלחו נמחקים).
- `put --merge` / `set` **מעדכנים/יוצרים** רק את המפתחות שנשלחו; השאר נשאר.
- `get --key` מחזיר תת־קבוצה (מפתח חסר → שגיאה).

`--format` בוחר את קודק הערכים (`json` | `env` | `yaml`). זה נפרד מ-`--output` הגלובלי למעטפות תגובה.

## get

```bash
homecloud secrets get my-secret
homecloud secrets get my-secret --format env
homecloud secrets get my-secret --key API_KEY --key DB_HOST
homecloud secrets get my-secret -k API_KEY --format env
```

Stdout הוא המפה המסודרת (לא מעטפת metadata).

## put

```bash
# החלפת כל המפה
homecloud secrets put my-secret --format env --file .env

# upsert מפתחות בלבד
homecloud secrets put my-secret --merge --format json --file patch.json
```

## set

הוספה/עריכה של זוגות `KEY=VALUE` (תמיד merge):

```bash
homecloud secrets set my-secret API_KEY=rotated DB_HOST=db.internal
```

## קשור

- [מדריך Secrets](../../guides/secrets.md)  
- [Authentication](../authentication.md)  
