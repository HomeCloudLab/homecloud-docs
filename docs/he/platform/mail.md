# דואר (Mail)

HomeCloud Mail הוא שירות דואר ב-control plane מעל מנוע **Stalwart**.

## ארכיטקטורה

| שכבה | תפקיד |
|------|--------|
| Console `/console/mail` | רשימת תיבות + כרטיס מטא-דאטה של השירות |
| Console `/console/mail/{mailboxId}` | Inbox / Sent / Compose לתיבה |
| `homecloud-api` `/accounts/{id}/mail/*` | JWT + metadata ב-Postgres |
| Stalwart (K3s) | SMTP/IMAP + תוכן ההודעה (מקור האמת) |

גופים וקבצים מצורפים **לא** נשמרים ב-Postgres.

## ניווט בקונסול

אותו דפוס כמו SO / Queues: **רשימה → פרטי משאב**.

1. **`/console/mail`** — טבלת תיבות (תוכן ראשי), כפתור **צור תיבה**, ופאנל מתקפל **סטטוס שירות ו-DNS** (בריאות מנוע, דומיין/hostname/IP, transport, DNS לקריאה בלבד).
2. **`/console/mail/{mailboxId}`** — כניסה לתיבה:
   - **Inbox** — סנכרון pull מ-IMAP (`direction=INBOUND`)
   - **Sent** — הודעות שנשלחו מ-Compose (`direction=OUTBOUND`, metadata ב-CP; עדיין לא תיקיית Sent ב-IMAP)
   - **Compose** — שליחה **מתוך אותה תיבה בלבד**

אין טאבים גלובליים של Messages / Domains / Settings בעמוד הרשימה.
חלק הסטטוס מקופל כברירת מחדל כדי שהתיבות יישארו במרכז.

## Phase 1

- דומיין **פלטפורמה** אחד מ-`MAIL_DOMAIN` (שורה ב-DB)
- יצירה/מחיקת תיבות בחשבון Platform Mail
- שליחה מתוך תיבה + קבלה (pull ב-IMAP ב-Inbox)
- רמזי DNS בכרטיס המטא-דאטה ברשימה
- גיבוי: hook בלבד — יעד יוגדר בהמשך

## לא ב-Phase 1 (בהמשך)

- **תבניות שליחה HBS** ורכיבים/חתימות מותאמים
- העברת ניהול DNS של הדואר ל-**Account → Domains**
- תיקיית Sent ב-IMAP / webmail מלא
- spam, אוטומציה, דומיינים ל-tenant
- Access Key gateway
- webhook inbound
- מעבר OTP/invites ל-`noreply@`

## Config

ראה את עמוד ה-EN לפרטי env ודוגמאות API. פתחו בראוטר **25 / 465 / 587**; אל תחשפו את פורט הניהול הציבורי.

!!! note "Stalwart 0.16 — listeners"
    ב-Stalwart 0.16 הגדרות listeners נשמרות ב-data store ולא ב-`config.json`.
    IMAP (143) ו-submission (587) **לא** נוצרים בברירת מחדל — יש ליצור אותם
    דרך JMAP (`x:NetworkListener/set`) או WebUI ולהפעיל מחדש את ה-pod.
    ה-Helm chart חושף `hostPort: 143` ו-`hostPort: 993` כדי שה-API על ה-host יגיע ל-IMAP.
