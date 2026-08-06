# התקנה

## שורת פקודה אחת (מומלץ)

=== "Linux / macOS"

    ```bash
    curl -fsSL https://homecloud-cli.so.holab.abrdns.com/install/install.sh | bash
    ```

=== "Windows (PowerShell)"

    ```powershell
    irm https://homecloud-cli.so.holab.abrdns.com/install/install.ps1 | iex
    ```

בינארים מותקנים אל:

| OS | Path |
|----|------|
| Linux/macOS | `/usr/local/bin/homecloud` או `~/.local/bin/homecloud` |
| Windows | `%LOCALAPPDATA%\Programs\HomeCloud\homecloud.exe` |

## Windows: הורדה ולחיצה כפולה

1. הורידו [`homecloud-windows-amd64.exe`](https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-windows-amd64.exe).
2. לחצו לחיצה כפולה על הקובץ ב-Explorer — ה-CLI מעתיק את עצמו ל-`HomeCloud`, מוסיף User PATH ומציג צעדים הבאים.
3. פתחו טרמינל **חדש** והריצו `homecloud configure` או `homecloud login`.

הרצת אותו קובץ מטרמינל בלי ארגומנטים מציגה עזרה (לא מתקינה אוטומטית). להתקנה מפורשת:

```powershell
.\homecloud-windows-amd64.exe install
.\homecloud-windows-amd64.exe install --force
```

השביתו התקנה אוטומטית (מפתחים / CI): הגדירו `HOMECLOUD_NO_AUTO_INSTALL=1` או העבירו `--no-install`.

## הורדה ישירה

```text
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-linux-amd64
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-darwin-arm64
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-windows-amd64.exe
```

גרסה נעוצה:

```text
https://homecloud-cli.so.holab.abrdns.com/releases/v0.2.10/homecloud-linux-amd64
```

## עדכון

```bash
homecloud update --check          # is a newer release available?
homecloud update                  # install latest standalone binary
homecloud update --version 0.2.31 # install a specific release
```

תמיד כותב לתיקיית ההתקנה ברירת המחדל (`%LOCALAPPDATA%\Programs\HomeCloud` ב-Windows, `~/.local/bin` ב-Linux/macOS), גם אם מפעילים `update` מעותק ב-Downloads. מוסיף/מרענן User PATH ב-Windows.

או הריצו מחדש את סקריפט ההתקנה (דורס את הבינארי במקום):

```powershell
irm https://homecloud-cli.so.holab.abrdns.com/install/install.ps1 | iex
```

## הסרה

```bash
homecloud uninstall          # confirm interactively
homecloud uninstall --yes    # no prompt
```

מסיר את הבינארי העצמאי ואת רשומת User PATH ב-Windows. אישורים/תצורה שמורים תחת `~/.homecloud` נשמרים.

## מפתחים (מקור)

```bash
git clone https://github.com/HomeCloudLab/homecloud-cli.git
cd homecloud-cli
pip install -e ".[dev]"
homecloud version   # shows "source" runtime
```
