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

1. **`/console/mail`** — mailbox table (primary), **Create mailbox**, **Templates**, **Contacts**, and a collapsible **Service status & DNS** panel.
2. **`/console/mail/templates`** — visual Template Studio gallery (**My templates** preview cards + **Ready-made** starters).
3. **`/console/mail/templates/{id}`** — Template Studio Pro (Design | Preview | Code).
4. **`/console/mail/contacts`** — address book with search, multi-select, and bulk delete.
5. **`/console/mail/{mailboxId}`** — email client:
   - **Desktop / tablet** — 3-pane layout: folders sidebar, message list, reader/compose; mailbox shown as a Gmail-like identity chip (avatar + display name + bold email); **New message** and **Full screen** sit in a toolbar under that chip (fullscreen exit bar shows the same identity)
   - **Mobile** — single-screen stack (list → reader → compose/settings) with slide-in navigation; folders open from ☰ or the folder title (drawer); FAB for new message; true edge-to-edge (console shell padding removed on the mail client); long recipient lines truncate (`name +N`); list scrolls clear of the FAB and status footer
   - **Sidebar** — Inbox, Sent, Drafts, Trash, Archive, Search, Settings, and Compose (desktop)
   - **Message list** — sender avatars, subject, preview, relative dates, unread dot, attachment indicator; multi-select checkboxes with bulk trash (and permanent delete in Trash)
   - **Message view** — sanitized HTML rendering (DOMPurify) in a sandboxed iframe; fixed-width marketing shells (e.g. 600px Brevo tables) soft-fit to the reader width; horizontal scroll when content still overflows (zoom / rigid layouts); plain text fallback; attachment downloads; action toolbar

### Contacts & bulk
- **Contacts** — `/console/mail/contacts` account address book; multi-select + bulk delete
- **Compose** — pick contacts into To (one message to many recipients)
- **API** — `GET/POST /contacts`, `POST /contacts/bulk-delete`, `POST /messages/bulk-trash`, `POST /messages/bulk-delete`

There is no separate global Messages / Domains / Settings tab on the list page.
The service status section is collapsed by default so mailboxes stay front and centre.

## Email client features

### Compose
- **Rich text editor** (Tiptap) with toolbar: bold, italic, underline, strikethrough, font size, headings, lists, blockquote, links (dialog for URL + optional label; uses selection when text is highlighted), **inline images/logos** (toolbar, paste, or drop; sent as `cid:` multipart/related so Gmail shows them), text alignment, clear formatting, undo/redo — active marks/blocks are highlighted in the toolbar; lists and quotes use visible styles (bullets/numbers/border)
- **Insert template** — compiles the template and keeps **full email HTML** (tables/styles) for free text edits — TipTap is not used for template bodies (it would strip layout).
- **Text direction** — compose wraps HTML with `dir="rtl"` (or `ltr`) from UI language / Hebrew-Arabic content so Gmail and other clients keep the same direction as the editor
- **Gmail-style email chips** for To, CC, BCC — tokenize on space, comma, Enter; click a chip to edit the address; remove with backspace or X; bidi/zero-width junk stripped; send blocked if any chip is invalid
- **Recipient addresses** — invisible / bidirectional Unicode marks (common when pasting from RTL Gmail UI) are stripped on compose chips and on send; invalid addresses are rejected before SMTP
- HTML body (`body_html`) and plain text (`body_text`) sent to API
- **Attachment support** — paperclip button opens file picker, drag-and-drop anywhere on compose form; files encoded as base64 and sent with the message
- Empty 0-byte bounce/DSN placeholder parts are hidden from the attachment list
- Upload progress indicator during send with attachments
- Ctrl+Enter keyboard shortcut to send

### Reply / Reply All / Forward
- **Reply** — prefills To = original sender (bare email), Subject = `Re: {subject}`, original body as blockquote
- **Reply All** — prefills all recipients minus self (sanitized bare emails)
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

### Gmail / major providers — delivery notes
- Gmail rejects direct submission from residential / unauthorized IPs (`550 5.7.1 The IP you're using to send mail is not authorized…`). Outbound must leave from a mail server IP with proper **PTR + SPF + DKIM** (Stalwart on your public mail host), not a home ISP IP. If you see this bounce, check `MAIL_PUBLIC_IP`, DNS, and that Stalwart is the egress MTA — do not expect Gmail to accept DIY SMTP from a dynamic client IP.
- Addresses contaminated with RTL bidi marks (e.g. `user@gmail.com` + U+202C/U+200F) cause `DNS resolution error: Malformed label` — fixed by address sanitization on compose/send.

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
- **Forwarding** — `forward_to` is saved and **applied to Stalwart via Sieve** (`redirect :copy` keeps a local copy)
- **Automation builder** — collapsible **When… Then…** rule cards with a live summary; multiple conditions (all of / any of) and multiple actions; drag to reorder priority; duplicate / enable / export–import JSON; client-side test against a sample message + Sieve preview. Compiled to the same active Sieve script as forwarding. Atomic reorder: `POST …/mailboxes/{id}/rules/reorder` with `{ "ids": [...] }`
- Settings accessible from the sidebar "Settings" tab inside each mailbox
- Settings (and Compose) use the full content pane — the empty message list is hidden; the form scrolls with a sticky Save bar

