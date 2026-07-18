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

### MFA

מנהלי פלטפורמה עם MFA חייבים להשלים גורם שני:

| שיטה | איך |
|------|-----|
| TOTP / קוד גיבוי | בקשה בטרמינל, או `--mfa-code` |
| Passkey / מפתח אבטחה | `homecloud login --browser` |

```bash
homecloud login --username alice --mfa-code 123456
homecloud login --browser
```

כל קריאת console שמחזירה `MFA_REQUIRED` מטופלת על ידי מנגנון MFA מרכזי ב-CLI (אתגר login או step-up) — הפקודות עצמן לא מממשות MFA.

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

Access Keys לא דורשים MFA בכל בקשה. יוצרים אותם פעם אחת בקונסול כשכבר מחוברים (כולל MFA).

## פרופילים

```bash
homecloud --profile production so ls media
homecloud configure --profile production
```

קובץ האישורים: `~/.homecloud/credentials`
