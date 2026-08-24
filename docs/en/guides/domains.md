# Domains & DNS

Bring a hostname you already own (any registrar). HomeCloud verifies ownership, then you connect it to a service. This is **not** a registrar — there is no purchase, transfer, or TLD renewal.

| Item | Value |
|------|--------|
| Console | **Account → Domains** (`/console/account/domains`) |

The platform apex (today `holab.abrdns.com`) is a different DNS system. Tenant domains are **your** hostnames.

## Add a domain

1. **Domains** → **Add domain**.
2. Enter the hostname (`example.com` or `app.example.com`).
3. Choose **External DNS** (keep records at your registrar) or **HomeCloud DNS**.
4. Click **Verify** when the TXT or nameservers match.

If HomeCloud DNS is not enabled in this environment, that option is visible but disabled. External DNS still works.

## External DNS

Keep DNS at your registrar.

1. Create the **TXT** record shown in the console.
2. Click **Verify**.
3. On the domain **Services** tab, connect an Application, Function URL, or SO website.
4. Create the **CNAME** the console shows.
5. SSL is issued automatically after the CNAME points at the platform. The **SSL** tab shows Active / Pending / Failed / Expiring / Expired and **Refresh**.

## HomeCloud DNS

When enabled, point nameservers at `ns1.{apex}` and `ns2.{apex}`, then Verify. Manage A, AAAA, CNAME, TXT, MX, CAA, and SRV on the **DNS** tab. Apex → a service is an **attachment**, not a record type named ALIAS.

## Domain page

Each domain has **Overview**, **DNS**, **SSL**, **Services**, **Mail**, and **Settings**.

- **Services** — connect or detach Application, Function URL, or SO website. Compute cannot use a custom domain. One HTTP connection per domain.
- **Mail** — opens [Mail Deliverability](mail.md) (one place for MX / SPF / DKIM / DMARC).
- **Settings** — delete the domain after you detach services.

Applications, Function URLs, and SO websites show attached hostnames as **Managed in Domains**. Connect only from the domain page.

## Tips

- Nameserver changes can take minutes to hours.
- External DNS cannot map the zone apex with a CNAME; use `www` or HomeCloud DNS when that mode is enabled.
- Detach the hostname before deleting the domain.

## Related

- [Applications](applications.md)
- [SSL certificates](ssl.md)
- [Mail](mail.md)
- [Terraform](../terraform/index.md) (`homecloud_domain` — create does not wait for DNS verify)
