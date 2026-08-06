# configure

הגדרת אישורי Access Key לפרופיל.

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

`default_account_id` אופציונלי — נפתר אוטומטית מה-Access Key.

## קבצים

| קובץ | מטרה |
|------|------|
| `~/.homecloud/credentials` | Access Keys לפי פרופיל |
| `~/.homecloud/session` | טוקני JWT + חשבון פעיל |

דריסת נתיבים:

```bash
export HOMECLOUD_CONFIG_DIR=/path/to/config
export HOMECLOUD_CREDENTIALS_FILE=/path/to/credentials
```
