# fn

Functions commands.

## list

Requires console login:

```bash
homecloud login --username alice
homecloud fn list
homecloud fn list --output json
```

## invoke

Invoke via Function URL using Access Key HMAC. The function must have a Function URL enabled (see `fn url --enable`).

```bash
homecloud fn invoke hello --payload '{"name":"Ada"}'
homecloud fn invoke hello --payload-file event.json
homecloud fn invoke hello -p '{}' --output json
```

## url

Show or enable/disable the Function URL (console JWT):

```bash
homecloud fn url hello
homecloud fn url hello --enable
homecloud fn url hello --enable --public    # WARNING: anonymous invoke
homecloud fn url hello --disable
```

`--public` allows anonymous invoke — only use when you intentionally want an open HTTP endpoint.

## logs

List recent invocations (metadata page), print one invocation’s detail, or **follow live SSE**:

```bash
homecloud fn logs hello
homecloud fn logs hello --limit 20
homecloud fn logs hello --cursor '<next_cursor>'
homecloud fn logs hello --status succeeded --trigger http
homecloud fn logs hello --id <invocation-id>
homecloud fn logs hello --id <invocation-id> --follow
homecloud fn logs hello --id <invocation-id> --follow --timeout 300
homecloud fn logs hello --id <invocation-id> --output json
```

List responses are cursor-paged (`items` + `next_cursor`). Rows do **not** include logs or response bodies — use `--id` for detail.

`--follow` uses `GET …/invocations/{id}/logs/stream` (status + live `log` lines + final blob). Mid-run lines are live-from-now via Platform NATS (no replay); history after completion is Postgres.

## watch

Wait for the next invocation and **stream its logs live** (same SSE contract as `--follow`):

```bash
homecloud fn watch hello
homecloud fn watch hello --wait 300 --poll 2
homecloud fn watch hello --wait 0              # wait forever
homecloud fn watch hello --since-id <id>
homecloud fn watch hello --follow-timeout 180
```

Exit code `1` if `--wait` seconds pass with no new invocation.

## Prerequisites

- Function exists and is deployed ([Functions guide](../../guides/functions.md))
- `fn list` / `fn url` / `fn logs` / `fn watch` → console login
- `fn invoke` → Access Key + Function URL enabled

## Related

- [Functions guide](../../guides/functions.md)  
- [SDK](../../sdk/index.md)  
