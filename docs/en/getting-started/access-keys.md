# Access Keys

Access Keys authenticate **data-plane** work (Object Storage, Message Queues, Secrets, Image Registry, SDK/CLI runtime) **and** programmatic **management** of the console API (Terraform / CI — [Terraform](../terraform/index.md)).

They are **not** your console password. Create them once, store the secret safely, and use them in CI and servers. Requests signed with an Access Key do **not** prompt for MFA.

## Create a key in the console

1. Open **IAM → Access Keys** (or **Account → Access keys**).  
2. Click **Create**.  
3. Choose a name and permissions (for example `*` for full access in a lab, or scoped actions like `so:*` / `mq:*`).  
4. Copy:

   - **Access Key ID** — starts with `HCAK…`  
   - **Secret access key** — shown **once**

If you lose the secret, revoke the key and create a new one. You cannot recover the secret later.

## Configure the CLI

=== "Interactive wizard"

    ```bash
    homecloud configure
    ```

    Enter Access Key ID, secret, and apex domain when prompted. Credentials are stored under `~/.homecloud/credentials` (multi-profile JSON).

=== "Environment variables"

    ```bash
    export HOMECLOUD_ACCESS_KEY_ID=HCAK...
    export HOMECLOUD_SECRET_ACCESS_KEY=...
    export HOMECLOUD_APEX=holab.abrdns.com
    ```

    Short forms `HC_ACCESS_KEY_ID`, `HC_SECRET_ACCESS_KEY`, `HC_APEX` also work.

=== "Per command"

    ```bash
    homecloud --access-key-id HCAK... --secret-access-key '...' so ls media
    ```

=== "Import JSON"

    ```bash
    homecloud configure import credentials.json
    ```

## Use from the SDK

=== "Python"

    ```python
    from homecloud import HomeCloud

    client = HomeCloud(
        access_key="HCAK...",
        secret_key="...",
    )
    # or: HomeCloud.from_env()
    # or: HomeCloud()  # reads ~/.homecloud/credentials
    ```

=== "Node.js"

    ```js
    const { HomeCloud } = require("@homecloud-platform/sdk");

    const client = new HomeCloud({
      accessKeyId: process.env.HC_ACCESS_KEY_ID,
      secretAccessKey: process.env.HC_SECRET_ACCESS_KEY,
      apex: process.env.HC_APEX,
    });
    ```

## Least privilege (recommended)

Prefer scoped policies over `*` in production. Example: allow a deploy key to update one static website bucket only:

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

Attach policies via **IAM → Policies / Roles**. See [IAM](../guides/iam.md) for roles, managed policy starters, and how Functions assume roles.

## Console login vs Access Key

| Task | Use |
|------|-----|
| Create a bucket or queue in the UI | Console session |
| `homecloud queues list` / `homecloud so ls-buckets` | `homecloud login` (JWT) |
| `homecloud so cp` / `so sync` / `mq send` | Access Key |
| CI deploy of a static site | Access Key in GitHub Actions secrets |
| Terraform provision of queues / buckets / secrets from CI | User-bound Access Key, **or** GitHub OIDC (`HC_ROLE_ARN`) — [Terraform](../terraform/index.md) |
| Day-to-day browsing in the browser | Console session + MFA |

You often use **both**: login for management listing, Access Key for transfers.

For Terraform in GitHub Actions, prefer **OIDC** over a long-lived `HC_SECRET_ACCESS_KEY` in GitHub Secrets. The provider exchanges a GitHub JWT at `POST /api/v1/sts/assume-role-with-web-identity`. See [Terraform — GitHub OIDC](../terraform/index.md#github-oidc-no-long-lived-key).

!!! warning "Never commit secrets"
    Do not put Access Key secrets in git. Use your CI secret store (`GitHub Actions` secrets, etc.), or skip the long-lived secret entirely with GitHub OIDC for Terraform.

## Troubleshooting

| Symptom | What to try |
|---------|-------------|
| `401` / unauthorized on `so` / `mq` | Wrong key/secret, or key revoked; re-run `homecloud configure` |
| `403` / permission denied | Key policy too narrow; check IAM policies |
| Works in console but CLI fails | Management call needs `homecloud login`; data-plane call needs Access Key |
| Old key after platform Redis flush | Keys live in the database; cache rebuilds automatically. If a very old key predates encryption migration, revoke and recreate |

## Related

- [CLI authentication](../cli/authentication.md)  
- [IAM guide](../guides/iam.md)  
- [SDK](../sdk/index.md)  
- [Terraform](../terraform/index.md) (SigV1 Access Key or GitHub OIDC)  
