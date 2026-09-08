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
2. Click **Invoke**.  
3. The list soft-refreshes via Realtime (`function.invoke.*`); when Realtime is down and runs are pending/running, the console polls about every 5s.  
4. Inspect status (StatusBadge), result, duration, and logs. Expanding a live run opens SSE (`…/logs/stream`) — **live-from-now** (no mid-run replay).

Ops chrome on the same tab:

- Filters: status, trigger, from/to (cursor resets; no full-history `COUNT(*)`)  
- **Running now** chip — bounded `status=running|pending` queries only  
- Find / open by invocation id  

### Triggers

| Type | When to use |
|------|-------------|
| `manual` | Console / API / CLI test invokes |
| `http` | Public or authenticated HTTP binding / Function URL |
| `queue` | Consume from an MQ queue |
| `cron` | Schedule (cron expression) |

Create, enable, disable, and delete triggers on the **Triggers** tab (event subscriptions live on the same tab; `?tab=events` still deep-links there).

### Layers

Attach shared dependency layers under **Configuration** (Layers section). For Python layers, include a top-level `python/` directory (or ensure the layer root is on `PYTHONPATH`).

### Function URL

Enable a Function URL from the Overview control when you need a stable HTTP entrypoint on `{name}.func.{apex}`. Disable it when the endpoint should no longer be reachable. CLI: `homecloud fn url`.

A custom hostname for that URL is connected from [Domains](domains.md) → **Services**, not from the function page.

### Configuration

Set memory, timeout, environment variables, **resource bindings** (mq / so / secrets / mail pickers + JSON escape hatch), **execution role** (IAM Role ARN), retry/DLQ, and layers. Functions should assume a **Role**, not an Access Key name. After changing bindings, recreate or update the role if policies may be stale.

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
| **Live stream** | Mid-run stdout/stderr | SSE `…/logs/stream` (Platform NATS; live-from-now) |
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
