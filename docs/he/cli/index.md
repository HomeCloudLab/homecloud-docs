# HomeCloud CLI

ה-CLI ‏`homecloud` הוא קובץ בינארי יחיד לפעולות console ו-data-plane.

**גרסה נוכחית:** ראו [גרסאות](releases.md)

## התקנה

```bash
# Linux / macOS
curl -fsSL https://homecloud-cli.so.holab.abrdns.com/install/install.sh | bash

# Windows
irm https://homecloud-cli.so.holab.abrdns.com/install/install.ps1 | iex
```

## אימות

```bash
homecloud version
```

## אפשרויות גלובליות

| דגל | משתנה סביבה | תיאור |
|------|---------|-------------|
| `--profile`, `-p` | `HOMECLOUD_PROFILE` | פרופיל אישורים בעל שם |
| `--access-key-id` | `HOMECLOUD_ACCESS_KEY_ID` | Access Key (דורס פרופיל) |
| `--secret-access-key` | `HOMECLOUD_SECRET_ACCESS_KEY` | Secret (דורס פרופיל) |
| `--apex` | `HOMECLOUD_APEX` | דומיין הפלטפורמה |

## קבוצות פקודות

| קבוצה | אימות | תיאור |
|-------|------|-------------|
| `configure`, `config` | — | הגדרת אישורים |
| `login`, `accounts` | JWT | Console API |
| `mq` | Access Key | שליחה/קבלה של הודעות |
| `so` | Access Key / JWT | אחסון אובייקטים |
| `queues`, `apps` | JWT | רשימות control plane |

ראו [פקודות](commands/index.md) לעיון מלא.
