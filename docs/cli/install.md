# Install

## One-liner (recommended)

=== "Linux / macOS"

    ```bash
    curl -fsSL https://homecloud-cli.so.holab.abrdns.com/install/install.sh | bash
    ```

=== "Windows (PowerShell)"

    ```powershell
    irm https://homecloud-cli.so.holab.abrdns.com/install/install.ps1 | iex
    ```

Binaries install to:

| OS | Path |
|----|------|
| Linux/macOS | `/usr/local/bin/homecloud` or `~/.local/bin/homecloud` |
| Windows | `%LOCALAPPDATA%\Programs\homecloud\homecloud.exe` |

## Direct download

```text
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-linux-amd64
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-darwin-arm64
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-windows-amd64.exe
```

Pinned version:

```text
https://homecloud-cli.so.holab.abrdns.com/releases/v0.2.10/homecloud-linux-amd64
```

## Update

Re-run the install script — it overwrites the binary in place:

```powershell
irm https://homecloud-cli.so.holab.abrdns.com/install/install.ps1 | iex
```

## Developers (source)

```bash
git clone https://github.com/HomeCloudLab/homecloud-cli.git
cd homecloud-cli
pip install -e ".[dev]"
homecloud version   # shows "source" runtime
```
