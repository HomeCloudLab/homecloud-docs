# MCP (Model Context Protocol)

**homecloud-mcp** הוא שרת MCP לפלטפורמת HomeCloud — לעוזרי AI (Cursor, Claude Desktop וכו'). התקשורת היא stdio; הקריאות ל-API עוברות דרך **Python SDK**, לא דרך בינארי ה-CLI.

## עיצוב

- **שרת אחד** לכל הפלטפורמה; שמות כלים עם קידומת שירות (`tasks_search`, בעתיד `mq_*`, `so_*`, …).
- **ליבה** — אימות (`HomeCloudClient`), רישום כלים, שגיאות, וסימון read-only/destructive.
- **מודולים** לכל שירות. Tasks הוא הראשון; מוסיפים מודולים לפי README של החבילה.

## אימות

כמו Tasks ב-CLI / SDK:

- `homecloud login` (JWT), או
- Access Key הקשור למשתמש ב-`~/.homecloud/credentials` / משתני סביבה (`HC_PROFILE`, …).

מפתחות service-account לא יכולים לפעול כמשתמש Tasks.

## התקנה והרצה

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

## כלי Tasks (מודול ראשון)

חיפוש, get (ברירת מחדל ללא כתיבה), schema, people, create/update/transition, bulk upsert, תגובות, תוויות, קישורים, ומחיקה (`confirm=true`). השתמשו ב-`tasks_schema` לפני `tasks_transition`.
