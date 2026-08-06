# HomeCloud CLI

The `homecloud` CLI is the command-line tool for account owners and DevOps. Use it to configure Access Keys, log in for management commands, sync object storage, publish queue messages, invoke functions, and more.

It ships as a **standalone binary** — end users do not need Python installed.

## Install

See [Install](install.md) for Linux, macOS, and Windows.

```bash
homecloud version
homecloud configure
homecloud login
```

## Mental model

| Command family | Auth | Examples |
|----------------|------|----------|
| Data plane | Access Key (`homecloud configure`) | `so cp`, `so sync`, `mq send`, `mq receive` |
| Management | Console session (`homecloud login`) | `queues list`, `so ls-buckets`, `apps list`, `accounts list` |
| Either / mixed | See each command page | `fn`, `ir`, `mail` |

Create keys: [Access Keys](../getting-started/access-keys.md). Details: [Authentication](authentication.md).

## Quick examples

```bash
# Object storage — deploy a static site
homecloud so sync ./dist so://my-website/ --delete

# Queues
homecloud mq send orders --body '{"id":1}'
homecloud mq receive orders --max-messages 5 --delete

# Functions
homecloud fn invoke hello --payload '{"name":"Ada"}'

# Registry
homecloud ir login
homecloud ir repo list

# Mail
homecloud mail mailboxes
```

## Command reference

| Page | Contents |
|------|----------|
| [All commands](commands/index.md) | Table of every command group |
| [configure](commands/configure.md) | Save Access Key profiles |
| [login](commands/login.md) | Browser / password session |
| [so](commands/so.md) | Object storage |
| [mq](commands/mq.md) | Message queues |
| [fn](commands/fn.md) | Functions |
| [ir](commands/ir.md) | Image registry |
| [mail](commands/mail.md) | Mail |
| [Releases](releases.md) | Version history / update |

## Output formats

```bash
homecloud queues list --output table   # default for many lists
homecloud mq send q --body '{}' --output json
homecloud so sync ./dist so://b/ --output json   # CI-friendly
```

## URI scheme

Object storage uses **`so://bucket/key`**:

```bash
homecloud so cp ./file.txt so://media/path/file.txt
homecloud so sync ./dist so://my-website/ --delete
```

## Next

1. [Install](install.md)  
2. [Authentication](authentication.md)  
3. Pick a command guide above  
4. For libraries in your app, see the [SDK](../sdk/index.md)  
