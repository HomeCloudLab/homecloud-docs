# Access Keys — security model

Access Keys authenticate **data plane** requests (SO, MQ, Secrets, Mail) using SigV1 HMAC. The runtime must hold the **plaintext secret** to verify signatures.

## Credentials vs authorization

| Concept | Role |
|---------|------|
| **Access Key (HCAK)** | Long-lived **credential** bound to a User or Service Account |
| **IAM policies** on that principal | **Authorization** (effective access). Root user → full access |
| **STS (HCSAK)** | Temporary sessions from `sts:AssumeRole` / Function Role ARN |

Do **not** put coarse `mq:*` / `so:*` scopes on the key itself for new keys — attach policies to the principal (IAM → Policies / Roles), then create the key.

## Source of truth

| Store | Role |
|-------|------|
| **Postgres** (`access_keys`) | Authoritative metadata + `secret_encrypted` + principal link |
| **Redis** | Disposable cache (secret + derived permissions / `iam_snapshot`) |

After a Redis flush or homelab restart:

1. API **rehydrates** all active keys on startup (principal policies → effective access)
2. Data plane services call `POST /internal/access-keys/{id}/ensure-cached` on cache miss (lazy rebuild)

## `secret_encrypted`

SigV1 cannot work with a one-way hash alone. New keys store:

- `secret_hash` — for audit/display (SHA-256)
- `secret_encrypted` — Fernet ciphertext derived from API `SECRET_KEY`

Production should move to KMS/HSM envelope encryption; homelab uses Fernet for simplicity.

## Internal ensure endpoint

Data plane only. Not public API.

```http
POST /internal/access-keys/HCAK.../ensure-cached
X-Homecloud-Internal-Token: <token>
```

- **204** — key warmed in Redis
- **401** — bad/missing token
- **404** — missing, revoked, or unrecoverable (pre-migration keys)

Token: `INTERNAL_ACCESS_KEY_SYNC_TOKEN` on API (defaults to `SECRET_KEY` when unset). Data plane must use the **same** value (homelab deploy scripts pass `SECRET_KEY` from platform `.env`).

## STS session keys (`HCSAK…`)

Short-lived STS credentials stay **Redis-only** with TTL. The ensure endpoint is never called for `HCSAK` prefixes.

Console helpers:

- `POST /accounts/{id}/sts/assume-role` — IAM Role AssumeRole (trust + caller + role policies)
- `POST /accounts/{id}/sts/assume-data-plane-role` — convenience mint scoped to one resource (console RBAC)

## Pre-migration keys

Keys created before migration `016` have `secret_encrypted = NULL`. They **cannot** be recovered after Redis loss.

**Action:** revoke and recreate those keys in Console → IAM → Access Keys, then update CI/GitHub secrets.

## Homelab resync

After restart, run on the homelab host:

```bash
/home/homelab/homecloud-platform/scripts/homelab-resync.sh
```

Includes `homelab-resync-access-keys.py` (Postgres → Redis). API startup rehydrate covers the common case; resync is safe to run repeatedly.
