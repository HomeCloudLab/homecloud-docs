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

כש-login מחזיר `MFA_REQUIRED`, התשובה כוללת `mfa_token`, `methods`, ו-`passkeys` (שמות להצגה). המשתמש **בוחר passkey**, רואה כרטיס אישור עם השם, ורק אז לוחץ **המשך** כדי לפתוח את חלון WebAuthn של הדפדפן — לא אוטומטי.

קוד TOTP וגיבוי מוזנים בשדה **OTP של 6 ספרות** (תיבות נפרדות, תמיכה בהדבקה). ניתן לעבור לקוד גיבוי דרך “השתמש בקוד גיבוי”. רישום passkey גם מציג כרטיס אישור לפני חלון הדפדפן.

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

## CLI עם MFA

ה-CLI תומך באותם גורמי MFA כמו הקונסול.

### טרמינל (TOTP / גיבוי)

```bash
homecloud login --username alice
# → Verification code: …
homecloud login --username alice --password '…' --mfa-code 123456
```

### דפדפן (passkeys / מפתחות אבטחה)

```bash
homecloud login --browser
```

| שלב | API |
|------|-----|
| התחלה | `POST /api/v1/auth/cli/session` |
| דף | `/auth/cli?session=…` |
| אישור | `POST /api/v1/auth/cli/session/{id}/approve` |
| סקר | `GET /api/v1/auth/cli/session/{id}` → JWT חד-פעמי |

סשנים חיים כ־10 דקות ב-Redis, חד-פעמיים, ולא שומרים `mfa_token` או קודים בדיסק.

## מלאי homelab ישן

לאחר migration, משאבי homelab מלפני multi-tenant נמצאים בחשבון platform admin (`settings.legacy_homelab=true`). tenants חדשים מתחילים ריקים.

## שינויי התנהגות

- `GET /api/v1/kubernetes/*` ו-`GET /api/v1/storage/*` דורשים **platform admin**; משתמשים רגילים משתמשים בנתיבים תחת `/api/v1/accounts/{account_id}/kubernetes/*`.
- מדיניות MinIO ב-bootstrap משתמשת ב-`so:*` עם prefix `{short_id}-` — לא `s3:*` גלובלי.
