# Containers

שירותי containers מנוהלים על **managed Compute pool** של HomeCloud. אתם מביאים image; HomeCloud מריץ Tasks. **אין Kubernetes API** ו**אין SSH ל־host**.

## מושגים

| משאב | משמעות |
|------|--------|
| **Service** | desired count + desired revision |
| **Revision** | snapshot בלתי משתנה (digest של image, CPU/RAM, ports, env, health) |
| **Deployment** | rollout פנימי ל־update / scale / force redeploy / rollback |
| **Task** | ניסיון ריצה עם desired מול observed |
| **Session** | exec ל־Task ב־RUNNING (גישה מנוהלת בלי SSH) |

## יצירת שירות

1. פתחו **Containers** בקונסול.
2. צרו שירות: שם, אזור, image (אופציונלי desired count > 1).
3. HomeCloud פותר digest, יוצר Revision 1, ומתאם Tasks על ה־pool.
4. עקבו אחרי **Tasks** — `observed` ו־`failure_code` (למשל `NO_CAPACITY`).

עדכון יוצר **Revision חדש** ו־**Deployment** — לא משנה Revisions ישנים. **Force redeploy** שומר על אותו Revision ופותח Deployment חדש. **Rollback** מצביע ל־Revision קודם. **Scale** משנה `desired_count` בלי Revision חדש.

## גישה

- **Logs** — חי ושמור (עם תקרה) ל־stdout/stderr של Task.
- **Session** — דורש `containers.exec`. capability קצר־חיים לתוך ה־container בלבד. JWT של הקונסול לא נכנס ל־container.

## CLI / SDK

דורש סשן קונסול (`homecloud login`) — Containers רצים על `compute.{apex}` ומקבלים JWT (Access Key SigV1 ל־Compute הוא המשך).

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

client = HomeCloudClient()  # אחרי homecloud login
services = client.containers.list_services()
```

## רשת

אפשר לשייך מזהה Load Balancer של Compute לשירות ל־endpoint ציבורי. רק Tasks ב־`RUNNING` **ו־healthy** מקבלים תעבורה. Health הוא TCP או HTTP path על ה־Revision.

## מול Applications

| Containers | Applications |
|------------|----------------|
| מביאים image / runtime | מביאים intent של אפליקציה (תבניות) |
| פרימיטיב של הרצה | מוצר ברמה גבוהה על Kubernetes של הפלטפורמה |

## לא במוצר הזה (עדיין)

Autoscaling, Tasks מרובי־containers, privileged/host networking, מכונות של הלקוח כ־capacity, אשכולות Kubernetes.
