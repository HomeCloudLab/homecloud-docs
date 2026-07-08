# SDK

!!! info "Coming soon"
    The HomeCloud Python SDK (`homecloud-sdk`) is vendored inside `homecloud-cli` today. A standalone SDK package and full API reference will be published here.

## Planned sections

- Installation (`pip install homecloud-sdk`)
- `HomeCloudClient` overview
- Service APIs: `storage`, `mq`, `queues`, `accounts`, `secrets`
- Authentication and profiles
- Versioning and changelog

## Current usage (via CLI package)

```python
from homecloud_sdk import HomeCloudClient

client = HomeCloudClient()
client.configure(access_key_id="HCAK...", secret_access_key="...")
client.so.sync_local_to_bucket("./dist", "my-bucket", delete=True)  # overwrites by default
client.so.sync_local_to_bucket("./dist", "my-bucket", skip=True)  # same-size skip
```

See [homecloud-cli](https://github.com/HomeCloudLab/homecloud-cli) source for the latest API.
