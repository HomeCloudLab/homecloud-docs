# MCP (Model Context Protocol)

HomeCloud חושפת MCP בשתי דרכים:

1. **Remote MCP (גל 1)** — Streamable HTTP ב־`https://mcp.<apex>/mcp`, עם אימות **Console JWT**.
2. **stdio מקומי** — חבילת `homecloud-mcp` ל־Cursor/Claude Desktop (פרופיל SDK / Access Key).

## Remote MCP (מומלץ ל־Cursor / Claude Code)

### אימות

1. התחברות: `homecloud login` או `homecloud login --browser` (אותו JWT כמו ב־CLI).
2. ייצוא הטוקן לסביבת תהליך ה־IDE (**בלי** לשמור ב־Git):

```bash
# bash / zsh
eval "$(homecloud mcp env)"

# PowerShell
Invoke-Expression (homecloud mcp env --shell powershell)
```

או הדפסה בלבד: `homecloud mcp print-token`.

3. הגדרת הלקוח עם אינטרפולציה למשתנה סביבה:

**Cursor** (`~/.cursor/mcp.json` — ברמת משתמש, לא בקובץ פרויקט ב־Git):

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

אחרי ייצוא המשתנה — הפעילו מחדש את ה־IDE אם הוא קורא env רק בעלייה.

בגל 1 חשוף רק **`tasks_search`**. אימות JWT עובר את אותה שרשרת כמו cloud-api (`session_version`, ביטול מכשיר, משתמש פעיל). הרשאות Tasks (`tasks.read`) נשארות מקור האמת ב־API.

Access Key / SigV1 נשארים לאוטומציה ול־dataplane; לא נדרשים למסלול האנושי המרוחק בגל 1.

## stdio מקומי

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

אימות: `homecloud login` (JWT) או Access Key של משתמש (`HC_PROFILE`). מפתחות service-account לא יכולים לפעול כמשתמש Tasks.

## עיצוב

- ליבת כלים משותפת עם חבילת `homecloud-mcp`; Remote בגל 1 מסונן ל־`tasks_search`.
- stdio שומר את מלוא משטח Tasks (+ SO list) לשימוש מקומי.

ראו את [README של homecloud-mcp](https://github.com/HomeCloudLab/homecloud-mcp) לרשימת הכלים המקומית המלאה.
