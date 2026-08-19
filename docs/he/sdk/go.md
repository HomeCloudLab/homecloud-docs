# SDK ל-Go

גישה תכנותית ל-HomeCloud מ-Go 1.22+.

**מודול:** `github.com/HomeCloudLab/homecloud-sdk/go`  
**ADR:** [ADR-051](https://github.com/HomeCloudLab/homecloud-infra/blob/master/docs/adr/adr-051-go-sdk.md)

אותן יכולות HomeCloud כמו [Python](python.md) ו-[Node.js](nodejs.md). ה-API הציבורי אידיומטי ל-Go (`context.Context`, structs, `errors.As`) ורשאי להיראות אחרת. ההתנהגות שקולה אלא אם תיעדנו תיקון בטיחות (למשל Go **לא** מריטריא `MQ.Send` אוטומטית).

## התקנה

```bash
go get github.com/HomeCloudLab/homecloud-sdk/go@v0.5.10
```

מודול בתת-תיקייה דורש גם תג `go/v0.5.10`.

## יצירת לקוח

```go
client, err := homecloud.FromEnv()
ctx := context.Background()
_, err = client.SO.Upload(ctx, "docs", homecloud.UploadOptions{
    FilePath: "./a.txt",
    Key:      "a.txt",
})
```

מפתחות מפורשים:

```go
client, err := homecloud.FromCredentials("HCAK...", "secret")
```

פרופיל `~/.homecloud/credentials`:

```go
client, err := homecloud.FromProfile("ci")
```

### מתוך Function (STS)

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
_, _ = client.SO.Sync(ctx, "./dist", "so://my-website/", homecloud.SyncOptions{Delete: true})
```

## תורים

```go
_, _ = client.MQ.Send(ctx, "orders", map[string]any{"id": 1}, nil)
msgs, _ := client.MQ.Receive(ctx, "orders", homecloud.ReceiveOptions{MaxMessages: 10, WaitSeconds: 5})
```

`Send` **לא** מרוטרי על 502/503/504 (בניגוד ל-Python/Node) כדי לא לשכפל הודעות.

## שגיאות

```go
var nf *homecloud.NotFoundError
if errors.As(err, &nf) {
    log.Println(nf.ResourceType, nf.Resource)
}
```

## משתני סביבה

כמו ב-Python: `HC_ACCESS_KEY_ID`, `HC_SECRET_ACCESS_KEY`, `HC_APEX`, `HC_PROFILE` (וגם `HOMECLOUD_*`).

## קשור

- [סקירת SDK](index.md)  
- [Python SDK](python.md)  
- [Node.js SDK](nodejs.md)
