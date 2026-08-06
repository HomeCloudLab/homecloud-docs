# ir

פקודות Image Registry (IR) לתמונות OCI / Docker פרטיות.

## login

מדפיס הוראות `docker login` למארח ה-registry:

```bash
homecloud ir login
```

ואז:

```bash
docker login ir.holab.abrdns.com
# Username: Access Key ID (HCAK…)
# Password: Access Key secret
```

Access Key צריך `ir:Push` ו/או `ir:Pull`.

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

## דוגמת Push

```bash
docker build -t myapp:1.0 .
docker tag myapp:1.0 ir.holab.abrdns.com/<account_short_id>/myapp:1.0
docker push ir.holab.abrdns.com/<account_short_id>/myapp:1.0
```

Account short id ומארח ה-registry המדויק מוצגים בדף Registry בקונסול ובפלט של `ir login`.

## קשור

- [מדריך Image Registry](../../guides/registry.md)  
- [Access Keys](../../getting-started/access-keys.md)  
