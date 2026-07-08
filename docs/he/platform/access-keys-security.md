# מודל אבטחה — Access Keys

Access Keys מאמתים בקשות **data plane** (SO, MQ, Secrets) באמצעות SigV1 HMAC. בזמן ריצה נדרש ה-**secret בטקסט גלוי** לאימות חתימות.

## מקור אמת (SoT)

| אחסון | תפקיד |
|-------|--------|
| **Postgres** (`access_keys`) | מטא-דאטה + `secret_encrypted` |
| **Redis** | מטמון חולף לאימות מהיר (ללא persistence ב-homelab) |

אחרי flush ל-Redis או הפעלה מחדש:

1. ה-API **ממלא מחדש** מפתחות פעילים בהפעלה
2. שירותי data plane קוראים ל-`POST /internal/access-keys/{id}/ensure-cached` ב-prom miss

## `secret_encrypted`

SigV1 לא עובד עם hash חד-כיווני בלבד. מפתחות חדשים שומרים:

- `secret_hash` — לביקורת/תצוגה (SHA-256)
- `secret_encrypted` — Fernet מופעל מ-`SECRET_KEY` של ה-API

בפרודקשן מומלץ KMS/HSM; ב-homelab משתמשים ב-Fernet לפשטות.

## נקודת ensure פנימית

לשימוש data plane בלבד — לא API ציבורי.

```http
POST /internal/access-keys/HCAK.../ensure-cached
X-Homecloud-Internal-Token: <token>
```

- **204** — המפתח ב-Redis
- **401** — טוקן שגוי/חסר
- **404** — חסר, בוטל, או לא ניתן לשחזור (מפתחות לפני migration)

טוקן: `INTERNAL_ACCESS_KEY_SYNC_TOKEN` ב-API (ברירת מחדל `SECRET_KEY`). ב-data plane אותו ערך (סקריפטי deploy מעבירים `SECRET_KEY` מ-`.env`).

## מפתחות STS (`HCSAK…`)

אישורי STS קצרי-טווח נשארים **רק ב-Redis** עם TTL. לא קוראים ל-ensure עבור `HCSAK`.

## מפתחות לפני migration

מפתחות שנוצרו לפני migration `016` ללא `secret_encrypted` — **לא ניתן לשחזר** אחרי אובדן Redis.

**פעולה:** בטל ויצור מחדש ב-Console → IAM → Access Keys, ועדכן secrets ב-GitHub/CI.

## resync ב-homelab

אחרי הפעלה מחדש:

```bash
/home/homelab/homecloud-platform/scripts/homelab-resync.sh
```

כולל `homelab-resync-access-keys.py`. rehydrate בהפעלת API מכסה את המקרה הרגיל; resync בטוח להרצה חוזרת.
