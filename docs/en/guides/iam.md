# IAM

IAM controls **who can do what** in your account: console principals (users + groups + policies), data-plane Roles/Policies, and Access Keys used by CLI/SDK/Terraform.

| Item | Value |
|------|--------|
| Console | **IAM** → `/console/iam` (+ Account members / users) |

## Two layers (do not mix them up)

### 1. Console access (people) — Groups + policies (ADR-053)

People get permissions from **policy attachments** and **group membership**, not from a four-role matrix.

| Access template (invite / create UX) | System group |
|--------------------------------------|--------------|
| Owner | `AccountOwners` |
| Admin | `AccountAdmins` |
| Builder | `Builders` |
| Reader | `Readers` |

Fine-grained custom groups and policies can be added under **IAM → Groups / Policies**. Evaluation is **Deny > Allow > implicit Deny**. Granting to others requires **CanDelegate** (subset of what you can perform).

Invite people under **Account → Members** with an access template. Use **IAM → Effective** and **Simulator** to debug Allows.

### Workspace catalog

The console lists services from `GET /api/v1/accounts/{id}/catalog` (released catalog ∩ IAM). Unreleased products are omitted. A released service you are not granted opens as an empty workspace — not an Access Denied screen.

### 2. Data-plane IAM (automation)

| Object | Purpose |
|--------|---------|
| **Policies** | Documents of `service:Action` + resource ARNs (`Deny` wins over `Allow`) |
| **Roles** | Assumeable identities (Functions use a Role ARN as `execution_role`) |
| **Access Keys** | Long-lived credentials for a user; permissions come from attached policies / groups |

Account IDs in ARNs are the **12-digit account number**.

## Access Keys (credentials-first)

Create and revoke under **IAM → Access Keys**. Full how-to: [Access Keys](../getting-started/access-keys.md).

User Access Keys can call **management** APIs (list buckets, queues, …) with SigV1 when policies Allow — no console JWT required. Interactive `homecloud login` is for the browser and rare CLI step-up. See [CLI authentication](../cli/authentication.md).

Roles can also trust **GitHub Actions OIDC** (`Principal.Federated` + `Condition` on `sub` / `aud`). Terraform then uses `HC_ROLE_ARN` instead of a long-lived Access Key. Assumed-role sessions can Create/Delete/Get queues, buckets, and secrets; other console routes return `403 iam.management_role_not_enabled`. See [Terraform — GitHub OIDC](../terraform/index.md#github-oidc-no-long-lived-key).

## Policies

1. Open **Policies** → create or clone a managed starter.  
2. Useful starters often include patterns like MQ consumer, SO read/write, Function basic execution.  
3. Attach the policy to a user, group, or role.

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
- MFA / passkeys for console login
- Session devices and revoke

## Related

- [Account & team](account.md)
- [Access Keys](../getting-started/access-keys.md)
- [CLI authentication](../cli/authentication.md)
- [SDK](../sdk/index.md)
- [Terraform](../terraform/index.md)
