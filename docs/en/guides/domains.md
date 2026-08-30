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

Keep DNS at your registrar. After TXT verify, open **Services** and connect an Application, Function URL, or SO website (enable website hosting on the bucket first). You can attach more than one hostname on the same domain.

| What you connect | Record to add |
|------------------|---------------|
| A subdomain (`www`, `app`, `api`, …) | **CNAME** from that name to the platform hostname shown in the console |
| The root name (`example.com`) | **A** and **AAAA** with the addresses shown, **or** ALIAS / ANAME / CNAME flattening on `@` if your DNS host supports it |

A CNAME cannot sit on the root name (it would conflict with SOA, NS, and mail). Prefer ALIAS when the DNS host has it, so addresses stay current. Then click **Check DNS**. SSL is issued automatically after DNS points here. The **SSL** tab shows Active / Pending / Failed / Expiring / Expired and **Refresh**.

## HomeCloud DNS

When enabled, point nameservers at `ns1.{apex}` and `ns2.{apex}`, then Verify. That creates a **hosted zone**: SOA and NS are read-only. Manage A, AAAA, CNAME, TXT, MX, CAA, and SRV on the **DNS** tab. Apex → a service is an **attachment**, not a record type named ALIAS.

After nameservers match, **Attach** writes the record and activates routing — no second Verify. Attach the root (empty host), `www`, `api`, or any other label. Connecting the apex can also create a **www** alias to the same service (checkbox on Attach; default on in the console). Enable **DNSSEC** on the DNS tab and copy the DS records at the registrar.

## Domain page

Each domain has **Overview**, **DNS**, **SSL**, **Services**, **Mail**, and **Settings**.

- **Services** — connect or detach Application, Function URL, or SO website. Each target gets HTTPS on that hostname. Compute cannot use a custom domain. Full DNS steps for a pending connection stay on this tab.
- **Mail** — opens [Mail Deliverability](mail.md) (one place for MX / SPF / DKIM / DMARC).
- **Settings** — delete the domain after you detach services.

Applications, Function URLs, and SO websites show attached hostnames as **Managed in Domains**. Connect only from the domain page. Application `custom_domain` is no longer a writable field.

## CLI and Terraform

```bash
homecloud domains create example.com --dns-mode homecloud
homecloud domains record-create DOMAIN_ID --type A --record 1.2.3.4 --host www
homecloud domains attach DOMAIN_ID --target-id FUNCTION_ID --target-type function --host www
```

Terraform resources: `homecloud_domain` (optional `wait_for_verified`), `homecloud_dns_record`, `homecloud_domain_attachment`. Domain search and purchase are console/API only.

## Tips

- Nameserver changes can take minutes to hours.
- External DNS: CNAME on a subdomain; A/AAAA or ALIAS on the root. HomeCloud DNS writes both for you.
- Detach every hostname before deleting the domain.
- Search is availability only. Buying a name is not offered yet.

## Related

- [Applications](applications.md)
- [SSL certificates](ssl.md)
- [Mail](mail.md)
- [Terraform](../terraform/index.md)
