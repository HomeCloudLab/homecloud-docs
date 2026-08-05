# Managed Databases (MDB)

HomeCloud MDB is a managed database product for **PostgreSQL**, **MySQL**, and **MongoDB**.

Day-2 operations go through the **Databases** console, API, and CLI — not by hand-editing operator CRDs. On the current development / homelab cluster, Kubernetes views still show MDB pods and CRs so operators can debug.

Live site: [docs](https://docs.web.holab.abrdns.com)

## What changed

MSP parity across engines (logical databases, users, backups) via providers; MySQL system secrets hardened (`monitor` / `clustercheck`); RoutingPlatform strategy dispatch; capabilities-driven console tabs.

## Engines and capabilities

| Capability | PostgreSQL | MySQL | MongoDB |
|------------|------------|-------|---------|
| Create / delete instance | yes | yes | yes |
| External access (connector / direct_tcp) | yes | yes (handshake `:3306`) | yes (SNI) |
| Logical databases | yes (CNPG Database CR) | yes (SQL) | yes (mongosh) |
| Managed users | yes | yes | yes |
| Manual backup | yes (CNPG/Barman) | yes (mysqldump Job → MinIO) | yes (mongodump Job → MinIO) |
| Restore to new instance | yes | not yet | not yet |
| HA size API | yes (default 1; >1 gated on homelab) | yes | yes |

## Connect

Reveal credentials from the instance **Connection** tab (or API `POST …/connection/reveal`).

- Connector: `*.mdb.{apex}:443` (TLS)
- PostgreSQL direct TCP: `:5432` HostSNI when enabled
- MySQL direct TCP: `:3306` via handshake edge router
- MongoDB direct TCP: `:27017` HostSNI + TLS when enabled

### MySQL `direct_tcp` username

MySQL’s protocol is server-first, so a shared public `:3306` cannot route by hostname/SNI. The edge router picks the instance from the **handshake username**:

- Use `{db_user}__{instance_name}` — e.g. `root__mydb-sql`
- Or the exact `routing_username` registered for the instance (default = instance name)
- Password is the real DB user’s password (`root` / managed user)

PowerShell example:

```powershell
mysql -h "mydb-sql.mdb.holab.abrdns.com" -P 3306 -u "root__mydb-sql" -p
```

(Older cleartext mode required `--enable-cleartext-plugin`; current edge uses native AuthSwitch passthrough.)
The Connection tab bootstrap user for MySQL is **`root`** (Secret). An `app` owner/database name in create form is the planned application DB — create it under **Databases** / **Users** if you want an `app` login.
## Logical databases

```bash
# List
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/logical-databases"

# Create
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"analytics","owner":"app"}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/logical-databases"
```

PowerShell: quote JSON with single quotes around the `-d` body or use `ConvertTo-Json`.

## Users

Console: **Users** tab — create readwrite/readonly users and rotate passwords.

```bash
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"username":"readonly1","role":"readonly","database":"app"}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/users"

curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/users/readonly1/rotate"
```

## Backups / restore

Requires MinIO credentials on the control plane (`MINIO_*` / CNPG backup bucket).

PostgreSQL: console **Backups** → **Restore to new instance** (creates a new resource).

MySQL/Mongo: manual backup Jobs are available; restore-to-new is not wired yet.
## MySQL `monitor` Access denied

If MySQL logs show `Access denied for user 'monitor'@'…'`, system secrets drifted from DB users.

1. Confirm Secret `{cluster}-mysql-secrets` has keys: `root`, `monitor`, `operator`, `replication`, `orchestrator`, `heartbeat`, `xtrabackup`, `clustercheck`, `clusterset`.
2. Patching a password in that Secret triggers operator rotation (seconds).
3. If the cluster was created with a partial Secret before this fix, recreate the instance or fill missing keys and wait for rotation.

New instances always get the full key set with Percona-safe passwords.

## HA / scale

`POST …/databases/{id}/scale` with `{"instances":1}`. On development profiles, `instances > 1` is rejected to protect homelab RAM. Online vertical resize (`instance_class` change without data loss) is planned for a follow-on.

## Breaking / migration

- API handlers no longer hardcode PostgreSQL-only for logical DB / backup list; engines without a capability return **501**.
- Engine catalog and database detail include `capabilities` for UI gating.
