# containers

Containers מנוהלים על `compute.{apex}`: Services, Tasks, Revisions ולוגים.

דורש סשן קונסול (`homecloud login`). Access Key SigV1 ל־Compute עדיין לא זמין.

```bash
homecloud containers list
homecloud containers create my-web --image nginx:latest --region eu-central
homecloud containers get SERVICE_ID
homecloud containers tasks SERVICE_ID
homecloud containers revisions SERVICE_ID
homecloud containers logs TASK_ID
homecloud containers delete SERVICE_ID
```

אפשרויות יצירה: `--image` (חובה), `--region`, `--cpu-milli`, `--memory-mib`, `--port`.

מדריך: [Containers](../../guides/containers.md).
