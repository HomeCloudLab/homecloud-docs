# מפתחות גישה (Access Keys)

מפתחות גישה מאמתים בקשות של **data plane** (SO, MQ, Secrets).

## יצירת מפתח

1. Console ← **IAM ← Access Keys ← Create**
2. בחרו הרשאות (`*`, `so:*`, `mq:*`, וכו')
3. העתיקו את **Access Key ID** (`HCAK…`) ואת ה-**Secret** (מוצג פעם אחת בלבד)

## הגדרת ה-CLI

=== "אינטראקטיבי"

    ```bash
    homecloud configure
    ```

=== "משתני סביבה"

    ```bash
    export HOMECLOUD_ACCESS_KEY_ID=HCAK...
    export HOMECLOUD_SECRET_ACCESS_KEY=...
    export HOMECLOUD_APEX=holab.abrdns.com
    ```

=== "לכל פקודה"

    ```bash
    homecloud --access-key-id HCAK... --secret-access-key ... so ls media
    ```

=== "ייבוא JSON"

    ```bash
    homecloud configure import credentials.json
    ```

!!! warning
    לעולם אל תשמרו סודות ב-git. השתמשו ב-secrets של GitHub Actions עבור CI/CD.

## מטמון Redis והפעלה מחדש ב-homelab

Postgres הוא **מקור האמת** למפתחות גישה. Redis הוא מטמון חולף.

אחרי הפעלה מחדש או flush ל-Redis:

- ה-API ממלא מחדש מפתחות בהפעלה
- SO/MQ/Secrets בונים מטמון בבקשה ראשונה דרך ensure פנימי
- הריצו `homelab-resync.sh` על המארח ל-rehydrate מלא

מפתחות שנוצרו **לפני** migration של `secret_encrypted` לא ניתנים לשחזור — בטלו ויצרו מחדש. ראו [מודל אבטחה — Access Keys](../platform/access-keys-security.md).

## דוגמת מדיניות (פריסה ל-SO)

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
