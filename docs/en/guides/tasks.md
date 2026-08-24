# Tasks

Tasks is a lightweight operational tracker for the account (Hebrew UI name: **משימות**). Use it for assignment, due dates, statuses, labels, and links to Compute / MDB / Domains — not as a Jira replacement.

| Item | Value |
|------|--------|
| Console | **Tasks** → `/console/tasks` |
| Keys | `TASK-{n}` per account |
| Storage | Control-plane Postgres (not an Orchestrator resource) |
| Notify | Email via platform **noreply** to people with a role on the item (assignees on create/assign; creator **and** assignees on done/cancelled). The console bell stores those lifecycle events and lists **one row per unseen discussion** (not a copy of each comment). |
| Live UI | Realtime Gateway SSE hint; REST is source of truth. Opening a task sets `last_seen_at` for you (WhatsApp-style). |

## Console walkthrough

### Create

1. Open **Tasks** → **Task**.  
2. Enter title, body, type, optional assignee, optional due date, and labels (pick existing or type a new name). Details are Markdown: leave the field to preview; the box stays a fixed height and scrolls.  
3. From a Compute, MDB, or Domain detail page, **Task** prefills the resource.

### Tabs

- **All** — every open and completed item in the account.  
- **Mine** — assigned to you.  
- **Watching** — items you follow.  
- **Done** — completed items, as the same table (status can still be changed from the dropdown or **⋯**). There is no board on this tab, because other statuses never appear here.  
- **Archive** — items filed away after they finished. Table only, read-only, and the only tab that shows them. See [Archive](#archive).

**All**, **Mine**, and **Watching** share one workspace: Kanban columns Open / In progress / Waiting/Blocked / Done (drag cards to change status), or one table. Right-click a card for open, copy link, status, watch, assign to me, archive, and delete. Use the grid/list icon to switch layout; each table row has the same actions under **⋯**. Tabs only change which items appear.

Status is limited to the people who own the item — see [Who can change status](#who-can-change-status). Cards you may not move do not drag, and their status dropdown is disabled with a tooltip.

### Item page

Open `TASK-12` to edit title and body, change status/assignee/due date, set labels, and continue the discussion. Details are Markdown: **Edit** shows the source (`#` headings, lists, tables); after save they render as formatted text, including `#so/…` console links, `https://` URLs, emails, and phone numbers. The title preview uses the same links. On a phone the discussion panel has a fixed height range so the thread stays readable; on a wide screen it sits beside the form. Your own bubbles use a soft wash of the console theme color (same hue, much lighter) so the text stays readable. They do not have a thick side stripe — that marker is only on quoted snippets, in the theme color. Quoted replies from others use a slightly darker fill so the original text is distinct from the reply. `@name` mentions render bold in the theme color. Line breaks in discussion messages are kept (**Shift+Enter** for a new line, **Enter** to send). You can multi-select your own messages (long-press, then tap more) and delete them for everyone. Consecutive comments from the same person on the same day (with no system line or other speaker in between) group as a cluster; the avatar and bubble tail sit on the last message. Type `@username` to mention someone in the thread (discussion messages do not send email). Type `#` in title, details, or discussion to insert a console reference (`#mail/noreply@example.com/inbox`).

### Archive

The archive is where finished work goes so the active lists stay short. It is not delete: the key, the details and the whole discussion survive, and an owner or admin can pull the item back.

Only **Done** and **Cancelled** items can be archived. That keeps live work out of the archive, because an item that is still open has a proper way to end — cancel it, which is recorded in the discussion with who and when. For convenience the menu on an open item offers **Cancel and archive**, which does both in one request.

Archive from **⋯** or right-click, on a board card or a table row. Archived items disappear from **All**, **Mine**, **Watching** and **Done**, and appear only under **Archive**. Search works inside whichever tab you are on, so the archive is searched from the archive tab.

Archiving is a separate axis from status, not a status of its own. An item keeps the status it had, and restoring returns it with that same status — `done` comes back as `done`.

**Cancel and archive** is the one action that touches both, and restoring reverses both. The cancel there exists only to make the item archivable, so restore undoes it and puts the item back where it actually was: a `waiting` item filed this way comes back as `waiting`, not as `cancelled`. Nothing is rewritten quietly — the discussion keeps the original `waiting → cancelled` line and adds a `cancelled → waiting` line on restore. The item page names the status it will return to before you press **Restore from archive**, and the API sends it as `restore_status`.

An item that was already `done` or `cancelled` when you archived it has no cancel to undo, so it simply comes back as it was.

An archived item is frozen: status, assignees, labels, due date, details and new comments are all blocked until it is restored. The item page shows who archived it and when, with a **Restore from archive** button for those allowed. Editing anyway (for example from the API) answers `409` with code `tasks.archived`.

Who may do what:

| Action | Who |
|--------|-----|
| Archive | Assignees, creator, whoever assigned it, and account owners/admins — the same rule as [status](#who-can-change-status) |
| Restore | Account owners and admins only |
| Delete an archived item | `tasks.delete` (owners and admins), permanently |

Restore is deliberately narrower than archive. Archiving is routine housekeeping that the people doing the work should not need to ask for, while bringing an item back into everyone's lists is a call for whoever runs the account. Archiving a non-terminal item without `cancel` answers `400` with code `tasks.archive_requires_terminal`; archiving an item you do not own answers `403` with `tasks.archive_requires_assignee`; restoring without the role answers `403` with `tasks.restore_requires_manager`.

Archive and restore are recorded in the discussion and send no email.

### Labels

Only labels attached to the item are shown as chips. **Add** opens a searchable catalog (including create). In the table and board, extra labels collapse to `+N`.

## Email

The person who made the change is **never** emailed. One save sends at most one email per recipient. Watchers are not emailed for status or comments.

System copy (status names such as Open / In progress / Done, the change summary, and chrome) follows the **recipient's** console language. Item title, details, comments, and usernames stay as written.

Details keep their Markdown formatting in the mail. Headings, **bold**, *italic*, `code`, fenced blocks, bullet and numbered lists, quotes, rules, links and GFM tables are converted to mail-safe HTML with inline styles, so they look the same in Gmail, Outlook and Apple Mail. Anything outside that subset (raw HTML, images, footnotes) is shown as plain text, and only `http`, `https` and `mailto` links are clickable. Long details are shortened at a line boundary with a note pointing to **Open in console**; `#so/…` console references stay as text in mail, because they only resolve inside the console.

| Change | Who gets mail |
|--------|----------------|
| Created (with assignee) | Assignee |
| Created (unassigned) | Nobody |
| Assigned / reassigned | New assignee only |
| Unassigned | Creator, if they did not do it |
| Status → `done` or `cancelled` | Creator |
| Status → `blocked` | Creator and assignee |
| Other status (open ↔ in progress, waiting, …) | Nobody |
| Comment / discussion | Nobody |
| Due date / due soon | Assignee, otherwise creator |
| Watcher added | The added user |
| Watcher removed | Nobody |

Cosmetic edits (title, details, type, labels, priority, project, resource links) send no mail and do not appear in the discussion. Watcher added still emails that user, but is not listed in the discussion.

Due-soon mail is sent once when an item is due within 24 hours and is not already done/cancelled.

## Console references

Stored text stays plain. `#` starts a service token until whitespace or end of line. `@` inside that token is part of the resource (for example an email), not a person.

```text
#mail
#mail/noreply@holab.abrdns.com/inbox
#so/my-bucket/images
#so/my-bucket/images/logo.png
#compute/server-01
#mq/events
#mdb/prod-pg
#redis/cache-1
#fn/resize
#ir/api
#dns/example.com
#secrets/db-password
#iam/developers
#tasks/12
#k8s/default
#apps/web
#ssl/console-cert
#mon/cpu
#billing
```

- `#` — service alias (`mail`, `so`, `compute`, `mq`, `mdb`, `redis`, `fn`, `ir`, `dns`, `secrets`, `iam`, `tasks`, `k8s`, `apps`, `ssl`, `mon`, `billing`)
- `/` — resource from that service’s list (mailbox, bucket, machine, queue, …). Mail also has folders; SO also has prefixes and objects.

Autocomplete follows those stages. Invalid or unknown tokens stay as plain text. `#billing` has no resource list (billing home only). IAM/SSL/Monitoring resources open the service page when there is no dedicated detail route.

## Permissions

| Permission | Typical use |
|------------|-------------|
| `tasks.read` | See Tasks in the catalog and open items |
| `tasks.create` | Create items |
| `tasks.update` | Comments, labels, assignees, due date, status and archive on items you own |
| `tasks.delete` | Delete items, including archived ones |
| `tasks.manage_labels` | Rename or archive labels (API) |

Without `tasks.read` the service tile is hidden.

### Who can change status

`tasks.update` is not enough on its own. Status belongs to the people who own the work, so the API accepts a status change only from:

- an **assignee** of the item (primary or additional),
- the **creator**,
- whoever **assigned** the current assignees,
- an account **owner** or **admin** (and platform admins), on any item.

Everyone else with `tasks.update` can still edit the title, details, labels, due date, watchers and comments, and can assign the item to themselves — one click on **Assign to me** — after which status opens up. An unassigned item therefore has to be picked up before it can move, unless you are the creator or a manager.

The console shows this rather than failing silently: the status dropdown is disabled with a tooltip that names the rule, board cards you may not move are not draggable, and the status entries disappear from the right-click and **⋯** menus. A single request may assign and set status together, so **Assign to me** followed by a status change works in one step. If the rule is hit anyway (for example from the API), the server answers `403` with code `tasks.status_requires_assignee`.

## Tips

- Tasks is not Account **Projects** (resource folders) and not **Operations** (async provision jobs).  
- Footer **Notifications** (and `/console/notifications`) list assignment/complete events and unseen comments per task — click opens that item, not the board.  
- Open Tasks pages refresh live while you stay on the page.

## Related

- [Compute](compute.md)  
- [Managed Databases (MDB)](databases.md)  
- [Domains & DNS](domains.md)  
- [Account & team](account.md)  
- [IAM](iam.md)  
