# Redis

HomeCloud Redis is a **managed cache** for your account. Use it for session stores, rate limits, queues of short-lived keys, and application caching.

| Item | Value |
|------|--------|
| Console | **Redis** → `/console/redis` |
| Credentials | Stored/revealed via the instance UI (often integrated with Secrets) |

## Console walkthrough

### Create

1. Open **Redis** → **Create**.  
2. Choose a name and size/options offered by the form.  
3. Wait until the instance is ready.

### Connect

1. Open the instance.  
2. Copy the connection endpoint and reveal the password when needed.  
3. Prefer storing the password in [Secrets](secrets.md) and injecting it into Applications / Functions / Kubernetes workloads.

Typical clients: `redis-cli`, `ioredis`, `redis-py`, language frameworks.

```bash
redis-cli -h <host> -p <port> --tls -a '<password>'
```

Exact TLS and port details appear on the instance page for your platform version — use those values, not guesses.

### Day-2

- Rotate credentials when people leave or secrets leak.  
- Delete unused instances to free quota.  
- Monitor memory usage from the instance overview if charts are shown.

## Use from an application

1. Create the Redis instance.  
2. Save host + password in a Secret.  
3. In an Application or Deployment, map the secret to environment variables (`REDIS_URL`, etc.).  
4. Point your framework at that URL.

## Tips

- Treat Redis as **ephemeral cache** unless your platform docs say persistence is enabled for your plan.  
- Do not commit Redis passwords to git.  
- Network access follows account isolation — other accounts cannot reach your instance.

## Related

- [Secrets](secrets.md)  
- [Applications](applications.md)  
- [Managed Databases](databases.md)  
- [Terraform](../terraform/index.md) (`homecloud_redis_instance`)  
