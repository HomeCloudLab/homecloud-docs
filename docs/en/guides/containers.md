# Containers

Managed container Services on a HomeCloud **managed Compute pool**. You bring an image; HomeCloud runs Tasks. There is **no Kubernetes API** and **no SSH to the host**.

## Concepts

| Resource | Meaning |
|----------|---------|
| **Service** | Desired count + desired revision |
| **Revision** | Immutable config snapshot (image **digest**, CPU/RAM, ports, env, health) |
| **Deployment** | Internal rollout for update / scale / force redeploy / rollback (status + healthy counts) |
| **Task** | One running attempt with desired vs observed state |
| **Session** | Exec into a RUNNING Task (like managed remote access without SSH) |

## Create a service

1. Open **Containers** in the console.
2. Create a service: name, region, image (optional desired count > 1).
3. HomeCloud resolves the image to a digest, creates Revision 1, and reconciles Tasks on the managed pool.
4. Watch **Tasks** for `observed` state and any `failure_code` (for example `NO_CAPACITY`).

Updates create a **new Revision** and a **Deployment** — they never mutate old Revisions. **Force redeploy** keeps the same Revision and starts a new Deployment that replaces Tasks. **Rollback** points desired revision at a prior Revision. **Scale** changes `desired_count` without a new Revision.

## Access

- **Logs** — live and retained (capped) stdout/stderr for a Task.
- **Session** — requires `containers.exec`. Opens a short-lived capability into the container only. Your console JWT never enters the container.

## CLI / SDK

Requires a console session (`homecloud login`) — Containers live on `compute.{apex}` and accept JWT (Access Key SigV1 for Compute is a follow-on).

```bash
homecloud containers list
homecloud containers create my-web --image nginx:latest --region eu-central
homecloud containers scale <service-id> 3
homecloud containers force-redeploy <service-id>
homecloud containers rollback <service-id> <revision-id>
homecloud containers deployments <service-id>
homecloud containers tasks <service-id>
homecloud containers logs <task-id>
```

```python
from homecloud_sdk import HomeCloudClient

client = HomeCloudClient()  # after homecloud login
services = client.containers.list_services()
```

## Networking

Attach a Compute load balancer id on the service when you need a public endpoint. Only Tasks that are `RUNNING` **and healthy** receive traffic. Health is TCP or HTTP path on the Revision.

## vs Applications

| Containers | Applications |
|------------|----------------|
| Bring your image / runtime artifact | Bring application intent (frontend/backend/DB templates) |
| Execution primitive | Higher-level product on platform Kubernetes |

## Not in this product (yet)

Autoscaling, multi-container Tasks, privileged/host networking, customer “bring your own machines”, Kubernetes clusters.
