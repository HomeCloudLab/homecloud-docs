# configure

הגדרת אישורי Access Key עבור פרופיל.

```bash
homecloud configure
homecloud configure --profile staging
homecloud configure import ./credentials.json
```

## credentials.json (ייבוא)

```json
{
  "access_key_id": "HCAK...",
  "secret_access_key": "...",
  "apex": "holab.abrdns.com"
}
```

השדה `default_account_id` הוא אופציונלי — מזוהה אוטומטית מתוך ה-Access Key.

## קבצים

| קובץ | מטרה |
|------|---------|
| `~/.homecloud/credentials` | מפתחות גישה לכל פרופיל |
| `~/.homecloud/session` | אסימוני JWT + חשבון פעיל |

דריסת נתיבים:

```bash
export HOMECLOUD_CONFIG_DIR=/path/to/config
export HOMECLOUD_CREDENTIALS_FILE=/path/to/credentials
```
