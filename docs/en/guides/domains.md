# Domains & DNS

Bring a hostname you already own (any registrar), or **search** for a name in the console. HomeCloud verifies ownership, then you connect it to a service. **Registration (buying a name) is not available yet.** Search never charges you.

| Item | Value |
|------|--------|
| Console | **Account → Domains** (`/console/account/domains`) |

The platform apex (today `holab.abrdns.com`) is a different DNS system. Tenant domains are **your** hostnames.

## Search a domain

On **Account → Domains**, use the search box to check whether a name looks available.

- You must be signed in. Search does not require billing.
- A result of **available** does **not** reserve or buy the name.
- Price may be missing. That is expected until registration is enabled.
- The **Buy** action stays disabled until billing is turned on for the platform.

If HomeCloud DNS is enabled in this environment, a name you later register would become a hosted zone automatically. Until registration exists, add a domain you already own (below).

## Add a domain

1. **Domains** → **Add domain**.
2. Enter the hostname (`example.com` or `app.example.com`).
3. Choose **External DNS** (keep records at your registrar) or **HomeCloud DNS** (a hosted zone).
4. Click **Verify** when the TXT or nameservers match.

If HomeCloud DNS is not enabled in this environment, that option is visible but disabled. External DNS still works.

## External DNS

Keep DNS at your registrar. After TXT verify, open **Hosts** and connect an Application, Function URL, SO website (enable website hosting on the bucket first), **machine**, or **public load balancer**. You can attach more than one hostname on the same domain. To let HomeCloud host the zone later, open **Settings** and switch to **HomeCloud DNS**, then change nameservers at the registrar.

| What you connect | Record to add |
|------------------|---------------|
| A subdomain (`www`, `app`, `api`, `test`, …) to Application / Function / SO | Set **Host** to that label, connect, then add a **CNAME** whose Name is only that label (not the full hostname) to the platform hostname shown |
| The root name (`example.com`) to Application / Function / SO | Leave Host empty. **ALIAS** or **ANAME** for `@` to that hostname, if your DNS host supports it. Otherwise change Host to a subdomain, save, and use a CNAME. |
| A machine or public load balancer | Connect the hostname to that resource. Discovery is **A** / **AAAA** from the resource’s public address or VIP — not a CNAME to the Function/SO edge. |

On a pending connection you can **change the host** and **Disconnect**. Check DNS looks up the saved host only. SSL is issued automatically after DNS points here. The **SSL** tab shows Active / Pending / Failed / Expiring / Expired and **Refresh**.

## HomeCloud DNS

When enabled, point nameservers at `ns1.{apex}` and `ns2.{apex}`, then Verify. That creates a **hosted zone**: SOA and NS are read-only. Manage A, AAAA, CNAME, TXT, MX, CAA, and SRV on the **DNS** tab. Apex → a service is an **attachment**, not a record type named ALIAS. You can **export or import** a BIND zone file on that tab.

After nameservers match, **Connect** on the Host Map writes the record and activates routing — no second Verify. Attach the root (empty host), `www`, `api`, or any other label. Connecting the apex can also create a **www** alias to the same service (checkbox on Connect; off by default). Enable **DNSSEC** on the DNS tab and copy the DS records at the registrar.

Every hosted record has an **origin**: `system` (SOA/NS), `service` (Connect), `mail` (Deliverability Fix), `user` (you / CLI / Terraform), or `dynamic` (DDNS). The DNS tab can edit or delete **user** rows only. Detach removes `service` rows; Mail Fix updates `mail` rows.

### Compute hostnames { #compute-hostnames }

A hostname is bound to a **resource** (`machine` or `load_balancer`), not to a pasted address. HomeCloud DNS writes **A** / **AAAA** (`origin=service`, `mode=static`) from the observed public IPv4, public IPv6, associated Floating IP (preferred over sticky IPv4), or public LB VIP. When that address or VIP changes, the attachment rewrites the record — that is not DDNS (`nic/update` / `myip` is a later change).

- A machine with **no public IPv4 and no public IPv6** cannot take a public hostname. Attach the hostname to a **public load balancer** whose backends can be private NICs.
- Public attach to an **internal** load balancer (`scheme=internal`) is rejected.
- **Agent Session** is a console path to a private machine. It is not DNS.
- TLS for a public HTTPS load balancer stays **Compute-managed** (point the hostname at the VIP). Machine guest TLS is on the guest. Compute attach does not create a Function/SO edge ingress.

