# Platform services

## SO — Object Storage

- S3-compatible API at `https://so.{apex}`
- Static websites at `https://{bucket}.web.{apex}`
- Console: create buckets, policies, website config, versioning
- Console object detail: copyable `so://bucket/key` URI for CLI/SDK (use quotes in PowerShell when the key contains spaces)
- Lifecycle: abort incomplete multipart uploads after N days (MinIO ILM — enforced on a schedule, not instantly)
- Uploads in progress: browser warns on tab close; in-app navigation prompts to cancel and abort uploaded parts

## MQ — Message Queues

- JetStream-backed queues per account
- Console: create/delete queues, DLQ, metrics
- CLI: `mq send`, `mq receive`

## MDB — Managed Databases

- PostgreSQL, MySQL, MongoDB via operators
- External access via MDB gateway + TCP routes

## Secrets

- Per-account secret store with Access Key auth

## Console

- React UI for all control-plane operations
- IAM: users, roles, access keys, policies — see [Access Keys security model](access-keys-security.md)
