# Architecture

HomeCloud splits **control plane** and **data plane**:

| Layer | Components | Auth |
|-------|------------|------|
| Control plane | `homecloud-api`, `homecloud-ui` | JWT (users) |
| Data plane | SO, MQ, MDB, Secrets gateways | Access Key + HMAC signature |

## DNS zones

For apex `holab.abrdns.com`:

```text
console.holab.abrdns.com     → API + UI
so.holab.abrdns.com          → Object storage API
{bucket}.web.holab.abrdns.com → Static websites
mq.holab.abrdns.com          → Message queues
mdb.holab.abrdns.com         → Databases
secrets.holab.abrdns.com     → Secrets
```

## Request signing (data plane)

```
StringToSign = METHOD + "\n" + PATH + "\n" + TIMESTAMP + "\n" + ACCOUNT_ID
Signature = HMAC-SHA256(secret, StringToSign)
```

Headers: `X-Homecloud-Access-Key-Id`, `X-Homecloud-Date`, `X-Homecloud-Signature`

## Repositories

See [Implementation governance](https://github.com/HomeCloudLab/homecloud-infra/blob/master/docs/architecture/implementation-governance.md) in `homecloud-infra`.
