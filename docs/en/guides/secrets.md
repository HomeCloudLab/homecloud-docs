# Secrets

Secrets store sensitive values (API tokens, DB passwords, webhook keys) as named entries with key/value maps. Apps, Functions, and operators retrieve them without hard-coding secrets in source.

| Item | Value |
|------|--------|
| Console | **Secrets** → `/console/secrets` |
| Data plane | `secrets.{apex}` (Access Key) |
| Reveal | Audited in the control plane |

## Console walkthrough

### Create

1. Open **Secrets** → **Create**.  
2. Choose a name (stable identifier your app will reference).  
3. Add one or more keys (for example `username`, `password`, `url`).  
4. Save.

### View and rotate

1. Open the secret.  
2. Use **Values** to reveal (audited) or update keys.  
3. Prefer rotation over sharing screenshots in chat.  
4. **Settings** / **API** tabs show metadata and example calls.

### Delete

Delete unused secrets to reduce exposure. Update consumers first so deploys do not break.

## Use from workloads

Patterns you will see in HomeCloud:

- Application settings reference a secret name / key  
- Function configuration injects secret values at runtime  
- Kubernetes / app templates map secret keys to environment variables  

Exact binding UI depends on the consuming service — look for “Secret” pickers in Applications, Functions, and Databases connection helpers.

## Access Keys and policies

Runtime read of secrets through the data plane requires an Access Key (or assumed role) with the right `secrets:…` actions. Scope policies to specific secret ARNs when possible. See [IAM](iam.md).

## SDK

```python
from homecloud import HomeCloud

client = HomeCloud.from_env()
print(client.secrets.list())
```

Management and reveal often go through the console JWT APIs; keep long-lived automation on least-privilege Access Keys.

## Tips

- Never commit secret values to git or put them in Function source files.  
- Use one secret per integration (database, Stripe, SMTP) so rotation is scoped.  
- After rotating a DB password in MDB, update the Secret your app reads.

## Related

- [IAM](iam.md)  
- [Databases](databases.md)  
- [Functions](functions.md)  
- [Applications](applications.md)  
