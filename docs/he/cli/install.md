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
| Windows | `%LOCALAPPDATA%\Programs\homecloud\homecloud.exe` |

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

הריצו מחדש את סקריפט ההתקנה — הוא דורס את הקובץ הבינארי במקום:

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
