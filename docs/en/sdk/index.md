# SDK

Python SDK for HomeCloud — programmatic access with Access Keys (no interactive MFA).

**Repo:** [homecloud-sdk](https://github.com/HomeCloudLab/homecloud-sdk) · **Version:** 0.3.2

## Install

```bash
pip install homecloud-sdk
```

Until the package is on PyPI, install from GitHub (private repo needs a token):

```bash
pip install "git+https://github.com/HomeCloudLab/homecloud-sdk.git"
# or editable sibling checkout:
pip install -e ../homecloud-sdk
```

## Quick start

```python
from homecloud_sdk import HomeCloud

# CI / servers — Access Key only
client = HomeCloud(
    access_key="HCAK...",
    secret_key="...",
)

# Or environment: HC_ACCESS_KEY_ID / HC_SECRET_ACCESS_KEY
# client = HomeCloud.from_env()

# Or ~/.homecloud/credentials (+ optional HC_PROFILE)
# client = HomeCloud()

client.so.upload("my-bucket", "./file.txt", key="docs/file.txt")
meta = client.so.head_object("my-bucket", "docs/file.txt")  # metadata only
client.mq.send("orders", {"id": 1})
```

## Auth model

| Who | How | MFA |
|-----|-----|-----|
| **SDK / automation** | Access Key + Secret (SigV1 data plane) | Never on requests |
| **CLI / humans** | `homecloud login` → console JWT | At login / step-up only |

Create Access Keys once in the Console (IAM). Runtime SDK calls do not prompt for MFA.

See also: [CLI authentication](../cli/authentication.md).

## Operations by plane

| API | Auth | Notes |
|-----|------|-------|
| `so.upload` / `download` / `sync_*` / `list_objects` / `delete` / `head_object` | Access Key | Primary path |
| `mq.send` / `receive` | Access Key | Primary path |
| `account_id()` | Access Key whoami | No JWT |
| `so.list_buckets` / `create_bucket` | Console JWT | Management helper |
| `queues.list` / `apps.list` / `accounts.*` | Console JWT | Management helper |

Interactive helpers (`login`, `login_browser`) exist for tools/CLI only — not for unattended jobs.

## Profiles and environment

| Variable | Short | Effect |
|----------|-------|--------|
| `HOMECLOUD_PROFILE` | `HC_PROFILE` | Active profile |
| `HOMECLOUD_ACCESS_KEY_ID` | `HC_ACCESS_KEY_ID` | Access key |
| `HOMECLOUD_SECRET_ACCESS_KEY` | `HC_SECRET_ACCESS_KEY` | Secret |
| `HOMECLOUD_ACCOUNT_ID` | `HC_ACCOUNT_ID` | Optional account |
| `HOMECLOUD_APEX` | `HC_APEX` | Platform domain |

Credentials file: `~/.homecloud/credentials` (JSON multi-profile).

## Relation to the CLI

[`homecloud-cli`](https://github.com/HomeCloudLab/homecloud-cli) is a thin Typer/Rich wrapper that **depends on** `homecloud-sdk`. It does not vendor the SDK source.
