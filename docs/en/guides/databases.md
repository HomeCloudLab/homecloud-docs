# Managed Databases (MDB)

MDB gives you managed **PostgreSQL**, **MySQL**, or **MongoDB** instances without hand-editing Kubernetes CRDs. You create and operate them from the **Databases** console (and matching APIs).

| Item | Value |
|------|--------|
| Console | **Databases** → `/console/database` |
| Endpoints | `*.mdb.{apex}` (TLS connector and/or direct TCP) |
| Credentials | Reveal from the **Connection** tab (audited) |

## What you get

| Capability | PostgreSQL | MySQL | MongoDB |
|------------|------------|-------|---------|
| Create / delete instance | yes | yes | yes |
| External access | yes | yes | yes |
| Logical databases | yes | yes | yes |
| Managed users + rotate password | yes | yes | yes |
| Manual backup | yes | yes | yes |
| Restore to **new** instance | yes | not yet | not yet |

Exact tabs in the UI are driven by engine **capabilities** — if a feature is not supported for that engine, the tab or action is hidden or returns an error.

## Console walkthrough

### Create an instance

1. Open **Databases** → **Create**.  
2. Choose engine (PostgreSQL / MySQL / MongoDB), name, size/class, and options shown in the form.  
3. Wait until status is healthy/ready.  
4. Open the instance.

### Connection tab

1. Open **Connection**.  
2. **Reveal** credentials when you need them (this is audited).  
3. Copy host, port, username, password, and TLS notes for your client (`psql`, `mysql`, Compass, app config, etc.).

Connection modes you may see:

| Mode | Typical use |
|------|-------------|
| **Connector** on `*.mdb.{apex}:443` | TLS tunnel — good default from outside the cluster |
| **Direct TCP** | Native ports (`5432` / `3306` / `27017`) when enabled for the instance |

### MySQL direct TCP — special username

MySQL’s protocol does not carry the hostname early enough for shared-port routing. For direct TCP on port `3306`, log in with:

```text
{db_user}__{instance_name}
```

Example: instance `mydb-sql`, user `root` → username `root__mydb-sql`. Password is the real database password.

```bash
mysql -h "mydb-sql.mdb.holab.abrdns.com" -P 3306 -u "root__mydb-sql" -p
```

The Connection tab documents the exact `routing_username` when it differs.

### Logical databases

Open the **Databases** (logical) tab:

- Create application databases (for example `analytics`).  
- Assign an owner where the engine supports it.

### Users

Open **Users**:

- Create `readwrite` / `readonly` users scoped to a database.  
- **Rotate** passwords when credentials may have leaked.

Store production passwords in [Secrets](secrets.md) rather than in chat or git.

### Backups

Open **Backups**:

- Trigger a **manual backup**.  
- On PostgreSQL, **Restore to new instance** creates a **new** database resource from a backup (it does not overwrite the live instance in place).

MySQL and MongoDB support manual backup jobs; restore-to-new may not be available yet on your platform version.

### Security

Use the **Security** tab for network / TLS related settings exposed for that engine. Prefer least-privilege DB users for applications.

## Connect from an application

1. Reveal connection info once.  
2. Put username/password in a HomeCloud **Secret** (or your app’s secret store).  
3. Point the app at the connector hostname.  
4. Require TLS as documented on the Connection tab.

## API examples (console JWT)

Replace `$TOKEN`, `$API`, `$ACCOUNT_ID`, `$DB_ID`.

```bash
# List logical databases
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/logical-databases"

# Create logical database
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"analytics","owner":"app"}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/logical-databases"

# Create readonly user
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"username":"readonly1","role":"readonly","database":"app"}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/users"

# Rotate password
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/users/readonly1/rotate"
```

## Scale / HA

Some engines expose scale (`instances` count) from the console or API. On smaller homelab profiles, `instances > 1` may be rejected to protect memory. Vertical resize without downtime may be limited — check the UI for allowed actions.

## Tips and pitfalls

- Always use the **Connection** tab values for the current instance — do not guess ports.  
- MySQL direct TCP **must** use the `__instance` username form.  
- Revealing passwords is audited — prefer Secrets + rotation over sharing screenshots.  
- Backups need platform object storage configured; if backup fails, contact your platform operator.  
- Kubernetes may show MDB pods in your account namespace for visibility; day-2 ops should still go through the Databases UI, not manual CR edits.

## Related

- [Secrets](secrets.md)  
- [Applications](applications.md)  
- [Kubernetes](kubernetes.md)  
- [Terraform](../terraform/index.md) (`homecloud_mdb_instance` / `homecloud_mdb_user`)  
