# CLI של HomeCloud

ה-CLI `homecloud` הוא כלי שורת הפקודה לבעלי חשבון ול-DevOps. השתמשו בו להגדרת Access Keys, התחברות לפקודות ניהול, סנכרון object storage, פרסום הודעות תור, invoke לפונקציות ועוד.

הוא מגיע כ**בינארי עצמאי** — משתמשי קצה לא צריכים Python מותקן.

## התקנה

ראו [התקנה](install.md) ל-Linux, macOS ו-Windows.

```bash
homecloud version
homecloud configure
homecloud login
```

## מודל מנטלי

| משפחת פקודות | Auth | דוגמאות |
|--------------|------|---------|
| Data plane | Access Key (`homecloud configure`) | `so cp`, `so sync`, `mq send`, `mq receive` |
| Management | סשן קונסול (`homecloud login`) | `queues list`, `so ls-buckets`, `apps list`, `accounts list` |
| Either / mixed | ראו עמוד כל פקודה | `fn`, `ir`, `mail` |

יצירת מפתחות: [Access Keys](../getting-started/access-keys.md). פרטים: [אימות](authentication.md).

## דוגמאות מהירות

```bash
# Object storage — deploy a static site
homecloud so sync ./dist so://my-website/ --delete

# Queues
homecloud mq send orders --body '{"id":1}'
homecloud mq receive orders --max-messages 5 --delete

# Functions
homecloud fn invoke hello --payload '{"name":"Ada"}'

# Registry
homecloud ir login
homecloud ir repo list

# Mail
homecloud mail mailboxes
```

## מדריך פקודות

| עמוד | תוכן |
|------|------|
| [כל הפקודות](commands/index.md) | טבלה של כל קבוצות הפקודות |
| [configure](commands/configure.md) | שמירת פרופילי Access Key |
| [login](commands/login.md) | סשן דפדפן / סיסמה |
| [so](commands/so.md) | Object storage |
| [mq](commands/mq.md) | Message queues |
| [fn](commands/fn.md) | Functions |
| [ir](commands/ir.md) | Image registry |
| [mail](commands/mail.md) | Mail |
| [שחרורים](releases.md) | היסטוריית גרסאות / עדכון |

## פורמטי פלט

```bash
homecloud queues list --output table   # default for many lists
homecloud mq send q --body '{}' --output json
homecloud so sync ./dist so://b/ --output json   # CI-friendly
```

## סכמת URI

Object storage משתמש ב-**`so://bucket/key`**:

```bash
homecloud so cp ./file.txt so://media/path/file.txt
homecloud so sync ./dist so://my-website/ --delete
```

## הבא

1. [התקנה](install.md)  
2. [אימות](authentication.md)  
3. בחרו מדריך פקודה למעלה  
4. לספריות באפליקציה, ראו את ה-[SDK](../sdk/index.md)  
