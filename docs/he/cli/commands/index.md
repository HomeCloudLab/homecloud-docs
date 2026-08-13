# פקודות CLI

מפת פקודות מלאה לבינארי `homecloud`.

## Meta

| פקודה | Auth | תיאור |
|-------|------|-------|
| `homecloud version` | — | גרסה (`--check` לעדכונים) |
| `homecloud update` | — | התקנת שחרור standalone חדש יותר |
| `homecloud install` / `uninstall` | — | מתקינים עזר כשרלוונטי |

## תצורה והתחברות

| פקודה | Auth | תיאור |
|-------|------|-------|
| `homecloud configure` | — | פרופיל Access Key אינטראקטיבי |
| `homecloud configure import` | — | ייבוא JSON של אישורים |
| `homecloud config show` | — | הצגת תצורה פעילה |
| `homecloud login` | — | JWT קונסול (`--browser` ל-passkeys) |

## חשבונות ואפליקציות

| פקודה | Auth | תיאור |
|-------|------|-------|
| `homecloud accounts list` | JWT | רשימת חשבונות |
| `homecloud accounts switch` | JWT | החלפת חשבון פעיל |
| `homecloud apps list` | JWT | רשימת אפליקציות |

## תורים (ניהול) ו-MQ (data plane)

| פקודה | Auth | תיאור |
|-------|------|-------|
| `homecloud queues list` | JWT | רשימת תורים (`--live` לעומקים) |
| `homecloud queues get` | JWT | פרטי תור |
| `homecloud mq send` | Access Key | פרסום הודעה/הודעות |
| `homecloud mq receive` | Access Key | קבלת הודעות |
| `homecloud mq delete` | Access Key | מחיקה לפי sequence |
| `homecloud mq purge` | Access Key | ניקוי תור |
| `homecloud mq receive-dlq` | Access Key | קריאת DLQ |
| `homecloud mq delete-dlq` | Access Key | מחיקת הודעת DLQ |
| `homecloud mq purge-dlq` | Access Key | ניקוי DLQ |

פרטים: [mq](mq.md).

## Object storage (`so`)

| פקודה | Auth | תיאור |
|-------|------|-------|
| `homecloud so ls-buckets` | JWT | רשימת buckets |
| `homecloud so ls` | Access Key | רשימת אובייקטים |
| `homecloud so cp` | Access Key | העתקת קובץ אחד מקומי ↔ SO |
| `homecloud so sync` | Access Key | סנכרון תיקייה ↔ prefix |
| `homecloud so rm` | Access Key | מחיקת אובייקט / prefix |

פרטים: [so](so.md).

## Functions (`fn`)

| פקודה | Auth | תיאור |
|-------|------|-------|
| `homecloud fn list` | session / key as configured | רשימת פונקציות |
| `homecloud fn invoke` | | Invoke עם מטען JSON |
| `homecloud fn url` | | הצגה / ניהול מידע Function URL |
| `homecloud fn logs` | | שליפת לוגים |
| `homecloud fn watch` | | מעקב אחר פעילות |

פרטים: [fn](fn.md).

## Image registry (`ir`)

| פקודה | Auth | תיאור |
|-------|------|-------|
| `homecloud ir login` | Access Key | עוזר `docker login` |
| `homecloud ir repo list\|create` | | Repositories |
| `homecloud ir usage` | | שימוש באחסון |

פרטים: [ir](ir.md).

## Mail

| פקודה | Auth | תיאור |
|-------|------|-------|
| `homecloud mail mailboxes` | | רשימת תיבות דואר |
| `homecloud mail messages` | | רשימת הודעות |
| `homecloud mail get` | | פרטי הודעה |
| `homecloud mail attachment` | | הורדת קובץ מצורף |

פרטים: [mail](mail.md).

## Billing, usage, monitoring

| פקודה | Auth | תיאור |
|-------|------|-------|
| `homecloud usage list` | JWT | כמויות מטר (בלי מחיר) |
| `homecloud billing summary` | JWT | אומדן מתחילת החודש |
| `homecloud billing forecast` | JWT | תחזית (Estimate) |
| `homecloud billing invoices` | JWT | רשימת חשבוניות |
| `homecloud monitoring workspace` | JWT | סביבת Monitoring |
| `homecloud monitoring dashboards` | JWT | גרפים ברירת מחדל |

פרטים: [billing](billing.md).

## סכמת URI

```bash
homecloud so cp ./file.txt so://media/path/file.txt
homecloud so sync ./dist so://my-website/ --delete
homecloud so sync so://docs/ ./site --delete
homecloud so rm so://media/old/ --recursive
```

## פורמטי פלט

```bash
homecloud queues list --output table
homecloud mq send q --body '{}' --output json
homecloud so sync ./dist so://b/ --output json
```
