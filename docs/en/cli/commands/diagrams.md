# diagrams

Manage account architecture diagrams from the CLI.

**Auth:** console JWT (`homecloud login`) or a **user-bound** Access Key (SigV1). Requires `diagrams.read` / `diagrams.create` / `diagrams.update`. Pass `--revision` on patch when updating `document` to avoid conflicts.

```bash
homecloud diagrams list
homecloud diagrams get DIAGRAM_ID
homecloud diagrams create "Production plan" --description "Draft"
homecloud diagrams create "Import" --document-file ./diagram.json
homecloud diagrams patch DIAGRAM_ID --name "Production architecture"
homecloud diagrams patch DIAGRAM_ID --document-file ./diagram.json --revision 3
```

| Command | Permission |
|---------|------------|
| `list` / `get` | `diagrams.read` |
| `create` | `diagrams.create` |
| `patch` | `diagrams.update` |

Guide: [Diagrams](../../guides/diagrams.md).
