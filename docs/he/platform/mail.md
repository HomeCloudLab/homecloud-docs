# דואר (Mail)

HomeCloud Mail הוא שירות דואר ב-control plane מעל מנוע **Stalwart**.

## ארכיטקטורה

| שכבה | תפקיד |
|------|--------|
| Console `/console/mail` | דומיינים, תיבות, שליחה, רשימת הודעות |
| `homecloud-api` `/accounts/{id}/mail/*` | JWT + metadata ב-Postgres |
| Stalwart (K3s) | SMTP/IMAP + תוכן ההודעה (מקור האמת) |

גופים וקבצים מצורפים **לא** נשמרים ב-Postgres.

## Phase 1

- דומיין **פלטפורמה** אחד מ-`MAIL_DOMAIN` (שורה ב-DB)
- יצירה/מחיקת תיבות בחשבון Platform Mail
- שליחה + קבלה (pull ב-IMAP)
- לוח DNS
- גיבוי: hook בלבד — יעד יוגדר בהמשך

## לא ב-Phase 1

Webmail, spam, אוטומציה, דומיינים ל-tenant, Access Key gateway, webhook inbound, מעבר OTP ל-`noreply@`.

## Config

ראה את עמוד ה-EN לפרטי env ודוגמאות API. פתחו בראוטר **25 / 465 / 587**; אל תחשפו את פורט הניהול הציבורי.
