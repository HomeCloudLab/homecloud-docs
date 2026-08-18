# IAM

IAM controls **who can do what** in your account: console users and roles, data-plane policies, and Access Keys used by CLI/SDK.

| Item | Value |
|------|--------|
| Console | **IAM** → `/console/iam` (+ Account members / users) |

## Two layers (do not mix them up)

### 1. Console access (people)

Roles such as **Owner**, **Admin**, **Developer**, **Viewer** decide who can open the console and call management APIs.

| Role (typical) | Intent |
|----------------|--------|
| Owner | Full control, including dangerous account operations |
| Admin | Manage resources and members |
| Developer | Build and deploy; limited admin |
| Viewer | Read-only |

Invite people under **Account → Members**. Details: [Account & team](account.md).

### Workspace catalog

The console lists services from `GET /api/v1/accounts/{id}/catalog` (released catalog ∩ IAM). Unreleased products are omitted (they look unavailable). A released service you are not granted opens as an empty workspace — not an Access Denied screen. API: unreleased → `404 identity.service_unreleased`; ungranted → `403 identity.service_not_granted`.

### 2. Data-plane IAM (automation)

| Object | Purpose |
|--------|---------|
| **Policies** | Documents of `service:Action` + resource ARNs (`Deny` wins over `Allow`) |
| **Roles** | Assumeable identities (Functions use a Role ARN as `execution_role`) |
| **Access Keys** | Long-lived credentials for a user; permissions come from attached policies |

Account IDs in ARNs are the **12-digit account number**.

## Access Keys

Create and revoke under **IAM → Access Keys**. Full how-to: [Access Keys](../getting-started/access-keys.md).

Root / owner-scoped keys may have broad power — prefer scoped keys for CI.

Roles can also trust **GitHub Actions OIDC** (`Principal.Federated` + `Condition` on `sub` / `aud`). Terraform then uses `HC_ROLE_ARN` instead of a long-lived Access Key. Assumed-role sessions can Create/Delete/Get queues, buckets, and secrets; other console routes return `403 iam.management_role_not_enabled`. See [Terraform — GitHub OIDC](../terraform/index.md#github-oidc-no-long-lived-key).

## Policies

1. Open **Policies** → create or clone a managed starter.  
2. Useful starters often include patterns like MQ consumer, SO read/write, Function basic execution.  
3. Attach the policy to a user or role.

Example SO deploy policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["so:ListBucket", "so:PutObject", "so:DeleteObject"],
      "Resource": [
        "arn:holab:so:::my-website",
        "arn:holab:so:::my-website/*"
      ]
    }
  ]
}
```

## Roles and Functions

Functions must use an **execution Role ARN** (not an Access Key name).

1. Create a Role with the permissions the function needs (SO, MQ, Secrets, …).  
2. Ensure the trust policy allows the Functions service account to assume it (`arn:…:service-account/functions` style principal — copy the exact principal from the console helper if shown).  
3. Set that Role ARN on the function configuration.

## Security settings

Under IAM / Account security:

- Enable **MFA** (TOTP or passkeys) for humans  
- Review sessions and revoke stolen sessions  
- Prefer short-lived console sessions; keep Access Keys only where automation needs them  

See also platform MFA notes if your operator published a security page for passkeys / impersonation support.

## Tips

- Start from managed policies, then narrow.  
- Separate keys per environment (dev/stage/prod).  
- Rotate keys when people leave or CI logs may have leaked them.  
- Viewer console role ≠ empty data-plane policy — set both intentionally.

## Related

- [Access Keys](../getting-started/access-keys.md)  
- [Functions](functions.md)  
- [Account & team](account.md)  
- [Terraform](../terraform/index.md) (`homecloud_iam_policy` / `homecloud_iam_role` / `homecloud_iam_policy_attachment`, plus GitHub OIDC trust)  
