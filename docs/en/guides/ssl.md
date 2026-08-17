# SSL certificates

The SSL page lists **TLS certificates** for your account hostnames. The platform requests and renews them when a domain is verified (External DNS) or nameservers are delegated (HomeCloud DNS). You do not upload certificate files for the standard path.

| Item | Value |
|------|--------|
| Console | **SSL** → `/console/ssl` (also the SSL tab on a domain) |

## How certificates are issued

| Domain DNS | Challenge |
|------------|-----------|
| External DNS | HTTP-01 after the hostname points at the platform |
| HomeCloud DNS | DNS-01 (RFC2136 on the hosted zone; apex and wildcard when possible) |

Renewal is automatic. Platform edge wildcards (`*.app.{apex}` and similar) are not shown on the tenant SSL list.

## Typical flow

1. Add and verify the domain under [Domains](domains.md).  
2. Attach a hostname to an Application, Function, or website.  
3. Wait until the certificate is Ready.  
4. Open `https://your-host` in the browser.

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Certificate stuck Pending | DNS not pointing at the platform yet, or nameservers not delegated |
| Wrong host covered | Attachment on the wrong Application |
| Expiry soon | Renewal should run automatically; if not, contact your operator |

## Related

- [Domains](domains.md)  
- [Applications](applications.md)  
