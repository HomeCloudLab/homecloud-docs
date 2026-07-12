# Platform security — MFA and impersonation

Phase 1b adds **TOTP MFA** for platform administrators and **account impersonation** for support workflows.

## Platform admin MFA

Platform admins (`platform_role=platform_admin`) can enroll TOTP from the API:

```http
POST /api/v1/auth/mfa/enroll
Authorization: Bearer <access_token>
```

Response includes:

- `secret` — base32 TOTP secret (show once)
- `provisioning_uri` — `otpauth://` URI for authenticator apps
- `backup_codes` — one-time recovery codes (show once)

Confirm enrollment:

```http
POST /api/v1/auth/mfa/confirm
Authorization: Bearer <access_token>
Content-Type: application/json

{"code": "123456"}
```

When MFA is enabled, these actions require a valid `mfa_code` (TOTP or unused backup code):

- Login (`POST /api/v1/auth/login` with `mfa_code`)
- Create tenant account (`POST /api/v1/platform/accounts`)
- Enter account impersonation (`POST /api/v1/platform/impersonation/accounts/{account_id}/enter`)

Check status:

```http
GET /api/v1/auth/mfa/status
```

Disable MFA (requires current TOTP):

```http
POST /api/v1/auth/mfa/disable
Content-Type: application/json

{"code": "123456"}
```

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

Exit impersonation:

```http
POST /api/v1/platform/impersonation/exit
Authorization: Bearer <impersonation_token>
```

In the Console, click **Enter account** on a platform account row (or its detail page). When MFA is enabled, the Console prompts for your TOTP or backup code before entering. An amber banner shows while impersonation is active and returns to **Platform accounts** after exit.

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
