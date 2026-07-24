# mq

פקודות תור הודעות (data plane).

## send

```bash
homecloud mq send my-queue --body '{"hello":"world"}'
homecloud mq send my-queue --body-file message.json
# אצווה (1–10 הודעות) — מערך JSON
homecloud mq send my-queue --body '[{"id":1},{"id":2}]'
homecloud mq send my-queue --body-file messages.json
```

=== "PowerShell"

    ‏PowerShell מסיר מרכאות מ-JSON בעת קריאה לקבצי הרצה נייטיביים. כל אלה עובדים:

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

פריטים שהתקבלו כוללים `created_at` (מתי ההודעה נשמרה בתור) כדי למדוד זמן המתנה.

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

`--live` / `get` כוללים עומק (`messages`), `inflight`, ו-`dlq_messages`.

## דרישות מקדימות

- ‏Access Key עם `mq:*` או `*` (ל-`mq *`)
- התחברות לקונסולה ל-`queues list` / `queues get`
- התור חייב להתקיים (צרו אותו ב-Console ← Queues)

```bash
homecloud login --username alice
homecloud queues list --live
```
