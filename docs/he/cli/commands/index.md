# פקודות CLI

| פקודה | אימות | תיאור |
|---------|------|-------------|
| `homecloud version` | — | מידע גרסה ו-build |
| `homecloud configure` | — | שמירת פרופיל Access Key |
| `homecloud configure import` | — | ייבוא אישורים מ-JSON |
| `homecloud config show` | — | הצגת התצורה הנוכחית |
| `homecloud login` | — | התחברות Console (JWT) |
| `homecloud accounts list` | JWT | רשימת חשבונות |
| `homecloud accounts switch` | JWT | החלפת חשבון פעיל |
| `homecloud apps list` | JWT | רשימת אפליקציות |
| `homecloud queues list` | JWT | רשימת תורים |
| `homecloud mq send` | Access Key | פרסום הודעה |
| `homecloud mq receive` | Access Key | קבלת הודעות |
| `homecloud so ls-buckets` | JWT | רשימת buckets |
| `homecloud so ls` | Access Key | רשימת אובייקטים |
| `homecloud so cp` | Access Key | העלאת קובץ |
| `homecloud so sync` | Access Key | סנכרון תיקייה ↔ bucket (העלאה או הורדה) |
| `homecloud so rm` | Access Key | מחיקת אובייקט / prefix |

## סכמת URI

‏URIs של אחסון אובייקטים משתמשים ב-**`so://`** (לא `s3://`):

```bash
homecloud so cp ./file.txt so://media/path/file.txt
homecloud so sync ./dist so://my-website/ --delete
homecloud so sync so://docs/ ./site --delete
homecloud so rm so://media/old/ --recursive
```

## פורמטי פלט

```bash
homecloud queues list --output table   # ברירת מחדל לרשימות
homecloud mq send q --body '{}' --output json
homecloud so sync ./dist so://b/ --output json   # מצב CI (ללא התקדמות חיה)
```
