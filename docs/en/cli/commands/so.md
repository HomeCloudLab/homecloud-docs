# so

Object storage commands.

## ls-buckets

Requires console login:

```bash
homecloud login --username alice
homecloud so ls-buckets
```

## ls

Lists objects and paginates through **all pages** (like `aws s3 ls`).

```bash
homecloud so ls media
homecloud so ls media --prefix photos/ --recursive
homecloud so ls media --prefix photos/ --recursive --name ".jpg"
```

| Flag | Behavior |
|------|----------|
| `--prefix` | Limit to keys under this prefix |
| `--recursive` | Flatten the tree (files only; no folder placeholders) |
| `--name` | Case-insensitive substring filter on keys (after full pagination) |

## cp

Copy a single file. Direction is determined by argument order.

=== "Upload (local → SO)"

    ```bash
    homecloud so cp ./build.zip so://media/releases/build.zip
    ```

=== "Download (SO → local)"

    ```powershell
    homecloud so cp "so://media/releases/build.zip" ".\build.zip"
    homecloud so cp "so://my-bucket/watch/spider noir/1/file.mkv" ".\local-dir\"
    ```

    If the destination is a directory, the object key basename is used as the local filename.

=== "Server-side (SO → SO)"

    ```bash
    homecloud so cp so://media/a.txt so://media/backup/a.txt
    homecloud so cp so://media/a.txt so://other-bucket/a.txt
    ```

    Same-bucket or cross-bucket. Progress is status-only (no byte stream).

Shows live byte progress for local ↔ bucket by default.

## sync

Bidirectional directory sync. Direction is determined by argument order.

In the Console, open an object’s **Properties** tab and copy the **SO URI** (`so://bucket/key`) — use that value as the `so://` argument below.

**Default:** overwrite every file that exists on the source side (upload or download).

| Flag | Behavior |
|------|----------|
| *(none)* | Overwrite matching keys/files |
| `--skip` | Skip when destination size already matches (size-only, not content hash) |
| `--delete` | Also remove extras on the destination (mirror) |

One command covers **local → bucket**, **bucket → local**, and **bucket → bucket** (`so://` → `so://`, server-side copy).

=== "Upload (local → SO)"

    ```bash
    homecloud so sync ./dist so://my-website/
    homecloud so sync ./dist so://my-website/ --delete
    homecloud so sync ./dist so://my-website/ --skip
    ```

    `--delete` removes remote objects that are not present locally (mirror mode).

=== "Download (SO → local)"

    ```powershell
    homecloud so sync so://docs/ ./site
    homecloud so sync so://docs/ ./site --delete
    homecloud so sync so://docs/ ./site --skip
    ```

    Single object (copy SO URI from Console **Properties**):

    ```powershell
    homecloud so sync "so://my-bucket/watch/spider noir/1/file.mkv" ".\local-dir\"
    ```

    `--delete` removes local files that are not present in the bucket (mirror mode).

    Keys with spaces must be quoted in PowerShell:

    ```powershell
    homecloud so sync "so://watch/spider noir/1/" ".\local-dir\"
    ```

    Large files stream to disk (no full-file memory buffer). Object keys with spaces use URL-encoded paths for HTTP while signing the canonical key path.

=== "Bucket → bucket"

    ```bash
    homecloud so sync so://photos/ so://backup/photos/
    homecloud so sync so://src-bucket/prefix/ so://dest-bucket/prefix/ --delete
    homecloud so sync so://a/ so://b/ --skip -j 16
    ```

    Remote sync uses server-side copy (no download through your machine). `--delete` removes objects under the destination prefix that are not present under the source prefix.

!!! warning "Breaking change (v0.2.15)"
    Before v0.2.15, sync skipped same-size files by default. From v0.2.15, sync **overwrites by default**. Use `--skip` to restore the old size-based skip behavior.

### Live output (default)

Progress is **byte-based** for uploads, downloads, and remote copies: one shared bar shows transferred size, speed, ETA, and file count. Workers update a thread-safe byte counter; the UI refreshes at 10 Hz (workers never touch Rich directly). Per-file lines still show `upload`, `download`, `copy`, `skip`, or `delete`.

```
scan  57 local, 12 remote, 57 operations
sync → so://my-website/  |  3/57 files  |  index.html  ━━━━━━━━  42%  12.3 MB/s  0:01:20  120/280 MB

upload  index.html
upload  assets/app.js
```

With `--skip`, unchanged same-size files show as `skip` instead of `upload`/`download`/`copy`.

Download shows `sync ← so://bucket/` and `download` lines; bucket→bucket shows `copy` lines.

### Parallel transfers

By default **10 files** transfer at once (`-j` / `--workers`, max 64). Reuses HTTP connections for speed:

```bash
homecloud so sync so://docs/ ./site -j 20
homecloud so sync ./dist so://my-website/ --delete -j 16
homecloud so sync so://photos/ so://backup/photos/ --delete -j 16
homecloud so sync ./dist so://my-website/ --skip -j 16
```

Use `--output json` in CI to suppress progress and emit a JSON summary.

### Static website deploy (GitHub Actions)

```yaml
- name: Deploy site
  env:
    HOMECLOUD_ACCESS_KEY_ID: ${{ secrets.HOMECLOUD_ACCESS_KEY_ID }}
    HOMECLOUD_SECRET_ACCESS_KEY: ${{ secrets.HOMECLOUD_SECRET_ACCESS_KEY }}
    HOMECLOUD_APEX: holab.abrdns.com
  run: |
    curl -fsSL https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-linux-amd64 -o homecloud
    chmod +x homecloud && sudo mv homecloud /usr/local/bin/
    homecloud so sync ./site so://my-website/ --delete --output json
```

## rm

```bash
homecloud so rm so://media/path/file.txt
homecloud so rm so://media/old-site/ --recursive
```

## Website URL

Enable **Static Website** on a bucket in the console, then:

```text
https://{bucket}.web.{apex}
```

Example: `https://docs.web.holab.abrdns.com`
