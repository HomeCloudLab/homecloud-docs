# Go SDK

Programmatic access to HomeCloud from Go 1.22+.

**Module:** `github.com/HomeCloudLab/homecloud-sdk/go`  
**ADR:** [ADR-051](https://github.com/HomeCloudLab/homecloud-infra/blob/master/docs/adr/adr-051-go-sdk.md)

Same HomeCloud capabilities as [Python](python.md) and [Node.js](nodejs.md). The Go API is idiomatic (`context.Context`, structs, `errors.As`) and is allowed to look different. Behavior matches unless a difference is documented as a safety fix (for example Go does **not** auto-retry `MQ.Send`).

## Install

```bash
go get github.com/HomeCloudLab/homecloud-sdk/go@v0.5.10
```

Go modules in `homecloud-sdk/go` also need a `go/v0.5.10` git tag.

## Create a client

```go
package main

import (
    "context"
    "log"

    "github.com/HomeCloudLab/homecloud-sdk/go"
)

func main() {
    client, err := homecloud.FromEnv()
    if err != nil {
        log.Fatal(err)
    }
    ctx := context.Background()

    _, err = client.SO.Upload(ctx, "docs", homecloud.UploadOptions{
        FilePath: "./a.txt",
        Key:      "a.txt",
    })
    if err != nil {
        log.Fatal(err)
    }
}
```

Explicit credentials:

```go
client, err := homecloud.FromCredentials("HCAK...", "secret")
```

Profile file `~/.homecloud/credentials`:

```go
client, err := homecloud.FromProfile("ci")
```

### Inside a Function (STS)

```go
client, err := homecloud.FromSTS(homecloud.STS{
    AccessKeyID:     entry.AccessKeyID,
    SecretAccessKey: entry.SecretAccessKey,
    SessionToken:    entry.SessionToken,
    ResourceType:    "so",
    BaseURL:         entry.BaseURL,
}, homecloud.WithAccountID(accountID))
```

## Object Storage

```go
_, _ = client.SO.PutJSON(ctx, "docs", "a.json", map[string]any{"ok": true})
meta, _ := client.SO.HeadObject(ctx, "docs", "a.json")
_, _ = client.SO.Download(ctx, "docs", "a.json", "./a.json")
_, _ = client.SO.Sync(ctx, "./dist", "so://my-website/", homecloud.SyncOptions{Delete: true})
```

## Message Queues

```go
_, _ = client.MQ.Send(ctx, "orders", map[string]any{"id": 1}, nil)
msgs, _ := client.MQ.Receive(ctx, "orders", homecloud.ReceiveOptions{MaxMessages: 10, WaitSeconds: 5})
for _, msg := range msgs {
    _ = client.MQ.Delete(ctx, "orders", msg.Sequence)
}
```

`Send` is **not** retried on 502/503/504 (unlike Python/Node) so a lost response cannot duplicate messages.

## Errors

```go
var nf *homecloud.NotFoundError
if errors.As(err, &nf) {
    log.Println(nf.ResourceType, nf.Resource)
}
```

## Environment variables

Same as Python: `HC_ACCESS_KEY_ID`, `HC_SECRET_ACCESS_KEY`, `HC_APEX`, `HC_PROFILE` (and `HOMECLOUD_*`).

Optional: `homecloud.WithRequestTimeout(30 * time.Second)` — used only when the caller’s context has no deadline, and not on streaming downloads.

## Related

- [SDK overview](index.md)  
- [Python SDK](python.md)  
- [Node.js SDK](nodejs.md)  
- [Java SDK](java.md)  
- [Object Storage guide](../guides/object-storage.md)  
- [Queues guide](../guides/queues.md)
