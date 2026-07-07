# configure

Set up Access Key credentials for a profile.

```bash
homecloud configure
homecloud configure --profile staging
homecloud configure import ./credentials.json
```

## credentials.json (import)

```json
{
  "access_key_id": "HCAK...",
  "secret_access_key": "...",
  "apex": "holab.abrdns.com"
}
```

`default_account_id` is optional — resolved automatically from the Access Key.

## Files

| File | Purpose |
|------|---------|
| `~/.homecloud/credentials` | Access Keys per profile |
| `~/.homecloud/session` | JWT tokens + active account |

Override paths:

```bash
export HOMECLOUD_CONFIG_DIR=/path/to/config
export HOMECLOUD_CREDENTIALS_FILE=/path/to/credentials
```
