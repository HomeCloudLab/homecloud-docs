# Diagrams

Account-scoped architecture diagrams for planning, documentation, and presentations. Each diagram is a user-owned canvas — not a live inventory map.

| Item | Value |
|------|--------|
| Console | **Diagrams** → `/console/diagrams` |
| Permissions | `diagrams.read` / `diagrams.create` / `diagrams.update` / `diagrams.delete` |
| Assets bucket | `so://diagrams-{account_number}/diagrams/{diagram_id}/assets/…` (listed under Object Storage; account-owned and billable) |


## List and create

1. Open **Diagrams**.
2. **New diagram** — name (required) and optional description.
3. Open a row to edit on the canvas.

## Editor basics

- **Live** nodes reference real HomeCloud resources (stale if the resource is deleted).
- **Planned** nodes describe future components without creating resources.
- **Text** and **shapes** (rectangle, ellipse, frame) for notes and boundaries.
- Modes: select / pan / connect; snap, align, layers, undo/redo, autosave.
- Command palette: **Ctrl+K**.
- Optional **Import** of account architecture as live nodes (never the default empty canvas).
- Double-click a live node to open it in the console; double-click text to edit inline.

## Present and export

- **Present** — fullscreen read-only view of the live diagram.
- **Export PNG / SVG** — full canvas or current selection.

## Share (view-only links)

Anyone with the URL can open a **frozen snapshot** without signing in.

1. In the editor (with `diagrams.update`), click **Share**.
2. Choose expiry: **Never**, **7 days**, or **30 days**; optional label.
3. **Create link** — copy the URL immediately (shown once).
4. Recipients open `/share/diagrams/{token}` — Present-style canvas, no console shell.
5. **Revoke** any active link from the same dialog.

### Snapshot semantics

- The public page shows the document captured at create time (name, description, nodes, edges, groups, viewport).
- Editing the diagram later does **not** update existing shares. Create a new link to republish.
- Public viewers do not call account APIs for live inventory refresh and do not see secrets.
- Node images stored as `so://…` resolve through a token-scoped asset URL.

## IAM

| Action | Typical roles |
|--------|----------------|
| List / open / list shares | `diagrams.read` (owner, admin, developer, viewer) |
| Create / edit / upload assets / create & revoke shares | `diagrams.update` (owner, admin, developer) |
| Create diagram | `diagrams.create` |
| Delete diagram | `diagrams.delete` (owner, admin) |

## SO assets bucket

Custom node images upload to the account bucket `diagrams-{account_number}` under `diagrams/{diagram_id}/assets/…` (URI: `so://diagrams-{account_number}/diagrams/{diagram_id}/assets/{filename}`). Browse and delete them under **Object Storage** like any other account bucket — the account owns and pays for the storage. Share links do **not** copy files; they re-presign the same `so://` URIs. The prefix `shared/{share_id}/` is reserved for a future opt-in frozen-copy mode and is unused today.

## Task references

In Tasks title, details, or discussion, type `#diagrams` or `#diagrams/<diagram-id>` for autocomplete and deep links.

## Related

- [Tasks — console references](tasks.md#console-references)
- [Object Storage](object-storage.md)
- [IAM](iam.md)
