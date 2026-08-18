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
2. Enter title, body, type, optional assignee, optional due date, and labels (pick existing or type a new name).  
3. From a Compute, MDB, or Domain detail page, **Task** prefills the resource.

### Tabs

- **All** — Kanban columns Open / In progress / Waiting/Blocked / Done (drag cards to change status). Use the grid/list icon to switch to the table.  
- **My Tasks** — items assigned to you, grouped (overdue, due today, in progress, waiting/blocked, recently completed).  
- **Watching** — items you follow.  
- **Done** — completed items.

### Item page

Open `TASK-12` to edit title and body, change status/assignee/due date, set labels, and continue the conversation. `@username` mentions notify that account member by email.

### Labels

Pick existing labels or type a new name when creating or editing an item. There is no separate labels catalog page.

## Email

The person who made the change is **never** emailed. One save sends at most one email per recipient.

| Change | Who gets mail |
|--------|----------------|
| Created (with assignee) | Assignee |
| Assigned / reassigned | New and previous assignee |
| Unassigned | Previous assignee and creator |
| Status changed | Assignee, creator, watchers |
| Comment | Those plus `@username` mentions |
| Due date / due soon | Assignee, otherwise creator |
| Watcher added | The added user |

Cosmetic edits (title, description, labels, resource links) write activity only — no mail.

Due-soon mail is sent once when an item is due within 24 hours and is not already done/cancelled.

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
