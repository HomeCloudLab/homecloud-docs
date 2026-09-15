# secrets

ערכי **Secrets** (data plane, Access Key). המודל הקנוני הוא מפה שטוחה `string → string`. JSON/YAML מקוננים ומפתחות כפולים נדחים.

`put` **מחליף את כל הסוד**. מפתחות שלא נכללים בקלט מוסרים.

`--format` בוחר את קודק הערכים (`json` | `env` | `yaml`). זה נפרד מ-`--output` הגלובלי למעטפות תגובה.

## get

```bash
homecloud secrets get my-secret
homecloud secrets get my-secret --format json
homecloud secrets get my-secret --format env
homecloud secrets get my-secret --format yaml
```

=== "PowerShell"

    ```powershell
    homecloud secrets get my-secret --format env
    ```

Stdout הוא המפה המסודרת (לא מעטפת metadata).

## put

```bash
homecloud secrets put my-secret --format env --file .env
homecloud secrets put my-secret --format json --file values.json
# stdin
cat values.json | homecloud secrets put my-secret --format json
```

=== "PowerShell"

    ```powershell
    homecloud secrets put my-secret --format env --file .env
    Get-Content values.json -Raw | homecloud secrets put my-secret --format json
    ```

מטא־נתוני התגובה משתמשים ב-`--output` (ברירת מחדל `json`).

## קשור

- [מדריך Secrets](../../guides/secrets.md)  
- [Authentication](../authentication.md)  
