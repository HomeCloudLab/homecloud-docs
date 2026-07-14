# Mail

HomeCloud Mail is a control-plane mail product on top of the **Stalwart** engine.

## Architecture

| Layer | Role |
|-------|------|
| Console `/console/mail` | Mailbox list + service metadata card |
| Console `/console/mail/{mailboxId}` | Professional 3-pane email client per mailbox |
| `homecloud-api` `/accounts/{id}/mail/*` | JWT APIs, Postgres **metadata** |
| Stalwart (K3s) | SMTP/IMAP + message content (source of truth) |

Bodies, attachments, and folders are **not** stored in Postgres — Stalwart is the single source of truth.

## Console navigation

Same pattern as SO / Queues: **list → resource detail**.

1. **`/console/mail`** — mailbox table (primary), **Create mailbox** button, and a collapsible **Service status & DNS** panel (engine health, domain/hostname/IP, transport, DNS records read-only).
2. **`/console/mail/{mailboxId}`** — 3-pane email client:
   - **Sidebar** — Inbox, Sent, Drafts, Trash, Archive, Search, and Compose button with unread counts
   - **Message list** — sender avatars, subject, preview, relative dates, unread dot, attachment indicator
   - **Message view** — sanitized HTML rendering (DOMPurify), plain text fallback, attachment downloads, action toolbar

There is no separate global Messages / Domains / Settings tab on the list page.
The service status section is collapsed by default so mailboxes stay front and centre.

## Email client features

### Compose
- **Rich text editor** (Tiptap) with toolbar: bold, italic, underline, strikethrough, headings, lists, blockquote, links, text alignment, undo/redo
- To, CC, BCC fields (CC/BCC collapsible)
- HTML body (`body_html`) and plain text (`body_text`) sent to API
- Attachment drop zone (UI prepared for sending; received attachments downloadable)

### Reply / Reply All / Forward
- **Reply** — prefills To = original sender, Subject = `Re: {subject}`, original body as blockquote
- **Reply All** — prefills all recipients minus self
- **Forward** — prefills Subject = `Fwd: {subject}`, includes forwarded message header
- Replies set `In-Reply-To` and `References` SMTP headers for proper conversation threading

### Conversation threading
- Backend fetches `Message-ID`, `In-Reply-To`, and `References` headers from Stalwart via IMAP
- Headers stored in Postgres metadata for thread grouping
- Replies link to original messages via standard RFC 2822 headers

### Delete / Trash / Permanent delete
- Delete moves messages to Trash via IMAP (COPY + DELETE + EXPUNGE)
- Restore moves messages from Trash back to INBOX
- Permanent delete removes from Stalwart and Postgres
- Trash folder visible in sidebar

### Sent folder
- Sent messages pulled from Stalwart IMAP Sent folder (not just control-plane metadata)
- Full body and headers available when viewing sent messages

### Attachments
- Received attachment metadata extracted from IMAP MIME parts
- Attachment download directly from Stalwart via API endpoint
- Attachment list displayed in message view with filename, size, and download link
- Attachment indicator (paperclip icon) in message list
- Compose: attachment drop zone UI (sending attachments support planned)

### Search
- Search box in sidebar triggers IMAP SEARCH via Stalwart
- Searches across Subject, From, and To fields
- Results displayed in message list

### Read tracking
- Messages marked as read (`is_read`) when opened via GET detail
- Unread messages shown with bold text and a primary-color dot
- Unread count badge on Inbox in sidebar

### HTML email rendering
- Inbound HTML emails sanitized with DOMPurify and rendered visually
- Styled blockquotes for quoted replies, proper table rendering, responsive images
- Plain text fallback with `whitespace-pre-wrap`
- Scoped CSS container (`prose`) for safe display

### Folders
- Inbox, Sent, Drafts, Trash, Archive — all backed by Stalwart IMAP folders
- Folder creation handled automatically by IMAP operations

## Phase 1 scope

- One **platform** mail domain seeded from `MAIL_DOMAIN` (DB row, not hardcoded)
- Create / delete mailboxes on the Platform Mail Account
- Professional 3-pane email client with compose, reply, forward, trash, search
- Rich text compose with Tiptap editor
- HTML email rendering with DOMPurify sanitization
- CC/BCC support in compose
- Conversation threading via In-Reply-To/References headers
- Read/unread tracking with visual indicators and badge counts
- Attachment download from Stalwart
- Sent folder with full message bodies from IMAP
- Search across messages
- Permanent delete from Trash
- DNS hints on the list-page metadata card (MX, A, SPF, DKIM placeholder, DMARC)

## Not in Phase 1 (follow-ups)

- **HBS send templates** and reusable compose components / fixed signatures
- Moving mail DNS management under **Account → Domains**
- File attachment **upload** in compose (download works, upload pending)
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

### Bash — compose send with CC and threading

```bash
curl -sS -X POST "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mailbox_id":"…","to":["you@example.com"],"cc":["team@example.com"],"subject":"Re: Hello","body_html":"<p>Reply</p>","body_text":"Reply","in_reply_to":"<original-msg-id>","references":"<original-msg-id>"}'
```

### Bash — search messages

```bash
curl -sS "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/messages?mailbox_id=$MAILBOX_ID&search=invoice" \
  -H "Authorization: Bearer $TOKEN"
```

### Bash — download attachment

```bash
curl -sS -o attachment.pdf \
  "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/messages/$MESSAGE_ID/attachments/0" \
  -H "Authorization: Bearer $TOKEN"
```

### Bash — trash / restore / permanent delete

```bash
# Trash
curl -sS -X POST "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/messages/$MESSAGE_ID/trash" \
  -H "Authorization: Bearer $TOKEN"

# Restore
curl -sS -X POST "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/messages/$MESSAGE_ID/restore" \
  -H "Authorization: Bearer $TOKEN"

# Permanent delete
curl -sS -X DELETE "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/messages/$MESSAGE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## Deploy engine

Chart and CI live in `homecloud-data-plane/services/mail/` — see that README.
