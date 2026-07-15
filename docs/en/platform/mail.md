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

Same pattern as SO / Queues: **list → resource detail**. Opening a mailbox keeps the mail chrome visible while data loads (no full-page skeleton flash); console shell padding stays stable across the Mail section.

1. **`/console/mail`** — mailbox table (primary), **Create mailbox** button, and a collapsible **Service status & DNS** panel (engine health, domain/hostname/IP, transport, DNS records read-only).
2. **`/console/mail/{mailboxId}`** — email client:
   - **Desktop / tablet** — 3-pane layout: folders sidebar, message list, reader/compose; mailbox shown as a Gmail-like identity chip (avatar + display name + bold email); **New message** and **Full screen** sit in a toolbar under that chip (fullscreen exit bar shows the same identity)
   - **Mobile** — single-screen stack (list → reader → compose/settings) with slide-in navigation; folders open from ☰ or the folder title (drawer); FAB for new message; true edge-to-edge (console shell padding removed on the mail client); long recipient lines truncate (`name +N`); list scrolls clear of the FAB and status footer
   - **Sidebar** — Inbox, Sent, Drafts, Trash, Archive, Search, Settings, and Compose (desktop)
   - **Message list** — sender avatars, subject, preview, relative dates, unread dot, attachment indicator
   - **Message view** — sanitized HTML rendering (DOMPurify), plain text fallback, attachment downloads, action toolbar

There is no separate global Messages / Domains / Settings tab on the list page.
The service status section is collapsed by default so mailboxes stay front and centre.

## Email client features

### Compose
- **Rich text editor** (Tiptap) with toolbar: bold, italic, underline, strikethrough, font size, headings, lists, blockquote, links (dialog for URL + optional label; uses selection when text is highlighted), **inline images/logos** (toolbar, paste, or drop; sent as `cid:` multipart/related so Gmail shows them), text alignment, clear formatting, undo/redo — active marks/blocks are highlighted in the toolbar; lists and quotes use visible styles (bullets/numbers/border)
- **Text direction** — compose wraps HTML with `dir="rtl"` (or `ltr`) from UI language / Hebrew-Arabic content so Gmail and other clients keep the same direction as the editor
- **Gmail-style email chips** for To, CC, BCC — tokenize on space, comma, Enter; click a chip to edit the address; remove with backspace or X
- HTML body (`body_html`) and plain text (`body_text`) sent to API
- **Attachment support** — paperclip button opens file picker, drag-and-drop anywhere on compose form; files encoded as base64 and sent with the message
- Upload progress indicator during send with attachments
- Ctrl+Enter keyboard shortcut to send

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
- **Send result** — success means Stalwart **accepted** the message for outbound delivery (not a guarantee the remote inbox accepted it)
- Immediate SMTP rejections surface as status `failed` with the server reason in the UI
- Async failures (e.g. Gmail bounce after accept) appear as Delivery Status / bounce mail in Inbox; when the bounce references a sent `Message-ID`, that outbound row is marked `failed`

### Attachments
- Received attachment metadata extracted from IMAP MIME parts
- Attachment download via authenticated blob request (not bare links)
- Attachment list displayed in message view with filename, size, and download button
- Attachment indicator (paperclip icon) in message list
- Compose: file picker + drag-and-drop, base64 encoding, sent as part of the message
- Inline `cid:` images rewritten to download URLs for proper rendering

### Search
- Search box in sidebar triggers IMAP SEARCH via Stalwart
- Searches across Subject, From, and To fields
- Results displayed in message list

### Read tracking
- Messages marked as read (`is_read`) when opened via GET detail
- Unread messages shown with bold text and a primary-color dot
- Unread count badge on Inbox in sidebar

### HTML email rendering
- Inbound HTML emails sanitized with DOMPurify and rendered in a sandboxed iframe
- **Presentation preserved** — HTML profile allow-list keeps layout tags (`center`, tables, `font`, author `style`/`align`); only active/dangerous tags are stripped (`script`, forms, iframes, …)
- Plain text fallback with `whitespace-pre-wrap`
- Outer reader chrome uses card padding; the iframe body itself has no inner padding so author layout controls spacing
- **Dark themes (Homelab / Midnight)** — transparent iframe (card shows through) with soft default text for unstyled mail; forced-white canvases / near-black text softened for readability without rewriting layout
- Outbound compose still wraps with UI `dir` so Hebrew stays correct in external clients

