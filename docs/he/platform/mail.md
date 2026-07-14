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

1. **`/console/mail`** — כל התיבות, **צור תיבה**, כרטיס **סטטוס והגדרות** אחד (בריאות מנוע, דומיין/hostname/IP, transport, DNS לקריאה בלבד).
2. **`/console/mail/{mailboxId}`** — כניסה לתיבה:
   - **Inbox** — סנכרון pull מ-IMAP (`direction=INBOUND`)
   - **Sent** — הודעות שנשלחו מ-Compose (`direction=OUTBOUND`, metadata ב-CP; עדיין לא תיקיית Sent ב-IMAP)
   - **Compose** — שליחה **מתוך אותה תיבה בלבד**

אין טאבים גלובליים של Messages / Domains / Settings בעמוד הרשימה.

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
