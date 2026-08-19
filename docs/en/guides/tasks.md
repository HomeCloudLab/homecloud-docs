# Tasks

Tasks is a lightweight operational tracker for the account (Hebrew UI name: **משימות**). Use it for assignment, due dates, statuses, labels, and links to Compute / MDB / Domains — not as a Jira replacement.

| Item | Value |
|------|--------|
| Console | **Tasks** → `/console/tasks` |
| Keys | `TASK-{n}` per account |
| Storage | Control-plane Postgres (not an Orchestrator resource) |
| Notify | Email via platform **noreply** — only people with a role on the item |
| Live UI | Realtime Gateway SSE hint; REST is source of truth |

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

**All**, **Mine**, and **Watching** share one workspace: Kanban columns Open / In progress / Waiting/Blocked / Done (drag cards to change status), or one table. Right-click a card for open, copy link, status, watch, assign to me, and delete. Use the grid/list icon to switch layout; each table row has the same actions under **⋯**. Tabs only change which items appear.

### Item page

Open `TASK-12` to edit title and body, change status/assignee/due date, set labels, and continue the discussion. Details are Markdown: **Edit** shows the source (`#` headings, lists, tables); after save they render as formatted text. On a phone the discussion panel has a fixed height range so the thread stays readable; on a wide screen it sits beside the form. Consecutive comments from the same person on the same day (with no system line or other speaker in between) group as a cluster; the avatar and bubble tail sit on the last message. Type `@username` to mention someone in the thread (discussion messages do not send email). Type `#` in title, details, or discussion to insert a console reference (`#mail/noreply@example.com/inbox`).

### Labels

Only labels attached to the item are shown as chips. **Add** opens a searchable catalog (including create). In the table and board, extra labels collapse to `+N`.

## Email

The person who made the change is **never** emailed. One save sends at most one email per recipient. Watchers are not emailed for status or comments.

System copy (status names such as Open / In progress / Done, the change summary, and chrome) follows the **recipient's** console language. Item title, details, comments, and usernames stay as written.

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
| `tasks.update` | Status, comments, labels on items, watchers |
| `tasks.delete` | Delete items |
| `tasks.manage_labels` | Rename or archive labels (API) |

Without `tasks.read` the service tile is hidden.

## Tips

- Tasks is not Account **Projects** (resource folders) and not **Operations** (async provision jobs).  
- There is no notification bell in V1 — check **My Tasks** and email.  
- Open Tasks pages refresh live while you stay on the page.

## Related

- [Compute](compute.md)  
- [Managed Databases (MDB)](databases.md)  
- [Domains & DNS](domains.md)  
- [Account & team](account.md)  
- [IAM](iam.md)  
