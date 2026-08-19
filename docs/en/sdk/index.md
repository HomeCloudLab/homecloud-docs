# SDK overview

Use the HomeCloud SDK from your applications, workers, and CI jobs. Unlike the console, the SDK is built for **automation**: Access Keys, no interactive MFA on each request.

| Language | Package | Docs |
|----------|---------|------|
| **Python** | `homecloud-sdk` (`import homecloud`) | [Python SDK](python.md) |
| **Node.js** | `@homecloud-platform/sdk` | [Node.js SDK](nodejs.md) |
| **Go** | `github.com/HomeCloudLab/homecloud-sdk/go` | [Go SDK](go.md) |
| **Java** | `com.homecloudlab:homecloud-sdk` | [Java SDK](java.md) |

All four languages target the same HomeCloud capabilities. Prefer the language your service already uses.

## Auth model

| Who | How | MFA |
|-----|-----|-----|
| **SDK / automation** | Access Key ID + Secret (SigV1) | Never on data-plane requests |
| **Humans / CLI login helpers** | Username/password → JWT | At login / step-up only |

Create keys in the console: [Access Keys](../getting-started/access-keys.md).

## What you can call

| Area | Typical methods | Auth |
|------|-----------------|------|
| Object Storage (`so`) | upload, download, sync, list, delete, head, presign | Access Key |
| Queues (`mq`) | send, receive, delete, purge, DLQ | Access Key |
| Functions | list, invoke, url, logs | Mixed (see language pages) |
| Mail | mailboxes, messages, get, attachment | Access Key / session |
| Image Registry (`ir`) | list/create repos, usage | Session / key as documented |
| Secrets | list | Access Key |
| Management helpers | `queues.list`, `apps.list`, `accounts.*`, create bucket | Console JWT |

## Minimal examples

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

## Next

1. Create an [Access Key](../getting-started/access-keys.md)  
2. Follow [Python](python.md), [Node.js](nodejs.md), [Go](go.md), or [Java](java.md)  
3. For shell scripts, you may prefer the [CLI](../cli/index.md) instead  
4. To provision account resources from CI, use [Terraform](../terraform/index.md) (not the SDK)  
