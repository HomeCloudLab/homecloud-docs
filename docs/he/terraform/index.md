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

מזהה ה-state הוא UUID של `resources.id`. `iam_arn` הוא ה-ARN הקנוני של IAM. `values` של סוד הוא write-only (Terraform 1.11+) ולא נשמר ב-state. הקונסול נשאר ניתן לכתיבה — אין נעילת `managed_by=terraform`.

## לא ב-Terraform

גופי אובייקטים, הודעות MQ, קבצי IDE של פונקציות, תיבת דואר, ו-bootstrap של הפלטפורמה נשארים ב-SDK/CLI או ב-GitHub Actions.
