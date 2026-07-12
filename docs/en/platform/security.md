# Platform security — MFA and impersonation

Phase 1b adds **multi-factor authentication** for platform administrators and **account impersonation** for support workflows.

## Platform admin MFA (Console)

Open **Security** from the user menu (`/console/iam/security`) or enroll via API.

Supported second factors:

| Method | Description |
|--------|-------------|
| **TOTP** | Google Authenticator, 1Password, Authy — scan `provisioning_uri` or enter secret |
| **Passkey (WebAuthn)** | Browser/device passkey (Touch ID, Windows Hello, security key) |
| **Backup codes** | One-time codes generated when TOTP is confirmed |

At least one of TOTP or passkey must be active when MFA is enabled.

### TOTP enrollment (API)

```http
POST /api/v1/auth/mfa/enroll
Authorization: Bearer <access_token>
```

Confirm:

```http
POST /api/v1/auth/mfa/confirm
Authorization: Bearer <access_token>
Content-Type: application/json

{"code": "123456"}
```

### Passkey enrollment (API)

```http
POST /api/v1/auth/mfa/webauthn/register/options
Authorization: Bearer <access_token>
```

```http
POST /api/v1/auth/mfa/webauthn/register/verify
Authorization: Bearer <access_token>
Content-Type: application/json

{"credential": { ... PublicKeyCredential JSON ... }, "nickname": "MacBook"}
```

Passkeys use `WEBAUTHN_RP_ID` (defaults to the hostname of `CONSOLE_PUBLIC_URL`, e.g. `console.holab.abrdns.com`).

### When MFA is required

Login, create tenant, and enter-account impersonation accept **either** `mfa_code` (TOTP/backup) **or** `mfa_webauthn` (assertion JSON):

- `POST /api/v1/auth/login`
- `POST /api/v1/platform/accounts`
- `POST /api/v1/platform/impersonation/accounts/{account_id}/enter`

Login without a second factor returns `403` with `{"code":"MFA_REQUIRED",...}` when MFA is enabled.

Check status:

```http
GET /api/v1/auth/mfa/status
```

Returns `totp_configured`, `passkeys_count`, and registered passkey metadata.

Disable MFA (TOTP code or passkey):

```http
POST /api/v1/auth/mfa/disable
Content-Type: application/json

{"code": "123456"}
```

Or `{"mfa_webauthn": { ... }}`.

### PowerShell example — login with MFA

```powershell
$body = @{
  username = "root"
  password = "password123"
  mfa_code = "123456"
} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8000/api/v1/auth/login" -Body $body -ContentType "application/json"
```

### Bash example — create account with MFA

```bash
curl -sS -X POST "http://127.0.0.1:8000/api/v1/platform/accounts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme","slug":"acme","owner_email":"owner@example.com","mfa_code":"123456"}'
```

## Account impersonation

Platform admins can act inside a tenant account for support. Impersonation:

- Issues a new JWT with `impersonating_account_id`
- Sets `current_account_id` to the target account
- Adds response header `X-HomeCloud-Acting-As` on account-scoped requests
- Writes audit events `impersonation.start` and `impersonation.end`

Enter account:

```http
POST /api/v1/platform/impersonation/accounts/{account_id}/enter
Authorization: Bearer <platform_admin_token>
Content-Type: application/json

{"mfa_code": "123456"}
```

Or `{"mfa_webauthn": { ... }}`.

Exit impersonation:

```http
POST /api/v1/platform/impersonation/exit
Authorization: Bearer <impersonation_token>
```

In the Console, click **Enter account** on a platform account row. When MFA is enabled, choose **authenticator code** or **Use passkey**. An amber banner shows while impersonation is active.

## Legacy homelab inventory

After migration (`scripts/migrate_legacy_to_platform_account.py`), pre-tenant homelab resources live in the tagged **platform admin account** (`settings.legacy_homelab=true`). New tenants start empty. Account settings show a read-only notice when viewing the legacy inventory account.

## Tenant isolation smoke test

Verify a freshly created account has no apps/resources (only bootstrap projects):

```bash
python scripts/verify_tenant_isolation_smoke.py --base-url http://127.0.0.1:8000
```

## Breaking changes

- Legacy `GET /api/v1/kubernetes/*` and `GET /api/v1/storage/*` require **platform admin**; regular users must use account-scoped routes under `/api/v1/accounts/{account_id}/kubernetes/*`.
- Bootstrap MinIO policies use `so:*` actions scoped to `arn:holab:so:::{short_id}-*` — not permissive `s3:*`.
