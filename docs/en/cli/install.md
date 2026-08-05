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
| Windows | `%LOCALAPPDATA%\Programs\HomeCloud\homecloud.exe` |

## Windows: download and double-click

1. Download [`homecloud-windows-amd64.exe`](https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-windows-amd64.exe).
2. Double-click the file in Explorer — the CLI copies itself into `HomeCloud`, adds User PATH, and shows next steps.
3. Open a **new** terminal and run `homecloud configure` or `homecloud login`.

Running the same file from a terminal with no arguments shows help (it does not auto-install). To install explicitly:

```powershell
.\homecloud-windows-amd64.exe install
.\homecloud-windows-amd64.exe install --force
```

Disable auto-install (developers / CI): set `HOMECLOUD_NO_AUTO_INSTALL=1` or pass `--no-install`.

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

Always writes to the default install directory (`%LOCALAPPDATA%\Programs\HomeCloud` on Windows, `~/.local/bin` on Linux/macOS), even if you launch `update` from a Downloads copy. Adds/refreshes User PATH on Windows.

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
