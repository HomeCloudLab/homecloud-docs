# Terraform

פרוויז'ן של **משאבי חשבון** ב-HomeCloud מ-Terraform או OpenTofu: תורים, באקטים, סודות, IAM, מסדי נתונים, Redis, פונקציות, ריפוזיטורי תמונות, דומיינים, מחשוב, מפתחות SSH ואפליקציות draft. הספק קורא ל-`console.{apex}/api/v1` עם **Access Key ב-SigV1** (או מפתח קצר-חיים מ-GitHub OIDC). הוא **לא** מנהל את ה-homelab (K3s, Helm, Compose).

ארכיטקטורה: [ADR-049](https://github.com/HomeCloudLab/homecloud-infra/blob/main/docs/adr/adr-049-terraform-provider.md).  
ריפו הספק: [`terraform-provider-homecloud`](https://github.com/HomeCloudLab/terraform-provider-homecloud) (השאירו את הקידומת `terraform-provider-*` — HashiCorp Registry דורש אותה).

רשום ב-Terraform Registry כ-[`homecloudlab/homecloud`](https://registry.terraform.io/providers/homecloudlab/homecloud/latest) (**v0.1.1**). הריצו `terraform init` — בלי בנייה מקומית ובלי `dev.tfrc` לשימוש רגיל. workspace שנעל כבר ל-v0.1.0: `terraform init -upgrade` (נדרש בשביל `homecloud configure` / `~/.homecloud/credentials`). ספקי קהילה מופיעים כ-**self-signed**; מזהה המפתח `4B8BCFED1A615BA9` הוא מפתח ה-GPG שלנו. זה צפוי.

## יצירת מפתח

השתמשו במשתמש IAM ייעודי עם תפקיד קונסול **developer** או **admin**, ואז Access Key הקשור למשתמש הזה. ראו [Access Keys](../getting-started/access-keys.md). אל תשימו את הסוד בקבצי `.tf`.

על הלפטופ: `homecloud configure` פעם אחת, ואז `terraform apply`. הספק קורא את אותו `%USERPROFILE%\.homecloud\credentials` כמו ה-CLI (`profile` / `HC_PROFILE` לחשבונות נוספים).

ב-CI: `HC_ACCESS_KEY_ID` + `HC_SECRET_ACCESS_KEY`, **או** `HC_ROLE_ARN` (GitHub OIDC). אם `HC_ROLE_ARN` מוגדר, קובץ credentials שנשאר על ה-runner לא נקרא.

| משתנה | משמעות |
|--------|--------|
| `HC_ACCESS_KEY_ID` | מזהה המפתח (גובר על קובץ ה-credentials) |
| `HC_SECRET_ACCESS_KEY` | הסוד |
| `HC_PROFILE` | פרופיל בקובץ ה-credentials |
| `HC_APEX` | Apex של הפלטפורמה (ברירת מחדל `holab.abrdns.com`) |
| `HC_ACCOUNT_ID` | UUID חשבון אופציונלי (ברירת מחדל: whoami) |
| `HC_ENDPOINT` | כתובת console חלופית (בדיקות) |

יצירה/עדכון/מחיקה של IAM דורשים תפקיד קונסול **owner או admin**. גם **מחיקת פונקציה** דורשת owner/admin. יצירה/מחיקה/קריאה של תור/באקט/סוד יכולות עם מפתח Service Account ופעולות IAM מתאימות (`mq:CreateQueue`, `so:CreateBucket`, `secrets:CreateSecret`, …). נתיבי קונסול שלא מופו ל-SA מחזירים `403 iam.management_sa_not_enabled`.

## GitHub OIDC (בלי מפתח ארוך-טווח)

ב-CI אפשר להנפיק Access Key **זמני** מ-JWT של GitHub Actions. אין צורך ב-`HC_SECRET_ACCESS_KEY` בסודות הריפו.

1. צרו IAM role שה-**trust** שלו מתיר GitHub Actions (`Principal.Federated` + `Condition` על `sub` ו-`aud`). צרפו מדיניות מנוהלת כמו `MQAdmin` / `SOBucketAdmin` / `SecretsAdmin`.
2. ב-GitHub Actions: `permissions: id-token: write`.
3. הגדירו `HC_ROLE_ARN` (ואופציונלי `HC_OIDC_AUDIENCE`, ברירת מחדל `https://console.{apex}`). הספק מחליף את ה-JWT ב-`POST /api/v1/sts/assume-role-with-web-identity` ומשתמש באישורי SigV1 קצרי-חיים (כולל `X-Homecloud-Session-Token`).

סשן assumed-role משתמש ב-IAM `authorize()` על **אותם נתיבים ממופים כמו מפתח Service Account** (יצירה/מחיקה/קריאה של תור / באקט / סוד). נתיבי קונסול שלא מופו מחזירים `403 iam.management_role_not_enabled`. IAM / MDB / פונקציות / מחשוב עדיין דורשים מפתח הקשור למשתמש.

דוגמת trust (החליפו מספר חשבון, ריפו ו-audience):

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

העתיקו שלד workflow מ-[`examples/github-oidc`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/github-oidc). ב-Actions הספק קורא את `ACTIONS_ID_TOKEN_REQUEST_URL` / `ACTIONS_ID_TOKEN_REQUEST_TOKEN` כש-`HC_WEB_IDENTITY_TOKEN` לא מוגדר.

| משתנה | משמעות |
|--------|--------|
| `HC_ROLE_ARN` | ARN של ה-Role להנחה |
| `HC_WEB_IDENTITY_TOKEN` | JWT של OIDC (אופציונלי ב-GitHub Actions; הספק יכול למשוך אותו) |
| `HC_OIDC_AUDIENCE` | ה-audience של ה-JWT (ברירת מחדל `https://console.{apex}`) |
| `HC_SESSION_TOKEN` | טוקן STS שכבר הוחלף (אופציונלי) |

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

OpenTofu עובד אותו דבר (`tofu apply`).

## התקנה

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
# קובץ lock קיים: terraform init -upgrade
```

לעבוד על הספק עצמו: העתיקו `dev.tfrc.example` ל-`dev.tfrc`, הגדירו `TF_CLI_CONFIG_FILE`, ו**דלגו על `terraform init`** (overrides מתעלמים מה-Registry). אז `terraform apply` מזהיר ש-overrides פעילים.

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

סכימת באקט היא `name` בלבד. Versioning / lifecycle / אתר נשארים בקונסול. `values` של סוד הם write-only (Terraform 1.11+) ולא נשמרים ב-state.

## P2 IAM

יצירה/עדכון/מחיקה של IAM דורשים Access Key של משתמש עם תפקיד קונסול **owner או admin** (`iam.manage`). מפתח developer מקבל 403. מפתחות Service Account וסשן OIDC assumed-role לא מופעלים על נתיבי IAM.

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

השתמשו ב-`arn` של המדיניות (כבר קנוני ל-IAM). צירוף דורש UUID של principal, לא שם. `Version` במסמך הוא `2026-07-24`, לא AWS `2012-10-17`. כש-CI מניח את ה-role, שימו **trust** של GitHub OIDC על `homecloud_iam_role` (ראו למעלה).

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

פונקציה לפי spec בלבד (בלי קבצי IDE). Function URL הוא משאב אח. `wait_for_verified` ב-`homecloud_domain` ממתין לאימות TXT או nameservers. תגיות IR לא ב-Terraform.

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
| `homecloud_dns_record` | `/domains/{id}/dns-records` |
| `homecloud_domain_attachment` | `/api/v1/accounts/{id}/domain-attachments` |
| `homecloud_compute_machine` | `/api/v1/accounts/{id}/compute/machines` |
| `homecloud_ssh_key` | `/api/v1/accounts/{id}/compute/ssh-keys` |
| `homecloud_application` | `/api/v1/accounts/{id}/applications` |

מזהה ה-state הוא UUID של `resources.id`. `iam_arn` הוא ה-ARN הקנוני של IAM (`arn:homecloud:mq::…:queue/name`). ייבוא כמעט תמיד לפי **שם** (slug לאפליקציות). אחרי import, `terraform plan` אמור להיות ריק אם ה-HCL תואם לאובייקט החי. הקונסול נשאר ניתן לכתיבה — אין נעילת `managed_by=terraform`.

## דוגמאות

| תיקייה | מה נוצר |
|--------|---------|
| [`examples/mvp`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/mvp) | תור + באקט + data של חשבון |
| [`examples/secret`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/secret) | סוד עם values ב-write-only |
| [`examples/iam`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/iam) | מדיניות + תפקיד + צירוף ל-SA (owner/admin) |
| [`examples/mdb`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/mdb) | PostgreSQL + משתמש + Redis |
| [`examples/p4`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/p4) | פונקציה + URL + ריפו IR + דומיין |
| [`examples/p5`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/p5) | מפתח SSH + אפליקציה draft (מכונה בהערה) |
| [`examples/github-oidc`](https://github.com/HomeCloudLab/terraform-provider-homecloud/tree/main/examples/github-oidc) | trust של GitHub Actions OIDC + שלד workflow |

## רישום ב-Registry

חי: [`registry.terraform.io/providers/homecloudlab/homecloud`](https://registry.terraform.io/providers/homecloudlab/homecloud/latest). תגיות `v*` חדשות נחתמות במפתח ב-[`docs/signing-key.asc`](https://github.com/HomeCloudLab/terraform-provider-homecloud/blob/main/docs/signing-key.asc). הערות למפרסם: [`PUBLISHING.md`](https://github.com/HomeCloudLab/terraform-provider-homecloud/blob/main/PUBLISHING.md).

הקונסול **לא** מציע copy-HCL או לשוניות curl ל-Queue API. Terraform חי כאן ובריפו הספק.

## לא ב-Terraform

גופי אובייקטים, הודעות MQ, קבצי IDE של פונקציות, תיבת דואר, תגיות IR, אימות DNS של דומיין, firewall/דיסקים של מכונה, provision/deploy של אפליקציה, ו-bootstrap של הפלטפורמה נשארים ב-SDK/CLI, בקונסול, או ב-GitHub Actions.
