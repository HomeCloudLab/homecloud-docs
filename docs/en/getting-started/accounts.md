# Accounts

Each HomeCloud **account** is an isolated namespace for apps, buckets, queues, and databases.

## Console

1. Log in at `https://console.{apex}`
2. Use the account switcher in the top bar
3. Invite team members via **IAM → Users**

## CLI

```bash
homecloud login --username alice
homecloud accounts list
homecloud accounts switch my-team
```

Access Keys belong to a single account. When you `homecloud configure`, the key's account is resolved automatically.
