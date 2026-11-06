# MCP (Model Context Protocol)

HomeCloud חושפת MCP בשתי דרכים:

1. **Remote MCP** — Streamable HTTP ב־`https://mcp.<apex>/mcp/`, עם **Console JWT** (או JWT קצר־חיים מהחלפת Access Key).
2. **stdio מקומי** — חבילת `homecloud-mcp` ל־Cursor/Claude Desktop (פרופיל SDK / Access Key).

## Remote MCP (מומלץ ל־Cursor / Claude Code)

### בני אדם — Console JWT

1. התחברות: `homecloud login` או `homecloud login --browser`.
2. ייצוא הטוקן (**בלי** לשמור ב־Git):

```bash
# bash / zsh — מעטפת נוכחית בלבד
eval "$(homecloud mcp env)"

# PowerShell — תהליך נוכחי + Persist ל־Cursor (User env)
Invoke-Expression (homecloud mcp env --shell powershell --persist)
```

או הדפסה בלבד: `homecloud mcp print-token`.

3. הגדרת הלקוח:

**Cursor** (`~/.cursor/mcp.json` — ברמת משתמש):

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

הפעילו **מחדש לגמרי** את ה־IDE אחרי הגדרת User env.

### סוכנים — Access Key → MCP JWT

Access Key של משתמש (SigV1) יכול להנפיק Bearer JWT ל־~שעה:

```bash
homecloud mcp token --shell bash
homecloud mcp token
```

Endpoint: `POST /api/v1/mcp/token` (SigV1). מפתחות service-account נדחים.

### משטח כלים (Remote)

| תחום | כלים |
|------|------|
| Tasks | כל `tasks_*` |
| SO | `so_list_buckets`, `so_list_objects` |
| MQ | `mq_list_queues`, `mq_get_queue` |

### OAuth / Marketplace

מטא־דאטה: `https://mcp.<apex>/.well-known/oauth-protected-resource`  
חבילת תוסף Cursor: `homecloud-cursor-plugin/`.

## stdio מקומי

```bash
pip install homecloud-mcp homecloud-sdk
homecloud-mcp
```

אימות: `homecloud login` או Access Key של משתמש (`HC_PROFILE`). stdio כולל גם SO ו־MQ list/get.
