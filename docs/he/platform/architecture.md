# ארכיטקטורה

‏HomeCloud מפריד בין **control plane** ל-**data plane**:

| שכבה | רכיבים | אימות |
|-------|------------|------|
| Control plane | `homecloud-api`, `homecloud-ui` | JWT (משתמשים) |
| Data plane | שערי SO, MQ, MDB, Secrets | Access Key + חתימת HMAC |

## אזורי DNS

עבור apex‏ `holab.abrdns.com`:

```text
console.holab.abrdns.com     → API + UI
so.holab.abrdns.com          → Object storage API
{bucket}.web.holab.abrdns.com → Static websites
mq.holab.abrdns.com          → Message queues
mdb.holab.abrdns.com         → Databases
secrets.holab.abrdns.com     → Secrets
```

## חתימת בקשות (data plane)

```
StringToSign = METHOD + "\n" + PATH + "\n" + TIMESTAMP + "\n" + ACCOUNT_ID
Signature = HMAC-SHA256(secret, StringToSign)
```

כותרות: `X-Homecloud-Access-Key-Id`, `X-Homecloud-Date`, `X-Homecloud-Signature`

## מאגרים

ראו [ממשל יישום (Implementation governance)](https://github.com/HomeCloudLab/homecloud-infra/blob/master/docs/architecture/implementation-governance.md) ב-`homecloud-infra`.
