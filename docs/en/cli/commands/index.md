# CLI commands

| Command | Auth | Description |
|---------|------|-------------|
| `homecloud version` | — | Version and build info |
| `homecloud configure` | — | Save Access Key profile |
| `homecloud configure import` | — | Import credentials JSON |
| `homecloud config show` | — | Show current config |
| `homecloud login` | — | Console JWT login |
| `homecloud accounts list` | JWT | List accounts |
| `homecloud accounts switch` | JWT | Switch active account |
| `homecloud apps list` | JWT | List applications |
| `homecloud queues list` | JWT | List queues |
| `homecloud mq send` | Access Key | Publish message |
| `homecloud mq receive` | Access Key | Receive messages |
| `homecloud so ls-buckets` | JWT | List buckets |
| `homecloud so ls` | Access Key | List objects |
| `homecloud so cp` | Access Key | Upload file |
| `homecloud so sync` | Access Key | Sync directory → bucket |
| `homecloud so rm` | Access Key | Delete object / prefix |

## URI scheme

Object storage URIs use **`so://`** (not `s3://`):

```bash
homecloud so cp ./file.txt so://media/path/file.txt
homecloud so sync ./dist so://my-website/ --delete
homecloud so rm so://media/old/ --recursive
```

## Output formats

```bash
homecloud queues list --output table   # default for lists
homecloud mq send q --body '{}' --output json
homecloud so sync ./dist so://b/ --output json   # CI mode (no live progress)
```
