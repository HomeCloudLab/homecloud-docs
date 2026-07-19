# תיעוד HomeCloud

ברוכים הבאים למרכז התיעוד של HomeCloud — מדריכי פלטפורמה, CLI ו-SDK.

**אתר חי:** [https://docs.web.holab.abrdns.com](https://docs.web.holab.abrdns.com)

## מה זה HomeCloud?

HomeCloud הוא control plane לענן מותאם homelab, הכולל:

| שירות | Zone | מטרה |
|-------|------|------|
| **Console** | `console.{apex}` | ממשק ווב + API של control plane |
| **SO** (אחסון אובייקטים) | `so.{apex}` / `{bucket}.web.{apex}` | אחסון תואם S3 + אתרים סטטיים |
| **MQ** | `mq.{apex}` | תורים להודעות |
| **MDB** | `mdb.{apex}` | מסדי נתונים מנוהלים |
| **Secrets** | `secrets.{apex}` | ניהול סודות |

## קישורים מהירים

- [התחלה](getting-started/overview.md)
- [התקנת CLI](cli/install.md)
- [פקודות CLI](cli/commands/index.md)
- [SDK](sdk/index.md)

## מאגרים

| מאגר | תיאור |
|------|--------|
| [homecloud-api](https://github.com/HomeCloudLab/homecloud-api) | Control plane API |
| [homecloud-ui](https://github.com/HomeCloudLab/homecloud-ui) | קונסולת ווב |
| [homecloud-cli](https://github.com/HomeCloudLab/homecloud-cli) | ממשק שורת פקודה |
| [homecloud-data-plane](https://github.com/HomeCloudLab/homecloud-data-plane) | שערי SO, MQ, MDB, Secrets |
| [homecloud-sdk](https://github.com/HomeCloudLab/homecloud-sdk) | SDK ל-Python |
| [homecloud-docs](https://github.com/HomeCloudLab/homecloud-docs) | אתר התיעוד הזה |
