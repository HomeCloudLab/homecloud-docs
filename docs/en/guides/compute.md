# Compute

Compute is HomeCloud **IaaS**: you ask for a **machine concept** in a HomeCloud **region**. HomeCloud is the cloud. Capacity vendors stay behind the API — you never send a vendor name, a vendor SKU, or a vendor image id.

You buy `hc.general.small` in `eu-central`, not “CX22 in Falkenstein”. The control plane picks a **Provider Offering** internally. Customer list price is **USD**: FX(wholesale) × GTM markup (default **2×**, cap **4×**). Wholesale cost is on the offering and is never returned to you. Running machine hours are billed from that offering’s snapshot, not a generic concept placeholder.

The console workspace is **`/console/compute`**: **Machines**, **SSH keys**, **Security groups**, **Floating IPs**, **Load balancers**, and **VPC** tabs (VPC is capability-gated), plus a machine detail workspace (Overview, Network, Session, Files, Performance, Snapshots). CLI/SDK commands will follow when this contract is soaked.

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
| **VPC** | Account private IPv4 fabric in a HomeCloud region (CIDR). Not a vendor “network” name. |
| **Subnet** | CIDR carve-out **inside** the parent VPC CIDR. Machines attach to a subnet. |
| **NIC** | Machine network interface. Stage 6.1: at most **one** private NIC (subnet attach) per machine; inventory shows `nic.private_ip` when attached. |

Quota default is **10 machines** on the existing account quota table (`409 compute.quota_exceeded`). Exhausted region capacity is `409 compute.capacity_exhausted`. VPC quotas: **5 VPCs** and **20 subnets** per account.

## Images

| `image_id` | Agent package |
|------------|----------------|
| `ubuntu-24.04` | `homecloud-agent.deb` |
| `debian-12` | `homecloud-agent.deb` |
| `almalinux-9` | `homecloud-agent.rpm` |
| `windows-2022` | HomeCloud Agent (PowerShell `#ps1`) when a bootstrap image is ready |

Create with `image_id` only — the adapter maps it to a vendor image internally. The client never sends that native id.

**Windows is `image ∩ offering`, not a lane.** `GET /concepts?image_id=windows-2022` marks a concept `available` only when an offering in that placement can boot it and the shape has at least **4 GiB** RAM. The console does not apply a local Windows filter. Create of a too-small shape or a placement with no capable offering returns `compute.invalid_image` / `compute.placement_unavailable`.

`windows-2022` stays `available=false` when the private bootstrap image is unset **or the configured UUID is gone** on Scaleway. A stale env var must not sell a create that 404s. Catalog `available=true` means a live image UUID exists — not that guest bootstrap or Agent ONLINE is proven. Session still requires `agent_state=ONLINE`.

AlmaLinux Agent install uses the `wheel` group (not Ubuntu `sudo`) and `pip` for `websocket-client`. The Agent script is **Python 3.9 compatible** (AlmaLinux 9 ships 3.9; `datetime.UTC` is 3.11+). Machines created before that cloud-init stay **Server starting** until you **rebuild**.

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

Optional create fields:

| Field | Meaning |
|-------|---------|
| `placement_scope` | `region` (default) or `flex` (EU cheapest eligible). Not available in `homelab`. |
| `boot_disk_gb` | Boot volume size in GB (free choice). Platform minimum **10** GB; maximum from the concept policy. Billed **per GB for the full size**. |
| `data_disk_gb` | Optional single attached data volume (compat). Prefer `data_disk_sizes`. |
| `data_disk_sizes` | Optional list of data volume sizes (GB each, free choice, min 10). Max 5. Rejected with `compute.data_volume_unsupported` when the placement has no `volume_attach`. |

After create, `POST .../machines/{id}/volumes` with `{ "size_gb": N }` attaches another data volume.
| `security_group_ids` | Extra groups (default always attaches). Rejected with `compute.firewall_unsupported` when the placement has no firewall. |
| `ssh_key_ids` | Account SSH keys injected at first boot. |

No eligible offering is `400 compute.placement_unavailable` (not a generic concept error). List/get machines include `operation_id`, `operation_status`, `operation_action`, and `operation_progress` for the latest Compute Operation. Create progress is ~10 (running), ~35 (before vendor create), ~80 (after), 100 (succeeded).

