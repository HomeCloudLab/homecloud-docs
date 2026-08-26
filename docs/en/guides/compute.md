# Compute

Compute is HomeCloud **IaaS**: you ask for a **machine concept** in a HomeCloud **region**. HomeCloud is the cloud. Capacity vendors stay behind the API — you never send a vendor name, a vendor SKU, or a vendor image id.

You buy `hc.general.small` in `eu-central`, not “CX22 in Falkenstein”. The control plane picks a **Provider Offering** internally. Customer list price is on the concept. Wholesale cost is on the offering and is never returned to you.

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
| **Concept** | Product you buy (`hc.shared.small`, `hc.general.small`): sharing, architecture, disk kind, locality, **customer** price |
| **Machine** | A VM in a HomeCloud region + AZ |
| **Basic / Standard** | Compatibility aliases for persistence (`ephemeral` vs `volume`). Prefer `concept_id`. |
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

Create with `image_id` only — the adapter maps it to a vendor image internally. The client never sends that native id.

**Windows Server is not available from current capacity.** Current fulfillment is Hetzner Cloud, which has no Windows system image. The catalog still lists `windows-2022`; create is rejected with `compute.concept_unavailable`.

AlmaLinux Agent install uses the `wheel` group (not Ubuntu `sudo`) and `pip` for `websocket-client`. Guests created before that cloud-init stay **Booting guest** until you **rebuild**.

## Create

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/machines" `
  -Headers @{ Authorization = "Bearer $token"; "Idempotency-Key" = "create-web-1" } `
  -ContentType "application/json" `
  -Body '{"name":"web-1","concept_id":"hc.general.small","image_id":"ubuntu-24.04","region_code":"eu-central","ssh_key_ids":["KEY_ID"]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/machines" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: create-web-1" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-1","concept_id":"hc.general.small","image_id":"ubuntu-24.04","region_code":"eu-central","ssh_key_ids":["KEY_ID"]}'
```

`region_code` is geography, not a vendor. `eu-central` can be fulfilled by more than one offering. A live create needs the matching vendor token on the API (`HETZNER_API_TOKEN` and/or `SCALEWAY_API_TOKEN` + `SCALEWAY_PROJECT_ID`). Without capacity configured the operation completes as **FAILED** (still HTTP 202) with a HomeCloud error — never a vendor name. `class` remains accepted as an alias (`basic` → `hc.shared.small`, `standard` → `hc.general.small`).

List concepts: `GET /api/v1/accounts/{id}/compute/concepts` (customer prices only).

Same `Idempotency-Key` + same body returns the original `machine_id` / `operation_id`.

## SSH keys

SSH keys are **account-wide**, not per machine. HomeCloud generates the key pair. Choose **ED25519** (default, recommended) or **RSA** (2048 / 3072 / 4096 bit), same options as AWS EC2 key pairs. The **private** file is returned **once** on `POST .../compute/ssh-keys` and is never stored. List/get return name, fingerprint, type, and public key only. The same key can be injected into many machines via `ssh_key_ids`.

| Method | Path |
|--------|------|
| GET | `/api/v1/accounts/{id}/compute/ssh-keys` |
| POST | `/api/v1/accounts/{id}/compute/ssh-keys` `{"name":"laptop","key_type":"ed25519"}` → includes `private_key` **once** |
| DELETE | `/api/v1/accounts/{id}/compute/ssh-keys/{key_id}` |

`key_type` is `ed25519` (default) or `rsa`. For RSA, `rsa_bits` may be `2048` (default), `3072`, or `4096`.

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

The Agent opens **outbound** TLS to Compute. Production guests use WebSocket `wss://…/internal/compute/agent/v1/connect` with **header** `X-Homecloud-Agent-Token` and `machine_id`. User JWT is ignored on that endpoint and never enters the guest. HTTP `POST /internal/compute/agent/heartbeat` remains a **fallback** for older images until rebuild. There is no public inbound Agent port. There is **no uninstall API**.

If the unit is disabled, heartbeat `{ "enabled": false }` sets `agent_state=OFFLINE` while the VM can stay `RUNNING`. A dropped channel, or no heartbeat for about 45 seconds, also shows `OFFLINE`. `POST .../machines/{id}/repair` re-issues node identity and **closes** any live channel; it does not stop the VM.

Guest tools are IAM-gated (viewers can list/preview/download; they cannot Session, exec, or write files):

| Action | Permission |
|--------|------------|
| List / read / download guest files | `compute.read` |
| Session PTY and `POST …/exec` | `compute.terminal` (or legacy `compute.update`) |
| Create / upload / edit / mkdir / delete guest files | `compute.files.write` (or legacy `compute.update`) |
| Start / stop / rebuild / firewall | `compute.update` |

