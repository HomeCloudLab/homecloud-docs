# Guides

Step-by-step guides for every major HomeCloud service. Each page covers:

1. What the service is for (in plain language)  
2. How to use it in the **console**  
3. How to automate with the **CLI** and **SDK** where applicable  
4. Common pitfalls  

## Catalog

| Guide | Service | Start here if you need to… |
|-------|---------|----------------------------|
| [Object Storage (SO)](object-storage.md) | SO | Store files, sync folders, host a static website |
| [Message Queues (MQ)](queues.md) | MQ | Decouple workers, use a DLQ |
| [Managed Databases (MDB)](databases.md) | MDB | Run PostgreSQL, MySQL, or MongoDB |
| [Compute](compute.md) | Compute | Virtual machines, VPC / subnets, Agent, volumes, operations |
| [Regions](regions.md) | Platform | HomeCloud places (`homelab`, `eu-central`), not vendor names |
| [Redis](redis.md) | Redis | Managed cache |
| [Functions](functions.md) | FN | Serverless handlers with triggers |
| [Applications](applications.md) | Apps | Deploy from a template |
| [Kubernetes](kubernetes.md) | K8s | Inspect and scale account workloads |
| [Image Registry (IR)](registry.md) | IR | Private Docker / OCI images |
| [Mail](mail.md) | Mail | Mailboxes, templates, automations |
| [Secrets](secrets.md) | Secrets | Store credentials for apps and functions |
| [IAM](iam.md) | IAM | Roles, policies, Access Keys, console roles |
| [Domains & DNS](domains.md) | Domains | Bring your own domain, or search for a name (registration is not for sale yet) |
| [SSL certificates](ssl.md) | SSL | See issued certificates |
| [Billing](billing.md) | Billing | Usage, estimates, invoices, spend alerts |
| [Monitoring](monitoring.md) | Monitoring | Metrics, logs, alerts |
| [Tasks](tasks.md) | Tasks | Assign ops tasks, due dates, labels (`TASK-{n}`) |
| [Account & team](account.md) | Account | Members, audit, projects, security |
| [Terraform](../terraform/index.md) | IaC | Provision account resources from CI (Access Key or GitHub OIDC) |

## Auth reminder

- **Console + `homecloud login`** — create and configure resources in a browser  
- **Access Key** — move data, call runtime APIs, and (with a user-bound key) provision via [Terraform](../terraform/index.md)  
- **GitHub OIDC** — Terraform in Actions without a long-lived secret (`HC_ROLE_ARN`)  

Create keys in [Access Keys](../getting-started/access-keys.md) before trying CLI examples on this site.
