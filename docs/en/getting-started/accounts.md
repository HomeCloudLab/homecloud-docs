# Accounts

Each HomeCloud **account** is an isolated namespace for apps, buckets, queues, and databases.

## Open an account from outside (self-service)

Visitors can open a new tenant without a platform admin — same step pattern as sign-in:

1. Open `https://console.{apex}/open-account` (also linked from **Sign in**).
2. **Email** — receive a verification code.
3. **OTP** — enter the 6-digit code.
4. **Credentials** — account name, username, password (+ confirm). Slug is derived from the account name.
5. You enter the console as the **account owner**. Invite more users later under **IAM → Users** (AWS-style root account).

The public flow creates a **bare** tenant (account + owner only). Apps, projects, namespaces, and other resources are created later inside the console when you need them — not during signup.

Disable with API env `PUBLIC_ACCOUNT_SIGNUP_ENABLED=false`.

## Platform admin create

Platform admins can still create tenants under **Platform → Accounts**, and may choose a **bootstrap mode** there:

- **Bare** — tenant + owner only (same as public signup)
- **Minimal** — + Kubernetes namespace shell (no default project)
- **Full** (default when omitted in admin API) — namespace, quotas, default project, DNS settings

No SO buckets, MDB, MQ, Secrets, or Functions are created automatically in any mode.

## Console

1. Log in at `https://console.{apex}`
2. Use the account switcher in the top bar
3. Invite team members via **IAM → Users**

## CLI

```bash
homecloud login --username alice
homecloud accounts list
homecloud accounts switch my-team
```

Access Keys belong to a single account. When you `homecloud configure`, the key's account is resolved automatically.
