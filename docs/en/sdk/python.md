# Python SDK

Programmatic access to HomeCloud from Python 3.

**Package:** `homecloud-sdk` · **Import:** `from homecloud import HomeCloud`

## Install

```bash
pip install homecloud-sdk
```

If the package is not on PyPI in your environment yet:

```bash
pip install "git+https://github.com/HomeCloudLab/homecloud-sdk.git"
# or editable checkout:
pip install -e ../homecloud-sdk
```

## Create a client

```python
from homecloud import HomeCloud

# Explicit (recommended for servers)
client = HomeCloud(
    access_key="HCAK...",
    secret_key="...",
)

# Environment: HC_ACCESS_KEY_ID / HC_SECRET_ACCESS_KEY / HC_APEX
client = HomeCloud.from_env()

# Profile file ~/.homecloud/credentials
client = HomeCloud()
client = HomeCloud(profile="ci")
```

### Async

```python
from homecloud import AsyncHomeCloud

async with AsyncHomeCloud.from_env() as client:
    await client.so.upload("docs", "./a.txt", key="a.txt")
    await client.mq.send("orders", {"id": 1})
```

`from homecloud_sdk import …` still works for compatibility; prefer `from homecloud import …`.

## Object Storage

```python
client.so.upload("docs", "./readme.md", key="readme.md")
client.so.upload(
    "media",
    body=video_bytes,
    key="videos/clip.mp4",
    content_type="video/mp4",
)

meta = client.so.head_object("docs", "readme.md")
client.so.download("docs", "readme.md", "./copy.md")

print(client.so.get_object_uri("docs", "readme.md"))
print(client.so.generate_presigned_url("docs", "readme.md", expires_in=3600))

client.so.list_objects("docs", prefix="readme")
# All pages under a prefix (continuation tokens)
keys = client.so.list_all_objects("docs", prefix="photos/", recursive=True)
client.so.copy("dest-bucket", "a.txt", "folder/a.txt", source_bucket="src-bucket")
client.so.move("dest-bucket", "a.txt", "folder/a.txt", source_bucket="src-bucket")
client.so.delete("docs", "readme.md")

# One API: local↔bucket or bucket↔bucket (same shape as CLI `so sync`)
client.so.sync("./dist", "so://my-website/", delete=True)
client.so.sync("so://docs/", "./site")
client.so.sync("so://photos/", "so://backup/photos/", delete=True)
```

Management helpers (`list_buckets`, `create_bucket`) support **Access Key (SigV1)** using the user’s effective policies (including system groups). `homecloud login` is mainly for interactive console sessions or special cases (e.g. IR ↔ Docker), not for listing buckets when credentials are present.

## Message Queues

```python
client.mq.send("orders", {"id": 1})
client.mq.send("orders", [{"id": 1}, {"id": 2}])  # batch 1–10

messages = client.mq.receive("orders", max_messages=10, wait_seconds=5)
for msg in messages:
    process(msg)
    client.mq.delete("orders", msg["sequence"])

client.mq.receive("orders", max_messages=10, delete=True)  # receive + ack
client.mq.purge("orders")

dlq = client.mq.receive_dlq("orders", max_messages=5)
client.mq.delete_dlq("orders", 7)
client.mq.purge_dlq("orders")
```

## Functions

```python
for fn in client.functions.list():
    print(fn["name"], fn.get("status"))

result = client.functions.invoke("hello", {"name": "Ada"})
print(result)

print(client.functions.url("hello"))
client.functions.enable_url("hello")
client.functions.disable_url("hello")

for row in client.functions.logs("hello"):
    print(row)
detail = client.functions.get_invocation("hello", invocation_id)
```

## Mail

```python
boxes = client.mail.list_mailboxes()
msgs = client.mail.list_messages(mailbox_id=boxes[0]["id"], limit=20)
detail = client.mail.get_message(msgs[0]["id"])
raw = client.mail.download_attachment(msgs[0]["id"], "0")
```

## Image Registry

```python
print(client.ir.list())
client.ir.create("myapp", keep_last=10)
print(client.ir.usage())
```

## Secrets

```python
print(client.secrets.list())
```

## Errors

```python
from homecloud import HomeCloud, NotFoundError, HomeCloudError

try:
    HomeCloud.from_env().so.head_object("docs", "missing.txt")
except NotFoundError as exc:
    print(exc.resource_type, exc.resource)
except HomeCloudError as exc:
    print(exc.status_code, exc)
```

| Type | Typical status |
|------|----------------|
| `NotFoundError` | 404 |
| `UnauthorizedError` | 401 |
| `PermissionDeniedError` | 403 |
| `BadRequestError` | 400 |
| `ConflictError` | 409 |
| `RateLimitError` | 429 |
| `ServiceUnavailableError` | 502–504 |
| `ApiError` | other HTTP errors |

## Environment variables

| Variable | Short | Effect |
|----------|-------|--------|
| `HOMECLOUD_PROFILE` | `HC_PROFILE` | Active profile |
| `HOMECLOUD_ACCESS_KEY_ID` | `HC_ACCESS_KEY_ID` | Access key |
| `HOMECLOUD_SECRET_ACCESS_KEY` | `HC_SECRET_ACCESS_KEY` | Secret |
| `HOMECLOUD_ACCOUNT_ID` | `HC_ACCOUNT_ID` | Optional account |
| `HOMECLOUD_APEX` | `HC_APEX` | Platform domain |

Credentials file: `~/.homecloud/credentials` (JSON multi-profile).

## Relation to the CLI

[`homecloud-cli`](https://github.com/HomeCloudLab/homecloud-cli) is a Typer/Rich wrapper around this SDK. Prefer the CLI for shell/CI sync commands and the SDK inside application code.

## Related

- [SDK overview](index.md)  
- [Node.js SDK](nodejs.md)  
- [Go SDK](go.md)  
- [Java SDK](java.md)  
- [Object Storage guide](../guides/object-storage.md)  
- [Queues guide](../guides/queues.md)  
