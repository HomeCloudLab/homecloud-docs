# Object Storage (SO)

Object Storage holds files as **objects** inside **buckets**. There are no real folders — only object keys that may contain `/` (for example `photos/2026/img.jpg`).

Use SO for backups, build artifacts, media, and **static websites** served at `https://{bucket}.web.{apex}`.

| Item | Value |
|------|--------|
| Console | **Object Storage** → `/console/storage` |
| API / CLI host | `https://so.{apex}` |
| URI scheme | `so://bucket/key` (not `s3://`) |
| Auth (data plane) | Access Key |

## Console walkthrough

### Create a bucket

1. Open **Object Storage**.  
2. Click **Create bucket**, choose a DNS-safe name, confirm.  
3. Open the bucket to see tabs: **Objects**, **Lifecycle**, **Versioning**, **Permissions**, **Website**.

### Browse and upload objects

1. Open the **Objects** tab.  
2. Navigate by prefix (the UI presents prefixes like folders).  
3. **Upload** one or many files. Multi-file uploads use a concurrency queue (1 / 5 / 10 workers) with pause, resume, and auto-retry. Large single files use multipart upload.  
4. Progress appears in the console **footer** — you can minimize it and keep working. Closing the tab while uploads run will warn you; cancel aborts uploaded parts.  
5. **Copy / cut / paste** (and drag between folders) runs as a **server job**. Move is atomic per object (copy + delete on SO). Closing the console does not turn a move into a leftover copy. Progress uses the same minimizable footer panel as uploads.

### Object properties

Open an object → **Properties** to see size, content type, and a copyable **`so://bucket/key`** URI. Use that URI in the CLI/SDK. In PowerShell, quote URIs when keys contain spaces:

```powershell
homecloud so cp "so://media/watch/spider noir/1/file.mkv" ".\file.mkv"
```

### Static website hosting

1. Open the bucket → **Website**.  
2. Enable website hosting and set index / error documents (for example `index.html`, `404.html`).  
3. Upload your site files (or `homecloud so sync ./dist so://my-website/ --delete`).  
4. Open `https://{bucket}.web.{apex}`.

### Lifecycle, versioning, permissions

| Tab | Purpose |
|-----|---------|
| **Lifecycle** | Expire objects or abort incomplete multipart uploads after N days |
| **Versioning** | Keep prior versions of overwritten keys |
| **Permissions** | Bucket policy / access rules for the account |

Lifecycle rules are enforced on a schedule (not instantly the second you save).

### Search

Use bucket search when you need to find keys by name/prefix across a large bucket (see the Search help in-console for filters).

## CLI

Prerequisites: [Install](../cli/install.md), [Access Key](../getting-started/access-keys.md). Listing buckets needs `homecloud login`; object transfers use the Access Key.

### List buckets and objects

```bash
homecloud login --username alice
homecloud so ls-buckets

homecloud so ls media
homecloud so ls media --prefix photos/ --recursive
```

### Copy one file

=== "Upload"

    ```bash
    homecloud so cp ./build.zip so://media/releases/build.zip
    ```

=== "Download"

    ```bash
    homecloud so cp so://media/releases/build.zip ./build.zip
    ```

### Sync a directory (common for static sites and deploys)

Direction follows argument order. Default behavior **overwrites** matching keys.

| Flag | Meaning |
|------|---------|
| *(none)* | Overwrite when the source has the file |
| `--skip` | Skip when destination size already matches |
| `--delete` | Also remove extras on the destination (mirror) |
| `-j N` | Parallel file transfers (default 10, max 64) |

=== "Upload local → bucket"

    ```bash
    homecloud so sync ./dist so://my-website/
    homecloud so sync ./dist so://my-website/ --delete
    homecloud so sync ./dist so://my-website/ --skip -j 16
    ```

=== "Download bucket → local"

    ```bash
    homecloud so sync so://docs/ ./site
    homecloud so sync so://docs/ ./site --delete
    ```

=== "Bucket → bucket"

    ```bash
    homecloud so sync so://photos/ so://backup/photos/
    homecloud so sync so://src/ so://dest/ --delete --skip
    ```

=== "CI (JSON summary, no live bar)"

    ```bash
    homecloud so sync ./dist so://my-website/ --delete --output json
    ```

### Delete

```bash
homecloud so rm so://media/old/file.txt
homecloud so rm so://media/old/ --recursive
```

Full flag reference: [CLI `so` commands](../cli/commands/so.md).

## SDK

=== "Python"

    ```python
    from homecloud import HomeCloud

    client = HomeCloud.from_env()

    client.so.upload("docs", "./readme.md", key="readme.md")
    client.so.upload(
        "media",
        body=b"...",
        key="videos/clip.mp4",
        content_type="video/mp4",
    )

    meta = client.so.head_object("docs", "readme.md")  # metadata only
    client.so.download("docs", "readme.md", "./readme-copy.md")

    uri = client.so.get_object_uri("docs", "readme.md")
    # uri["so_uri"], uri["https_url"]

    url = client.so.generate_presigned_url("docs", "readme.md", expires_in=3600)

    client.so.sync("./dist", "so://my-website/", delete=True)
    client.so.sync("so://docs/", "./site")
    client.so.sync("so://photos/", "so://backup/photos/", delete=True)
    ```

=== "Python (async)"

    ```python
    from homecloud import AsyncHomeCloud

    async with AsyncHomeCloud.from_env() as client:
        await client.so.upload("docs", "./a.txt", key="a.txt")
        meta = await client.so.head_object("docs", "a.txt")
    ```

=== "Node.js"

    ```js
    const { HomeCloud } = require("@homecloud-platform/sdk");

    const client = HomeCloud.fromEnv();
    await client.so.putJson("docs", "a.json", { ok: true });
    ```

Management helpers such as `list_buckets` / `create_bucket` typically need a console JWT session (same as `homecloud login`). Runtime upload/download/sync use the Access Key only.

## Typical workflows

### Deploy a static site from CI

1. Create bucket `my-website`, enable **Website**.  
2. Create an Access Key with `so:*` (or a policy limited to that bucket).  
3. In CI:

```bash
export HC_ACCESS_KEY_ID=...
export HC_SECRET_ACCESS_KEY=...
export HC_APEX=holab.abrdns.com
homecloud so sync ./dist so://my-website/ --delete --output json
```

### Share a temporary download link

Use `generate_presigned_url` in the SDK, or download via CLI and distribute the file yourself. Prefer short expiry times.

## Tips and pitfalls

- Prefer **`so://`** everywhere in HomeCloud docs and tooling — not `s3://`.  
- Keys with spaces need quotes in PowerShell.  
- `so sync` without `--skip` overwrites by design (since CLI v0.2.15).  
- Incomplete multipart uploads can be cleaned by a lifecycle abort rule.  
- Bucket names should stay DNS-safe if you enable website hosting.

## Related

- [CLI `so`](../cli/commands/so.md)  
- [SDK](../sdk/index.md)  
- [Access Keys](../getting-started/access-keys.md)  
- [Terraform](../terraform/index.md) (`homecloud_so_bucket`)  
