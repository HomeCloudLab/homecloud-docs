# CLI commands

Complete command map for the `homecloud` binary.

## Meta

| Command | Auth | Description |
|---------|------|-------------|
| `homecloud version` | — | Version (`--check` for updates) |
| `homecloud update` | — | Install a newer standalone release |
| `homecloud install` / `uninstall` | — | Helper installers where applicable |

## Configuration & login

| Command | Auth | Description |
|---------|------|-------------|
| `homecloud configure` | — | Interactive Access Key profile |
| `homecloud configure import` | — | Import credentials JSON |
| `homecloud config show` | — | Show active config |
| `homecloud login` | — | Console JWT (`--browser` for passkeys) |

## Accounts & apps

| Command | Auth | Description |
|---------|------|-------------|
| `homecloud accounts list` | JWT | List accounts |
| `homecloud accounts switch` | JWT | Switch active account |
| `homecloud apps list` | JWT | List applications |

## Queues (management) & MQ (data plane)

| Command | Auth | Description |
|---------|------|-------------|
| `homecloud queues list` | JWT | List queues (`--live` for depths) |
| `homecloud queues get` | JWT | Queue details |
| `homecloud mq send` | Access Key | Publish message(s) |
| `homecloud mq receive` | Access Key | Receive messages |
| `homecloud mq delete` | Access Key | Delete by sequence |
| `homecloud mq purge` | Access Key | Purge queue |
| `homecloud mq receive-dlq` | Access Key | Read DLQ |
| `homecloud mq delete-dlq` | Access Key | Delete DLQ message |
| `homecloud mq purge-dlq` | Access Key | Purge DLQ |

Details: [mq](mq.md).

## Object storage (`so`)

| Command | Auth | Description |
|---------|------|-------------|
| `homecloud so ls-buckets` | JWT | List buckets |
| `homecloud so ls` | Access Key | List objects |
| `homecloud so cp` | Access Key | Copy one file local ↔ SO |
| `homecloud so sync` | Access Key | Sync directory ↔ prefix |
| `homecloud so rm` | Access Key | Delete object / prefix |

Details: [so](so.md).

## Functions (`fn`)

| Command | Auth | Description |
|---------|------|-------------|
| `homecloud fn list` | session / key as configured | List functions |
| `homecloud fn invoke` | | Invoke with JSON payload |
| `homecloud fn url` | | Show / manage function URL info |
| `homecloud fn logs` | | Fetch logs |
| `homecloud fn watch` | | Follow activity |

Details: [fn](fn.md).

## Domains

| Command | Auth | Description |
|---------|------|-------------|
| `homecloud domains list` | JWT | List domains |
| `homecloud domains create` | JWT | Add a domain (`--dns-mode external` or `homecloud`) |
| `homecloud domains get` | JWT | Domain detail |
| `homecloud domains verify` | JWT | Verify TXT or nameservers |
| `homecloud domains attach` | JWT | Connect a hostname (`--host test` relative; empty = root) |
| `homecloud domains records` | JWT | List HomeCloud DNS records |
| `homecloud domains record-create` | JWT | Create a hosted DNS record |
| `homecloud domains delete` | JWT | Delete a domain (detach services first) |

Details: [domains](domains.md). Guide: [Domains](../../guides/domains.md).

## Image registry (`ir`)

| Command | Auth | Description |
|---------|------|-------------|
| `homecloud ir login` | Access Key | `docker login` helper |
| `homecloud ir repo list\|create` | | Repositories |
| `homecloud ir usage` | | Storage usage |

Details: [ir](ir.md).

## Mail

| Command | Auth | Description |
|---------|------|-------------|
| `homecloud mail mailboxes` | | List mailboxes |
| `homecloud mail messages` | | List messages |
| `homecloud mail get` | | Message detail |
| `homecloud mail attachment` | | Download attachment |

Details: [mail](mail.md).

## Billing, usage, monitoring

| Command | Auth | Description |
|---------|------|-------------|
| `homecloud usage list` | JWT | Metered quantities (no prices) |
| `homecloud billing summary` | JWT | Month-to-date estimate |
| `homecloud billing forecast` | JWT | Period forecast (Estimate) |
| `homecloud billing invoices` | JWT | List invoices |
| `homecloud monitoring workspace` | JWT | Monitoring workspace |
| `homecloud monitoring dashboards` | JWT | Default charts |

Details: [billing](billing.md).

## URI scheme

```bash
homecloud so cp ./file.txt so://media/path/file.txt
homecloud so sync ./dist so://my-website/ --delete
homecloud so sync so://docs/ ./site --delete
homecloud so rm so://media/old/ --recursive
```

## Output formats

```bash
homecloud queues list --output table
homecloud mq send q --body '{}' --output json
homecloud so sync ./dist so://b/ --output json
```