## Email templates (Template Studio Pro)

Account-scoped reusable layouts owned as JSON blocks (`document_json`), compiled to email-safe HTML tables via `mail_hbs` (no Unlayer lock-in; HTML is not the source of truth).

| Surface | Path |
|---------|------|
| Gallery | `/console/mail/templates` — My templates + ready-made starter cards with live thumbnails |
| Studio | `/console/mail/templates/{id}` — Design \| Preview \| Code |
| API | `GET/POST /accounts/{id}/mail/templates`, `GET …/templates/starters`, `POST …/templates/lint`, `POST …/preview`, `POST …/{id}/render`, `POST …/{id}/duplicate` |
| Send | Compose injects full HTML, or `POST …/messages` with optional `template_id` + `template_variables` |

### Visual gallery
- **My templates** — card grid with scaled iframe thumbnails from `POST …/templates/preview`
- **Ready-made** — starter catalog from `GET …/templates/starters` (includes `preview_html`)
- Actions: open, duplicate, delete; one **New template** (blank); search by name

### Document model
- Blocks: `header`, `text`, `button`, `image`, **`section`** (children, depth ≤ 3), `columns`, `list`, `code`, `divider`, `spacer`, `footer`, **`preheader`**, **`hero`**, **`logo_row`**, **`product_card`**
- Buttons support pill radius + `hoverBg`
- Merge tags: `{{user_name}}`, `{{company_name}}`, `{{cta_url}}`, `{{portal_url}}`, digest/product/notice fields, etc.
- Starters: blank, welcome, notification, announcement, promo, invoice, plus inspired layouts **`network_digest`**, **`promo_grid`**, **`system_notice`** (pattern-inspired; no brand assets)

### Template Studio Pro modes
| Mode | Behavior |
|------|----------|
| **Design** | Unified top bar (Back, editable name, autosave status, Undo/Redo, device frames, Design/Preview/Code); preview-first canvas (click deepest block, or section padding to select the section); left **Components \| Layers** (+ Ready presets); right **Inspector** with merge-tag autocomplete and **SO image picker** (stores public HTTPS URLs); leave warning when dirty; selection toolbar (move, duplicate, delete) |
| **Preview** | Full-width device frames (Desktop / Tablet / Mobile) + dark preview; same compiled HTML |
| **Code** | Monaco split (compiled HTML + Format) \| live preview; Issues panel from `POST …/templates/lint` |

### Responsive Email Engine (renderer-owned)
Every compile produces **email-safe table HTML** that is responsive by default (ADR-030). Responsive behavior is defined at **component level** and **enforced by `mail_hbs`** — templates do not invent ad-hoc CSS.

| Rule | Behavior |
|------|----------|
| Shell | Desktop max-width ≈600px; fluid `width:100%` + outer padding on mobile |
| Breakpoint | `@media only screen and (max-width:600px)` |
| Images | `width` attr + `max-width:100%;height:auto` |
| Buttons | Full-width tap target on mobile (opt out via `responsive.mobile.fullWidth: false`) |
| Columns | Stack on mobile by default (`mobile: "side-by-side"` or `stack: false` to keep row) |
| Intent | Optional `responsive.mobile` / shorthand `mobile: "stack"` on blocks; unknown keys ignored |

### Compatibility validator
`POST …/templates/lint` checks compiled HTML + document for Outlook/Gmail pitfalls (scripts, flex/grid, missing alt, oversized payloads, weak button hrefs). Studio shows results in the Issues panel.

### Compose template insert
1. Insert template → compiles via preview API → **full email HTML kept** (tables/styles) in `MailHtmlBodyEditor` — **not** TipTap (TipTap strips email layout)
2. Subject filled from the template; body is freely editable
3. Autosave / send use that HTML like any other message
4. Optional chip: “Inserted from template …” (dismissible)

Studio is the only full builder. Compose does **not** use a locked slot form.

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

- Moving mail DNS management under **Account → Domains**
- Spam/AV, tenant-owned domains
- Access Key gateway (future SES-like API)
- Event/webhook inbound (Phase 1 uses pull; events later)
- Cutover of OTP/invites to `noreply@` (after send is stable)
- True fuzzy “similar” matching beyond Sieve `:matches` / `:contains`

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

### Bash — create an automation rule

```bash
curl -sS -X POST "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/mailboxes/$MAILBOX_ID/rules" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Invoices","match":"all","conditions":[{"field":"from","op":"is","value":["billing@acme.com"]},{"field":"has_attachment","op":"is","value":true}],"actions":[{"type":"fileinto","mailbox":"Invoices"}]}'
```

### Bash — reorder automation rules

```bash
curl -sS -X POST "https://console.example.com/api/v1/accounts/$ACCOUNT_ID/mail/mailboxes/$MAILBOX_ID/rules/reorder" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids":["RULE_UUID_1","RULE_UUID_2","RULE_UUID_3"]}'
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