`region_code` is geography, not a vendor. `eu-central` can be fulfilled by more than one offering. A live create needs the matching vendor token on the API (`HETZNER_API_TOKEN` and/or `SCALEWAY_API_TOKEN` + `SCALEWAY_PROJECT_ID`). Without capacity configured the operation completes as **FAILED** (still HTTP 202) with a HomeCloud error — never a vendor name. `class` remains accepted as an alias (`basic` → `hc.shared.small`, `standard` → `hc.general.small`).

List concepts: `GET /api/v1/accounts/{id}/compute/concepts` (customer prices only). Pass `image_id` so `available` is the image∩offering intersection for that guest (required for Windows honesty).

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

Stop / reboot / delete go through the provider even when `agent_state=OFFLINE`. Delete removes the instance **and** its boot disk at the placement (including network block disks). Load balancer and VPC delete wait until the placement object is gone before HomeCloud drops the row.

CPU/RAM resize is **Standard only** and requires the machine **stopped**:

`POST .../machines/{id}/resize` `{"vcpus":4,"memory_mb":4096}`

Disk is **grow-only**: `POST .../volumes/{volume_id}/resize` `{"size_gb":80}`.

## Firewall, volumes, snapshots

- **Security groups** are the source of truth for ingress (account-scoped). Attach to a **machine** and/or to a private **NIC** (`target_type` `machine` | `nic`). Each rule is TCP/UDP + port + **source CIDR** (e.g. `0.0.0.0/0`, a public host, or a VPC/subnet CIDR). Domains are not supported.
- Effective rules for a machine = **union** of groups attached to the machine **and** to its NICs (deduplicated). On current Hetzner capacity the driver still applies that union to the **server** firewall — NIC targeting is HomeCloud SoT for future per-interface vendors.
- The account **default** group includes **TCP 22**. Extra groups do **not** force SSH — create HTTPS-only groups if you want.
- Console: Compute → **Security groups** (quick create dialog; full-page edit). The list shows attached machines. Detach removes the vendor firewall from the VM; delete removes the firewall object. Delete is blocked while a group is attached to a **live** machine or NIC. Deleting a machine detaches its groups. Attachments to a machine that is already gone are cleaned up and do not block delete. `PUT .../machines/{id}/firewall` is a compatibility shim that writes the account **default** group.
- Attach API: `POST .../security-groups/{group_id}/attachments` `{"target_type":"machine"|"nic","target_id":"…"}`. Machine shorthand `POST .../machines/{id}/security-groups/{group_id}` always uses `target_type=machine`.
- Drivers without a vendor firewall (Scaleway today) store the policy in HomeCloud and do not pretend the vendor applied it.
- Public IPv4 is allocated on the machine NIC; private IPv4 appears after [VPC subnet attach](#vpc-subnets-private-nic). New machines on placements that advertise `ipv6` are **dual-stack**: the NIC also stores observed `public_ipv6`. Existing machines stay IPv4-only until recreate. VPC/subnet CIDR remains IPv4 — a vendor IPv6 prefix is not the HomeCloud subnet. A Domain hostname on a machine or public LB is an **attachment** (A/AAAA from the resource; Floating IP preferred for A). See [Domains — Compute hostnames](domains.md#compute-hostnames). Load balancer `vip_address` stays IPv4; IPv6 address targets are rejected unless the placement advertises `lb_ipv6`.
- Snapshot a **volume** (`POST .../volumes/{id}/snapshots`), list with `GET .../volumes/{id}/snapshots`, restore to a **new volume** (`POST .../snapshots/{id}/restore`). Not a machine snapshot.

## Floating IP

A Floating IP is a **network identity** that outlives a machine. Allocate in a region, then associate to **one** machine in that region. Deleting the machine **unassigns** the address; **release** returns it to capacity. Quota is **10** per account (`409 compute.floating_ip_quota`).

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/floating-ips" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-public","region_code":"eu-central"}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/floating-ips" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-public","region_code":"eu-central"}'
```

| Action | Request |
|--------|---------|
| List | `GET .../floating-ips?region_code=` (sets `can_allocate`) |
| Get | `GET .../floating-ips/{id}` |
| Associate | `POST .../floating-ips/{id}/associate` `{"machine_id":"..."}` |
| Disassociate | `POST .../floating-ips/{id}/disassociate` |
| Release | `DELETE .../floating-ips/{id}` |
| On a machine | `GET .../machines/{id}/floating-ips` |

Mutating calls return **202** `{ floating_ip_id, operation_id }`. Recover re-assigns Floating IPs whose `desired_machine_id` is still that machine.

| Code | Meaning |
|------|---------|
| `compute.floating_ip_unsupported` | Placement has no Floating IP capability |
| `compute.floating_ip_quota` | Account already has 10 Floating IPs |
| `compute.floating_ip_exists` | Name already used in the account |
| `compute.floating_ip_region` | IP and machine are in different regions |
| `compute.floating_ip_provider` | IP and machine are not the same capacity placement |
| `compute.floating_ip_attached` | Machine already has a Floating IP |
| `compute.floating_ip_busy` | Allocate/release still in progress |
| `compute.invalid_floating_ip_name` | Name does not match the allowed pattern |
| `compute.floating_ip_not_found` | Unknown id |

Console: Compute → **Floating IPs**, and the machine Overview card when the placement supports it.

## Load balancers

A public Load Balancer is a **VIP** in front of Compute machines. Desired targets are HomeCloud objects — `machine`, `nic`, or `address` — not a vendor server id. `machine_ids` is a shorthand for `{ "type": "machine", "id": "…" }`. Current adapters implement **machine**, **nic**, and **address** in regions whose offerings advertise `load_balancer` (`eu-central` and `eu-west` today). A **nic** target uses the machine's private IPv4 after VPC attach; the adapter attaches the **same** public LB product to that VPC (not a separate vendor SKU). NIC without a private IP yet is skipped until attach finishes (same pending skip as a machine without a reachable address). Cross-adapter NIC (Hetzner LB + Scaleway VPC) returns `compute.unsupported_target`. Targets must share the HomeCloud **region**. In `eu-west`, the load balancer is colocated with the target machine's capacity zone so HTTPS certificates and private NIC backends can provision. Same create/update body works in both regions. Protocols: **TCP**, **HTTP**, and **HTTPS**. HTTPS terminates TLS at the load balancer: pass a DNS `hostname` (never a vendor certificate id), then point an **A** record at the VIP so the managed certificate can issue. Backends stay HTTP. HTTP/HTTPS listeners accept `sticky: true` (cookie affinity; cookie name is adapter-private). HTTP health checks accept `path` (default `/`). Per-target weight is not available on the current public LB SKUs. Quota is **5** per account (`409 compute.load_balancer_quota`) and covers public + internal.

Omit `scheme` (or send `public`) for today’s public VIP. `scheme` and `vpc_id` are **immutable** after create.

### Internal VIP (`scheme=internal`)

An internal load balancer is the **same** HomeCloud LB product with a private VIP in a **HomeCloud VPC**. The domain is `vpc_id` + HomeCloud targets — not “a Scaleway network” or “a Hetzner network.” The adapter underlay is an implementation detail of the current placement.

**This slice:** same-underlay packets stay on the native fabric. When VPC overlay is `ready`, an internal LB may target a `nic` / `machine` on another underlay of the same `vpc_id`. Until overlay is ready, a NIC this underlay cannot reach returns `compute.unsupported_target` (or `compute.overlay_unavailable` if overlay is in `error`). Overlay does not add a new ALB type or a new target type.

**Not in this slice:** public internet reachability, HomeCloud internal DNS, HTTPS / managed certificates (Let's Encrypt cannot issue for RFC1918), a second load-balancer product, customer VPN, or VPC peering.

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/load-balancers" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-int","region_code":"eu-west","scheme":"internal","vpc_id":"VPC_ID","listeners":[{"protocol":"http","port":80,"target_port":8080,"sticky":true}],"health_check":{"path":"/readyz"},"targets":[{"type":"nic","id":"NIC_ID"}]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-int","region_code":"eu-west","scheme":"internal","vpc_id":"VPC_ID","listeners":[{"protocol":"http","port":80,"target_port":8080,"sticky":true}],"health_check":{"path":"/readyz"},"targets":[{"type":"nic","id":"NIC_ID"}]}'
```

