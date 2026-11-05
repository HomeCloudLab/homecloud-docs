# MCP (Model Context Protocol)

HomeCloud exposes MCP in two ways:

1. **Remote MCP (Wave 1)** — Streamable HTTP at `https://mcp.<apex>/mcp`, authenticated with a **Console JWT**.
2. **Local stdio** — `homecloud-mcp` package for Cursor/Claude Desktop (SDK profile / Access Key).

## Remote MCP (recommended for Cursor / Claude Code)

### Auth

1. Sign in: `homecloud login` or `homecloud login --browser` (same Console JWT as the CLI).
2. Export the token into the environment of the IDE process (**do not** commit it):

```bash
# bash / zsh
eval "$(homecloud mcp env)"

# PowerShell
Invoke-Expression (homecloud mcp env --shell powershell)
```

Or print only: `homecloud mcp print-token`.

3. Point the client at the public endpoint with header interpolation:

**Cursor** (`~/.cursor/mcp.json` — user-global, not a project commit):

```json
{
  "mcpServers": {
    "homecloud": {
      "url": "https://mcp.holab.abrdns.com/mcp",
      "headers": {
        "Authorization": "Bearer ${env:HC_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Claude Code:**

```bash
claude mcp add --transport http homecloud https://mcp.holab.abrdns.com/mcp \
  --header "Authorization: Bearer $HC_ACCESS_TOKEN"
```

Restart the IDE after exporting the env var if it only reads the environment at process start.

Wave 1 exposes **`tasks_search` only**. JWT validation uses the same cloud-api chain as the console (`session_version`, device revoke, active user). Tasks IAM (`tasks.read`) remains authoritative on the API.

Access Key / SigV1 remain for automation and dataplane services; they are not required for the human Remote path in Wave 1.

## Local stdio

```bash
pip install homecloud-mcp homecloud-sdk
homecloud-mcp
```

```json
{
  "mcpServers": {
    "homecloud": {
      "command": "homecloud-mcp",
      "env": { "HC_PROFILE": "default" }
    }
  }
}
```

Auth: `homecloud login` (JWT) or user-bound Access Key (`HC_PROFILE`). Service-account keys cannot act as a Tasks user.

## Design

- Shared tool core with the `homecloud-mcp` package; Remote Wave 1 filters to `tasks_search`.
- stdio keeps the full Tasks (+ SO list) surface for local use.

See the [homecloud-mcp](https://github.com/HomeCloudLab/homecloud-mcp) README for the full local tool list.
