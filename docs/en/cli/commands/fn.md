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

List recent invocations, or print one invocation’s detail and logs:

```bash
homecloud fn logs hello
homecloud fn logs hello --id <invocation-id>
homecloud fn logs hello --id <invocation-id> --output json
```

## watch

Wait for the next completed invocation and print its logs (logs are available after the run finishes, not streamed mid-flight):

```bash
homecloud fn watch hello
homecloud fn watch hello --wait 300 --poll 2
homecloud fn watch hello --wait 0              # wait forever
homecloud fn watch hello --since-id <id>
```

Exit code `1` if `--wait` seconds pass with no new invocation.

## Prerequisites

- Function exists and is deployed ([Functions guide](../../guides/functions.md))
- `fn list` / `fn url` / `fn logs` / `fn watch` → console login
- `fn invoke` → Access Key + Function URL enabled

## Related

- [Functions guide](../../guides/functions.md)  
- [SDK](../../sdk/index.md)  
