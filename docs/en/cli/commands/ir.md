# ir

Image Registry (IR) commands for private OCI / Docker images.

## login

Logs Docker into IR using your configured Access Key profile (no interactive username/password):

```bash
homecloud configure   # once: save Access Key id + secret
homecloud ir login
```

Equivalent to AWS-style piping:

```bash
homecloud ir get-login-password | docker login --username <AccessKeyId> --password-stdin ir.holab.abrdns.com
```

Options:

- `--registry HOST` — override registry host (default `ir.{apex}`)
- `--print-only` — print the pipe command only; do not run `docker`

Access Key needs `ir:Push` and/or `ir:Pull`.

## get-login-password

Prints the Access Key secret to stdout for `--password-stdin` (CI / scripts):

```bash
homecloud ir get-login-password | docker login --username "$HOMECLOUD_ACCESS_KEY_ID" --password-stdin ir.holab.abrdns.com
```

## repo

```bash
homecloud login --username alice
homecloud ir repo list
homecloud ir repo create myapp
homecloud ir repo create myapp --output json
```

## usage

```bash
homecloud ir usage
homecloud ir usage --output json
```

## Push example

```bash
docker build -t myapp:1.0 .
docker tag myapp:1.0 ir.holab.abrdns.com/<account_short_id>/myapp:1.0
docker push ir.holab.abrdns.com/<account_short_id>/myapp:1.0
```

Account short id and exact registry host are shown in the console Registry page (**View push commands**) and derived by `ir login` from your apex.

## Related

- [Image Registry guide](../../guides/registry.md)  
- [Access Keys](../../getting-started/access-keys.md)  
