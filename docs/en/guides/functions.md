# Functions

Functions are **managed serverless** units. You write a handler (Python 3.12 and/or Node depending on your platform), deploy immutable versions, and invoke them from the console, CLI, SDK, HTTP, queues, or cron.

| Item | Value |
|------|--------|
| Console | **Functions** → `/console/functions` |
| Customer Function URL | `{name}.func.{apex}` (optional; enable Function URL) |
| Internal runtime host | `fn.{apex}` (platform only — not for apps) |
| Auth (invoke via CLI/SDK) | Access Key / session as documented per command |

## Access planes (do not mix)

| Plane | Hostname | Who uses it |
|-------|----------|-------------|
| **Console / management** | Console + management API | Test invoke with JWT; operators |
| **Function URL** | `{name}.func.{apex}` | Apps and integrations (Access Key HMAC or public) |
| **Internal runtime** | `fn.{apex}` | Platform workers only (same idea as SO internal hosts) |

These hostnames stay separate on purpose — do not merge them.

## Concepts

| Term | Meaning |
|------|---------|
| **Function** | Named unit with memory/timeout settings |
| **Workspace** | Editable files in the console (working tree) |
| **Version** | Immutable packaged deploy (`$LATEST` points at current) |
| **Handler** | `module.callable` (example: `main.handler`) |
| **Trigger** | How the function runs: manual, HTTP, queue, cron |
| **Layer** | Shared dependencies packaged once and attached |
| **Function URL** | Optional HTTP endpoint for the function |

## Console walkthrough

### Create

1. Open **Functions** → **Create function**.  
2. Choose a DNS-compatible name, runtime, handler (default often `main.handler`), memory, and timeout.  
3. The platform seeds a starter workspace (for example `main.py`).

### Code workspace

Open the **Code** tab:

- Multi-file tree and Monaco editor (VS Code–style)  
- Create / rename / delete files and folders; autosave  
- Format, outline, problems, search  
- Language intelligence (completions / diagnostics) when the language service is connected  

Work in the workspace until you are ready to deploy — deploy packages what is in the tree (with packaging rules that exclude things like `.env` and Markdown docs).

### Build & Deploy Preview

Use **Build & Deploy Preview** before a real deploy:

- Confirms runtime, handler, and entrypoint file  
- Shows included vs excluded paths and package size  
- Blocks deploy when validation fails (missing entrypoint, etc.)

### Deploy a version

Click **Deploy version**. The platform packages the workspace into a new immutable version and updates `$LATEST`. Artifacts are often stored as `so://…` URIs when Object Storage is available.

Rollback is available from the **Versions** section under the **Code** tab / API when you need a previous package.

### Invoke for testing

Open **Invocations**:

1. Edit the **Event JSON**.  
2. Click **Invoke** — the API returns `running` + invocation id immediately (`async_mode`), then finishes in the background.  
3. The console opens that run’s **detail page** and streams SSE (`…/logs/stream`) with session catch-up, then live lines.  
4. Soft-refresh via Realtime (`function.invoke.*`); when Realtime is down and runs are pending/running, the list polls about every 5s.

Ops chrome on the list:

- One filter row: status, trigger, date range, and debounced search (matches id / last log / response on **loaded** rows; UUID can be fetched into the list)  
- Table columns include **Last log** (truncated); response is only on the detail page  
- Click a row → dedicated invocation page (summary, logs above response)  
- **Running now** chip — bounded `status=running|pending` queries only 

### Triggers

| Type | When to use |
|------|-------------|
| `manual` | Console / API / CLI test invokes |
| `http` | Public or authenticated HTTP binding / Function URL |
| `queue` | Consume from an MQ queue |
| `cron` | Schedule (cron expression) |

Create, enable, disable, and delete triggers on the **Triggers** tab.

### Events (Event Bus)

Subscribe on the **Events** tab. Pick source → event → optional resource filters. SO needs a bucket (prefix optional with path suggestions). Tasks can filter by `item_id` / task `key`; Compute by `machine_id` / `operation_id`; Functions by function name. Empty optional filters match account-wide for that event type.

