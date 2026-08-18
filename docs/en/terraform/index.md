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

## P2 IAM

IAM create/update/delete needs a User-bound Access Key with console role **owner or admin** (`iam.manage`). Developer keys get 403. Service Account keys are not enabled on IAM routes.

```hcl
data "homecloud_iam_service_account" "functions" {
  name = "functions"
}

resource "homecloud_iam_policy" "mq" {
  name = "ci-mq"
  document = jsonencode({
    Version = "2026-07-24"
    Statement = [{
      Effect   = "Allow"
      Action   = ["mq:*"]
      Resource = "arn:homecloud:mq::${data.homecloud_account.this.account_number}:queue/*"
    }]
  })
}

resource "homecloud_iam_role" "ci" {
  name = "ci"
}

resource "homecloud_iam_policy_attachment" "functions_mq" {
  policy_arn     = homecloud_iam_policy.mq.arn
  principal_type = "service_account"
  principal_id   = data.homecloud_iam_service_account.functions.id
}
```

Use the policy's `arn` (already IAM-canonical). Attachments take a principal UUID, not a name. `Version` in the document is `2026-07-24`, not AWS `2012-10-17`.

## P3 MDB / Redis

Create waits until `status=active` (errors if `failed`). GET is by name or UUID. User `password` is write-only and never returned. Redis passwords stay in `credentials_secret`.

```hcl
resource "homecloud_mdb_instance" "app" {
  name           = "app-db"
  engine         = "postgresql"
  instance_class = "micro"
}

resource "homecloud_mdb_user" "ci" {
  instance_name = homecloud_mdb_instance.app.name
  username      = "ci"
  password      = var.db_password
}

resource "homecloud_redis_instance" "cache" {
  name           = "app-cache"
  instance_class = "micro"
}
```

## P4 Functions / IR / Domains

Spec-only function (no IDE files). Function URL is a sibling. Domain create does **not** wait for DNS verification. Image tags stay out of Terraform.

```hcl
resource "homecloud_function" "hello" {
  name    = "hello"
  handler = "main.handler"
}

resource "homecloud_function_url" "hello" {
  function_name = homecloud_function.hello.name
}

resource "homecloud_ir_repository" "app" {
  name = "frontend"
}

resource "homecloud_domain" "site" {
  hostname = "app.example.com"
}
```

Function **delete** needs owner/admin. Create/update works with a developer key.

## P5 Compute / SSH / Applications

Machine create waits on the Operations API. Application create stays **draft** (no provision/deploy). SSH `private_key` is sensitive and only returned on create.

```hcl
resource "homecloud_ssh_key" "ci" {
  name = "ci"
}

resource "homecloud_application" "api" {
  name     = "api"
  slug     = "api"
  template = "api-only"
}

resource "homecloud_compute_machine" "web" {
  name          = "web-1"
  machine_class = "basic"
  image_id      = "ubuntu-24.04"
  ssh_key_ids   = [homecloud_ssh_key.ci.id]
}
```

| Resource | API |
|----------|-----|
| `homecloud_mq_queue` | `/api/v1/accounts/{id}/queues` |
| `homecloud_so_bucket` | `/api/v1/accounts/{id}/storage/buckets` |
| `homecloud_secret` | `/api/v1/accounts/{id}/secrets` |
| `data.homecloud_account` | whoami + `GET /accounts/{id}` |
| `homecloud_iam_policy` | `/api/v1/accounts/{id}/iam/policies` |
| `homecloud_iam_role` | `/api/v1/accounts/{id}/iam/roles` |
| `homecloud_iam_policy_attachment` | `/iam/principals/attachments` |
| `data.homecloud_iam_service_account` | `GET /iam/service-accounts/{name}` |
| `homecloud_mdb_instance` | `/api/v1/accounts/{id}/databases` |
| `homecloud_mdb_user` | `/databases/{instance}/users` |
| `homecloud_redis_instance` | `/api/v1/accounts/{id}/caches` |
| `homecloud_function` | `/api/v1/accounts/{id}/functions` |
| `homecloud_function_url` | `.../functions/{name}/url` |
| `homecloud_ir_repository` | `/api/v1/accounts/{id}/registry/repositories` |
| `homecloud_domain` | `/api/v1/accounts/{id}/domains` |
| `homecloud_compute_machine` | `/api/v1/accounts/{id}/compute/machines` |
| `homecloud_ssh_key` | `/api/v1/accounts/{id}/compute/ssh-keys` |
| `homecloud_application` | `/api/v1/accounts/{id}/applications` |

State `id` is the control-plane `resources.id` UUID. `iam_arn` is the IAM-canonical ARN (`arn:homecloud:mq::…:queue/name`). Secret `values` are write-only (Terraform 1.11+) and never stored in state. The console stays fully writable — there is no `managed_by=terraform` lock.

## Not in Terraform

Object bodies, MQ messages, function IDE files, mail inbox, and platform bootstrap stay on the SDK/CLI or GitHub Actions.
