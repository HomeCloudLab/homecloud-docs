# Platform services

## SO — Object Storage

- S3-compatible API at `https://so.{apex}`
- Static websites at `https://{bucket}.web.{apex}`
- Console: create buckets, policies, website config, versioning
- Console object detail: copyable `so://bucket/key` URI for CLI/SDK (use quotes in PowerShell when the key contains spaces)
- Lifecycle: abort incomplete multipart uploads after N days (MinIO ILM — enforced on a schedule, not instantly). After save, the API merges the submitted rule into the GET response when MinIO omits `abort_incomplete_multipart_days` on read-back, so the console shows the value you set.
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

## Mail

- Stalwart engine on K3s (HDD path); Console + API in control plane
- Postgres stores **message metadata only**; bodies live in Stalwart
- Console: mailbox list → per-mailbox Inbox / Sent / Compose (same pattern as SO / Queues)
- Phase 1: platform domain from config, mailboxes, send/receive, DNS hints on the service card
- See [Mail](mail.md)

## Console

- React UI for all control-plane operations
- **Kubernetes** — namespace-first console (like SO buckets / MQ queues): tenants see their `acc-{shortId}` namespace; platform admins also see system namespaces (`homecloud`, `so`, `mq`, `mdb`, `kube-system`, …) plus their own account namespace — not other tenants' `acc-*` namespaces
- **Status footer** — thin sticky bar at the bottom of the console shell: API health (left), optional route context (center), background activities (right). SO uploads open in the footer (not a blocking toast); click the chip to expand progress (files, speed, bytes). Minimize with ↓; close with **X** — active uploads prompt for confirmation and abort multipart parts via the upload controller.
- IAM: users, roles, access keys, policies — see [Access Keys security model](access-keys-security.md)
