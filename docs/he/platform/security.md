# אבטחת פלטפורמה — MFA ו-impersonation

Phase 1b מוסיף **TOTP MFA** למנהלי פלטפורמה ו-**impersonation** לחשבונות tenant לצורכי תמיכה.

## MFA למנהל פלטפורמה

מנהלי פלטפורמה (`platform_role=platform_admin`) יכולים להירשם ל-TOTP דרך ה-API:

```http
POST /api/v1/auth/mfa/enroll
Authorization: Bearer <access_token>
```

אישור ההרשמה:

```http
POST /api/v1/auth/mfa/confirm
Authorization: Bearer <access_token>
Content-Type: application/json

{"code": "123456"}
```

כש-MFA מופעל, נדרש `mfa_code` תקף ב:

- התחברות (`POST /api/v1/auth/login`)
- יצירת חשבון tenant (`POST /api/v1/platform/accounts`)
- כניסה ל-impersonation (`POST /api/v1/platform/impersonation/accounts/{account_id}/enter`)

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
