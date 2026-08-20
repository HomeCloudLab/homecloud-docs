# אימות

ה-CLI משתמש ב**שני** סוגי אישורים. העדיפו Access Keys לאוטומציה; התחברות לקונסול לבני אדם אינטראקטיביים.

## מתי להשתמש במה (credentials-first)

| רוצים… | השתמשו ב |
|--------|----------|
| רשימה/יצירת buckets, רשימת תורים, Terraform, APIs ניהוליים שמותרים במדיניות | **Access Key** (`homecloud configure`) — SigV1, בלי JWT |
| העלאה/סנכרון אובייקטים, שליחה/קבלה של הודעות, invoke ל-Function URLs | **Access Key** |
| דפדפן קונסול, MFA step-up, bootstrap נדיר ב-CLI | **התחברות לקונסול** (`homecloud login`) |
| פרוטוקולים מיוחדים (למשל IR ↔ Docker login) | התחברות לקונסול / זרימה ייעודית |

ההרשאות תמיד מגיעות מ**מדיניות וקבוצות IAM** של הזהות (ADR-053). ה-Access Key עצמו לא נושא מטריצת הרשאות.

## התחברות לקונסול (JWT)

```bash
homecloud login --username alice
# Password prompted interactively, or:
homecloud login --username alice --password '...'
```

!!! important
    ההתחברות משתמשת ב**שם משתמש**, לא באימייל.

### MFA

| שיטה | איך |
|------|-----|
| TOTP / קוד גיבוי | הנחיה בטרמינל, או `--mfa-code` |
| Passkey / מפתח אבטחה | `homecloud login --browser` |

```bash
homecloud login --username alice --mfa-code 123456
homecloud login --browser
```

קובץ סשן: `~/.homecloud/session` (לפי פרופיל).

## Access Key (ברירת מחדל ל-CLI/SDK)

```bash
homecloud configure
```

או inline ל-CI:

```bash
homecloud \
  --access-key-id "$HOMECLOUD_ACCESS_KEY_ID" \
  --secret-access-key "$HOMECLOUD_SECRET_ACCESS_KEY" \
  so ls-buckets
```

דוגמאות שעובדות עם Access Key בלבד (כשהמדיניות Allow):

```bash
homecloud so ls-buckets
homecloud queues list
```

אין צורך ב-`account_id` — המפתח כבר מוגבל לחשבון אחד.

Access Keys לא מבקשים MFA בכל בקשה. יצירה חד־פעמית בקונסול (עם MFA אם מופעל): [Access Keys](../getting-started/access-keys.md).

## Profiles

```bash
homecloud configure --profile production
homecloud --profile production so ls media
```

קובץ אישורים: `~/.homecloud/credentials`

## Related

- [Install](install.md)  
- [Command map](commands/index.md)  
- [IAM](../guides/iam.md)  
- [Terraform](../terraform/index.md)  
