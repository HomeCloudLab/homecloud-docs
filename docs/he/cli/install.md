# התקנה

## שורה אחת (מומלץ)

=== "Linux / macOS"

    ```bash
    curl -fsSL https://homecloud-cli.so.holab.abrdns.com/install/install.sh | bash
    ```

=== "Windows (PowerShell)"

    ```powershell
    irm https://homecloud-cli.so.holab.abrdns.com/install/install.ps1 | iex
    ```

הקבצים הבינאריים מותקנים אל:

| מערכת הפעלה | נתיב |
|----|------|
| Linux/macOS | `/usr/local/bin/homecloud` או `~/.local/bin/homecloud` |
| Windows | `%LOCALAPPDATA%\Programs\HomeCloud\homecloud.exe` |

## Windows: הורדה ולחיצה כפולה

1. הורידו את [`homecloud-windows-amd64.exe`](https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-windows-amd64.exe).
2. לחצו פעמיים על הקובץ ב-Explorer — ה-CLI מעתיק את עצמו ל-`HomeCloud`, מוסיף ל-User PATH, ומציג את הצעדים הבאים.
3. פתחו טרמינל **חדש** והריצו `homecloud configure` או `homecloud login`.

הרצה מתוך טרמינל בלי ארגומנטים מציגה help (לא מתקינה אוטומטית). להתקנה מפורשת:

```powershell
.\homecloud-windows-amd64.exe install
.\homecloud-windows-amd64.exe install --force
```

לביטול התקנה אוטומטית (מפתחים / CI): `HOMECLOUD_NO_AUTO_INSTALL=1` או `--no-install`.

## הורדה ישירה

```text
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-linux-amd64
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-darwin-arm64
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-windows-amd64.exe
```

גרסה מקובעת:

```text
https://homecloud-cli.so.holab.abrdns.com/releases/v0.2.10/homecloud-linux-amd64
```

## עדכון

```bash
homecloud update --check          # האם יש גרסה חדשה?
homecloud update                  # התקנת בינארי standalone אחרון
homecloud update --version 0.2.31 # התקנת גרסה ספציפית
```

תמיד נכתב לנתיב ברירת המחדל (`%LOCALAPPDATA%\Programs\HomeCloud` ב-Windows, `~/.local/bin` ב-Linux/macOS), גם אם מריצים `update` מעותק ב-Downloads. ב-Windows מעדכן גם את ה-User PATH.

או הריצו מחדש את סקריפט ההתקנה (דורס את הבינארי במקום):

```powershell
irm https://homecloud-cli.so.holab.abrdns.com/install/install.ps1 | iex
```

## מפתחים (מקוד מקור)

```bash
git clone https://github.com/HomeCloudLab/homecloud-cli.git
cd homecloud-cli
pip install -e ".[dev]"
homecloud version   # מציג זמן ריצה "source"
```
