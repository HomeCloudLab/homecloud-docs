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

```bash
homecloud update --check          # is a newer release available?
homecloud update                  # install latest standalone binary
homecloud update --version 0.2.31 # install a specific release
```

Works from both standalone and pip/source installs. Source installs write the binary to the default install directory (`%LOCALAPPDATA%\Programs\homecloud` on Windows, `~/.local/bin` on Linux/macOS) and add it to PATH.

Or re-run the install script (overwrites the binary in place):

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
