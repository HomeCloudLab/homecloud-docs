# Domains & DNS

Bring a domain you already own (any registrar). HomeCloud is the control plane; DNS and TLS are published by the platform backends.

| Item | Value |
|------|--------|
| Console | **Domains** (account catalog) |

## Two setup modes

### External DNS

Keep DNS at your current registrar.

1. **Domains** → **Add domain** → **External DNS**.
2. Create the **TXT** record shown in the console.
3. Click **Verify**.
4. When you attach a hostname to an Application, create the **CNAME** the console shows.

SSL for that hostname uses HTTP-01 after the CNAME points at the platform.

### HomeCloud DNS

HomeCloud hosts the zone. You only change nameservers at the registrar (GoDaddy, Namecheap, Google, or anywhere else). Nameservers look like `ns1.{apex}` and `ns2.{apex}` (today the lab apex is `holab.abrdns.com` until the production domain is purchased).

1. **Add domain** → **HomeCloud DNS**.
2. Set the nameservers the console lists.
3. Click **Verify** (or wait for the background poll).
4. Manage records in the console (A, AAAA, CNAME, TXT, MX, CAA, SRV).
5. Attach Applications, Function URLs, websites, or Mail — records and certificates are applied for you.

Apex (`example.com` → an Application) is an attachment, not a user-facing ALIAS record.

## Attach to a service

- **Applications → Domains** — custom hostname  
- **SO website** — custom hostname in addition to `{bucket}.web.{apex}`  
- **Mail** — on HomeCloud DNS, deliverability records can be applied from the Mail panel  

## Tips

- Nameserver changes can take minutes to hours.  
- External DNS cannot map the zone apex with a CNAME; use `www` or switch to HomeCloud DNS.  
- Detach a hostname from an app before deleting the domain.

## Related

- [Applications](applications.md)  
- [SSL certificates](ssl.md)  
- [Mail](mail.md)  
