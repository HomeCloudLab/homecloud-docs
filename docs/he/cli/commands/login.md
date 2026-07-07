# login

אימות Console (JWT).

```bash
homecloud login
homecloud login --username alice --password 'secret'
homecloud login --profile staging
```

## Username מול email

ה-API מצפה ל-`username`, לא ל-email:

```bash
# ✓ נכון
homecloud login --username daivid

# ✗ שגוי (401 או אישורים לא תקינים)
homecloud login --username daivid.aba@gmail.com
```

## אחרי ההתחברות

```bash
homecloud accounts list
homecloud queues list
homecloud so ls-buckets
```

ה-session נשמר ב-`~/.homecloud/session`.
