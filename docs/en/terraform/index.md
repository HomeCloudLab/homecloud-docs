# Terraform

Provision HomeCloud **account resources** (queues, buckets, later DBs) from Terraform or OpenTofu. The provider calls `console.{apex}/api/v1` with a **SigV1 Access Key**. It does **not** manage the homelab (K3s, Helm, Compose).

Architecture: [ADR-049](https://github.com/HomeCloudLab/homecloud-infra/blob/main/docs/adr/adr-049-terraform-provider.md).

## Create a key

Use a dedicated IAM user with console role **developer** or **admin**, then an Access Key bound to that user. See [Access Keys](../getting-started/access-keys.md).

Service Account keys can Create/Delete/Get queues, buckets, and secrets when an IAM policy allows the matching action (`mq:CreateQueue`, `so:CreateBucket`, `secrets:CreateSecret`, …). Other console routes still return `403 iam.management_sa_not_enabled`.

## Configure

```hcl
terraform {
  required_providers {
    homecloud = {
      source = "homecloudlab/homecloud"
    }
  }
}

provider "homecloud" {
  apex = "holab.abrdns.com"
}
```

Environment (same names as the CLI):

```bash
export HC_ACCESS_KEY_ID=HCAK...
export HC_SECRET_ACCESS_KEY=...
export HC_APEX=holab.abrdns.com
# optional: HC_ACCOUNT_ID, HC_ENDPOINT
```

Build from source until the Terraform Registry listing ships. Copy `dev.tfrc.example` to `dev.tfrc`, point it at the repo directory, and set `TF_CLI_CONFIG_FILE`. **Skip `terraform init`** — overrides do not use the Registry.

```bash
git clone https://github.com/HomeCloudLab/terraform-provider-homecloud
cd terraform-provider-homecloud
go build -o terraform-provider-homecloud
```

## P1 / P1b resources

```hcl
data "homecloud_account" "this" {}

resource "homecloud_mq_queue" "jobs" {
  name = "jobs"
}

resource "homecloud_so_bucket" "assets" {
  name = "assets"
}

resource "homecloud_secret" "db" {
  name        = "database-url"
  description = "Primary DB"
  values = {
    DATABASE_URL = var.database_url
  }
}
```

| Resource | API |
|----------|-----|
| `homecloud_mq_queue` | `/api/v1/accounts/{id}/queues` |
| `homecloud_so_bucket` | `/api/v1/accounts/{id}/storage/buckets` |
| `homecloud_secret` | `/api/v1/accounts/{id}/secrets` |
| `data.homecloud_account` | whoami + `GET /accounts/{id}` |

State `id` is the control-plane `resources.id` UUID. `iam_arn` is the IAM-canonical ARN (`arn:homecloud:mq::…:queue/name`). Secret `values` are write-only (Terraform 1.11+) and never stored in state. The console stays fully writable — there is no `managed_by=terraform` lock.

## Not in Terraform

Object bodies, MQ messages, function IDE files, mail inbox, and platform bootstrap stay on the SDK/CLI or GitHub Actions.
