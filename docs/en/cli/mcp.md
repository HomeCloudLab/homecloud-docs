# MCP (Model Context Protocol)

**homecloud-mcp** is the platform MCP server for AI assistants (Cursor, Claude Desktop, etc.). It speaks MCP over stdio and calls HomeCloud through the **Python SDK** — not the CLI binary.

## Design

- **One server** for the whole platform; tool names are prefixed by service (`tasks_search`, future `mq_*`, `so_*`, …).
- **Core** handles auth (`HomeCloudClient`), tool registry, error shaping, and read-only/destructive hints.
- **Modules** implement each service. Tasks shipped first; add modules by registering them in the package (see the project README).

## Auth

Same as Tasks CLI / SDK:

- `homecloud login` (console JWT), or
- User-bound Access Key in `~/.homecloud/credentials` / env (`HC_PROFILE`, `HOMECLOUD_ACCESS_KEY_ID`, …).

Service-account keys cannot act as a Tasks user.

## Install and run

```bash
pip install homecloud-mcp homecloud-sdk
homecloud-mcp
```

## Cursor

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

See the [homecloud-mcp](https://github.com/HomeCloudLab/homecloud-mcp) README for a full tool list and module extension guide.

## Tasks tools (first module)

Search, get (read-only by default), schema, people, create/update/transition, bulk upsert, comments, labels, links, and delete (with `confirm=true`). Use `tasks_schema` to discover valid statuses and transitions before calling `tasks_transition`.
