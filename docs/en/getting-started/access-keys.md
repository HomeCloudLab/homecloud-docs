# Access Keys

Access Keys authenticate **data plane** requests (SO, MQ, Secrets).

## Create a key

1. Console → **IAM → Access Keys → Create**
2. Choose permissions (`*`, `so:*`, `mq:*`, etc.)
3. Copy **Access Key ID** (`HCAK…`) and **Secret** (shown once)

## Configure the CLI

=== "Interactive"

    ```bash
    homecloud configure
    ```

=== "Environment variables"

    ```bash
    export HOMECLOUD_ACCESS_KEY_ID=HCAK...
    export HOMECLOUD_SECRET_ACCESS_KEY=...
    export HOMECLOUD_APEX=holab.abrdns.com
    ```

=== "Per command"

    ```bash
    homecloud --access-key-id HCAK... --secret-access-key ... so ls media
    ```

=== "Import JSON"

    ```bash
    homecloud configure import credentials.json
    ```

!!! warning
    Never commit secrets to git. Use GitHub Actions secrets for CI/CD.

## Redis cache and homelab restarts

Postgres is the **source of truth** for access keys. Redis is a disposable cache.

After a homelab restart or Redis flush:

- The API rehydrates keys on startup
- SO/MQ/Secrets rebuild cache on first request via an internal ensure call
- Run `homelab-resync.sh` on the host for a full manual rehydrate

Keys created **before** the `secret_encrypted` migration cannot be recovered — revoke and recreate them. See [Access Keys security model](../platform/access-keys-security.md).

## Policy example (SO deploy)

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
