# SDK

!!! info "בקרוב"
    ה-SDK של HomeCloud ל-Python (`homecloud-sdk`) מובנה כיום בתוך `homecloud-cli`. חבילת SDK עצמאית ועיון API מלא יפורסמו כאן.

## חלקים מתוכננים

- התקנה (`pip install homecloud-sdk`)
- סקירת `HomeCloudClient`
- ‏APIs של שירותים: `storage`, `mq`, `queues`, `accounts`, `secrets`
- אימות ופרופילים
- ניהול גרסאות ויומן שינויים

## שימוש נוכחי (דרך חבילת ה-CLI)

```python
from homecloud_sdk import HomeCloudClient

client = HomeCloudClient()
client.configure(access_key_id="HCAK...", secret_access_key="...")
client.so.sync_local_to_bucket("./dist", "my-bucket", delete=True)  # דורס כברירת מחדל
client.so.sync_local_to_bucket("./dist", "my-bucket", skip=True)  # דילוג לפי גודל
```

לעיון ב-API העדכני ביותר, ראו את קוד המקור של [homecloud-cli](https://github.com/HomeCloudLab/homecloud-cli).
