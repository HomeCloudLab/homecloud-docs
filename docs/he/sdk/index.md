# סקירת SDK

השתמשו ב-SDK של HomeCloud מהאפליקציות, ה-workers ומשימות ה-CI שלכם. בניגוד לקונסול, ה-SDK בנוי ל**אוטומציה**: Access Keys, בלי MFA אינטראקטיבי בכל בקשה.

| שפה | חבילה | תיעוד |
|-----|-------|-------|
| **Python** | `homecloud-sdk` (`import homecloud`) | [Python SDK](python.md) |
| **Node.js** | `@homecloud-platform/sdk` | [Node.js SDK](nodejs.md) |
| **Go** | `github.com/HomeCloudLab/homecloud-sdk/go` | [SDK ל-Go](go.md) |
| **Java** | `com.homecloudlab:homecloud-sdk` | [SDK ל-Java](java.md) |

ארבע השפות מכוונות לאותן יכולות HomeCloud. העדיפו את השפה שהשירות שלכם כבר משתמש בה.

## מודל Auth

| מי | איך | MFA |
|----|-----|-----|
| **SDK / אוטומציה** | Access Key ID + Secret (SigV1) | אף פעם בבקשות data-plane |
| **בני אדם / עוזרי login ב-CLI** | שם משתמש/סיסמה → JWT | בהתחברות / step-up בלבד |

צרו מפתחות בקונסול: [Access Keys](../getting-started/access-keys.md).

## מה אפשר לקרוא

| אזור | שיטות טיפוסיות | Auth |
|------|----------------|------|
| Object Storage (`so`) | upload, download, sync, list, delete, head, presign | Access Key |
| Queues (`mq`) | send, receive, delete, purge, DLQ | Access Key |
| Functions | list, invoke, url, logs | Mixed (ראו עמודי השפה) |
| Mail | mailboxes, messages, get, attachment | Access Key / session |
| Image Registry (`ir`) | list/create repos, usage | Session / key as documented |
| Secrets | list | Access Key |
| עוזרי ניהול | `queues.list`, `apps.list`, `accounts.*`, create bucket | JWT קונסול |

## דוגמאות מינימליות

=== "Python"

    ```python
    from homecloud import HomeCloud

    client = HomeCloud.from_env()
    client.so.upload("docs", "./a.txt", key="a.txt")
    client.mq.send("orders", {"id": 1})
    ```

=== "Node.js"

    ```js
    const { HomeCloud } = require("@homecloud-platform/sdk");

    const client = HomeCloud.fromEnv();
    await client.so.putJson("docs", "a.json", { ok: true });
    ```

=== "Go"

    ```go
    client, _ := homecloud.FromEnv()
    _, _ = client.SO.PutJSON(ctx, "docs", "a.json", map[string]any{"ok": true})
    ```

=== "Java"

    ```java
    HomeCloud client = HomeCloud.fromEnv();
    client.so().putJson("docs", "a.json", Map.of("ok", true));
    ```

## הבא

1. צרו [Access Key](../getting-started/access-keys.md)  
2. עקבו אחרי [Python](python.md), [Node.js](nodejs.md), [Go](go.md) או [Java](java.md)  
3. לסקריפטי shell, ייתכן שתעדיפו את ה-[CLI](../cli/index.md) במקום  
4. לפרוויז'ן משאבי חשבון מ-CI השתמשו ב-[Terraform](../terraform/index.md) (לא ב-SDK)  
