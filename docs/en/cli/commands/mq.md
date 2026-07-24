# mq

Message queue commands (data plane).

## send

```bash
homecloud mq send my-queue --body '{"hello":"world"}'
homecloud mq send my-queue --body-file message.json
# Batch (1–10 messages) — JSON array
homecloud mq send my-queue --body '[{"id":1},{"id":2}]'
homecloud mq send my-queue --body-file messages.json
```

=== "PowerShell"

    PowerShell strips JSON quotes when calling native executables. These all work:

    ```powershell
    homecloud mq send q --body '{hello:world}'
    homecloud mq send q --body '{"hello":"world"}'
    homecloud mq send q --body-file message.json
    ```

## receive

```bash
homecloud mq receive my-queue
homecloud mq receive my-queue --max-messages 5 --wait-seconds 10
# Fast consume: ack/delete immediately (no visibility / no separate delete)
homecloud mq receive my-queue --max-messages 10 --delete
```

Received items include `created_at` (when the message was stored in the queue) so you can measure wait time.
With `--delete`, `status` is `deleted` and messages are removed in the same call.

## delete / purge

```bash
homecloud mq delete my-queue 42
homecloud mq purge my-queue
```

## DLQ

```bash
homecloud mq receive-dlq my-queue --max-messages 5
homecloud mq delete-dlq my-queue 7
homecloud mq purge-dlq my-queue
```

## queues (console JWT)

```bash
homecloud queues list
homecloud queues list --live
homecloud queues get my-queue
```

`--live` / `get` include depth (`messages`), `inflight`, and `dlq_messages`.

## Prerequisites

- Access Key with `mq:*` or `*` (for `mq *`)
- Console login for `queues list` / `queues get`
- Queue must exist (create in Console → Queues)

```bash
homecloud login --username alice
homecloud queues list --live
```
