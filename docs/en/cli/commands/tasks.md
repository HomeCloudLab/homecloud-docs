# tasks

Full account Tasks management from the CLI — same control-plane API as the console (search, create, assign, comment, labels, archive, share).

**Auth:** `homecloud login` (JWT) or a **user-bound** Access Key (SigV1). Service-account keys cannot act as a user. IAM: `tasks.read` / `tasks.create` / `tasks.update` / `tasks.delete` / `tasks.manage_labels` as needed. Status changes follow the same assignee rules as the console.

## Smart search

Same grammar as the console search box:

| Token | Meaning |
|-------|---------|
| free text | Title, details, key, comments |
| `@alice` | Assignee username |
| `&ops` | Label name |
| `#compute` or `#mdb/…` | Linked service / resource |
| `type:change` | Item type |
| `due:today` / `due:overdue` / `due:2026-10-20` | Due filter |
| `created:2026-10-01..2026-10-19` | Created range |

```bash
homecloud tasks search cert @alice &ops due:overdue
homecloud tasks list --mine --status open,in_progress
homecloud tasks mine
homecloud tasks list "rotate type:change" --output table
```

## Create and update

Assignees accept **username**, `@user`, `me`, or UUID. Due accepts ISO-8601, `today`, `tomorrow`, `+3d`, `+1w`.

```bash
homecloud tasks create "Rotate cert" --type change --priority p2 \
  --assignee alice --label ops --due +3d \
  --description-file ./notes.md

homecloud tasks update TASK-12 --status in_progress --assign-me
homecloud tasks patch TASK-12 --title "Rotate certs" --clear-due
homecloud tasks assign TASK-12 alice bob --status waiting
homecloud tasks assign-me TASK-12 --status in_progress
homecloud tasks unassign TASK-12
```

## Discussion and activity

```bash
homecloud tasks comment TASK-12 "Deployed to staging"
homecloud tasks comment TASK-12 --file ./note.md
homecloud tasks activity TASK-12
homecloud tasks comment-edit TASK-12 COMMENT_ID "fixed typo"
homecloud tasks comment-delete TASK-12 COMMENT_ID
```

## Labels, watchers, people

```bash
homecloud tasks label TASK-12 ops
homecloud tasks unlabel TASK-12 LABEL_ID
homecloud tasks labels
homecloud tasks people
homecloud tasks watch TASK-12
homecloud tasks unwatch TASK-12
```

## Archive, delete, links, share

```bash
homecloud tasks archive TASK-12
homecloud tasks archive TASK-12 --cancel          # cancel then archive
homecloud tasks restore TASK-12
homecloud tasks delete TASK-12 --yes

homecloud tasks link TASK-12 --type compute --id MACHINE_ID --ref web-1
homecloud tasks unlink TASK-12 LINK_ID

homecloud tasks share TASK-12 --expires-in 7d --include-discussion
homecloud tasks shares TASK-12
homecloud tasks unshare TASK-12 SHARE_ID
```

## Commands and permissions

| Command | Permission |
|---------|------------|
| `search` / `list` / `mine` / `get` / `activity` / `people` / `labels` / `shares` | `tasks.read` |
| `create` | `tasks.create` |
| `update` / `patch` / `assign*` / `comment*` / `watch*` / `label` / `archive` / `restore` / `link*` / `share*` | `tasks.update` |
| `delete` | `tasks.delete` |

Guide: [Tasks](../../guides/tasks.md). SDK: [Python](../../sdk/python.md).
