# secrets

Secret **values** (data plane, Access Key). The canonical model is a flat `string → string` map. Nested JSON/YAML and duplicate keys are rejected.

`put` **replaces the entire secret**. Keys omitted from the input are removed.

`--format` chooses the value codec (`json` | `env` | `yaml`). This is separate from global `--output` used elsewhere for response envelopes.

## get

```bash
homecloud secrets get my-secret
homecloud secrets get my-secret --format json
homecloud secrets get my-secret --format env
homecloud secrets get my-secret --format yaml
```

=== "PowerShell"

    ```powershell
    homecloud secrets get my-secret --format env
    ```

Stdout is the serialized map (not a metadata envelope).

## put

```bash
homecloud secrets put my-secret --format env --file .env
homecloud secrets put my-secret --format json --file values.json
homecloud secrets put my-secret --format yaml --file values.yaml
# stdin
cat values.json | homecloud secrets put my-secret --format json
```

=== "PowerShell"

    ```powershell
    homecloud secrets put my-secret --format env --file .env
    Get-Content values.json -Raw | homecloud secrets put my-secret --format json
    ```

Response metadata uses `--output` (`json` by default).

## Related

- [Secrets guide](../../guides/secrets.md)  
- [Authentication](../authentication.md)  
