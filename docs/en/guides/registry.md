# Image Registry (IR)

IR is your account’s **private OCI / Docker registry**. Push images here for Applications and Kubernetes instead of using a public registry for private code.

| Item | Value |
|------|--------|
| Console | **Registry** → `/console/registry` |
| Registry host | `ir.{apex}` |
| Image reference | `ir.{apex}/{account_number}/{repository}:{tag}` |
| Auth | `homecloud ir login` (Access Key profile) with `ir:Push` / `ir:Pull` |

`account_number` is the **12-digit** public account id (same as login / IAM ARNs). Legacy paths that used a generated short id remain readable during migration; new repositories and all docs/examples use the account number.

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
homecloud configure   # once: Access Key id + secret
homecloud ir login    # runs docker login with your profile (no manual prompts)
```

AWS-style alternative:

```bash
homecloud ir get-login-password | docker login --username <AccessKeyId> --password-stdin ir.holab.abrdns.com
```

The Access Key needs `ir:Push` and/or `ir:Pull`.

### Tag and push

In the console, open the repository and use **View push commands** for host/account/repo already filled in. Or:

```bash
docker build -t myapp:1.0 .
docker tag myapp:1.0 ir.holab.abrdns.com/996476522433/myapp:1.0
docker push ir.holab.abrdns.com/996476522433/myapp:1.0
```

Replace `996476522433` with your **account number** (console user menu / Registry **View push commands**).

### Pull

```bash
docker pull ir.holab.abrdns.com/996476522433/myapp:1.0
# production:
docker pull ir.holab.abrdns.com/996476522433/myapp@sha256:...
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

## Related

- [CLI `ir`](../cli/commands/ir.md)
- [Access Keys](../getting-started/access-keys.md)
- [IAM guide](iam.md)
