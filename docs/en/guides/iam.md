# IAM

IAM controls **who can do what** in your account: console principals (users + groups + policies), data-plane Roles/Policies, and Access Keys used by CLI/SDK/Terraform.

| Item | Value |
|------|--------|
| Console | **IAM → Users** (create / edit) · **Account → Users** (read-only preview) |

## Two layers (do not mix them up)

### 1. Console access (people) — Groups + policies (ADR-053)

People get permissions from **policy attachments** and **group membership**, not from a four-role matrix. The console Access column shows those attachments (any group or policy). `account_role` remains in the API for compatibility and is not used for display.

The four system groups still exist and can be attached like any other group:

| System group | Managed policy | Typical use |
|--------------|----------------|-------------|
| `AccountOwners` | `SystemAccountOwners` (`Action: *`) | Full account administration; new catalog actions apply automatically |
| `AccountAdmins` | `SystemAccountAdmins` (`Action: *`) | Admin pack; new catalog actions apply automatically |
| `Builders` | `SystemBuilders` | Build / operate workloads (`service:*` when that service is fully granted) |
| `Readers` | `SystemReaders` | Read-only |

Older `ConsoleSystem*` policy names and ARNs still resolve after rename. The `*` is stored on the policy version row (authorize reads that document). The console does not rewrite a long action list into `*` only for display. Owner-only console actions (delete account, transfer ownership) stay gated by the owner role.

Fine-grained custom groups and policies live under **IAM → Groups / Policies**. Evaluation is **Deny > Allow > implicit Deny**. Granting to others requires **CanDelegate**: a subset of concrete actions you can perform. Owner/admin packs store `Action: *` for **perform** (new catalog actions apply automatically). That star does **not** let an admin hand out `*` or `so:*` — only an owner (or someone who already holds that wildcard) may grant wildcards.

Create users under **IAM → Users** (email invite or username/password). Grants at creation are optional — a user with none authenticates but has no meaningful access until you attach groups or policies. Open a user to manage **Groups** and **Direct policies** as tabs. The breadcrumb shows the **username**, not the internal user id. Each tab has an add control at the top and a **table** of current memberships or attachments below. Search filters that table (and the add picker). Use **IAM → Diagnostics** to debug Allows: simulator first, then effective access cards by service.

Open a group for a **members** table like IAM Users: username, email, Access, status, and a ⋮ menu (open the user, or remove them from the group). Multi-select plus **Remove from group** works on custom groups and built-in packs. A remove from `Builders` (or any pack) **stays removed** — the console no longer puts the user back from `account_role` on the next request.

### Account root

The account root has **implicit full access** (no policy document required). You do not need to put root in any group.

| Action | Allowed? |
|--------|----------|
| Disable, delete, or change role | No |
| Attach or detach a **user** policy | No — `403 identity.root_permissions_immutable` |
| Add or remove from a group | Yes |

The user page hides attach/detach for root. Existing attachments stay visible and read-only.

The visual policy builder accumulates statements across services (it does not replace the document when you switch service). Opening a policy never mutates it; Visual ↔ JSON tab switches never generate a new document. The console groups the document **by service for display** even when one statement lists many services. Permission cards sit in a four-across grid; click anywhere on a card to open that slice.

**Create policy** opens a bottom drawer. Name is at the top. **Add from** is one picker (managed templates and your policies); choosing an item **merges** those statements into what you already added — it does not replace manual work and does not duplicate an identical statement. Same effect + same resource unions actions; same effect + same actions unions resources. Different action/resource pairs stay as separate statements so a merge never grants the Cartesian product (Get on bucket A plus Put on bucket B does not become Get+Put on both). A broader Allow (`so:*` on `*`) drops a narrower one. Choosing **All** for a service (`mq:*`) replaces every other Allow for that service. Deny never merges with Allow. Create stays disabled until the policy has a name **and** at least one permission. Selected permissions stay in a compact service list (capability tags such as Read / Write — not every action). That list scrolls on its own — it does not scroll the whole sheet. On a phone the cards sit at the bottom and scroll sideways. Click a service to edit that slice: effect, multiple resource rows, actions, and optional slice JSON (`Sid` / `Condition`). **All** writes `{service}:*` and disables the individual checkboxes; turning it off clears them so you pick specific actions. Resource fields are free text with catalog suggestions as you type (no `#` required). Editing a mixed statement updates only that service; a resource or effect change splits it out so siblings stay untouched.

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

User Access Keys can call **management** APIs (list buckets, queues, …) with SigV1 when policies Allow — no console JWT required. Interactive `homecloud login` is for the browser and rare CLI step-up. See [CLI authentication](../cli/authentication.md) and [Authentication architecture](authentication-architecture.md).

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

## Diagnostics

Open **IAM → Diagnostics**.

1. **Simulator** (top) — ask whether `service:Action` is allowed on a resource ARN without performing it.
2. **Effective access** (below) — cards by service with Read / Write / Create chips. Click a chip or `+N` for exact action names.

The simulator answers the question you arrived with. The cards summarize what is attached after Deny wins.

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
