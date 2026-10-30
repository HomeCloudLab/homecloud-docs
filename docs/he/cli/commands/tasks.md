# tasks

ניהול מלא של משימות מה-CLI — אותו API כמו בקונסול (חיפוש, יצירה, הקצאה, תגובות, תוויות, ארכיון, שיתוף).

**אימות:** `homecloud login` (JWT) או Access Key **קשור למשתמש** (SigV1). מפתחות Service Account לא יכולים לפעול כמשתמש. הרשאות IAM לפי הפעולה. שינויי סטטוס כפופים לכללי ההקצאה כמו בקונסול.

## חיפוש חכם

אותה תחביר כמו תיבת החיפוש בקונסול:

| אסימון | משמעות |
|--------|---------|
| טקסט חופשי | כותרת, פירוט, מפתח, תגובות |
| `@alice` | מוקצה לפי שם משתמש |
| `&ops` | תווית |
| `#compute` או `#mdb/…` | שירות / משאב מקושר |
| `type:change` | סוג פריט |
| `due:today` / `due:overdue` / `due:2026-10-20` | סינון יעד |
| `created:2026-10-01..2026-10-19` | טווח יצירה |

```bash
homecloud tasks search cert @alice &ops due:overdue
homecloud tasks list --mine --status open,in_progress
homecloud tasks mine
homecloud tasks list --limit 50 --sort -sequence --all
homecloud tasks list --output jsonl --fields key,title,status
homecloud tasks list --wide --output table
```

## יצירה ועדכון

מוקצים: **שם משתמש**, `@user`, `me`, או UUID. תאריך יעד: ISO-8601, `today`, `tomorrow`, `+3d`, `+1w`.

גילוי ערכים מותרים (סוגים, סטטוסים, עדיפויות, מעברים):

```bash
homecloud tasks schema
```

```bash
homecloud tasks create "Rotate cert" --type change --priority p2 \
  --status in_progress --assignee alice --label ops --due +3d \
  --external-id jira-1001 --description-file ./notes.md
homecloud tasks create "Draft" --description-file -

homecloud tasks upsert --external-id jira-1001 --title "Rotate cert v2"
homecloud tasks import --file tasks.jsonl --failed-out failed.jsonl
homecloud tasks bulk-delete TASK-1 TASK-2 --yes

homecloud tasks update TASK-12 --status in_progress --assign-me
homecloud tasks relate TASK-12 --to TASK-34 --type blocks
homecloud tasks relations TASK-12

`--dry-run` ב-`create`, `upsert` ו-`import` — מדפיס את הפעולה המתוכננת בלי כתיבה ל-API.
homecloud tasks assign TASK-12 alice bob --status waiting
homecloud tasks assign-me TASK-12 --status in_progress
```

## דיון, תוויות, ארכיון, שיתוף

```bash
homecloud tasks get TASK-12
homecloud tasks get TASK-12 --no-mark-seen
homecloud tasks comment TASK-12 "Deployed to staging"
homecloud tasks activity TASK-12
homecloud tasks label TASK-12 ops
homecloud tasks watch TASK-12
homecloud tasks archive TASK-12 --cancel
homecloud tasks share TASK-12 --expires-in 7d --include-discussion
homecloud tasks delete TASK-12 --yes
```

מדריך: [משימות](../../guides/tasks.md).
