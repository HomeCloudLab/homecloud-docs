# SSL certificates

The SSL page shows **TLS certificates** issued for your account (via the platform certificate manager). It is primarily a **read-only** view so you can confirm hosts are covered and see expiry.

| Item | Value |
|------|--------|
| Console | **SSL** → `/console/ssl` |

## What you will see

- Certificate list (hosts / secrets)  
- Status and expiry  
- Links or names that correlate to Ingress / domain attachments  

You normally do **not** upload raw certificate files here for standard Application or console hostnames — the platform requests and renews certificates when domains are attached correctly.

## Typical flow

1. Verify and attach a hostname under [Domains](domains.md) / Application domains.  
2. Wait for the certificate to become Ready.  
3. Confirm on the **SSL** page.  
4. Open `https://your-host` and validate in the browser.

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Certificate stuck Pending | DNS not pointing at the platform yet; HTTP-01/DNS-01 challenge failing |
| Wrong host covered | Domain attach on the wrong Application / Ingress |
| Expiry soon | Platform should renew automatically; if not, contact your operator |

## Related

- [Domains](domains.md)  
- [Applications](applications.md)  
