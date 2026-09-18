# Secrets

Secrets store sensitive values (API tokens, DB passwords, webhook keys) as named entries with a **flat** key/value map (`string → string`). Apps, Functions, and operators retrieve them without hard-coding secrets in source.

| Item | Value |
|------|--------|
| Console | **Secrets** → `/console/secrets` |
| Data plane | `secrets.{apex}` (Access Key) |
| Storage | Kubernetes Opaque Secret in the account namespace (etcd encryption at rest + TLS). Metadata lives in the control plane; values are not stored as Postgres plaintext. |

## Console walkthrough

### Create

1. Open **Secrets** → **Create**.  
2. Choose a name (stable identifier your app will reference).  
3. Optionally set initial key/value pairs.  
4. Save.

### Values tab

One canvas for view and edit:

1. Open the secret → **Values**.  
2. **Reveal** is a switch: turn it on to load and show values (session only).  
3. **Edit** works without turning Reveal on first — the console fetches the map as part of edit.  
4. Default editor is the **Table** (same key/value rows as before). Use hover **`+`** between rows to insert.  
5. **Source** switches to JSON, ENV, or YAML text for the same flat map (nested objects and duplicate keys are rejected).  
6. **Save new version** replaces the entire map. Removing keys prompts for confirmation.

**Settings** holds description and delete. API/SDK examples live in the [docs](../sdk/index.md) and [CLI](../cli/commands/secrets.md) — not on a Secret detail tab.

### Delete

Delete unused secrets to reduce exposure. Update consumers first so deploys do not break.

## Formats (JSON / ENV / YAML)

All surfaces share one model: a flat map of string keys to string values.

| Format | Example |
|--------|---------|
| JSON | `{ "API_KEY": "…", "DATABASE_URL": "…" }` |
| ENV | `API_KEY=…` / `DATABASE_URL=…` |
| YAML | `API_KEY: …` |

Rejected: nested objects/arrays, non-string JSON values, duplicate keys.

## CLI

```bash
homecloud secrets create my-secret
homecloud secrets create my-secret API_KEY=test DB_HOST=db.internal
homecloud secrets create my-secret --format env --file .env

homecloud secrets get my-secret
homecloud secrets get my-secret --format env
homecloud secrets get my-secret --format yaml

homecloud secrets put my-secret --format env --file .env
homecloud secrets put my-secret --format json --file values.json
homecloud secrets set my-secret API_KEY=rotated
```

`create` needs an Access Key (`homecloud configure`). `get` / `put` / `set` need an Access Key. `put` replaces the **entire** secret by default; use ``--merge`` / `set` to upsert keys. See [secrets CLI](../cli/commands/secrets.md).

## Access Keys and policies

Runtime read of secrets through the data plane requires an Access Key (or assumed role) with the right `secrets:…` actions. Scope policies to specific secret ARNs when possible. See [IAM](iam.md).

## SDK

```python
from homecloud import HomeCloud

client = HomeCloud.from_env()
print(client.secrets.list())  # console JWT — metadata
client.secrets.create("my-secret", API_KEY="test")  # Access Key SigV1
print(client.secrets.get_value("my-secret"))  # full map
print(client.secrets.get_value("my-secret", "API_KEY"))  # subset
client.secrets.put_value("my-secret", {"API_KEY": "rotated"})  # replace all
client.secrets.put_value("my-secret", API_KEY="test", merge=True)  # upsert fields
print(client.secrets.get_value("my-secret", format="env"))
client.secrets.put_value("my-secret", "API_KEY=x", format="env", merge=True)
```

Codecs (`json` | `env` | `yaml`) are available via ``format=`` on ``get_value`` / ``put_value`` (same as CLI ``--format``).

## Tips

- Never commit secret values to git or put them in Function source files.  
- Use one secret per integration (database, Stripe, SMTP) so rotation is scoped.  
- After rotating a DB password in MDB, update the Secret your app reads.

## Related

- [CLI secrets](../cli/commands/secrets.md)  
- [IAM](iam.md)  
- [Databases](databases.md)  
- [Functions](functions.md)  
- [Applications](applications.md)  
- [Terraform](../terraform/index.md) (`homecloud_secret`)  
