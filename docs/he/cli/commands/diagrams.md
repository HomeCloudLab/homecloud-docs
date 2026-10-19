# diagrams

ניהול דיאגרמות ארכיטקטורה בחשבון מ־CLI.

**אימות:** JWT קונסול (`homecloud login`) או Access Key **קשור למשתמש** (SigV1). נדרשות `diagrams.read` / `diagrams.create` / `diagrams.update`. ב־patch של `document` העבירו `--revision` כדי למנוע התנגשויות.

```bash
homecloud diagrams list
homecloud diagrams get DIAGRAM_ID
homecloud diagrams create "Production plan" --description "Draft"
homecloud diagrams create "Import" --document-file ./diagram.json
homecloud diagrams patch DIAGRAM_ID --name "Production architecture"
homecloud diagrams patch DIAGRAM_ID --document-file ./diagram.json --revision 3
```

| פקודה | הרשאה |
|-------|--------|
| `list` / `get` | `diagrams.read` |
| `create` | `diagrams.create` |
| `patch` | `diagrams.update` |

מדריך: [דיאגרמות](../../guides/diagrams.md).
