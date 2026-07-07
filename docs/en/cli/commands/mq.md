# mq

Message queue commands (data plane).

## send

```bash
homecloud mq send my-queue --body '{"hello":"world"}'
homecloud mq send my-queue --body-file message.json
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
```

## Prerequisites

- Access Key with `mq:*` or `*`
- Queue must exist (create in Console → Queues)

```bash
homecloud login --username alice
homecloud queues list
```
