# Image Registry (IR)

IR is your account’s **private OCI / Docker registry**. Push images here for Applications and Kubernetes instead of using a public registry for private code.

| Item | Value |
|------|--------|
| Console | **Registry** → `/console/registry` |
| Registry host | `ir.{apex}` |
| Image reference | `ir.{apex}/{account_short_id}/{repository}:{tag}` |
| Auth | Access Key ID + secret (`docker login`) with `ir:Push` / `ir:Pull` |

Platform GHCR (if any) is for HomeCloud’s own CI — not for your tenant images.

## Console walkthrough

### Create a repository

1. Open **Registry** → **Create repository**.  
2. Choose a name.  
3. Optionally set **lifecycle**: keep last N tags, plus protected tags that must never be deleted.  
4. Open the repo to see tags/digests and usage.

### Usage and quotas

Open **Usage** (console or CLI) to see how much storage you consume. Disable or clean old tags when nearing quota. Digests (`@sha256:…`) are immutable — prefer digests in production deploys.

## Docker / Podman workflow

### Login

```bash
homecloud ir login
# or:
docker login ir.holab.abrdns.com -u 'HCAK...' -p '<secret>'
```

Use your Access Key ID as username and the secret as password. The key needs `ir:Push` and/or `ir:Pull`.

### Tag and push

```bash
docker build -t myapp:1.0 .
docker tag myapp:1.0 ir.holab.abrdns.com/abc123def456/myapp:1.0
docker push ir.holab.abrdns.com/abc123def456/myapp:1.0
```

Replace `abc123def456` with your **account short id** (shown in the console registry page / account overview).

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

See [CLI `ir`](../cli/commands/ir.md).

## SDK

```python
from homecloud import HomeCloud

client = HomeCloud.from_env()
print(client.ir.list())
client.ir.create("myapp", keep_last=10)
print(client.ir.usage())
```

## Use with Applications / Kubernetes

1. Push `myapp:1.0` to IR.  
2. In Application create/settings, set the image to the IR reference.  
3. Ensure the runtime can pull (platform pull secrets / workload identity as configured for your account).

## Tips

- Protect `latest` or release tags in lifecycle settings if you rely on them.  
- Prefer digest pins for production.  
- Rotate Access Keys used in CI just like any other secret.

## Related

- [Applications](applications.md)  
- [Kubernetes](kubernetes.md)  
- [Access Keys](../getting-started/access-keys.md)  
