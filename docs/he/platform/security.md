# אבטחת פלטפורמה — MFA ו-impersonation

Phase 1b מוסיף **אימות רב-שלבי** למנהלי פלטפורמה ו-**impersonation** לחשבונות tenant.

## MFA — Console + API

פתח **חשבון** מהסרגל (`/console/account`) — דף אחד עם טאבים: פרופיל וחשבון, אבטחה (MFA, QR, passkeys, sessions), חברים, משתמשי פלטפורמה, מפתחות גישה, יומן.

**חברים** = מי מורשה ב-**חשבון tenant הנוכחי**. **משתמשי פלטפורמה** = זהויות גלובליות ב-HomeCloud (root).

| שיטה | תיאור |
|------|--------|
| **TOTP** | Google Authenticator, 1Password, Authy — הרשמה עם **QR** |
| **Passkey (WebAuthn)** | מפתח בדפדפן/מכשיר — **ללא הגבלה**, ניתן למחוק |
| **Backup codes** | קודי חירום חד-פעמיים |

נדרש `mfa_code` **או** `mfa_webauthn` ב-login, יצירת tenant ו-enter account.

כש-login מחזיר `MFA_REQUIRED`, התשובה כוללת `mfa_token`, `methods`, ו-`passkeys` (שמות להצגה). המשתמש לוחץ **המשך עם passkey** כדי לפתוח את חלון הדפדפן — לא אוטומטי.

```http
POST /api/v1/auth/mfa/webauthn/login/options
Content-Type: application/json

{"mfa_token": "<token>"}
```

Passkeys משתמשים ב-RP ID מה-hostname של `CONSOLE_PUBLIC_URL` (למשל `console.holab.abrdns.com`).

## Impersonation

מנהל פלטפורמה יכול לפעול בתוך חשבון tenant. הזרימה מנפיקה JWT עם `impersonating_account_id`, כותבת audit (`impersonation.start` / `impersonation.end`), והקונסולה מציגה באנר כתום.

בקונסולה לוחצים **כניסה לחשבון** בשורת החשבון (או בדף הפרטים). כש-MFA מופעל, הקונסולה מבקשת קוד TOTP או קוד גיבוי לפני הכניסה, ומציגה באנר כתום עד היציאה.

יציאה:

```http
POST /api/v1/platform/impersonation/exit
Authorization: Bearer <impersonation_token>
```

## מלאי homelab ישן

לאחר migration, משאבי homelab מלפני multi-tenant נמצאים בחשבון platform admin (`settings.legacy_homelab=true`). tenants חדשים מתחילים ריקים.

## שינויי התנהגות

- `GET /api/v1/kubernetes/*` ו-`GET /api/v1/storage/*` דורשים **platform admin**; משתמשים רגילים משתמשים בנתיבים תחת `/api/v1/accounts/{account_id}/kubernetes/*`.
- מדיניות MinIO ב-bootstrap משתמשת ב-`so:*` עם prefix `{short_id}-` — לא `s3:*` גלובלי.
