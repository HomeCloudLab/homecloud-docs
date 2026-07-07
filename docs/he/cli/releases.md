# גרסאות CLI

הקבצים הבינאריים מתפרסמים ל-bucket הציבורי `homecloud-cli` בכל git tag.

## האחרונה

```text
https://homecloud-cli.so.holab.abrdns.com/releases/latest/VERSION
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-linux-amd64
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-darwin-arm64
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-windows-amd64.exe
```

## היסטוריית גרסאות

| גרסה | עיקרי השינויים |
|---------|------------|
| v0.2.14 | ניסיון חוזר בשגיאות העברה זמניות, מטמון לזיהוי חשבון, הודעות שגיאה ברורות יותר |
| v0.2.13 | ‏`so sync` / `so rm -r` מקבילי (‏`-j` workers), שימוש חוזר בחיבורי HTTP |
| v0.2.12 | ‏`so sync` דו-כיווני (העלאה + הורדה), ‏API‏ `client.so` |
| v0.2.11 | התקדמות חיה עבור `so sync` / `cp` / `rm` |
| v0.2.10 | ‏`so sync`, `so rm -r`, ‏URIs‏ `so://`, אישורים בשורה |
| v0.2.8 | תיקון גוף ב-MQ, username בהתחברות, JSON ב-PowerShell |
| v0.2.6 | גרסה בינארית ציבורית ראשונה |

יומן שינויים מלא: [גרסאות homecloud-cli](https://github.com/HomeCloudLab/homecloud-cli/releases)

## בדיקת הגרסה המותקנת

```bash
homecloud version
# homecloud 0.2.10 (linux-x86_64, standalone)
```
