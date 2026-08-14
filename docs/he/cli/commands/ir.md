# ir

פקודות Image Registry (IR) לתמונות OCI / Docker פרטיות.

## login

מתחבר ל-Docker מול IR עם פרופיל ה-Access Key המוגדר (בלי הזנת username/password ידנית):

```bash
homecloud configure   # פעם אחת: שמירת מזהה + secret
homecloud ir login
```

שקיל ל-pipe בסגנון AWS:

```bash
homecloud ir get-login-password | docker login --username <AccessKeyId> --password-stdin ir.holab.abrdns.com
```

אפשרויות:

- `--registry HOST` — דריסת מארח ה-registry (ברירת מחדל `ir.{apex}`)
- `--print-only` — הדפסת פקודת ה-pipe בלבד; לא מריץ `docker`

Access Key צריך `ir:Push` ו/או `ir:Pull`.

## get-login-password

מדפיס את ה-secret ל-stdout עבור `--password-stdin` (CI / סקריפטים):

```bash
homecloud ir get-login-password | docker login --username "$HOMECLOUD_ACCESS_KEY_ID" --password-stdin ir.holab.abrdns.com
```

## repo

```bash
homecloud login --username alice
homecloud ir repo list
homecloud ir repo create myapp
homecloud ir repo create myapp --output json
```

## usage

```bash
homecloud ir usage
homecloud ir usage --output json
```

## דוגמת Push

```bash
docker build -t myapp:1.0 .
docker tag myapp:1.0 ir.holab.abrdns.com/<account_short_id>/myapp:1.0
docker push ir.holab.abrdns.com/<account_short_id>/myapp:1.0
```

Account short id ומארח ה-registry מוצגים בדף Registry בקונסול (**פקודות push**) ונגזרים מ-apex ב-`ir login`.

## קשור

- [מדריך Image Registry](../../guides/registry.md)  
- [Access Keys](../../getting-started/access-keys.md)  