Empty targets still return **202** and allocate a private VIP. Prove traffic from a machine NIC in that VPC — a public client must not hit it.

| Capability | Public | Internal |
|------------|--------|----------|
| `scheme` | `public` (default) | `internal` (requires `vpc_id`) |
| VIP | Public IPv4 | Private IPv4 in the VPC CIDR |
| Listeners | TCP, HTTP, HTTPS | TCP, HTTP |
| Sticky | HTTP / HTTPS | HTTP |
| Hetzner / Scaleway / stub | yes | `lb_internal` |
| OVH | no | `compute.lb_internal_unsupported` |

List responses add `can_create_internal` next to `can_create`.

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/load-balancers" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-front","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080}],"machine_ids":["MACHINE_ID"]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-front","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080}],"machine_ids":["MACHINE_ID"]}'
```

Equivalent `targets` body (same machine shorthand, plus an address target):

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-front","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080}],"targets":[{"type":"machine","id":"MACHINE_ID"},{"type":"address","address":"203.0.113.10"}]}'
```

Private NIC target (machine must already be attached to a subnet; use the HomeCloud NIC id from inventory, not a vendor ref):

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/load-balancers" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-priv","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080}],"targets":[{"type":"nic","id":"NIC_ID"}]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-priv","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080}],"targets":[{"type":"nic","id":"NIC_ID"}]}'
```

HTTPS termination (managed certificate for a DNS hostname; backends stay HTTP). Create returns an **active** VIP even if the certificate is still waiting for DNS. Attach the hostname to the load balancer on [Domains → Hosts](domains.md#compute-hostnames) (or point an A record at that VIP), then **update** the load balancer (same body) so the adapter can attach the certificate:

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/load-balancers" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-tls","region_code":"eu-central","listeners":[{"protocol":"https","port":443,"target_port":8080,"hostname":"app.example.com"}],"machine_ids":["MACHINE_ID"]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-tls","region_code":"eu-central","listeners":[{"protocol":"https","port":443,"target_port":8080,"hostname":"app.example.com"}],"machine_ids":["MACHINE_ID"]}'
```

