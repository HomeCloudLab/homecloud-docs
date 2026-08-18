# אימות

ה-CLI משתמש ב**שני** סוגי אישורים. בחרו את זה שמתאים לפקודה.

## מתי להשתמש במה

| רוצים… | השתמשו ב |
|--------|----------|
| ליצור משאבים בממשק, לרשום תורים/buckets/apps, לנהל Function URLs | **התחברות לקונסול** (`homecloud login`) |
| להעלות/לסנכרן אובייקטים, לשלוח/לקבל הודעות, לעשות invoke ל-Function URLs | **Access Key** (`homecloud configure`) |

הרבה זרימות משתמשות בשניהם באותו סשן shell.

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

## Access Key (data plane)

```bash
homecloud configure
```

או inline ל-CI:

```bash
homecloud \
  --access-key-id "$HOMECLOUD_ACCESS_KEY_ID" \
  --secret-access-key "$HOMECLOUD_SECRET_ACCESS_KEY" \
  so sync ./dist so://my-bucket/ --delete
```

אין צורך בדגל `account_id` — המפתח כבר מוגבל לחשבון אחד.

Access Keys אף פעם לא מבקשים MFA בכל בקשה. צרו אותם פעם אחת בקונסול (עם MFA אם מופעל): [Access Keys](../getting-started/access-keys.md).

## פרופילים

```bash
homecloud configure --profile production
homecloud --profile production so ls media
```

קובץ אישורים: `~/.homecloud/credentials`

## קשור

- [התקנה](install.md)  
- [מפת פקודות](commands/index.md)  
- [IAM](../guides/iam.md)  
- [Terraform](../terraform/index.md)  
