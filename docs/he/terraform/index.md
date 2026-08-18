# Terraform

פרוויז'ן של **משאבי חשבון** ב-HomeCloud (תורים, באקטים, בהמשך מסדי נתונים) מ-Terraform או OpenTofu. הספק קורא ל-`console.{apex}/api/v1` עם **Access Key ב-SigV1**. הוא **לא** מנהל את ה-homelab (K3s, Helm, Compose).

ארכיטקטורה: [ADR-049](https://github.com/HomeCloudLab/homecloud-infra/blob/main/docs/adr/adr-049-terraform-provider.md).

## יצירת מפתח

השתמשו במשתמש IAM ייעודי עם תפקיד קונסול **developer** או **admin**, ואז Access Key הקשור למשתמש הזה. ראו [Access Keys](../getting-started/access-keys.md).

מפתחות Service Account יכולים ליצור/לקרוא/למחוק תורים, באקטים וסודות כשמדיניות IAM מתירה את הפעולה (`mq:CreateQueue`, `so:CreateBucket`, `secrets:CreateSecret`, …). נתיבי קונסול אחרים עדיין מחזירים `403 iam.management_sa_not_enabled`.

## הגדרה

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

משתני סביבה (אותם שמות כמו ב-CLI):

```bash
export HC_ACCESS_KEY_ID=HCAK...
export HC_SECRET_ACCESS_KEY=...
export HC_APEX=holab.abrdns.com
# אופציונלי: HC_ACCOUNT_ID, HC_ENDPOINT
```

ב-GitHub Actions אפשר בלי סוד ארוך-טווח: `HC_ROLE_ARN` ו-`permissions: id-token: write`.
הספק קורא ל-`POST /api/v1/sts/assume-role-with-web-identity`. ה-trust חייב לצמצם
`sub` ו-`aud`. סשן assumed-role עובד על תור/באקט/סוד כמו מפתח Service Account.
ראו [דוגמת github-oidc](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/github-oidc).

בנייה מהמקור עד שיופיע ב-Terraform Registry. העתיקו `dev.tfrc.example` ל-`dev.tfrc`, הפנו אותו לתיקיית הריפו, והגדירו `TF_CLI_CONFIG_FILE`. **דלגו על `terraform init`** — overrides לא משתמשים ב-Registry.

```bash
git clone https://github.com/HomeCloudLab/terraform-provider-homecloud
cd terraform-provider-homecloud
go build -o terraform-provider-homecloud
```

## משאבי P1 / P1b

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

יצירה/עדכון/מחיקה של IAM דורשים Access Key של משתמש עם תפקיד קונסול **owner או admin** (`iam.manage`). מפתח developer מקבל 403. מפתחות Service Account לא מופעלים על נתיבי IAM.

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

השתמשו ב-`arn` של המדיניות (כבר קנוני ל-IAM). צירוף דורש UUID של principal, לא שם. `Version` במסמך הוא `2026-07-24`, לא AWS `2012-10-17`.

## P3 MDB / Redis

יצירה ממתינה עד `status=active` (נכשל אם `failed`). GET לפי שם או UUID. `password` של משתמש הוא write-only ולא חוזר ב-GET. סיסמת Redis נשארת ב-`credentials_secret`.

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

פונקציה לפי spec בלבד (בלי קבצי IDE). Function URL הוא משאב אח. יצירת דומיין **לא** ממתינה לאימות DNS. תגיות IR לא ב-Terraform.

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

מחיקת פונקציה דורשת owner/admin. יצירה/עדכון עובדים עם מפתח developer.

## P5 Compute / SSH / Applications

יצירת מכונה ממתינה ל-Operations API. יצירת אפליקציה נשארת **draft** (בלי provision/deploy). `private_key` של SSH הוא sensitive וחוזר רק ביצירה.

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

| משאב | API |
|------|-----|
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

מזהה ה-state הוא UUID של `resources.id`. `iam_arn` הוא ה-ARN הקנוני של IAM. `values` של סוד הוא write-only (Terraform 1.11+) ולא נשמר ב-state. הקונסול נשאר ניתן לכתיבה — אין נעילת `managed_by=terraform`.

## לא ב-Terraform

גופי אובייקטים, הודעות MQ, קבצי IDE של פונקציות, תיבת דואר, ו-bootstrap של הפלטפורמה נשארים ב-SDK/CLI או ב-GitHub Actions.
