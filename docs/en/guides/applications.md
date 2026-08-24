# Applications

Applications deploy a **ready-made stack** from a template so you do not wire every Kubernetes object by hand. Use them when you want a known shape (API, website, worker) with console operations for logs, metrics, domains, and settings.

| Item | Value |
|------|--------|
| Console | **Applications** → `/console/applications` |
| CLI | `homecloud apps list` (management; create/update primarily in console) |

## Templates

| Template | Typical use |
|----------|-------------|
| **api-only** | Backend API service |
| **fullstack** | Frontend + API style stack |
| **static-site** | Static assets (often paired with SO website hosting patterns) |
| **worker** | Background consumer / job process |

Exact env vars and components depend on the template version shown in the create wizard.

## Console walkthrough

### Create

1. Open **Applications** → **Create**.  
2. Choose a template, name, and project (if you use [Projects](account.md)).  
3. Fill required settings (image, env, resources, domain attachments as prompted).  
4. Create and wait until components become healthy.

### Detail tabs

After open, you typically get:

| Tab | Purpose |
|-----|---------|
| **Overview** | Status, endpoints, summary |
| **Components** | Pieces of the stack |
| **Resources** | CPU/memory and related knobs |
| **Domains** | Shows custom hostnames managed in [Domains](domains.md) |
| **Metrics** | Runtime charts when enabled |
| **Logs** | Stream or fetch recent logs |
| **Settings** | Configuration edits |
| **Advanced** | Power-user options |

Use **Operations** actions (restart, sync, etc.) from the UI when offered — prefer them over manual kubectl for day-2.

### Domains

Connect a verified hostname from [Domains](domains.md) → **Services**. The application page lists attached hostnames as managed in Domains (no free-text custom domain field). SSL certificates appear under [SSL](ssl.md) once issued.

### Logs and metrics

- **Logs** — debug crashes and bad config.  
- **Metrics** — watch CPU, memory, and request-level signals when the monitoring stack is available for your account.

## CLI

```bash
homecloud login --username alice
homecloud apps list
```

Deeper lifecycle (create/update/delete) is console-first today; use the UI for those operations unless your platform version adds more CLI verbs.

## When to use Applications vs raw Kubernetes vs Functions

| Need | Prefer |
|------|--------|
| Template stack with console ops | **Applications** |
| Custom manifests / one-off workloads | **Kubernetes** |
| Short event-driven code | **Functions** |
| Only static files | **SO website** (often enough alone) |

## Tips

- Keep secrets in [Secrets](secrets.md), not in plain settings fields when avoidable.  
- Pin image digests from [IR](registry.md) for reproducible deploys.  
- Use Projects to group related apps for a team.

## Related

- [Kubernetes](kubernetes.md)  
- [Image Registry](registry.md)  
- [Domains](domains.md)  
- [Account & projects](account.md)  
- [Terraform](../terraform/index.md) (`homecloud_application` — draft / spec only)  
