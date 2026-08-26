# Using the console

The console is the primary UI for creating resources, inviting people, and inspecting status. This page is a map of what you will see after login.

## Layout

| Area | What it does |
|------|----------------|
| **Top bar** | Account switcher, user menu, language, help |
| **Left sidebar** | Service list (Storage, Queues, Databases, Functions, …) and Account hub |
| **Main pane** | List pages and resource detail tabs |
| **Status footer** | Path control (hover/click for the full path), notification bell (red count of waiting items), and background activity (uploads, SO copy/move) |
| **Info (ⓘ)** | Contextual help for the current page or tab |

Most services follow the same pattern:

1. **List** — create, search, open a resource.  
2. **Detail** — tabs for overview, settings, logs, API examples, and so on.

## Notifications

The footer bell is an aggregator, not a second inbox:

- **Badge** (red number on the bell, no click needed) = waiting items: assignment/complete events, unpaid invoices, unseen task discussions, and unread mail (one for any unread mail).
- **Mail** — one row per mailbox (count only) → that mailbox inbox.
- **Tasks** — one row per unseen discussion → that item (`?focus=discussion`). Create / assign / done also write a thin per-recipient event.
- **See all** opens `/console/notifications` (waiting items + recently seen events). The popover stays a short unread preview.

The UI refetches counts only when the Realtime Gateway signals a relevant change (debounced). Comments and mail messages are not copied into a notifications table.

The gateway is **account-scoped**, not Mail-only. Members connect if they have at least one event-family read permission (`tasks.read`, `iam.read`, `resources.read`, `billing.read`, `compute.read`, …). They only receive events for families they can read. A **403** from the stream is terminal — the console does not retry. Missing `resources.read` does not hide Tasks or the bell.

The console keeps **one SSE connection per browser tab**. Tasks, Compute, Mail, and the notification bell register filters on that stream; opening a service does not open another `/realtime/events` request. REST remains the source of truth. After a deploy, clients reconnect with jitter so they do not all hit the API in the same second.

## Service catalog

The full catalog is on **console home** (`/console`). Cards are equal height, with a short description, featured tab links, and a resource count in the **end** panel (right in English, left in Hebrew). Each service uses its own color as a wash on that end panel — not a full-card fill.

Open `/console/services` only if you still have a bookmark; it redirects home.

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
| See waiting notifications | Footer bell → **See all** (`/console/notifications`) |

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
