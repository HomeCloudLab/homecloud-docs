# Image Registry (IR)

IR הוא **registry פרטי של OCI / Docker** לחשבון שלכם. דחפו לכאן images ל-Applications ול-Kubernetes במקום להשתמש ב-registry ציבורי לקוד פרטי.

| פריט | ערך |
|------|--------|
| Console | **Registry** → `/console/registry` |
| Registry host | `ir.{apex}` |
| Image reference | `ir.{apex}/{account_short_id}/{repository}:{tag}` |
| Auth | `homecloud ir login` (פרופיל Access Key) עם `ir:Push` / `ir:Pull` |

GHCR של הפלטפורמה (אם קיים) מיועד ל-CI של HomeCloud עצמה — לא לתמונות ה-tenant שלכם.

## הליכה בקונסול

### יצירת repository

1. פתחו **Registry** → **Create repository**.  
2. בחרו שם.  
3. אופציונלית הגדירו **lifecycle**: שמירת N tags אחרונים, ועוד tags מוגנים שאסור למחוק לעולם.  
4. פתחו את ה-repo כדי לראות tags/digests ושימוש.

### שימוש ומכסות

פתחו **Usage** (קונסול או CLI) כדי לראות כמה אחסון נצרך. השביתו או נקו tags ישנים כשמתקרבים למכסה. Digests (`@sha256:…`) בלתי משתנים — העדיפו digests בפריסות פרודקשן.

## זרימת Docker / Podman

### התחברות

```bash
homecloud configure   # פעם אחת: מזהה Access Key + secret
homecloud ir login    # מריץ docker login מהפרופיל (בלי הזנה ידנית)
```

חלופה בסגנון AWS:

```bash
homecloud ir get-login-password | docker login --username <AccessKeyId> --password-stdin ir.holab.abrdns.com
```

המפתח צריך `ir:Push` ו/או `ir:Pull`.

### Tag ו-push

בקונסול, פתחו את ה-repository והשתמשו ב-**פקודות push** עם host/חשבון/ריפו כבר ממולאים. או:

```bash
docker build -t myapp:1.0 .
docker tag myapp:1.0 ir.holab.abrdns.com/abc123def456/myapp:1.0
docker push ir.holab.abrdns.com/abc123def456/myapp:1.0
```

החליפו `abc123def456` ב-**account short id** שלכם (מוצג בדף registry בקונסול / סקירת חשבון).

### Pull

```bash
docker pull ir.holab.abrdns.com/abc123def456/myapp:1.0
# production:
docker pull ir.holab.abrdns.com/abc123def456/myapp@sha256:...
```

## CLI

```bash
homecloud ir login
homecloud ir repo list
homecloud ir repo create myapp --keep-last 10
homecloud ir usage
```

ראו [CLI `ir`](../cli/commands/ir.md).

## SDK

```python
from homecloud import HomeCloud

client = HomeCloud.from_env()
print(client.ir.list())
client.ir.create("myapp", keep_last=10)
print(client.ir.usage())
```

## שימוש עם Applications / Kubernetes

1. דחפו `myapp:1.0` ל-IR.  
2. ביצירה/הגדרות של Application, הגדירו את ה-image להפניית IR.  
3. ודאו שה-runtime יכול למשוך (pull secrets של הפלטפורמה / זהות עומס כפי שמוגדר לחשבון).

## טיפים

- הגנו על `latest` או tags של שחרור בהגדרות lifecycle אם אתם מסתמכים עליהם.  
- העדיפו נעיצת digest לפרודקשן.  
- סובבו Access Keys שבשימוש ב-CI כמו כל סוד אחר.

## קשור

- [Applications](applications.md)  
- [Kubernetes](kubernetes.md)  
- [Access Keys](../getting-started/access-keys.md)  
- [Terraform](../terraform/index.md) (`homecloud_ir_repository` — תגיות image לא ב-Terraform)  