CLI:

```bash
homecloud domains attach DOMAIN_ID --target-id MACHINE_ID --target-type machine --host api
homecloud domains attach DOMAIN_ID --target-id LB_ID --target-type load_balancer
```

PowerShell (JSON unchanged):

```powershell
homecloud domains attach $domainId --target-id $machineId --target-type machine --host api
```

### Dynamic DNS

On a hosted **A** or **AAAA**, enable dynamic DNS. The console shows a token **once**. Point ddclient (or similar) at dyndns2:

```text
protocol=dyndns2
server=console.holab.abrdns.com
login=home.example.com
password=TOKEN
```

```bash
curl -u 'home.example.com:TOKEN' \
  'https://console.holab.abrdns.com/nic/update?hostname=home.example.com&myip=203.0.113.10'
```

The same update is also at `/api/v1/dyn/nic/update`. No account JWT. Bodies are dyndns2 text (`good`, `nochg`, `badauth`, `nohost`, `abuse`). Rotate or revoke the token from the DNS tab.

Some registrars reject HomeCloud nameservers until those hostnames are registered at the TLD. Until the platform finishes that (a later production-domain step), **keep External DNS**.

## Domain page

Each domain has **Hosts** (default), **DNS**, **SSL**, **Mail**, and **Settings**. Links with `tab=overview` or `tab=services` open Hosts.

- **Hosts** — hostname → Application, Function URL, SO website, machine, or public load balancer, with DNS / routing / TLS. Connect and Detach from this map. For External DNS pending attachments, copy the discovery CNAME (or apex A/AAAA/ALIAS) shown on the row. A private machine uses an LB (or Agent Session — not DNS).
- **DNS** — HomeCloud hosted zone editor (origin-aware). External DNS is not a zone editor; pending discovery stays on Hosts.
- **Mail** — Enable Mail on this verified hostname, then create mailboxes (`hello@your-domain`). External DNS: copy the MX / SPF / DKIM / DMARC rows at the registrar — **you do not change nameservers**. HomeCloud DNS can write those records (Deliverability → Fix). Live checks stay on this tab. Mail is not a second DNS editor.
- **Settings** — switch External DNS ↔ HomeCloud DNS, then delete the domain after you detach services.

Applications, Function URLs, and SO websites show attached hostnames as **Managed in Domains**. Connect only from the domain page. Application `custom_domain` is no longer a writable field.

## CLI and Terraform

```bash
homecloud domains create example.com --dns-mode homecloud
homecloud domains record-create DOMAIN_ID --type A --record 1.2.3.4 --host www
homecloud domains record-update DOMAIN_ID RECORD_ID --type A --record 1.2.3.5 --host www
homecloud domains record-delete DOMAIN_ID RECORD_ID
homecloud domains attach DOMAIN_ID --target-id FUNCTION_ID --target-type function --host test
homecloud domains attach DOMAIN_ID --target-id MACHINE_ID --target-type machine --host api
homecloud domains detach ATTACHMENT_ID
```

`--host` is the relative label (`test`, `www`). Empty is the root name. `target-type` for Compute is `machine` or `load_balancer` (`compute` / `vm` are aliases for `machine`). `homecloud domains records` includes `origin` and `mode`. Terraform `homecloud_dns_record.origin` is computed; `mode` is optional (`static` or `dynamic`). `homecloud_domain_attachment.host` is relative; changing it replaces the resource.

Terraform resources: `homecloud_domain` (optional `wait_for_verified`), `homecloud_dns_record`, `homecloud_domain_attachment`. Domain search and purchase are console/API only.

## Tips

- Nameserver changes can take minutes to hours.
- Some registrars reject HomeCloud nameservers until those hostnames are registered at the TLD. Until that platform step is done, keep External DNS and use CNAME or ALIAS.
- External DNS: CNAME on a subdomain; ALIAS or ANAME on the root if the DNS host supports it. HomeCloud DNS writes both for you.
- Detach every hostname before deleting the domain.
- Search is availability only. Buying a name is not offered yet.

## Related

- [Applications](applications.md)
- [SSL certificates](ssl.md)
- [Mail](mail.md)
- [Terraform](../terraform/index.md)
