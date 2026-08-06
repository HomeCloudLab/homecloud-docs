# Message Queues (MQ)

Message Queues let one part of your system **publish** work and another part **consume** it asynchronously. HomeCloud MQ is backed by JetStream and is isolated per account.

| Item | Value |
|------|--------|
| Console | **Queues** → `/console/queues` |
| Data-plane host | `https://mq.{apex}` |
| Auth (send/receive) | Access Key |
| Auth (list/create in CLI) | `homecloud login` for `queues list` / `queues get` |

## Concepts

| Term | Meaning |
|------|---------|
| **Queue** | Named channel you create in the console |
| **Message** | JSON payload (single object or batch) |
| **Receive** | Pull messages to process |
| **Delete / ack** | Remove a message after successful processing |
| **Purge** | Delete all messages in the queue |
| **DLQ** | Dead-letter queue for messages that failed repeatedly |
| **Inflight** | Messages delivered but not yet deleted |

## Console walkthrough

### Create a queue

1. Open **Queues**.  
2. **Create queue** — pick a name (DNS-safe / simple identifier).  
3. Open the queue. Tabs typically include: **Overview**, **Messages**, **DLQ**, **Monitoring**, **Settings**, **API**.

### Send a test message

1. Open **Messages** (or use the send action / API tab).  
2. Paste a JSON body and send.  
3. Confirm depth increases on Overview / Monitoring.

### Receive and inspect

Use the console message browser for debugging. For workers, prefer the CLI or SDK so you can ack/delete reliably.

### DLQ

Failed or expired messages may land in the **DLQ** tab. Inspect payloads, fix the consumer, then delete or purge DLQ messages when done.

### Settings

Tune retention / delivery behavior from **Settings** (see in-console help for the fields your platform exposes). The **API** tab shows example HTTP calls for the current queue.

## CLI

### Management (console session)

```bash
homecloud login --username alice
homecloud queues list
homecloud queues list --live          # includes depth, inflight, DLQ counts
homecloud queues get orders
```

Create the queue in the console first if it does not exist.

### Send

```bash
homecloud mq send orders --body '{"id":1,"sku":"ABC"}'
homecloud mq send orders --body-file message.json

# Batch: JSON array (1–10 messages)
homecloud mq send orders --body '[{"id":1},{"id":2}]'
```

=== "PowerShell"

    PowerShell often mangles JSON quotes for native executables. Prefer a file, or a form the CLI accepts:

    ```powershell
    homecloud mq send orders --body-file message.json
    homecloud mq send orders --body '{hello:world}'
    ```

### Receive

```bash
homecloud mq receive orders
homecloud mq receive orders --max-messages 5 --wait-seconds 10

# Fast consume: delete/ack in the same call
homecloud mq receive orders --max-messages 10 --delete
```

Received items include `created_at` so you can measure how long a message waited.

### Delete, purge, DLQ

```bash
homecloud mq delete orders 42
homecloud mq purge orders

homecloud mq receive-dlq orders --max-messages 5
homecloud mq delete-dlq orders 7
homecloud mq purge-dlq orders
```

Full reference: [CLI `mq`](../cli/commands/mq.md).

## SDK

=== "Python"

    ```python
    from homecloud import HomeCloud

    client = HomeCloud.from_env()

    client.mq.send("orders", {"id": 1})
    client.mq.send("orders", [{"id": 1}, {"id": 2}])  # batch

    messages = client.mq.receive("orders", max_messages=10, wait_seconds=5)
    for msg in messages:
        # process msg...
        client.mq.delete("orders", msg["sequence"])

    # Or receive and delete in one step:
    client.mq.receive("orders", max_messages=10, delete=True)

    client.mq.purge("orders")
    dlq = client.mq.receive_dlq("orders", max_messages=5)
    ```

=== "Python (async)"

    ```python
    from homecloud import AsyncHomeCloud

    async with AsyncHomeCloud.from_env() as client:
        await client.mq.send("orders", {"id": 1})
        msgs = await client.mq.receive("orders", max_messages=10, delete=True)
    ```

=== "Worker loop sketch"

    ```python
    from homecloud import HomeCloud
    import time

    client = HomeCloud.from_env()

    while True:
        batch = client.mq.receive("orders", max_messages=10, wait_seconds=20)
        if not batch:
            continue
        for msg in batch:
            try:
                handle(msg["body"])
                client.mq.delete("orders", msg["sequence"])
            except Exception:
                # leave message for retry / DLQ policy
                pass
    ```

## Typical workflows

### Webhook → queue → worker

1. Create queue `inbound-events`.  
2. API or Function writes with `mq.send`.  
3. A long-running worker (Application **worker** template, Kubernetes deployment, or Functions **queue** trigger) receives and acks.

### Poison messages

1. Watch **DLQ** count on `queues list --live`.  
2. `receive-dlq`, inspect payload, fix bug.  
3. `purge-dlq` or delete individual sequences when resolved.

## Tips and pitfalls

- Access Key needs `mq:*` (or narrower send/receive actions).  
- `queues list` needs login; `mq send` needs Access Key — easy to mix up.  
- Always **delete** (ack) after successful processing, or use `receive(..., delete=True)` for simple consumers.  
- Keep payloads reasonably small; store large blobs in SO and put the `so://` URI in the message.

## Related

- [Functions](functions.md) (queue triggers)  
- [CLI `mq`](../cli/commands/mq.md)  
- [Access Keys](../getting-started/access-keys.md)  
