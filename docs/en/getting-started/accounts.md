# Accounts

Each HomeCloud **account** is an isolated namespace for apps, buckets, queues, and databases.

## Open an account from outside (self-service)

Visitors can open a new tenant without a platform admin:

1. Open `https://console.{apex}/open-account` (also linked from **Sign in**).
2. Verify email with OTP, choose username/password, account name/slug.
3. Pick a **bootstrap mode**:
   - **Bare** — tenant + owner only
   - **Minimal** (default) — + Kubernetes namespace shell (no default project)
   - **Full** — today’s full pipeline (namespace, quotas, default project, DNS settings)

No SO buckets, MDB, MQ, Secrets, or Functions are created automatically.

Disable with API env `PUBLIC_ACCOUNT_SIGNUP_ENABLED=false`.

## Platform admin create

Platform admins can still create tenants under **Platform → Accounts**, with the same bootstrap modes (default **full** when omitted).

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
