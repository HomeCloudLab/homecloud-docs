# Authentication

The CLI uses **two** credential types. Prefer Access Keys for automation; use console login for interactive humans.

## When to use which (credentials-first)

| You want to… | Use |
|--------------|-----|
| List/create buckets, list queues, Terraform, CI/CD management APIs allowed by your policies | **Access Key** (`homecloud configure`) — SigV1, no JWT |
| Upload/sync objects, send/receive messages, invoke Function URLs | **Access Key** |
| Interactive console browser, MFA step-up, rare CLI bootstrap | **Console login** (`homecloud login`) |
| Special tool protocols (e.g. IR ↔ Docker login) | Console login / tool-specific flow |

Permissions always come from **IAM policies and groups** attached to the principal (ADR-053). The Access Key does not carry its own permission matrix.

## Console login (JWT)

```bash
homecloud login --username alice
# Password prompted interactively, or:
homecloud login --username alice --password '...'
```

!!! important
    Login uses **username**, not email.

### MFA

| Method | How |
|--------|-----|
| TOTP / backup code | Terminal prompt, or `--mfa-code` |
| Passkey / security key | `homecloud login --browser` |

```bash
homecloud login --username alice --mfa-code 123456
homecloud login --browser
```

Session file: `~/.homecloud/session` (per profile).

## Access Key (default for CLI/SDK)

```bash
homecloud configure
```

Or inline for CI:

```bash
homecloud \
  --access-key-id "$HOMECLOUD_ACCESS_KEY_ID" \
  --secret-access-key "$HOMECLOUD_SECRET_ACCESS_KEY" \
  so ls-buckets
```

Examples that work with Access Key alone (when policy Allows):

```bash
homecloud so ls-buckets
homecloud so create-bucket my-bucket   # when wired via management SigV1
homecloud queues list                  # when policy Allows
```

No `account_id` flag is required — the key is already scoped to one account.

Access Keys never prompt for MFA on each request. Create them once in the console (with MFA if enabled): [Access Keys](../getting-started/access-keys.md).

## Profiles

```bash
homecloud configure --profile production
homecloud --profile production so ls media
```

Credentials file: `~/.homecloud/credentials`

## Related

- [Install](install.md)  
- [Command map](commands/index.md)  
- [IAM](../guides/iam.md)  
- [Terraform](../terraform/index.md)  
