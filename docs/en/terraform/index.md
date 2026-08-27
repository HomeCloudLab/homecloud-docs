# Terraform

Provision HomeCloud **account resources** from Terraform or OpenTofu: queues, buckets, secrets, IAM, databases, Redis, functions, image repositories, domains, compute, SSH keys, and draft applications. The provider calls `console.{apex}/api/v1` with a **SigV1 Access Key** (or a short-lived key from GitHub OIDC). It does **not** manage the homelab (K3s, Helm, Compose).

Architecture: [ADR-049](https://github.com/HomeCloudLab/homecloud-infra/blob/main/docs/adr/adr-049-terraform-provider.md).  
Provider repo: [`terraform-provider-homecloud`](https://github.com/HomeCloudLab/terraform-provider-homecloud) (keep the `terraform-provider-*` name — HashiCorp Registry requires that prefix).

Listed on the Terraform Registry as [`homecloudlab/homecloud`](https://registry.terraform.io/providers/homecloudlab/homecloud/latest) (**v0.1.1**). Run `terraform init` — no local build and no `dev.tfrc` for normal use. Workspaces already locked to v0.1.0: `terraform init -upgrade` (needed for `homecloud configure` / `~/.homecloud/credentials`). Community providers show as **self-signed**; the key ID `4B8BCFED1A615BA9` is our GPG key. That is expected.

## Create a key

Use a dedicated IAM user with console role **developer** or **admin**, then an Access Key bound to that user. See [Access Keys](../getting-started/access-keys.md). Never put the secret in `.tf` files.

Local laptop: `homecloud configure` once, then `terraform apply`. The provider reads the same `%USERPROFILE%\.homecloud\credentials` file as the CLI (`profile` / `HC_PROFILE` for other accounts).

CI: set `HC_ACCESS_KEY_ID` + `HC_SECRET_ACCESS_KEY`, **or** `HC_ROLE_ARN` (GitHub OIDC). If `HC_ROLE_ARN` is set, a leftover credentials file on the runner is ignored.

| Variable | Meaning |
|----------|---------|
| `HC_ACCESS_KEY_ID` | Access Key ID (overrides the credentials file) |
| `HC_SECRET_ACCESS_KEY` | Secret |
| `HC_PROFILE` | Named profile in the credentials file |
| `HC_APEX` | Platform apex (default `holab.abrdns.com`) |
| `HC_ACCOUNT_ID` | Optional account UUID (default: whoami) |
| `HC_ENDPOINT` | Optional console URL override (tests) |

IAM create/update/delete needs a console role of **owner or admin**. Function **delete** also needs owner/admin. Queue/bucket/secret Create/Delete/Get can use a Service Account key with the matching IAM actions (`mq:CreateQueue`, `so:CreateBucket`, `secrets:CreateSecret`, …). Unmapped SA console routes return `403 iam.management_sa_not_enabled`.

## GitHub OIDC (no long-lived key)

CI can mint a **temporary** Access Key from a GitHub Actions OIDC JWT. No `HC_SECRET_ACCESS_KEY` in repo secrets.

1. Create an IAM role whose **trust** allows GitHub Actions (`Principal.Federated` + `Condition` on `sub` and `aud`). Attach managed policies such as `MQAdmin` / `SOBucketAdmin` / `SecretsAdmin`.
2. In GitHub Actions, `permissions: id-token: write`.
3. Set `HC_ROLE_ARN` (and optionally `HC_OIDC_AUDIENCE`, default `https://console.{apex}`). The provider exchanges the JWT at `POST /api/v1/sts/assume-role-with-web-identity` and uses the short-lived SigV1 credentials (including `X-Homecloud-Session-Token`).

Assumed-role sessions use IAM `authorize()` on the **same mapped routes as Service Account keys** (queue / bucket / secret Create/Delete/Get). Unmapped console routes return `403 iam.management_role_not_enabled`. IAM / MDB / functions / compute still need a User-bound key.

Trust example (replace account number, repo, and audience):

```json
{
  "Version": "2026-07-24",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:homecloud:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRole",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "https://console.holab.abrdns.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:HomeCloudLab/my-infra:*"
      }
    }
  }]
}
```

Copy a workflow skeleton from [`examples/github-oidc`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/github-oidc). In Actions the provider reads `ACTIONS_ID_TOKEN_REQUEST_URL` / `ACTIONS_ID_TOKEN_REQUEST_TOKEN` when `HC_WEB_IDENTITY_TOKEN` is unset.

| Variable | Meaning |
|----------|---------|
| `HC_ROLE_ARN` | IAM role ARN to assume |
| `HC_WEB_IDENTITY_TOKEN` | OIDC JWT (optional in GitHub Actions; the provider can fetch it) |
| `HC_OIDC_AUDIENCE` | JWT audience (default `https://console.{apex}`) |
| `HC_SESSION_TOKEN` | Already-exchanged STS session token (optional) |

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

OpenTofu works the same (`tofu apply`).

## Install

```hcl
terraform {
  required_providers {
    homecloud = {
      source  = "homecloudlab/homecloud"
      version = "~> 0.1"
    }
  }
}
```

```bash
terraform init
# existing .terraform.lock.hcl: terraform init -upgrade
```

Hack on the provider itself: copy `dev.tfrc.example` to `dev.tfrc`, set `TF_CLI_CONFIG_FILE`, and **skip `terraform init`** (overrides ignore the Registry). `terraform apply` then warns that development overrides are in effect.

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

Bucket schema is `name` only. Versioning / lifecycle / website stay in the console. Secret `values` are write-only (Terraform 1.11+) and never stored in state.

## P2 IAM

IAM create/update/delete needs a User-bound Access Key with console role **owner or admin** (`iam.manage`). Developer keys get 403. Service Account keys and assumed-role OIDC sessions are not enabled on IAM routes.

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

Use the policy's `arn` (already IAM-canonical). Attachments take a principal UUID, not a name. `Version` in the document is `2026-07-24`, not AWS `2012-10-17`. Put GitHub OIDC **trust** on `homecloud_iam_role` (see above) when CI assumes the role.

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

Spec-only function (no IDE files). Function URL is a sibling. Set `wait_for_verified` on `homecloud_domain` to poll TXT or nameserver verification. Image tags stay out of Terraform.

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
  hostname           = "example.com"
  dns_mode           = "homecloud"
  wait_for_verified  = true
}

resource "homecloud_dns_record" "www" {
  domain_id = homecloud_domain.site.id
  type      = "A"
  host      = "www"
  record    = "1.2.3.4"
}

resource "homecloud_domain_attachment" "fn" {
  domain_id   = homecloud_domain.site.id
  target_id   = homecloud_function.hello.id
  target_type = "function"
  host        = "www"
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
| `homecloud_dns_record` | `/domains/{id}/dns-records` |
| `homecloud_domain_attachment` | `/api/v1/accounts/{id}/domain-attachments` |
| `homecloud_compute_machine` | `/api/v1/accounts/{id}/compute/machines` |
| `homecloud_ssh_key` | `/api/v1/accounts/{id}/compute/ssh-keys` |
| `homecloud_application` | `/api/v1/accounts/{id}/applications` |

State `id` is the control-plane `resources.id` UUID. `iam_arn` is the IAM-canonical ARN (`arn:homecloud:mq::…:queue/name`). Import is almost always by **name** (slug for applications). After import, `terraform plan` should be empty if HCL matches the live object. The console stays fully writable — there is no `managed_by=terraform` lock.

## Worked examples

| Directory | What it creates |
|-----------|-----------------|
| [`examples/mvp`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/mvp) | Queue + bucket + account data |
| [`examples/secret`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/secret) | Secret with write-only values |
| [`examples/iam`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/iam) | Policy + role + SA attachment (owner/admin) |
| [`examples/mdb`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/mdb) | PostgreSQL + user + Redis |
| [`examples/p4`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/p4) | Function + URL + IR repo + domain |
| [`examples/p5`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/p5) | SSH key + draft application (machine commented) |
| [`examples/github-oidc`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/github-oidc) | GitHub Actions OIDC trust + workflow skeleton |

## Registry listing

Live: [`registry.terraform.io/providers/homecloudlab/homecloud`](https://registry.terraform.io/providers/homecloudlab/homecloud/latest). New `v*` tags are signed with the GPG key in [`docs/signing-key.asc`](https://github.com/HomeCloudLab/terraform-provider-homecloud/blob/main/docs/signing-key.asc). Publisher notes: [`PUBLISHING.md`](https://github.com/HomeCloudLab/terraform-provider-homecloud/blob/main/PUBLISHING.md).

The console does **not** offer copy-HCL or Queue API curl tabs. Terraform lives here and in the provider repo.

## Not in Terraform

Object bodies, MQ messages, function IDE files, mail inbox, IR tags, domain DNS verify, machine firewall/disks, application provision/deploy, and platform bootstrap stay on the SDK/CLI, the console, or GitHub Actions.
