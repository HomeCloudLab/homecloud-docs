# Access Keys

Access Keys מאמתים עבודת **data-plane** (Object Storage, Message Queues, Secrets, Image Registry, ריצה של SDK/CLI) **וגם** ניהול פרוגרמטי של ה-console API (Terraform / CI — [Terraform](../terraform/index.md)).

הם **לא** סיסמת הקונסול. צרו אותם פעם אחת, שמרו את ה-secret בבטחה, והשתמשו בהם ב-CI ובשרתים. בקשות חתומות עם Access Key **לא** מבקשות MFA.

## יצירת מפתח בקונסול

1. פתחו **IAM → Access Keys** (או **Account → Access keys**).  
2. לחצו **Create**.  
3. בחרו שם והרשאות (למשל `*` לגישה מלאה במעבדה, או פעולות מוגבלות כמו `so:*` / `mq:*`).  
4. העתיקו:

   - **Access Key ID** — מתחיל ב-`HCAK…`  
   - **Secret access key** — מוצג **פעם אחת**

אם איבדתם את ה-secret, בטלו את המפתח וצרו חדש. לא ניתן לשחזר את ה-secret אחר כך.

## הגדרת ה-CLI

=== "אשף אינטראקטיבי"

    ```bash
    homecloud configure
    ```

    הזינו Access Key ID, secret ודומיין apex כשמתבקשים. האישורים נשמרים תחת `~/.homecloud/credentials` (JSON מרובה־פרופילים).

=== "משתני סביבה"

    ```bash
    export HOMECLOUD_ACCESS_KEY_ID=HCAK...
    export HOMECLOUD_SECRET_ACCESS_KEY=...
    export HOMECLOUD_APEX=holab.abrdns.com
    ```

    הצורות הקצרות `HC_ACCESS_KEY_ID`, `HC_SECRET_ACCESS_KEY`, `HC_APEX` גם עובדות.

=== "לפי פקודה"

    ```bash
    homecloud --access-key-id HCAK... --secret-access-key '...' so ls media
    ```

=== "ייבוא JSON"

    ```bash
    homecloud configure import credentials.json
    ```

## שימוש מה-SDK

=== "Python"

    ```python
    from homecloud import HomeCloud

    client = HomeCloud(
        access_key="HCAK...",
        secret_key="...",
    )
    # or: HomeCloud.from_env()
    # or: HomeCloud()  # reads ~/.homecloud/credentials
    ```

=== "Node.js"

    ```js
    const { HomeCloud } = require("@homecloud-platform/sdk");

    const client = new HomeCloud({
      accessKeyId: process.env.HC_ACCESS_KEY_ID,
      secretAccessKey: process.env.HC_SECRET_ACCESS_KEY,
      apex: process.env.HC_APEX,
    });
    ```

## הרשאה מינימלית (מומלץ)

העדיפו מדיניות מוגבלת על פני `*` בפרודקשן. דוגמה: לאפשר למפתח פריסה לעדכן רק bucket אחד של אתר סטטי:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["so:ListBucket", "so:PutObject", "so:DeleteObject"],
      "Resource": [
        "arn:holab:so:::my-website",
        "arn:holab:so:::my-website/*"
      ]
    }
  ]
}
```

צירפו מדיניות דרך **IAM → Policies / Roles**. ראו [IAM](../guides/iam.md) לתפקידים, מתחילי מדיניות מנוהלת, ואיך Functions מניחים תפקידים.

## התחברות לקונסול מול Access Key

| משימה | השתמשו ב |
|-------|----------|
| יצירת bucket או תור בממשק | סשן קונסול |
| `homecloud queues list` / `homecloud so ls-buckets` | `homecloud login` (JWT) |
| `homecloud so cp` / `so sync` / `mq send` | Access Key |
| פריסת אתר סטטי ב-CI | Access Key ב-secrets של GitHub Actions |
| גלישה יומיומית בדפדפן | סשן קונסול + MFA |

לעיתים קרובות משתמשים ב**שניהם**: login לרשימות ניהול, Access Key להעברות.

!!! warning "לעולם אל תעלו סודות ל-git"
    אל תשימו secret של Access Key ב-git. השתמשו במאגר הסודות של ה-CI (`GitHub Actions` secrets וכו').

## פתרון בעיות

| תסמין | מה לנסות |
|-------|----------|
| `401` / unauthorized ב-`so` / `mq` | מפתח/secret שגויים, או מפתח שבוטל; הריצו מחדש `homecloud configure` |
| `403` / permission denied | מדיניות המפתח צרה מדי; בדקו מדיניות IAM |
| עובד בקונסול אבל ה-CLI נכשל | קריאת ניהול דורשת `homecloud login`; קריאת data-plane דורשת Access Key |
| מפתח ישן אחרי flush ל-Redis של הפלטפורמה | מפתחות חיים במסד הנתונים; המטמון נבנה מחדש אוטומטית. אם מפתח ישן מאוד קדם להעברת הצפנה, בטלו וצרו מחדש |

## קשור

- [אימות ב-CLI](../cli/authentication.md)  
- [מדריך IAM](../guides/iam.md)  
- [SDK](../sdk/index.md)  