### Layers

Attach shared dependency layers under **Configuration** (Layers section). For Python layers, include a top-level `python/` directory (or ensure the layer root is on `PYTHONPATH`).

### Function URL

Enable a Function URL from Overview (small checkboxes). When enabled, the URL and public/private badge appear in the Function summary next to the ARN. Details stay in the info panel. CLI: `homecloud fn url`.

A custom hostname for that URL is connected from [Domains](domains.md) → **Services**, not from the function page.

### Configuration

Set memory, timeout, environment variables, **resource bindings** (logical names for mq / so / secrets / mail — routing only), and an **execution role** (IAM Role ARN). Permissions (Allow/Deny, prefixes, conditions) are edited on the role in [IAM Runtime](../guides/iam.md) — create or attach policies there. After changing bindings, recreate or update the role if policies may be stale.

## CLI

```bash
homecloud fn list

homecloud fn invoke hello --payload '{"name":"Ada"}'
# or payload file:
homecloud fn invoke hello --payload-file event.json

homecloud fn url hello
homecloud fn logs hello
homecloud fn logs hello --limit 20 --cursor '<next_cursor>'
homecloud fn watch hello          # live SSE follow for the next invocation
homecloud fn logs hello --id <id> --follow
```

### Invocations observability

Three layers stay separate:

| Layer | What | Where |
|-------|------|--------|
| **History (SoT)** | List metadata + detail by id | Postgres via REST (`…/invocations`) |
| **Live stream** | Mid-run stdout/stderr | SSE `…/logs/stream` (Platform NATS + Redis session buffer catch-up) |
| **Persisted logs** | Trimmed final blob on the invocation row | Postgres (free / basic retention) |

The console list soft-refreshes on Realtime Gateway `function.invoke.*` hints. When Realtime is offline and pending/running rows exist, a ~5s soft poll keeps the page honest (still O(page) — no Follow poller over history). Extended search / long retention (Loki/SO) is a future paid SKU — not part of basic observability.

See [CLI `fn`](../cli/commands/fn.md) for flags.

## SDK

=== "Python"

    ```python
    from homecloud import HomeCloud

    client = HomeCloud.from_env()

    for fn in client.functions.list():
        print(fn["name"])

    result = client.functions.invoke("hello", {"name": "Ada"})
    print(result)

    print(client.functions.url("hello"))
    client.functions.enable_url("hello")
    client.functions.disable_url("hello")

    page = client.functions.logs("hello", limit=50)
    for row in page["items"]:
        print(row["id"], row["status"])
    if page.get("next_cursor"):
        page = client.functions.logs("hello", cursor=page["next_cursor"])
    ```

## Example handler (Python)

```python
# main.py
def handler(event, context):
    name = (event or {}).get("name", "world")
    return {"ok": True, "message": f"Hello, {name}!"}
```

Deploy from the console, then:

```bash
homecloud fn invoke hello --payload '{"name":"Ada"}'
```

## Typical workflows

### HTTP API micro-endpoint

1. Create function + deploy.  
2. Add an **http** trigger or enable **Function URL**.  
3. Call the URL from your app or webhook provider.

### Queue worker

1. Create an MQ queue.  
2. Add a **queue** trigger on the function.  
3. Publish with `homecloud mq send` or the SDK.

### Scheduled job

1. Add a **cron** trigger with your schedule.  
2. Keep the handler idempotent (jobs can overlap if a run is slow).

## Tips and pitfalls

- Deploy creates a **new version** — the editor workspace alone is not live until you deploy.  
- Do not put secrets in source files; use [Secrets](secrets.md) + IAM.  
- `execution_role` must be a **Role ARN** trusted for Functions.  
- Use Build Preview to catch missing handlers before deploy.  
- Package size and layers affect cold/warm behavior — keep dependencies lean.

## Related

- [IAM](iam.md)  
- [Queues](queues.md)  
- [Object Storage](object-storage.md)  
- [CLI `fn`](../cli/commands/fn.md)  
- [Terraform](../terraform/index.md) (`homecloud_function` / `_function_url` — spec only; no IDE files)  
