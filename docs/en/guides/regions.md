# Regions

A **region** is a HomeCloud place to put resources (`homelab`, `eu-central`, …). It is **not** a vendor name. Capacity providers (Hetzner, Scaleway, OVH) bind behind the API — you pick `eu-central`, not `fsn1`.

| Item | Value |
|------|--------|
| List | `GET /api/v1/catalog/regions` |
| One region | `GET /api/v1/catalog/regions/{code}` |
| Account default | `accounts.default_region` (usually `homelab`) |

## What you see

The console region switcher scopes Compute (and other regional lists) to the selected code. Identity users and billing stay global.

Availability zones are HomeCloud codes too (`homelab-a`, `eu-central-a`). Create payloads send `region_code` and optional `az_code` — never a vendor location slug.

## Isolation (platform vs tenant)

On production lines the Event Bus uses `PLATFORM_NATS_URL`. Tenant MQ uses `TENANT_NATS_URL` / `NATS_URL`. Homelab `local` may keep a single NATS until an explicit cutover. Do not fall back from the platform bus to tenant MQ.

Logical databases (`hc_control`, `hc_compute`, …) are the isolation unit for schema. The homelab still runs one Postgres until that cutover runbook is executed.

## Compute naming

The product is **Compute**. Images are HomeCloud ids: `ubuntu-24.04`, `debian-12`, `almalinux-9`. Object storage is **SO** (`so://`). Managed databases are **MDB**.
