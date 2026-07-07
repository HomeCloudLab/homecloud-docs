# so

Object storage commands.

## ls-buckets

Requires console login:

```bash
homecloud login --username alice
homecloud so ls-buckets
```

## ls

```bash
homecloud so ls media
homecloud so ls media --prefix photos/ --recursive
```

## cp

Upload a single file:

```bash
homecloud so cp ./build.zip so://media/releases/build.zip
```

Shows live progress by default.

## sync

Upload a directory (one-way, like `aws s3 sync local → remote`):

```bash
homecloud so sync ./dist so://my-website/
homecloud so sync ./dist so://my-website/ --delete
```

### Live output (default)

```
scan  57 local, 12 remote, 45 operations
sync → so://my-website/  ━━━━━━━━━━━━━━━━━━━━ 100%

upload  index.html
upload  assets/app.js
skip    favicon.ico
delete  old-bundle.js
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
