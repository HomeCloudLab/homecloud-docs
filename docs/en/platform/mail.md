# Mail

HomeCloud Mail is a control-plane mail product on top of the **Stalwart** engine.

## Architecture

| Layer | Role |
|-------|------|
| Console `/console/mail` | Mailbox list + service metadata card |
| Console `/console/mail/{mailboxId}` | Professional 3-pane email client per mailbox |
| `homecloud-api` `/accounts/{id}/mail/*` | JWT APIs, Postgres **metadata** |
| Stalwart (K3s) | SMTP/IMAP + message content (source of truth) |

Bodies and attachments are **not** stored in Postgres.

## Console navigation

Same pattern as SO / Queues: **list → resource detail**.

1. **`/console/mail`** — mailbox table (primary), **Create mailbox** button, and a collapsible **Service status & DNS** panel (engine health, domain/hostname/IP, transport, DNS records read-only).
2. **`/console/mail/{mailboxId}`** — 3-pane email client:
   - **Sidebar** — Inbox, Sent, Trash, Compose folders with unread counts
   - **Message list** — sender avatars, subject, preview, relative dates, unread dot
   - **Message view** — sanitized HTML rendering (DOMPurify), plain text fallback, action toolbar

There is no separate global Messages / Domains / Settings tab on the list page.
The service status section is collapsed by default so mailboxes stay front and centre.

## Email client features

### Compose
- **Rich text editor** (Tiptap) with toolbar: bold, italic, underline, strikethrough, headings, lists, blockquote, links, text alignment, undo/redo
- To, CC, BCC fields (CC/BCC collapsible)
- HTML body (`body_html`) and plain text (`body_text`) sent to API
- Attachment drop zone (UI prepared, backend upload coming)

### Reply / Reply All / Forward
- **Reply** — prefills To = original sender, Subject = `Re: {subject}`, original body as blockquote
- **Reply All** — prefills all recipients minus self
- **Forward** — prefills Subject = `Fwd: {subject}`, includes forwarded message header

### Delete / Trash
- Delete moves messages to Trash via IMAP (COPY + DELETE + EXPUNGE)
- Restore moves messages from Trash back to INBOX
- Trash folder visible in sidebar

### Read tracking
- Messages marked as read (`is_read`) when opened via GET detail
- Unread messages shown with bold text and a primary-color dot

### HTML email rendering
- Inbound HTML emails sanitized with DOMPurify and rendered visually
- Plain text fallback with `whitespace-pre-wrap`
- Scoped CSS container (`prose`) for safe display

## Phase 1 scope

- One **platform** mail domain seeded from `MAIL_DOMAIN` (DB row, not hardcoded)
- Create / delete mailboxes on the Platform Mail Account
- Professional 3-pane email client with compose, reply, forward, trash
- Rich text compose with Tiptap editor
- HTML email rendering with DOMPurify sanitization
- CC/BCC support in compose
- Read/unread tracking with visual indicators
- DNS hints on the list-page metadata card (MX, A, SPF, DKIM placeholder, DMARC)

## Not in Phase 1 (follow-ups)

- **HBS send templates** and reusable compose components / fixed signatures
- Moving mail DNS management under **Account → Domains**
- File attachment upload/download (UI placeholder ready, backend pending)
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

!!! note "Stalwart 0.16 listeners"
    Stalwart 0.16 stores listener config inside the data store, not `config.json`.
    Plain-text IMAP (143) and submission (587) listeners are **not** created by default.
    Create them via the JMAP management API (`x:NetworkListener/set`) or the Stalwart WebUI,
    then restart the pod. The Helm chart exposes `hostPort: 143` and `hostPort: 993` so the
    API container on the host can reach IMAP.

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

### Bash — compose send with CC (from a specific mailbox)

```bash
curl -sS -X POST "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mailbox_id":"…","to":["you@example.com"],"cc":["team@example.com"],"subject":"Hello","body_html":"<p>Hi</p>","body_text":"Hi"}'
```

### Bash — trash a message

```bash
curl -sS -X POST "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/messages/$MESSAGE_ID/trash" \
  -H "Authorization: Bearer $TOKEN"
```

### Bash — restore a message from trash

```bash
curl -sS -X POST "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/messages/$MESSAGE_ID/restore" \
  -H "Authorization: Bearer $TOKEN"
```

## Deploy engine

Chart and CI live in `homecloud-data-plane/services/mail/` — see that README.
