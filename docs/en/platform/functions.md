# Functions

HomeCloud Functions are managed serverless compute units — the platform equivalent of AWS Lambda. You author Python 3.12 handlers in a VS Code–class console workspace, deploy immutable versions, and invoke them synchronously through the control plane (the warm runtime lives on the Functions data plane).

## Create

1. Open **Console → Functions**.
2. **Create function** — choose a DNS-compatible name, handler (default `main.handler`), memory, and timeout.
3. The platform seeds an empty workspace with `main.py`.

Permissions: `function.create` (falls back to `resources.create` in the console when role matrices align).

## Code workspace

The **Code** tab is a multi-file editor:

- Left file tree (folders expandable)
- Multi-tab Monaco editor with the VS Code dark theme (`vs-dark`)
- New file / new folder / rename / delete
- Dirty indicator on unsaved tabs; **Save** writes the active file
- Language mode follows extension (`.py` → Python, `.json` → JSON, `.md` → Markdown)

Working-tree files are stored per function until you deploy.

## Deploy

**Deploy version** zips the current workspace into a new immutable `function_version` and updates `$LATEST`.

- When Object Storage (SO) is available, the packaged artifact is referenced with an `so://` URI (for example `so://functions/{account}/{name}/v{n}.zip`).
- In local/dev mode the zip may be stored on the version row until SO is configured.

Rollback is available via the versions API (`POST …/versions/{n}/rollback`).

## Invoke

From the **Invocations** tab:

1. Edit the **Event JSON** payload.
2. Click **Invoke**.
3. Inspect result, status, duration, and logs.

The control plane orchestrates the call; production execution runs on `homecloud-fn` (`POST /invoke` with package + layers as base64 zips). Manual HTTP invoke URLs are shown on Overview when configured.

## Triggers

Supported trigger types:

| Type | Use |
|------|-----|
| `manual` | Console / API test invoke |
| `http` | HTTP binding / invoke URL |
| `queue` | MQ (JetStream) consumer |
| `cron` | Schedule expression |

Create, enable/disable, and delete triggers from the **Triggers** tab.

## Layers

Layers package shared dependencies (platform or account-scoped). Attach one or more layers on the **Layers** tab; layer artifacts also use `so://` when published to Object Storage.

Layer layout for Python: include a top-level `python/` directory (or the layer root is added to `PYTHONPATH`).

## Runtime notes

- Runtime: Python 3.12
- Handler form: `module.callable` (for example `main.handler`)
- Execution: subprocess sandbox with timeout; memory is a soft limit advertised to the handler context
- Data-plane host: `fn.holab.abrdns.com` (internal invoke may use `X-Homecloud-Internal-Token` when configured)

## Related

- [Platform services](services.md)
- ADR-025 Function Runtime Architecture (infra docs)
