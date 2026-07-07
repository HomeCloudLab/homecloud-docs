# HomeCloud Documentation

Welcome to the HomeCloud documentation hub — platform guides, CLI reference, and SDK docs.

**Live site:** [https://docs.web.holab.abrdns.com](https://docs.web.holab.abrdns.com)

## What is HomeCloud?

HomeCloud is a homelab-first cloud control plane with:

| Service | Zone | Purpose |
|---------|------|---------|
| **Console** | `console.{apex}` | Web UI + control-plane API |
| **SO** (Object Storage) | `so.{apex}` / `{bucket}.web.{apex}` | S3-compatible storage + static websites |
| **MQ** | `mq.{apex}` | Message queues |
| **MDB** | `mdb.{apex}` | Managed databases |
| **Secrets** | `secrets.{apex}` | Secrets management |

## Quick links

- [Getting started](getting-started/overview.md)
- [CLI install](cli/install.md)
- [CLI commands](cli/commands/index.md)
- [SDK](sdk/index.md) *(coming soon)*

## Repositories

| Repo | Description |
|------|-------------|
| [homecloud-api](https://github.com/HomeCloudLab/homecloud-api) | Control plane API |
| [homecloud-ui](https://github.com/HomeCloudLab/homecloud-ui) | Web console |
| [homecloud-cli](https://github.com/HomeCloudLab/homecloud-cli) | Command-line interface |
| [homecloud-data-plane](https://github.com/HomeCloudLab/homecloud-data-plane) | SO, MQ, MDB, Secrets gateways |
| [homecloud-docs](https://github.com/HomeCloudLab/homecloud-docs) | This documentation site |
