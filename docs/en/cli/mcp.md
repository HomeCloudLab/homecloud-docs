# MCP (Model Context Protocol)

HomeCloud exposes MCP in two ways:

1. **Remote MCP** — Streamable HTTP at `https://mcp.<apex>/mcp/`, authenticated with a **Console JWT** (or a short-lived JWT from Access Key exchange).
2. **Local stdio** — `homecloud-mcp` package for Cursor/Claude Desktop (SDK profile / Access Key).

## Remote MCP (recommended for Cursor / Claude Code)

### Humans — Console JWT

1. Sign in: `homecloud login` or `homecloud login --browser`.
2. Export the token (**do not** commit it):

```bash
# bash / zsh — current shell only
eval "$(homecloud mcp env)"

# PowerShell — current process + persist for Cursor (User env)
Invoke-Expression (homecloud mcp env --shell powershell --persist)
```

Or print only: `homecloud mcp print-token`.

3. Point the client at the public endpoint:

**Cursor** (`~/.cursor/mcp.json` — user-global):

```json
{
  "mcpServers": {
    "homecloud": {
      "url": "https://mcp.holab.abrdns.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${env:HC_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Claude Code:**

```bash
claude mcp add --transport http --scope user homecloud https://mcp.holab.abrdns.com/mcp/ \
  --header "Authorization: Bearer $HC_ACCESS_TOKEN"
```

Fully **restart** the IDE after setting User env (Cursor only reads env at process start).

### Agents — Access Key → MCP JWT

User-bound Access Key (SigV1) can mint a ~1h Bearer JWT:

```bash
# requires homecloud configure with a user-bound key
homecloud mcp token --shell bash
# or raw JWT:
homecloud mcp token
```

Endpoint: `POST /api/v1/mcp/token` (SigV1). Service-account keys are rejected.

### Tool surface (Remote)

| Area | Tools |
|------|--------|
| Tasks | Full `tasks_*` set (search, get, create/update, comments, labels, shares, …) |
| SO | `so_list_buckets`, `so_list_objects` |
| MQ | `mq_list_queues`, `mq_get_queue` |

JWT validation uses the same cloud-api chain as the console (`session_version`, device revoke, active user). Tasks / SO / MQ IAM remains authoritative on the API.

### OAuth / Marketplace

Protected Resource Metadata: `https://mcp.<apex>/.well-known/oauth-protected-resource`  
Cursor plugin package: `homecloud-cursor-plugin/` (submit to [Cursor Marketplace](https://cursor.com/marketplace/publish)).

Access map: [task-54 MCP access matrix](https://github.com/HomeCloudLab/cloud-infra/blob/main/docs/tasks/task-54-mcp-access-matrix.md) (internal).

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

Auth: `homecloud login` (JWT) or user-bound Access Key (`HC_PROFILE`). Service-account keys cannot act as a Tasks user. Stdio also includes SO list tools and MQ list/get.

## Design

- Shared tool core with the `homecloud-mcp` package; Remote hosts Tasks + SO/MQ read tools on cloud-api.
- Data-plane MQ send/receive and raw Access Key dataplane remain available via SDK/CLI; agent Remote path uses JWT (login or `mcp token` exchange).

See the [homecloud-mcp](https://github.com/HomeCloudLab/homecloud-mcp) README for the full local tool list.
