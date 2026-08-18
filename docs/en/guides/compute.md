# Compute

Compute is HomeCloud **IaaS**: virtual machines with a HomeCloud image, SSH, a volume (Standard class), and a platform Agent. HomeCloud is the cloud. Capacity providers (Hetzner first) stay behind the API — you never send a vendor name or a vendor image id.

The console workspace is **`/console/compute`**: **Machines** and **SSH keys** tabs, plus a machine detail workspace (Overview, Terminal, Files, Performance, Snapshots). CLI/SDK commands will follow when this contract is soaked.

| Item | Value |
|------|--------|
| API | `/api/v1/accounts/{account_id}/compute` |
| Auth | Session JWT or Access Key (`compute.create` / `update` / `delete` / `read`) |
| Async | Mutating calls return **202** `{ machine_id, operation_id }` |
| Operation GET | `GET /api/v1/accounts/{account_id}/operations/{operation_id}` |

## Concepts

| Term | Meaning |
|------|---------|
| **Machine** | A VM in a HomeCloud region + AZ |
| **Basic** | Local disk. Rebuild replaces the VM. |
| **Standard** | Persistent boot volume. Recover attaches the same volume to a new VM. |
| **Image** | HomeCloud id only: `ubuntu-24.04`, `debian-12`, `almalinux-9` |
| **Agent** | Outbound node identity (token now, mTLS later). User JWT never enters the guest. |
| **Health triad** | `desired_state`, `provider_state`, `agent_state` — three fields, never one status string |
| **rebuild** | User action, same `machine_id` |
| **recover** | Control plane replaces a dead VM, keeps volumes |

Quota default is **10 machines** on the existing account quota table (`409 compute.quota_exceeded`). Exhausted region capacity is `409 compute.capacity_exhausted`.

## Images

| `image_id` | Agent package |
|------------|----------------|
| `ubuntu-24.04` | `homecloud-agent.deb` |
| `debian-12` | `homecloud-agent.deb` |
| `almalinux-9` | `homecloud-agent.rpm` |

No Windows. Create with `image_id` only — the adapter maps it (for example AlmaLinux → Hetzner `alma-9` internally).

## Create

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/machines" `
  -Headers @{ Authorization = "Bearer $token"; "Idempotency-Key" = "create-web-1" } `
  -ContentType "application/json" `
  -Body '{"name":"web-1","class":"standard","image_id":"ubuntu-24.04","region_code":"eu-central","ssh_key_ids":["KEY_ID"]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/machines" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: create-web-1" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-1","class":"standard","image_id":"ubuntu-24.04","region_code":"eu-central","ssh_key_ids":["KEY_ID"]}'
```

`region_code=eu-central` is Hetzner capacity (`fsn1`). A live create needs `HETZNER_API_TOKEN` on the API. Without the token the operation completes as **FAILED** (still HTTP 202) and no vendor call is made.

Same `Idempotency-Key` + same body returns the original `machine_id` / `operation_id`.

## SSH keys

SSH keys are **account-wide**, not per machine. HomeCloud generates Ed25519 keys. The **private** file is returned **once** on `POST .../compute/ssh-keys` and is never stored. List/get return name, fingerprint, and public key only. The same key can be injected into many machines via `ssh_key_ids`.

| Method | Path |
|--------|------|
| GET | `/api/v1/accounts/{id}/compute/ssh-keys` |
| POST | `/api/v1/accounts/{id}/compute/ssh-keys` `{"name":"laptop"}` → includes `private_key` **once** |
| DELETE | `/api/v1/accounts/{id}/compute/ssh-keys/{key_id}` |

Create a machine with `"ssh_key_ids": ["<uuid>"]`. Inline `ssh_keys` public-key strings remain accepted for automation.

## Lifecycle

| Method | Path | Operation `action` |
|--------|------|--------------------|
| POST | `.../machines/{id}/start` | `start` |
| POST | `.../machines/{id}/stop` | `stop` |
| POST | `.../machines/{id}/reboot` | `reboot` |
| POST | `.../machines/{id}/rebuild` | `rebuild` |
| POST | `.../machines/{id}/recover` | `recover` |
| DELETE | `.../machines/{id}` | `delete` |

Stop / reboot / delete go through the provider even when `agent_state=OFFLINE`.

CPU/RAM resize is **Standard only** and requires the machine **stopped**:

`POST .../machines/{id}/resize` `{"vcpus":4,"memory_mb":4096}`

Disk is **grow-only**: `POST .../volumes/{volume_id}/resize` `{"size_gb":80}`.

## Firewall, volumes, snapshots

- Default inbound **TCP 22**. Extra rules: TCP/UDP only (`PUT .../machines/{id}/firewall`).
- IPv4 is allocated; IPv6 is stored as null and not required.
- Snapshot a **volume** (`POST .../volumes/{id}/snapshots`), list with `GET .../volumes/{id}/snapshots`, restore to a **new volume** (`POST .../snapshots/{id}/restore`). Not a machine snapshot.

## Agent

The Agent opens **outbound** HTTPS to `/internal/compute/agent/heartbeat` with `X-Homecloud-Agent-Token`. There is no public inbound Agent port. There is **no uninstall API**.

If the unit is disabled, heartbeat `{ "enabled": false }` sets `agent_state=OFFLINE` while the VM can stay `RUNNING` — degraded management, not a dead machine. `POST .../machines/{id}/repair` re-issues node identity; it does not stop the VM.

Exec and files require Agent **ONLINE**:

- `POST .../machines/{id}/exec` `{"command":"hostname"}`
- `GET/PUT .../machines/{id}/files`

Otherwise `409 compute.agent_offline`.

## Providers

HomeCloud is the cloud. **Hetzner** is the first capacity adapter (then Scaleway, then OVH). Do not put customer VMs on the homelab control-plane host. MDB, Mail, SO, and MQ do not run on Compute.

## Console

| Page | Path |
|------|------|
| Machines + SSH keys | `/console/compute` |
| Workspace | `/console/compute/{machine_id}` |

Service tabs: **Machines**, **SSH keys**. Machine tabs: **Overview** (health triad, lifecycle, firewall), **Terminal** (Agent exec), **Files**, **Performance**, **Snapshots**. Terminal and files require `agent_state=ONLINE`. Without `HETZNER_API_TOKEN` a create still returns HTTP 202; the Operation is **FAILED**.

## Breaking changes

None — Compute is new. The console catalog now includes Compute.

## Related

- [SSH keys and machines in Terraform](../terraform/index.md) (`homecloud_compute_machine` / `homecloud_ssh_key`)
