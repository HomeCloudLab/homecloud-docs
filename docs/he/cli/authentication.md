# אימות

ה-CLI של HomeCloud משתמש בשני מצבי אימות בהתאם לפקודה.

## התחברות ל-Console (JWT)

עבור פקודות control-plane: ‏`login`, `accounts`, `queues list`, `so ls-buckets`.

```bash
homecloud login --username alice
# הסיסמה מתבקשת אינטראקטיבית, או:
homecloud login --username alice --password '...'
```

!!! important
    ההתחברות משתמשת ב-**username**, לא ב-email. השדה ב-console API הוא `username`.

ה-session נשמר ב-`~/.homecloud/session` לכל פרופיל.

## Access Key (data plane)

עבור `mq`, `so ls/cp/sync/rm`:

```bash
homecloud configure
```

או בשורה (אידיאלי ל-CI):

```bash
homecloud \
  --access-key-id "$HOMECLOUD_ACCESS_KEY_ID" \
  --secret-access-key "$HOMECLOUD_SECRET_ACCESS_KEY" \
  so sync ./dist so://my-bucket/ --delete
```

אין צורך ב-`account_id` — הוא מזוהה דרך `/access-key/whoami` בשער ה-SO.

## פרופילים

```bash
homecloud --profile production so ls media
homecloud configure --profile production
```

קובץ האישורים: `~/.homecloud/credentials`
