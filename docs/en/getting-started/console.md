# Using the console

The console is the primary UI for creating resources, inviting people, and inspecting status. This page is a map of what you will see after login.

## Layout

| Area | What it does |
|------|----------------|
| **Top bar** | Account switcher, user menu, language, help |
| **Left sidebar** | Service list (Storage, Queues, Databases, Functions, …) and Account hub |
| **Main pane** | List pages and resource detail tabs |
| **Status footer** | Path control (hover/click for the full path), notification bell (`events` + billing attention), and background activity (uploads, SO copy/move) |
| **Info (ⓘ)** | Contextual help for the current page or tab |

Most services follow the same pattern:

1. **List** — create, search, open a resource.  
2. **Detail** — tabs for overview, settings, logs, API examples, and so on.

## Service catalog

Open **Services** in the sidebar (or `/console/services`) for the full catalog with short descriptions. Enabled services open their console pages; items marked coming soon are not clickable yet.

## Where to find common tasks

| Task | Go to |
|------|--------|
| Upload files / static site | **Object Storage (SO)** → bucket → Objects |
| Create a queue and inspect DLQ | **Queues (MQ)** |
| Provision PostgreSQL / MySQL / MongoDB | **Databases (MDB)** |
| Create a Redis cache | **Redis** |
| Edit and deploy serverless code | **Functions** |
| Deploy from a template | **Applications** |
| Browse pods / scale deployments | **Kubernetes** |
| `docker push` private images | **Registry (IR)** |
| Read and send email | **Mail** |
| Store API tokens for apps | **Secrets** |
| Roles, policies, Access Keys | **IAM** |
| Bring your own domain | **Account → Domains** (or **Domains** in the catalog) |
| View TLS certificates | **SSL** |
| Invite members, audit log, projects | **Account** hub |

## Account hub

Under **Account** you manage the tenant itself:

- **Overview** — summary of the account  
- **Security / sessions** — password, MFA, active sessions  
- **Members** — invite and roles  
- **IAM users** — console users for the account  
- **Access keys** — data-plane credentials (also under IAM)  
- **Audit** — who did what  
- **Projects** — group applications and resources  
- **Resources** — cross-service inventory  

Details: [Account & team](../guides/account.md).

## Help inside the product

Every major page and many tabs have an **Info** button. It opens a short panel for that screen. These docs go deeper (full workflows, CLI, and SDK examples). Use both: Info for “what is this screen?”, docs for “how do I automate this?”.

## Tips that save time

- Copy **`so://bucket/key`** from an object’s Properties tab when using the CLI — quote it in PowerShell if the key has spaces.  
- Connection strings and passwords for databases are under the instance **Connection** tab (reveal is audited).  
- Long uploads show progress in the **footer**, not only as a toast — you can minimize and keep working.  
- If a create action fails with a quota error, check **Account** quotas or ask a platform admin.

## Next

- [Create Access Keys](access-keys.md)  
- Browse [Guides](../guides/index.md) for the service you need  