Sticky sessions (HTTP/HTTPS cookie affinity) plus an HTTP health path:

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/load-balancers" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-stick","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080,"sticky":true}],"health_check":{"protocol":"http","path":"/readyz"},"machine_ids":["MACHINE_ID"]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-stick","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080,"sticky":true}],"health_check":{"protocol":"http","path":"/readyz"},"machine_ids":["MACHINE_ID"]}'
```

| Action | Request |
|--------|---------|
| List | `GET .../load-balancers?region_code=` (sets `can_create` and `can_create_internal`) |
| Get | `GET .../load-balancers/{id}` |
| Update | `PUT .../load-balancers/{id}` `{ listeners, machine_ids }` or `{ targets }` (`scheme` / `vpc_id` immutable) |
| Delete | `DELETE .../load-balancers/{id}` |

Mutating calls return **202** `{ load_balancer_id, operation_id }`.

| Code | Meaning |
|------|---------|
| `compute.load_balancer_unsupported` | Placement has no LB capability |
| `compute.lb_internal_unsupported` | Placement cannot omit the public interface (`lb_internal=false`) |
| `compute.load_balancer_quota` | Account already has 5 LBs |
| `compute.load_balancer_exists` | Name already used |
| `compute.load_balancer_region` | LB and targets in different HomeCloud regions (internal + overlay `ready` may span bound regions) |
| `compute.vpc_not_found` / `compute.vpc_busy` / `compute.vpc_region` | Internal LB VPC missing, still provisioning, or in another region |
| `compute.unsupported_target` | This adapter cannot implement that target type, the target is not on this VPC, or the current underlay cannot reach it (overlay not ready) |
| `compute.overlay_unavailable` | Overlay is in `error`; do not treat the remote NIC as a healthy backend |
| `compute.invalid_targets` | Bad target list, or address outside the VPC CIDR |
| `compute.invalid_listener` | Bad protocol/port/hostname, TCP+sticky, HTTPS on internal, or HTTPS/sticky not available |

Console: Compute → **Load balancers**. **Delete** on the row releases the VIP (`DELETE .../load-balancers/{id}`).

## VPC / subnets / private NIC

A **VPC** is an account-scoped private IPv4 fabric in a HomeCloud **region**. You choose a CIDR (typically RFC1918), carve **subnets** that must sit **inside** that VPC CIDR, then **attach** a machine to a subnet (one private NIC per machine in this release). Inventory shows the observed private address on `nic.private_ip`. Public IPv4 / Floating IP behavior is unchanged.

Capability gate: placements with `private_network` support VPC (`eu-central` and `eu-west` today). Other placements return `compute.vpc_unsupported` and the console **hides** the VPC tab when no capable region is selected — same honesty pattern as Floating IP. Same create/attach body works in both regions (`machine_id` + `subnet_id`; never a vendor network id).

In `eu-west`, machines, VPC, and public LB that need to attach (private NIC or HTTPS certificates) are placed in the **same capacity zone**. A VPC CIDR on that placement must be **`/29`–`/20`** (`compute.invalid_cidr` for a wider prefix such as `/16`). `eu-central` still accepts typical `/16` fabrics. A subnet that sits inside the VPC CIDR is recorded even when the placement cannot add a second vendor prefix after create.

Quotas: **5 VPCs** and **20 subnets** per account (`409 compute.vpc_quota` / `compute.subnet_quota`). One private subnet attachment per machine.

### Create VPC

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/vpcs" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"app-net","region_code":"eu-central","cidr":"10.0.0.0/16"}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/vpcs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"app-net","region_code":"eu-central","cidr":"10.0.0.0/16"}'
```

