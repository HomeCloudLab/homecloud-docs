# mq

פקודות תור הודעות (data plane).

## send

```bash
homecloud mq send my-queue --body '{"hello":"world"}'
homecloud mq send my-queue --body-file message.json
# Batch (1–10 messages) — JSON array
homecloud mq send my-queue --body '[{"id":1},{"id":2}]'
homecloud mq send my-queue --body-file messages.json
```

=== "PowerShell"

    PowerShell מסיר ציטוטי JSON בקריאה לתוכנות native. כל אלה עובדים:

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

פריטים שהתקבלו כוללים `created_at` (מתי ההודעה נשמרה בתור) כדי למדוד זמן המתנה.
עם `--delete`, `status` הוא `deleted` וההודעות מוסרות באותה קריאה.

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

## queues (JWT קונסול)

```bash
homecloud queues list
homecloud queues list --live
homecloud queues get my-queue
```

`--live` / `get` כוללים עומק (`messages`), `inflight` ו-`dlq_messages`.

## דרישות קדם

- Access Key עם `mq:*` או `*` (עבור `mq *`)
- התחברות לקונסול ל-`queues list` / `queues get`
- התור חייב להתקיים (צרו ב-Console → Queues)

```bash
homecloud login --username alice
homecloud queues list --live
```