Exec and files require Agent **ONLINE**. When the channel is up they run as RPC (and Session as `stream.*` PTY) on that socket:

- `POST .../machines/{id}/exec` `{"command":"hostname"}`
- `GET .../machines/{id}/files?path=/` — list (name, size, modified, folder/file)
- `GET .../machines/{id}/files/content?path=` — read text
- `PUT .../machines/{id}/files` `{"path","content"}` — create or overwrite text
- `GET .../machines/{id}/files/blob?path=` — download (up to 1 MiB)
- `POST .../machines/{id}/files/blob?path=` — upload binary (chunked `write_b64`, up to 32 MiB)
- `POST .../machines/{id}/files/mkdir` `{"path"}` — create a folder
- `GET .../machines/{id}/metrics/history?range=1h|24h|7d|30d` — downsampled series (Compute Postgres, not the guest)

Otherwise `409 compute.agent_offline`.

The console **Session** tab does not connect until you choose a method and click Connect. Linux guests offer **Agent shell** (PTY). Windows guests also show **Guest desktop** (not shipped yet). SSH `:22` stays break-glass and is not a Session method.

Full screen covers the **entire browser**: no Session title, no side padding. The live-session toolbar follows the console **page theme** (background, borders, and buttons) so controls stay readable — in AWS that is a light bar with orange primary actions, not the dark top chrome. The terminal canvas stays dark. Esc or Exit full screen returns without dropping the session. Find sits on its own row under status and session actions (match case / whole word / regex, result count, previous / next). Type to search. Ctrl+F focuses it. The session stays connected while the browser tab is visible (WebSocket protocol pings every 20s so idle proxies do not drop it). Leaving the tab for **4 minutes** disconnects and shows Reconnect. End session, leaving Session, a dropped WebSocket, or Agent OFFLINE also close it. Idle typing does not. Copy/paste: right-click menu or Ctrl+C / Ctrl+V / Ctrl+X (Ctrl+C copies when text is selected; otherwise it is SIGINT).

The **Explorer** tab lists folders and files (list or grid). Create, upload (drag-and-drop, up to 32 MiB), mkdir, download, and delete files. Folder move/rename is not in this release. Rebuild the VM to pick up `write_b64` chunked upload.

## Providers

HomeCloud is the cloud. You choose a **concept** and a **region**. Offerings (Hetzner, Scaleway, later OVH) are internal. Do not put customer VMs on the homelab control-plane host. MDB, Mail, SO, and MQ do not run on Compute.

## Console

| Page | Path |
|------|------|
| Machines + SSH keys | `/console/compute` |
| Workspace | `/console/compute/{machine_id}` |

Service tabs: **Machines**, **SSH keys**. Machine tabs: **Overview** (health triad, lifecycle, firewall), **Session** (choose Agent shell then Connect; full screen edge-to-edge), **Explorer**, **Performance**, **Snapshots**. Session and Explorer require `agent_state=ONLINE`. Without `HETZNER_API_TOKEN` a create still returns HTTP 202; the Operation is **FAILED**.

## Live updates

Compute publishes `machine.updated` and `operation.updated` to the API Event Bus. The Realtime Gateway fans those out over **SSE**. The console tab already has one account stream; Compute registers a filter on it and refetches that machine or list only when an event arrives. Opening Compute does not open a second SSE connection.

Agent heartbeats (every ~2s) do **not** publish `machine.updated` unless Agent visibility actually changes (`ONLINE` / `OFFLINE` / error). Routine heartbeats must not reopen SSE or poll the machine list.

HTTP polling is only a fallback when the SSE stream is down, and only while a machine is busy (provisioning, deleting, or booting until Agent is ONLINE).

## Performance history

The Agent stays stateless: `/proc` → snapshot → heartbeat. Compute owns history (`MetricsRepository` → Postgres). Logs are a different store later (ADR-046). Do not write time series on the guest.

Retention: 15s raw for 24h, 1m for 7d, 5m for 30d, 1h for 90d (min/max/avg). Network is stored as bytes/sec derived at ingest, not cumulative counters. The Performance tab shows four charts (CPU, RAM, network, disk) with range buttons. Summary tiles show **used / total (percent)** for CPU (of allocated vCPU), RAM, and disk; network shows live KiB/s or MiB/s plus total bytes transferred. Chart hover uses the same units as the axis.

## Breaking changes

None — Compute is new. The console catalog now includes Compute.

## Related

- [SSH keys and machines in Terraform](../terraform/index.md) (`homecloud_compute_machine` / `homecloud_ssh_key`)
