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

## דרישות מקדימות

- ‏Access Key עם `mq:*` או `*`
- התור חייב להתקיים (צרו אותו ב-Console ← Queues)

```bash
homecloud login --username alice
homecloud queues list
```
