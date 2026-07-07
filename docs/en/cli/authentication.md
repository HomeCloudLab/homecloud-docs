# Authentication

HomeCloud CLI uses two auth modes depending on the command.

## Console login (JWT)

For control-plane commands: `login`, `accounts`, `queues list`, `so ls-buckets`.

```bash
homecloud login --username alice
# Password prompted interactively, or:
homecloud login --username alice --password '...'
```

!!! important
    Login uses **username**, not email. The console API field is `username`.

Session is stored in `~/.homecloud/session` per profile.

## Access Key (data plane)

For `mq`, `so ls/cp/sync/rm`:

```bash
homecloud configure
```

Or inline (ideal for CI):

```bash
homecloud \
  --access-key-id "$HOMECLOUD_ACCESS_KEY_ID" \
  --secret-access-key "$HOMECLOUD_SECRET_ACCESS_KEY" \
  so sync ./dist so://my-bucket/ --delete
```

No `account_id` needed — resolved via `/access-key/whoami` on the SO gateway.

## Profiles

```bash
homecloud --profile production so ls media
homecloud configure --profile production
```

Credentials file: `~/.homecloud/credentials`