### Folders
- Inbox, Sent, Drafts, Trash, Archive — all backed by Stalwart IMAP folders
- Folder creation handled automatically by IMAP operations

### Mailbox settings
- **Display name** — shown as the sender name in outgoing emails (From header)
- **Signature** — seeded into the compose editor (after `--`) so you can edit or remove it before send; not appended silently by the API
- **Forwarding** — forward incoming emails to another address (stored in DB, forwarding setup planned)
- Settings accessible from the sidebar "Settings" tab inside each mailbox
- Settings (and Compose) use the full content pane — the empty message list is hidden; the form scrolls with a sticky Save bar

## Phase 1 scope

- One **platform** mail domain seeded from `MAIL_DOMAIN` (DB row, not hardcoded)
- Create / delete mailboxes on the Platform Mail Account
- Professional 3-pane email client with compose, reply, forward, trash, search
- Rich text compose with Tiptap editor
- HTML email rendering with DOMPurify sanitization
- CC/BCC support in compose
- Conversation threading via In-Reply-To/References headers
- Read/unread tracking with visual indicators and badge counts
- Attachment download and upload (base64 encoding)
- Inline cid: image rendering
- Sent folder with full message bodies from IMAP
- Search across messages
- Permanent delete from Trash
- Mailbox profile: display name, signature, forwarding
- Gmail-style email chips for recipients
- DNS hints on the list-page metadata card (MX, A, SPF, DKIM placeholder, DMARC)

## Not in Phase 1 (follow-ups)

- **HBS send templates** and reusable compose components
- Moving mail DNS management under **Account → Domains**
- Active forwarding via Stalwart sieve rules (UI stores `forward_to`, sieve setup pending)
- Spam/AV, automation, tenant-owned domains
- Access Key gateway (future SES-like API)
- Event/webhook inbound (Phase 1 uses pull; events later)
- Cutover of OTP/invites to `noreply@` (after send is stable)

## Deliverability hardening

Console **Status → Deliverability** runs live checks and can **Fix** safe CloudNS records when `CLOUDNS_*` is configured on the API.

| Item | Recommended | Notes |
|------|-------------|-------|
| SPF | `v=spf1 mx -all` | Use **mx** (not `ip4:`) so a home/dynamic IP stays valid when you update the `mail` A record |
| DKIM | TXT from Stalwart | **Fix DKIM** publishes the key + forces CloudNS zone sync |
| DMARC | `p=quarantine` + `rua`/`ruf` | Create a mailbox for reports (e.g. `dmarc-reports@`) |
| TLS-RPT | `_smtp._tls` TXT | Aggregate TLS failure reports |
| MTA-STS | `_mta-sts` TXT + HTTPS policy | Policy served at `https://mta-sts.<domain>/.well-known/mta-sts.txt` (`mode: testing` until SMTP certs are solid) |
| PTR / rDNS | `mail.<domain>` | **ISP only** — residential (e.g. Cellcom/Netvision `bb.*`) usually cannot set PTR |
| BIMI | later | Needs DMARC quarantine/reject + SVG (+ VMC for Gmail logos) |
| ARC | Stalwart-native | Useful mainly for forwarding chains; not required for direct SMTP |

Bootstrap / refresh forward DNS on the homelab host:

```bash
bash homecloud-data-plane/services/mail/scripts/setup-mail-dns-homelab.sh
```

Then add Traefik route `Host(mta-sts.<domain>)` → API (see `homecloud-infra/platform/traefik/dynamic/console-host.yml.example`).

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
CLOUDNS_AUTH_ID=...
CLOUDNS_AUTH_PASSWORD=...
CLOUDNS_ZONE=example.com
# Optional after Traefik mta-sts route exists:
# MAIL_MTA_STS_POLICY_URL=https://mta-sts.example.com/.well-known/mta-sts.txt
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

### Bash — update mailbox profile (display name, signature, forwarding)

```bash
curl -sS -X PATCH "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/mailboxes/$MAILBOX_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"display_name":"Support Team","signature_html":"<p>Best regards,<br/>Support</p>","forward_to":"backup@example.com"}'
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
