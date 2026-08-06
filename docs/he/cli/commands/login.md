# login

אימות קונסול (JWT). תומך בסיסמה בלבד, MFA (TOTP / קודי גיבוי), והתחברות דפדפן ל-passkeys.

```bash
homecloud login
homecloud login --account 100200300400 --username alice --password 'secret'
homecloud login --profile staging
```

## חשבון, ואז שם משתמש

ההתחברות פותרת **Account → Username → Password → MFA**. `--account` מקבל את מספר
החשבון או את כינוי החשבון, ונדרש להתחברות טרמינל (התחברות דפדפן פותרת
אותו בדף ההתחברות של הקונסול במקום):

```bash
# ✓ Correct — account number or alias, then username (not email)
homecloud login --account 100200300400 --username daivid
homecloud login --account acme-corp --username daivid

# ✗ Wrong (401 or invalid credentials)
homecloud login --account acme-corp --username daivid.aba@gmail.com
```

## תפריטים אינטראקטיביים

בטרמינל אמיתי (TTY), `homecloud login` שואל איך להתחבר עם מקשי חצים:

```text
? How do you want to sign in?
❯ Terminal  — username, password, authenticator / backup code
  Browser   — passkeys & security keys (recommended if you use a passkey)
```

אם MFA מציע גם מאמת וגם passkey:

```text
? Choose second factor
❯ Authenticator app or backup code
  Passkey / security key (YubiKey) — opens browser
```

דגלים מדלגים על התפריטים: `--browser`, `--mfa-code`, `--account` / `--username` / `--password`.

## MFA (TOTP / קודי גיבוי)


אם MFA מופעל למשתמש, ה-CLI מבקש קוד אימות אחרי הסיסמה:

```bash
$ homecloud login --account 100200300400 --username alice
Password:
Verification code: 123456
✓ Logged in
```

לא־אינטראקטיבי / סקריפטים:

```bash
homecloud login --account 100200300400 --username alice --password 'secret' --mfa-code 123456
```

`mfa_token` וקודי אימות אף פעם לא נכתבים לדיסק — רק ה-JWT שמתקבל נשמר ב-`~/.homecloud/session`.

## התחברות דפדפן (passkeys / מפתחות אבטחה)

מומלץ כשמשתמשים ב-passkeys או במפתחות אבטחה חומרתיים:

```bash
homecloud login --browser
```

זרימה:

1. ה-CLI מתחיל סשן קצר־חיים ופותח את הקונסול
2. מתחברים בדפדפן (סיסמה, TOTP, קוד גיבוי או passkey)
3. אחרי התחברות מוצלחת ה-CLI מורשה אוטומטית
4. ה-CLI מקבל JWT חד־פעמי ויוצא

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
