# HomeCloud CLI

The `homecloud` CLI is a single binary for console and data-plane operations.

**Current release:** see [Releases](releases.md)

## Install

```bash
# Linux / macOS
curl -fsSL https://homecloud-cli.so.holab.abrdns.com/install/install.sh | bash

# Windows
irm https://homecloud-cli.so.holab.abrdns.com/install/install.ps1 | iex
```

## Verify

```bash
homecloud version
```

## Global options

| Flag | Env var | Description |
|------|---------|-------------|
| `--profile`, `-p` | `HOMECLOUD_PROFILE` | Named credentials profile |
| `--access-key-id` | `HOMECLOUD_ACCESS_KEY_ID` | Access Key (overrides profile) |
| `--secret-access-key` | `HOMECLOUD_SECRET_ACCESS_KEY` | Secret (overrides profile) |
| `--apex` | `HOMECLOUD_APEX` | Platform domain |

## Command groups

| Group | Auth | Description |
|-------|------|-------------|
| `configure`, `config` | — | Credentials setup |
| `login`, `accounts` | JWT | Console API |
| `mq` | Access Key | Send/receive messages |
| `so` | Access Key / JWT | Object storage |
| `queues`, `apps` | JWT | Control plane lists |

See [Commands](commands/index.md) for full reference.
