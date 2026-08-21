# Authentication architecture

How HomeCloud authenticates **console**, **CLI**, and **SDK** callers — and how the hot path stays fast under high concurrency (ADR-053).

## Two credential programs

| Channel | Credential | Where it lives | Typical use |
|---------|------------|----------------|-------------|
| Browser console | JWT (24h, no refresh) | `localStorage` (`homecloud_token`) | Interactive humans, MFA |
| CLI interactive | JWT | `~/.homecloud/session` | `homecloud login` / browser MFA |
| CLI / SDK / Terraform | Access Key SigV1 | `~/.homecloud/credentials` | Automation, CI, management + data plane |
| Data plane (SO / MQ / …) | Access Key SigV1 | Same credentials file | Object/message I/O |

Permissions always come from **IAM groups + policies** attached to the principal — not from a coarse Owner/Admin/Builder/Reader matrix. Access templates on invite/create only map people into system groups (`AccountOwners`, `AccountAdmins`, `Builders`, `Readers`).

## Request path (console or user Access Key)

```text
Identity (JWT verify OR SigV1 HMAC)
  → membership / account checks
  → ensure system groups (fast-path if already seeded)
  → effective permissions (Redis cache, then DB)
  → route: require_permission / require_console_iam
```

- **JWT**: decode → load user → check `session_version` + device binding.
- **Management SigV1**: verify signature with Access Key secret (Redis-backed cache, Postgres on miss) → same account-access pipeline for **user** keys.
- **Data-plane SigV1**: Redis `AccessKeyCache` + IAM snapshot (separate from console JWT).

## Scale principles

1. **Seed once** — system groups/policies are created only when missing; warm requests skip locks and commits.
2. **Cache effective permissions** — Redis key per `account_id` + `user_id`, invalidated when policies, groups, or memberships change (account epoch bump).
3. **Cache Access Keys** — management and data plane share the Redis access-key cache; decrypt/DB only on miss.
4. **Isolate tenants** — cache keys and advisory locks are scoped by account; one tenant’s traffic does not serialize another’s.
5. **Stateless verify** — JWT/SigV1 crypto does not need a DB round-trip; DB/Redis only for identity material and authz.

## Credentials-first CLI / SDK

Prefer Access Keys (`homecloud configure`). Console login is for the browser and rare step-up (e.g. passkeys). Details: [CLI authentication](../cli/authentication.md), [IAM guide](iam.md), [Access Keys](../getting-started/access-keys.md).
