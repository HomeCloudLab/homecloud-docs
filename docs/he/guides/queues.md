# Message Queues (MQ)

Message Queues מאפשרים לחלק אחד במערכת **לפרסם** עבודה ולחלק אחר **לצרוך** אותה באופן אסינכרוני. HomeCloud MQ מבוסס על JetStream ומבודד לפי חשבון.

| פריט | ערך |
|------|--------|
| Console | **Queues** → `/console/queues` |
| Data-plane host | `https://mq.{apex}` |
| Auth (send/receive) | Access Key |
| Auth (list/create ב-CLI) | `homecloud login` ל-`queues list` / `queues get` |

## מושגים

| מונח | משמעות |
|------|--------|
| **Queue** | ערוץ בשם שיוצרים בקונסול |
| **Message** | מטען JSON (אובייקט בודד או אצווה) |
| **Receive** | משיכת הודעות לעיבוד |
| **Delete / ack** | הסרת הודעה אחרי עיבוד מוצלח |
| **Purge** | מחיקת כל ההודעות בתור |
| **DLQ** | תור מכתבים מתים להודעות שנכשלו שוב ושוב |
| **Inflight** | הודעות שנמסרו אך עדיין לא נמחקו |

## הליכה בקונסול

### יצירת תור

1. פתחו **Queues**.  
2. **Create queue** — בחרו שם (בטוח ל-DNS / מזהה פשוט).  
3. פתחו את התור. לשוניות טיפוסיות: **Overview**, **Messages**, **DLQ**, **Monitoring**, **Settings**, **API**.

### שליחת הודעת בדיקה

1. פתחו **Messages** (או השתמשו בפעולת send / לשונית API).  
2. הדביקו גוף JSON ושלחו.  
3. ודאו שהעומק עולה ב-Overview / Monitoring.

### קבלה ובדיקה

השתמשו בדפדפן ההודעות בקונסול לדיבוג. ל-workers העדיפו CLI או SDK כדי שתוכלו לעשות ack/delete באופן אמין.

### DLQ

הודעות שנכשלו או שפגו עשויות להגיע ללשונית **DLQ**. בדקו מטענים, תקנו את הצרכן, ואז מחקו או נקו הודעות DLQ כשסיימתם.

### Settings

כוונו התנהגות שמירה / מסירה מ-**Settings** (ראו עזרה בקונסול לשדות שהפלטפורמה חושפת). לשונית **API** מציגה דוגמאות קריאות HTTP לתור הנוכחי.

## CLI

### ניהול (סשן קונסול)

```bash
homecloud login --username alice
homecloud queues list
homecloud queues list --live          # includes depth, inflight, DLQ counts
homecloud queues get orders
```

צרו את התור בקונסול קודם אם הוא לא קיים.

### שליחה

```bash
homecloud mq send orders --body '{"id":1,"sku":"ABC"}'
homecloud mq send orders --body-file message.json

# Batch: JSON array (1–10 messages)
homecloud mq send orders --body '[{"id":1},{"id":2}]'
```

=== "PowerShell"

    PowerShell לעיתים מקלקל ציטוטי JSON לתוכנות native. העדיפו קובץ, או צורה שה-CLI מקבל:

    ```powershell
    homecloud mq send orders --body-file message.json
    homecloud mq send orders --body '{hello:world}'
    ```

### קבלה

```bash
homecloud mq receive orders
homecloud mq receive orders --max-messages 5 --wait-seconds 10

# Fast consume: delete/ack in the same call
homecloud mq receive orders --max-messages 10 --delete
```

פריטים שהתקבלו כוללים `created_at` כדי למדוד כמה זמן הודעה חיכתה.

### מחיקה, purge, DLQ

```bash
homecloud mq delete orders 42
homecloud mq purge orders

homecloud mq receive-dlq orders --max-messages 5
homecloud mq delete-dlq orders 7
homecloud mq purge-dlq orders
```

מדריך מלא: [CLI `mq`](../cli/commands/mq.md).

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

## זרימות עבודה טיפוסיות

### Webhook → תור → worker

1. צרו תור `inbound-events`.  
2. API או Function כותבים עם `mq.send`.  
3. worker ארוך־ריצה (תבנית Application **worker**, deployment ב-Kubernetes, או trigger **queue** של Functions) מקבל ועושה ack.

### הודעות רעילות

1. עקבו אחרי ספירת **DLQ** ב-`queues list --live`.  
2. `receive-dlq`, בדקו מטען, תקנו באג.  
3. `purge-dlq` או מחקו sequences בודדים כשנפתר.

## טיפים ומלכודות

- Access Key צריך `mq:*` (או פעולות send/receive צרות יותר).  
- `queues list` דורש login; `mq send` דורש Access Key — קל לערבב.  
- תמיד **מחקו** (ack) אחרי עיבוד מוצלח, או השתמשו ב-`receive(..., delete=True)` לצרכנים פשוטים.  
- שמרו מטענים קטנים באופן סביר; אחסנו blobs גדולים ב-SO ושימו את ה-URI של `so://` בהודעה.

## קשור

- [Functions](functions.md) (triggers של תורים)  
- [CLI `mq`](../cli/commands/mq.md)  
- [Access Keys](../getting-started/access-keys.md)  
