# login

אימות לקונסול (JWT). תומך בסיסמה בלבד, MFA (TOTP / קודי גיבוי), והתחברות בדפדפן ל-passkeys.

```bash
homecloud login
homecloud login --username alice --password 'secret'
homecloud login --profile staging
```

## שם משתמש מול אימייל

ה-API מצפה ל-`username`, לא לאימייל:

```bash
# ✓ נכון
homecloud login --username daivid

# ✗ שגוי (401 או credentials לא תקינים)
homecloud login --username daivid.aba@gmail.com
```

## MFA (TOTP / קודי גיבוי)

אם MFA מופעל למשתמש platform admin, ה-CLI מבקש קוד אימות אחרי הסיסמה:

```bash
$ homecloud login --username alice
Password:
Verification code: 123456
✓ Logged in
```

ללא אינטראקציה / סקריפטים:

```bash
homecloud login --username alice --password 'secret' --mfa-code 123456
```

`mfa_token` וקודי אימות לעולם לא נשמרים בדיסק — רק ה-JWT נשמר ב-`~/.homecloud/session`.

## התחברות בדפדפן (passkeys / מפתחות אבטחה)

מומלץ כשמשתמשים ב-passkeys או מפתחות חומרה:

```bash
homecloud login --browser
```

תהליך:

1. ה-CLI פותח סשן קצר-חיים ופותח את הקונסול
2. מתחברים בדפדפן (סיסמה, TOTP, קוד גיבוי או passkey)
3. לוחצים **אשר CLI**
4. ה-CLI מקבל JWT חד-פעמי ומסיים

```text
Opening browser...
Complete authentication in your browser.
  https://console.…/auth/cli?session=…
Waiting for authentication...
✓ Logged in
```

## אחרי התחברות

```bash
homecloud accounts list
homecloud queues list
homecloud so ls-buckets
```

הסשן נשמר ב-`~/.homecloud/session`.
