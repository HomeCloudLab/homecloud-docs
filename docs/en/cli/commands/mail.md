# mail

Mail commands for listing mailboxes and reading messages from the terminal.

## mailboxes

```bash
homecloud mail mailboxes
homecloud mail mailboxes --output json
```

Works with an Access Key that includes `mail:*` or a console login session (depending on your platform wiring).

## messages

List message metadata (console login):

```bash
homecloud mail messages --mailbox-id <id>
homecloud mail messages --mailbox-id <id> --folder INBOX --limit 50
homecloud mail messages --mailbox-id <id> --output json
```

## get

Fetch full message including HTML body and attachment metadata:

```bash
homecloud mail get <message-id>
homecloud mail get <message-id> --output json
```

## attachment

Download one attachment part to a local file:

```bash
homecloud mail attachment <message-id> <part-id> --dest ./invoice.pdf
```

## Tips

- Prefer the console for compose, templates, and automations.  
- Use CLI/SDK for scripting exports and debugging message IDs.  
- If lists look stale, sync from the console (**Sync inbox**) and retry.

## Related

- [Mail guide](../../guides/mail.md)  
