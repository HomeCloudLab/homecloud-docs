# What is HomeCloud?

HomeCloud is a private cloud control plane: one web console, one CLI, and one SDK for the services you need to run apps — storage, queues, databases, functions, containers, mail, and more.

You work inside an **account**. An account is your isolated workspace (similar in spirit to an AWS account or a GCP project). Resources you create — buckets, queues, databases, apps — belong to that account and are not shared with other accounts unless you explicitly grant access.

## Who this is for

- **Account owners** who opened a tenant and need to invite a team  
- **Developers** who deploy apps, push images, or call APIs from code  
- **DevOps / platform users** who automate with the CLI and CI  

If you are operating the HomeCloud *infrastructure itself* (K3s nodes, Traefik, operators), that is out of scope here — these guides assume the platform is already running and you have a console URL.

## The three ways to work

### 1. Web console

Open `https://console.{apex}` (for example `https://console.holab.abrdns.com`).

Use the console to:

- Create and browse resources (buckets, queues, databases, functions, …)  
- Invite members and manage IAM  
- Edit function code, compose mail, inspect logs and metrics  
- Copy connection strings and `so://` URIs  

Almost every service has a list page and a detail page (same pattern as “buckets → objects” or “queues → messages”).

### 2. CLI (`homecloud`)

Install once ([Install](../cli/install.md)), then:

```bash
homecloud configure          # save Access Key for data-plane work
homecloud login              # browser/password session for management
homecloud so sync ./dist so://my-site/
homecloud mq send orders --body '{"id":1}'
homecloud fn invoke hello --payload '{"name":"Ada"}'
```

See the [CLI guide](../cli/index.md).

### 3. SDK (Python / Node.js)

For apps and automation that should not open a browser:

```python
from homecloud import HomeCloud

client = HomeCloud.from_env()   # HC_ACCESS_KEY_ID / HC_SECRET_ACCESS_KEY
client.so.upload("docs", "./readme.md", key="readme.md")
client.mq.send("orders", {"id": 1})
```

See the [SDK guide](../sdk/index.md).

## Mental model: control plane vs data plane

You do not need the internal architecture — only this distinction:

| Plane | Examples | Auth |
|-------|----------|------|
| **Control plane** | Create a bucket, list queues, invite a user, deploy a function version | Console session (`homecloud login`) or management APIs with JWT |
| **Data plane** | Upload an object, send a message, pull an image, invoke a warm function | Access Key (signed requests) |

**Rule of thumb:** creating and configuring resources → console / login. Moving data at runtime → Access Key.

!!! note "Account ID is automatic"
    Access Keys are already scoped to one account. The CLI and SDK resolve the account from the key — you do not pass `account_id` on every command.

## Services at a glance

| Service | Short name | What you use it for |
|---------|------------|---------------------|
| Object Storage | **SO** | Files, backups, static websites (`so://bucket/key`) |
| Message Queues | **MQ** | Async jobs, fan-out, DLQ |
| Managed Databases | **MDB** | PostgreSQL, MySQL, MongoDB |
| Redis | **Redis** | Managed cache |
| Functions | **FN** | Serverless Python / Node handlers |
| Applications | **Apps** | Template-based deploy (API, fullstack, static, worker) |
| Kubernetes | **K8s** | Browse and scale workloads in your account namespace |
| Image Registry | **IR** | Private OCI images (`docker push`) |
| Mail | **Mail** | Mailboxes, templates, automations |
| Secrets | **Secrets** | Named secret values for apps and functions |
| IAM | **IAM** | Roles, policies, Access Keys, console roles |
| Domains | **Domains** | Bring your own domain + DNS records |
| SSL | **SSL** | View certificates issued for your account |

Full how-to pages live under [Guides](../guides/index.md).

## Next steps

1. [Open an account](accounts.md) (or accept an invite)  
2. [Tour the console](console.md)  
3. [Create an Access Key](access-keys.md) and install the [CLI](../cli/install.md)  
4. Follow a service guide — start with [Object Storage](../guides/object-storage.md) or [Queues](../guides/queues.md) if you are unsure  