### Create subnet

Subnet CIDR must be a subnet of the parent VPC CIDR and must not overlap sibling subnets.

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/vpcs/$vpcId/subnets" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web","cidr":"10.0.1.0/24"}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/vpcs/$VPC_ID/subnets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web","cidr":"10.0.1.0/24"}'
```

### Attach / detach machine

`POST .../machines` may include optional `subnet_id` (same UUID as attach). After the provider server exists, Compute queues the same NIC attach as Overview. Omit it for a public-only machine. `subnet_id` requires **region** placement (not flex) so the machine stays in the VPC’s HomeCloud region. The body still speaks `subnet_id` only — never a vendor `server_ref`.

`POST .../machines/{machine_id}/subnets/{subnet_id}` attaches the machine’s private NIC (same region + capacity placement as the VPC). `DELETE` on the same path detaches. Mutating calls return **202** `{ nic_id, machine_id, subnet_id, operation_id }` (detach clears `subnet_id` in the response).

| Action | Request |
|--------|---------|
| List VPCs | `GET .../vpcs?region_code=` (sets `can_create` and `can_bind_overlay` when the region is capable) |
| Get VPC | `GET .../vpcs/{id}` (includes nested `subnets`, `overlay_status`, `underlay_regions`) |
| Create VPC | `POST .../vpcs` `{ name, region_code, cidr, description? }` |
| Bind overlay | `POST .../vpcs/{id}/underlays` `{ region_code }` — HomeCloud region only; no vendor ids |
| Delete VPC | `DELETE .../vpcs/{id}` — unused subnets are removed with the VPC |
| List subnets | `GET .../vpcs/{id}/subnets` |
| Create subnet | `POST .../vpcs/{id}/subnets` `{ name, cidr }` |
| Delete subnet | `DELETE .../vpcs/{id}/subnets/{subnet_id}` or `DELETE .../subnets/{subnet_id}` |
| Create machine (optional subnet) | `POST .../machines` `{ …, subnet_id? }` — attach after the server exists |
| Attach | `POST .../machines/{machine_id}/subnets/{subnet_id}` |
| Detach | `DELETE .../machines/{machine_id}/subnets/{subnet_id}` |

Mutating VPC/subnet/NIC calls return **202** with an `operation_id`. Machine and VPC must share a HomeCloud **region** until overlay is `ready` for a binding that covers the machine’s region. Same-vendor fabric is an adapter detail: if that adapter cannot attach the machine it returns `compute.unsupported_target`.

### Overlay

A HomeCloud VPC is one `vpc_id` + CIDR. Create still picks a **home** region (first underlay). Overlay binds another HomeCloud region into the same VPC so private packets can cross fabrics. Internal VIP stays the same LB product (`scheme=internal`); overlay does **not** invent a multi-provider ALB.

`GET` shows `overlay_status` (`absent` | `pending` | `ready` | `error`) and `underlay_regions` (HomeCloud region codes only — never vendor network ids).

Capability `vpc_overlay`: if false, `POST .../underlays` returns `compute.overlay_unsupported`. Stub implements two in-process fabrics. Current Hetzner and Scaleway placements stay off until overlay gateways exist on those underlays.

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/vpcs/$vpcId/underlays" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"region_code":"eu-central"}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/vpcs/$VPC_ID/underlays" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"region_code":"eu-central"}'
```

