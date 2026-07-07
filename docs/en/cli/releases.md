# CLI releases

Binaries are published to the public `homecloud-cli` bucket on every git tag.

## Latest

```text
https://homecloud-cli.so.holab.abrdns.com/releases/latest/VERSION
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-linux-amd64
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-darwin-arm64
https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-windows-amd64.exe
```

## Version history

| Version | Highlights |
|---------|------------|
| v0.2.14 | Retry transient transfer errors, cache account resolution, clearer error messages |
| v0.2.13 | Parallel `so sync` / `so rm -r` (`-j` workers), HTTP connection reuse |
| v0.2.12 | Bidirectional `so sync` (upload + download), `client.so` API |
| v0.2.11 | Live progress for `so sync` / `cp` / `rm` |
| v0.2.10 | `so sync`, `so rm -r`, `so://` URIs, inline credentials |
| v0.2.8 | MQ body fix, login username, PowerShell JSON |
| v0.2.6 | First public binary release |

Full changelog: [homecloud-cli releases](https://github.com/HomeCloudLab/homecloud-cli/releases)

## Check installed version

```bash
homecloud version
# homecloud 0.2.10 (linux-x86_64, standalone)
```
