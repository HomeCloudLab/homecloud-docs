# חשבונות

כל **חשבון** ב-HomeCloud הוא מרחב שמות מבודד עבור אפליקציות, buckets, תורים ומסדי נתונים.

## Console

1. התחברו בכתובת `https://console.{apex}`
2. השתמשו במחליף החשבונות בסרגל העליון
3. הזמינו חברי צוות דרך **IAM ← Users**

## CLI

```bash
homecloud login --username alice
homecloud accounts list
homecloud accounts switch my-team
```

מפתחות גישה (Access Keys) שייכים לחשבון יחיד. כשמריצים `homecloud configure`, החשבון של המפתח מזוהה אוטומטית.
