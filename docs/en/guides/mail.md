# Mail

HomeCloud Mail gives your account **mailboxes**, a full webmail client, **templates**, **contacts**, and **automations** (forwarding / Sieve-style rules). Outbound and inbound mail are handled by the platform mail engine; the console stores metadata for fast listing.

| Item | Value |
|------|--------|
| Console | **Mail** → `/console/mail` |
| Per mailbox | `/console/mail/{mailboxId}` |
| Templates | `/console/mail?tab=templates` (editor: `/console/mail/templates/{id}`) |
| Contacts | `/console/mail?tab=contacts` |

## Console map

1. **Mailboxes / Contacts / Templates tabs** — URL-synced (`?tab=`). Header **Refresh** is always there; **Create mailbox / contact / template** follows the active tab. Create contact is a dialog.  
2. **Mailbox client** — folders (Inbox, Sent, Drafts, Trash, Archive), search, compose, settings. The footer bell shows **one unread row per mailbox** (count only) and opens that inbox (`/console/mail/{email}`).  
3. **Template Studio** — visual email builder with preview and code.  
4. **Contacts** — address book for compose.

## Create and use a mailbox

1. Open **Mail** → **Create mailbox** (local part on the platform mail domain, unless your platform already supports custom domains).  
2. Open the mailbox.  
3. Send a test message to yourself; use **Sync inbox** if a new message is slow to appear.  
4. Open **Settings** inside the mailbox for display name, signature, forwarding, and automation rules.

### Compose

- Rich text toolbar (bold, lists, links, inline images, …)  
- Gmail-style chips for To / Cc / Bcc  
- Attachments via paperclip or drag-and-drop  
- Insert a **template** (keeps full email HTML)  
- Ctrl+Enter to send  

Reply / Reply all / Forward preserve threading headers.

### Folders and delete

| Action | Result |
|--------|--------|
| Delete | Moves to Trash |
| Restore | Back to Inbox |
| Permanent delete (from Trash) | Removed for good |

### Deliverability

Open **Status → Deliverability** (from the mail service area) for SPF / DKIM / DMARC checks. Use **Fix** when your platform can publish safe DNS records automatically. Good deliverability needs correct DNS and mail leaving from the platform MTA — not from a random residential IP.

## Templates

1. Open **Mail → Templates** → **New template** (blank) or pick a starter (welcome, invoice, promo, …).  
2. Design with blocks (header, text, button, columns, …).  
3. Preview on desktop/tablet/mobile.  
4. Insert from compose, or send via API with `template_id` + variables.

Merge tags look like `{{user_name}}`, `{{cta_url}}`, etc.

## Contacts

Maintain an address book from the **Contacts** tab; **Create contact** opens a dialog. Multi-select and bulk delete when cleaning up. Compose can pick contacts into To.

## Automations

In mailbox **Settings → Automations**:

- Build **When… Then…** rules (from, subject, has attachment, …)  
- Actions such as file into a folder, forward, and related Sieve actions  
- Reorder priority, enable/disable, export/import JSON  
- Forwarding can also be set as a simple `forward_to` that keeps a local copy  

## CLI

```bash
homecloud mail mailboxes
homecloud mail messages --mailbox <id>
homecloud mail get <message-id>
homecloud mail attachment <message-id> <part-id> -o ./file.bin
```

See [CLI `mail`](../cli/commands/mail.md).

## SDK

```python
from homecloud import HomeCloud

client = HomeCloud.from_env()
boxes = client.mail.list_mailboxes()
msgs = client.mail.list_messages(mailbox_id=boxes[0]["id"], direction="INBOUND")
detail = client.mail.get_message(msgs[0]["id"])
data = client.mail.download_attachment(msgs[0]["id"], "0")
```

## API examples (console JWT)

```bash
# List mailboxes
curl -sS -H "Authorization: Bearer $TOKEN" \
  "$API/api/v1/accounts/$ACCOUNT_ID/mail/mailboxes"

# Send
curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"mailbox_id":"…","to":["you@example.com"],"subject":"Hello","body_html":"<p>Hi</p>","body_text":"Hi"}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/mail/messages"
```

## Tips and pitfalls

- Soft refresh of the UI re-reads metadata; it may **not** pull from IMAP — use **Sync inbox** or wait for the background sync worker.  
- “Sent” means the platform MTA **accepted** the message; remote bounce mail can still arrive later.  
- Paste addresses carefully from RTL clients — invisible Unicode marks can break recipients (the console strips many of these automatically).  
- System addresses like `noreply@` may exist for platform mail; you usually cannot delete system-owned mailboxes.

## Related

- [Domains](domains.md)  
- [Functions](functions.md) (mail → function events when enabled)  
- [CLI `mail`](../cli/commands/mail.md)  
