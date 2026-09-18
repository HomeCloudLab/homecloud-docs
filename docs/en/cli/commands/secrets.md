# secrets

Secret **create** / **list** use Access Key SigV1 on the management plane (no `homecloud login`). **get** / **put** / **set** use the data plane (Access Key). The canonical model is a flat `string → string` map. Nested JSON/YAML and duplicate keys are rejected.

- `create` makes the secret shell; optional `KEY=VALUE` / `--file` seeds values in the same command.
- `put` **replaces** the entire secret by default (omitted keys are removed).
- `put --merge` / `set` **upsert** only the keys you send; other keys stay.
- `get --key` fetches a subset of keys (missing key → error).

`--format` chooses the value codec (`json` | `env` | `yaml`). This is separate from global `--output` used elsewhere for response envelopes.

## create

```bash
# empty shell (Access Key — homecloud configure)
homecloud secrets create my-secret
homecloud secrets create my-secret --description "app credentials"

# create + seed values
homecloud secrets create my-secret API_KEY=test DB_HOST=db.internal
homecloud secrets create my-secret --format env --file .env
```

## get

```bash
homecloud secrets get my-secret
homecloud secrets get my-secret --format env
homecloud secrets get my-secret --key API_KEY --key DB_HOST
homecloud secrets get my-secret -k API_KEY --format env
```

Stdout is the serialized map (not a metadata envelope).

## put

```bash
# replace entire map
homecloud secrets put my-secret --format env --file .env

# upsert keys only
homecloud secrets put my-secret --merge --format json --file patch.json
cat patch.env | homecloud secrets put my-secret --merge --format env
```

## set

Upsert one or more `KEY=VALUE` pairs (always merge):

```bash
homecloud secrets set my-secret API_KEY=rotated DB_HOST=db.internal
```

## Related

- [Secrets guide](../../guides/secrets.md)  
- [Authentication](../authentication.md)  
