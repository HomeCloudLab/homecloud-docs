# ir

Image Registry (IR) commands for private OCI / Docker images.

## login

Prints `docker login` instructions for the registry host:

```bash
homecloud ir login
```

Then:

```bash
docker login ir.holab.abrdns.com
# Username: Access Key ID (HCAK…)
# Password: Access Key secret
```

Access Key needs `ir:Push` and/or `ir:Pull`.

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

Account short id and exact registry host are shown in the console Registry page and in `ir login` output.

## Related

- [Image Registry guide](../../guides/registry.md)  
- [Access Keys](../../getting-started/access-keys.md)  