| Code | Meaning |
|------|---------|
| `compute.vpc_unsupported` | Region/placement has no private-network capability |
| `compute.vpc_quota` | Account already has 5 VPCs |
| `compute.subnet_quota` | Account already has 20 subnets |
| `compute.invalid_cidr` | Bad CIDR, or subnet not contained in VPC CIDR |
| `compute.subnet_overlap` | Subnet CIDR overlaps another subnet in the VPC |
| `compute.vpc_in_use` | Delete blocked while a machine still has a private NIC on this VPC |
| `compute.vpc_region` | Machine and VPC in different HomeCloud regions (until overlay is `ready` for that binding) |
| `compute.overlay_unsupported` | Placement cannot bind a second underlay (`vpc_overlay=false`) |
| `compute.overlay_unavailable` | Overlay is in `error` or the gateway path is gone |
| `compute.overlay_bound` | That HomeCloud region is already bound to this VPC |
| `compute.unsupported_target` | This adapter cannot attach that machine to the fabric, or overlay is not ready for a cross-underlay NIC |
| `compute.nic_busy` | Attach/detach still in progress, or machine already has a private subnet |
| `compute.subnet_busy` | Subnet still provisioning |
| `compute.vpc_not_found` / `compute.subnet_not_found` | Unknown id |

Console: Compute → **VPC** (when the selected region can create). **Delete** is available even when the VPC still has empty subnets; those subnets are removed with the VPC. Detach or delete attached machines first if delete returns `compute.vpc_in_use`. **Create machine** can pick an optional subnet when the type has `private_network` and placement is this region. Machine **Overview** shows private IPv4 and attach/detach when the placement supports private networks.

Security groups may target the NIC after attach: `POST .../security-groups/{group_id}/attachments` with `{"target_type":"nic","target_id":"<nic_id>"}` (`nic_id` from the attach response).

## Agent

The Agent opens **outbound** TLS to Compute. Production guests use WebSocket `wss://…/internal/compute/agent/v1/connect` with **header** `X-Homecloud-Agent-Token` and `machine_id`. User JWT is ignored on that endpoint and never enters the guest. HTTP `POST /internal/compute/agent/heartbeat` remains a **fallback** for older images until rebuild. There is no public inbound Agent port. There is **no uninstall API**.

If the unit is disabled, heartbeat `{ "enabled": false }` sets `agent_state=OFFLINE` while the VM can stay `RUNNING`. A dropped channel, or no heartbeat for about 45 seconds, also shows `OFFLINE`. `POST .../machines/{id}/repair` re-issues node identity and **closes** any live channel; it does not stop the VM.

Guest tools are IAM-gated (viewers can list/preview/download; they cannot Session, exec, or write files):

| Action | Permission |
|--------|------------|
| List / read / download guest files | `compute.read` |
| Session PTY and `POST …/exec` | `compute.terminal` (or legacy `compute.update`) |
| Create / upload / edit / mkdir / rename / move / delete guest files | `compute.files.write` (or legacy `compute.update`) |
| Start / stop / rebuild / firewall | `compute.update` |

Exec and files require Agent **ONLINE**. When the channel is up they run as RPC (and Session as `stream.*` PTY) on that socket:

- `POST .../machines/{id}/exec` `{"command":"hostname"}`
- `GET .../machines/{id}/files?path=/` — list (name, size, modified, folder/file)
- `GET .../machines/{id}/files/content?path=` — read text
- `PUT .../machines/{id}/files` `{"path","content"}` — create or overwrite text
- `GET .../machines/{id}/files/blob?path=` — download (up to 1 MiB)
- `POST .../machines/{id}/files/blob?path=` — upload binary (chunked `write_b64`, up to 32 MiB)
- `POST .../machines/{id}/files/mkdir` `{"path"}` — create a folder
- `POST .../machines/{id}/files/rename` `{"path","dest"}` — rename or move a file or directory
- `DELETE .../machines/{id}/files?path=` — delete a file or directory (recursive when the agent supports it)
- `GET .../machines/{id}/metrics/history?range=1h|24h|7d|30d` — downsampled series (Compute Postgres, not the guest)

Otherwise `409 compute.agent_offline`.

