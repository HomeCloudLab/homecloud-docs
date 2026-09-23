# containers

Managed Containers on `compute.{apex}`: Services, Tasks, Revisions, and logs.

Requires a console session (`homecloud login`). Access Key SigV1 to Compute is not available yet.

```bash
homecloud containers list
homecloud containers create my-web --image nginx:latest --region eu-central
homecloud containers get SERVICE_ID
homecloud containers tasks SERVICE_ID
homecloud containers revisions SERVICE_ID
homecloud containers logs TASK_ID
homecloud containers delete SERVICE_ID
```

Create options: `--image` (required), `--region`, `--cpu-milli`, `--memory-mib`, `--port`.

Guide: [Containers](../../guides/containers.md).
