# Domains & DNS

Bring your own domain (BYOD) so Applications, websites, and other services can use hostnames you control.

| Item | Value |
|------|--------|
| Console | **Account → Domains** (also listed as **Domains** in the service catalog) |

## Workflow

### 1. Add the domain

1. Open **Domains** → **Add domain**.  
2. Enter the apex you own (for example `example.com`).  
3. The console shows a **TXT verification** record.

### 2. Verify ownership

1. In your DNS provider (or HomeCloud DNS UI when hosted there), create the TXT record exactly as shown.  
2. Wait for DNS propagation.  
3. Click **Verify** in the console.

Until verification succeeds you cannot attach the domain to services.

### 3. Manage records

After verification, manage records as needed:

| Type | Typical use |
|------|-------------|
| **A / AAAA** | Point hostnames at platform IPs when instructed |
| **CNAME** | Point `www` or app hosts at platform targets |
| **TXT** | Verification, SPF, DKIM, DMARC |
| **MX** | Mail routing (when using HomeCloud Mail on a custom domain — if enabled) |
| **SRV** | Service discovery records when required |

Follow the values the console or service (Mail deliverability, Application domain attach) prints — do not invent targets.

### 4. Attach to a service

- **Applications → Domains** — attach a hostname to an app  
- **SO website** — often uses `{bucket}.web.{apex}`; custom domains depend on platform support  
- **Mail** — deliverability panel may publish SPF/DKIM/DMARC for the mail domain  

## Tips

- Keep TTL moderate while testing; raise it after things are stable.  
- When verification fails, check for duplicate TXT records or typos (including trailing dots).  
- Removing a domain that is still attached to an app will break routing — detach first.

## Related

- [Applications](applications.md)  
- [SSL certificates](ssl.md)  
- [Mail](mail.md)  