The console **Session** tab does not connect until you choose a method and click Connect. Linux machines offer **Shell** (PTY). Windows machines also show **Desktop** (not shipped yet). SSH `:22` stays break-glass and is not a Session method. The managed shell starts at filesystem root (`/` on Linux, `C:\` on Windows) — the same root as Files Explorer — not under `$HOME`. Login user matches the image (`ubuntu` / `debian` / `alma`); the prompt looks like `ubuntu@hostname:/`. Machines created before this change may still use `homecloud` until **rebuild**. Empty machine names become `i-{12 hex}` (hostname follows).

Full screen covers the **entire browser**: no Session title, no side padding. The live-session toolbar follows the console **page theme** (background, borders, and buttons) so controls stay readable — in AWS that is a light bar with orange primary actions, not the dark top chrome. The terminal canvas stays dark. Esc or Exit full screen returns without dropping the session. Find sits on its own row under status and session actions (match case / whole word / regex, result count, previous / next). Type to search. Ctrl+F focuses it. The session stays connected while the browser tab is visible (WebSocket protocol pings every 20s so idle proxies do not drop it). Leaving the tab for **4 minutes** disconnects and shows Reconnect. End session, leaving Session, or a dropped WebSocket also close it. Idle typing does not. Copy/paste: right-click menu or **Ctrl+Shift+C** / Ctrl+V / **Ctrl+Shift+X**. Plain **Ctrl+C** is always SIGINT to the shell (same as SSH).

The **Files** tab has two modes (preference is stored locally):

- **Explorer** — list or grid, like Object Storage. The default folder is the filesystem root (`/` or `C:\` on Windows). Folders open in place. Files open on `/console/compute/{id}/file?path=` (Monaco, **manual Save** only). Images preview; oversized or binary files offer download.
- **VS Code** — a tree plus editor tabs **inside** Files, plus a bottom **integrated Terminal** panel beside the tree (not under it). The chrome matches the **Functions** code workspace: dark editor theme, toolbar (**Save**, **Format Document**, **Commands**, **Full screen**, **Settings**), explorer header icons (new file/folder, refresh, collapse), breadcrumbs under tabs, minimap and other editor prefs (shared with Functions via Settings). The terminal is **closed by default**; open with **Ctrl+J** or **Ctrl+`** (VS Code defaults), the toolbar **Terminal** button, or the panel controls. If Chrome/Edge still opens **Downloads** on Ctrl+J, use Ctrl+` or the button — [vscode.dev](https://vscode.dev/) can claim Ctrl+J more reliably as a PWA/workbench. With **more than one** terminal, sessions appear in a **right sidebar** (like desktop VS Code), not as top tabs. Tab labels stay clean (no `bash (13)` counters): they use the workspace folder name and update from the shell window title when the guest emits one (no injected shell scripts). Multiple logical terminals via **+**; drag the top edge to resize. Default root is the filesystem root; **Open Folder** (next to theme / Save) sets a workspace root for the tree and best-effort terminal `cwd` (stored in the browser per machine). Workspace root is **IDE layout only** — not a security sandbox; Session still has a full shell. Opening a file does not navigate away. Dirty tabs; never autosave (optional **format on save** in Settings). **JS / TS / JSON** get Monaco’s built-in in-browser language service (completion and diagnostics). Other languages (including Python) get syntax highlighting and document word suggestions only — there is no BasedPyright / LSP host on guest Files (unlike Functions).

The machine may hold **two attached** PTY bridges at a time (Session + VS Code foreground). The VS Code panel can keep **many logical terminals**; switching away **parks** the shell on the guest (same process, resume later) instead of holding many live WebSockets. **+** adds a tab; at most two stay attached — others park (LRU). **Ctrl+J** / **Ctrl+`** or the **Terminal** toolbar button shows/hides the panel (closed by default; hiding parks attached tabs). Drag the top edge to resize. Kill (trash / list ×) terminates the shell.

Drop rules match Object Storage: drop on a **folder** uploads into that folder, or **moves** items already in Explorer/VS Code; drop on empty chrome uploads into the **current directory**; a **file** is not a drop target. The full upload overlay appears only when dragging files from the OS. Upload a folder from the **Upload** menu or by dragging a directory. Cap is **32 MiB** per file.

Toolbar: one **New** menu (file or folder) and one **Upload** menu (files or folder). **Cut**, **Copy**, **Paste**, **Rename**, **Delete**, and **Download** appear after you select items (Explorer), open the file page, or focus/open an item in VS Code. Paste uses the current folder (Explorer) or focused folder (VS Code). Cut moves files and folders via agent rename; copy pastes **files only**. Right-click a file or folder in Explorer (list or grid) or in the VS Code tree/tabs for the actions that apply to that item. On a narrow viewport the toolbar actions are icon-only. Rename is **same-directory** for files and folders (agent `rename` RPC). Folders can be deleted recursively when the agent supports directory delete; download stays files-only (no zip from the console).

Name filter applies to the **current listing only**. Find-in-file is Monaco’s Ctrl+F on a loaded file. There is no guest-wide grep.

Platform paths are omitted from list and rejected on read/write: `/etc/homecloud/**`, `/home/homecloud/**` (legacy), `/usr/local/bin/homecloud-agent`, the systemd unit, and Windows `C:\ProgramData\HomeCloud\` plus `C:\Users\homecloud\`. Customer login homes (`/home/ubuntu`, `/home/debian`, `/home/alma`) are **not** denylisted. Names starting with `.` are hidden in Explorer.

Older VMs may need **rebuild** so the agent includes directory delete (`rmtree`) and the `rename` job used by move/rename in the console.

## Providers

HomeCloud is the cloud. You choose a **concept** and a **region**. Offerings (Hetzner, Scaleway, later OVH) are internal. Do not put customer VMs on the homelab control-plane host. MDB, Mail, SO, and MQ do not run on Compute.

## Console

| Page | Path |
|------|------|
| Machines + SSH keys + Security groups + Floating IPs + Load balancers + VPC | `/console/compute` |
| Workspace | `/console/compute/{machine_id}` |

Service tabs: **Machines**, **SSH keys**, **Security groups**, **Floating IPs**, **Load balancers**, **VPC** (hidden when the region has no `private_network` capability). The Machines list **defaults to every region** so a Windows VM in `eu-west` is not hidden while the header is on `eu-central` — those machines still bill. Create / VPC / LB stay scoped to the selected region.

Machine workspace tabs: **Overview** (health, access, resize — lifecycle actions live in the header), **Network** (Security groups / Floating IP / VPC panels when the placement supports them), **Session**, **Files**, **Performance**, **Snapshots**. Session and Files wait until the server responds. While a machine is busy, the list **state** cell shows a compact **progress ring** (stroke fill, no percent text) plus a short phase tag (provisioning, server starting, stop, reboot, …). The detail header shows the same progress **only while a lifecycle operation is in flight** (or failed/stuck) — not an idle Running/Preparing pill next to Start/Stop. The list ring hides when the VM is Running and the server responds. A stuck starting-server state surfaces after 20 minutes on the list.

Without `HETZNER_API_TOKEN` a create still returns HTTP 202; the Operation is **FAILED**.

## Live updates

Compute publishes `machine.updated`, `operation.updated`, `floating_ip.updated`, `load_balancer.updated`, `vpc.updated`, `subnet.updated`, and `nic.updated` to the API Event Bus. The Realtime Gateway fans those out over **SSE**. The console tab already has one account stream; Compute registers a filter on it and refetches that machine or list only when an event arrives. Opening Compute does not open a second SSE connection.

Agent heartbeats (every ~2s) do **not** publish `machine.updated` unless Agent visibility actually changes (`ONLINE` / `OFFLINE` / error). Routine heartbeats must not reopen SSE or poll the machine list.

HTTP polling is only a fallback when the SSE stream is down, and only while a machine is busy (provisioning, deleting, or booting until Agent is ONLINE).

## Performance history

The Agent stays stateless: `/proc` → snapshot → heartbeat. Compute owns history (`MetricsRepository` → Postgres). Logs are a different store later (ADR-046). Do not write time series on the guest.

Retention: 15s raw for 24h, 1m for 7d, 5m for 30d, 1h for 90d (min/max/avg). Network is stored as bytes/sec derived at ingest, not cumulative counters. The Performance tab shows four charts (CPU, RAM, network, disk) with range buttons. Summary tiles show **used / total (percent)** for CPU (of allocated vCPU), RAM, and disk; network shows live KiB/s or MiB/s plus total bytes transferred. Chart hover uses the same units as the axis.

## Breaking changes

None — Compute is new. The console catalog now includes Compute.

## Related

- [SSH keys and machines in Terraform](../terraform/index.md) (`homecloud_compute_machine` / `homecloud_ssh_key`)
