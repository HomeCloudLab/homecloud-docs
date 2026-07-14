# Mail

HomeCloud Mail is a control-plane mail product on top of the **Stalwart** engine.

## Architecture

| Layer | Role |
|-------|------|
| Console `/console/mail` | Mailbox list + service metadata card |
| Console `/console/mail/{mailboxId}` | Per-mailbox Inbox / Sent / Compose |
| `homecloud-api` `/accounts/{id}/mail/*` | JWT APIs, Postgres **metadata** |
| Stalwart (K3s) | SMTP/IMAP + message content (source of truth) |

Bodies and attachments are **not** stored in Postgres.

## Console navigation

Same pattern as SO / Queues: **list → resource detail**.

1. **`/console/mail`** — all mailboxes, **Create mailbox**, one **status & settings** card (engine health, domain/hostname/IP, transport, DNS records read-only).
2. **`/console/mail/{mailboxId}`** — open a mailbox:
   - **Inbox** — IMAP pull sync on list (`direction=INBOUND`)
   - **Sent** — messages sent via Compose (`direction=OUTBOUND`, CP metadata; not an IMAP Sent folder yet)
   - **Compose** — send from **that** mailbox only (no global compose)

There is no separate global Messages / Domains / Settings tab on the list page.

## Phase 1 scope

- One **platform** mail domain seeded from `MAIL_DOMAIN` (DB row, not hardcoded)
- Create / delete mailboxes on the Platform Mail Account
- Send (Compose inside a mailbox) + receive (IMAP pull on Inbox)
- DNS hints on the list-page metadata card (MX, A, SPF, DKIM placeholder, DMARC)
- Backup: placeholder only (`backup.enabled=false`) — target TBD later

## Not in Phase 1 (follow-ups)

- **HBS send templates** and reusable compose components / fixed signatures
- Moving mail DNS management under **Account → Domains**
- IMAP Sent folder / full webmail
- Spam/AV, automation, tenant-owned domains
- Access Key gateway (future SES-like API)
- Event/webhook inbound (Phase 1 uses pull; events later)
- Cutover of OTP/invites to `noreply@` (after send is stable)

## Configuration (examples)

```bash
MAIL_DOMAIN=example.com
MAIL_HOSTNAME=mail.example.com
MAIL_PUBLIC_IP=203.0.113.10
MAIL_TRANSPORT=DIRECT_SMTP
MAIL_PLATFORM_ACCOUNT_SHORT_ID=abc123def456
STALWART_ADMIN_URL=http://127.0.0.1:18080
STALWART_ADMIN_USER=admin
STALWART_ADMIN_PASSWORD=...
```

Router: forward TCP **25 / 465 / 587** to the K3s node. Do **not** expose management port `18080` publicly.

## API examples

### PowerShell — list mailboxes

```powershell
$headers = @{ Authorization = "Bearer $TOKEN" }
Invoke-RestMethod -Headers $headers `
  -Uri "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/mailboxes"
```

### Bash — list inbox for a mailbox

```bash
curl -sS "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/messages?mailbox_id=$MAILBOX_ID&direction=INBOUND" \
  -H "Authorization: Bearer $TOKEN"
```

### Bash — compose send (from a specific mailbox)

```bash
curl -sS -X POST "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mailbox_id":"…","to":["you@example.com"],"subject":"Hello","body_text":"Hi"}'
```

## Deploy engine

Chart and CI live in `homecloud-data-plane/services/mail/` — see that README.
