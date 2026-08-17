# Terraform

פרוויז'ן של **משאבי חשבון** ב-HomeCloud (תורים, באקטים, בהמשך מסדי נתונים) מ-Terraform או OpenTofu. הספק קורא ל-`console.{apex}/api/v1` עם **Access Key ב-SigV1**. הוא **לא** מנהל את ה-homelab (K3s, Helm, Compose).

ארכיטקטורה: [ADR-049](https://github.com/HomeCloudLab/homecloud-infra/blob/main/docs/adr/adr-049-terraform-provider.md).

## יצירת מפתח

השתמשו במשתמש IAM ייעודי עם תפקיד קונסול **developer** או **admin**, ואז Access Key הקשור למשתמש הזה. ראו [Access Keys](../getting-started/access-keys.md).

מפתחות Service Account עדיין לא יכולים לשנות את ה-management API (`403 iam.management_sa_not_enabled`).

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

בנייה מהמקור עד שיופיע ב-Terraform Registry:

```bash
git clone https://github.com/HomeCloudLab/terraform-provider-homecloud
cd terraform-provider-homecloud
go build -o terraform-provider-homecloud
```

## משאבי P1

```hcl
data "homecloud_account" "this" {}

resource "homecloud_mq_queue" "jobs" {
  name = "jobs"
}

resource "homecloud_so_bucket" "assets" {
  name = "assets"
}
```

| משאב | API |
|------|-----|
| `homecloud_mq_queue` | `/api/v1/accounts/{id}/queues` |
| `homecloud_so_bucket` | `/api/v1/accounts/{id}/storage/buckets` |
| `data.homecloud_account` | whoami + `GET /accounts/{id}` |

מזהה ה-state הוא UUID של `resources.id`. `iam_arn` הוא ה-ARN הקנוני של IAM. הקונסול נשאר ניתן לכתיבה — אין נעילת `managed_by=terraform`.

## לא ב-Terraform

גופי אובייקטים, הודעות MQ, קבצי IDE של פונקציות, תיבת דואר, ו-bootstrap של הפלטפורמה נשארים ב-SDK/CLI או ב-GitHub Actions.
