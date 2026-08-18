# Authentication

The CLI uses **two** credential types. Pick the one that matches the command.

## When to use which

| You want to… | Use |
|--------------|-----|
| Create resources in the UI, list queues/buckets/apps, manage Function URLs | **Console login** (`homecloud login`) |
| Upload/sync objects, send/receive messages, invoke Function URLs | **Access Key** (`homecloud configure`) |

Many workflows use both in the same shell session.

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

## Access Key (data plane)

```bash
homecloud configure
```

Or inline for CI:

```bash
homecloud \
  --access-key-id "$HOMECLOUD_ACCESS_KEY_ID" \
  --secret-access-key "$HOMECLOUD_SECRET_ACCESS_KEY" \
  so sync ./dist so://my-bucket/ --delete
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
