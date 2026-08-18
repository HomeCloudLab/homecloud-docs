# Compute

Compute הוא שכבת ה-**IaaS** של HomeCloud: מכונות וירטואליות עם image של HomeCloud, SSH, volume (במחלקת Standard), ו-Agent של הפלטפורמה. HomeCloud הוא הענן. ספקי קיבולת (Hetzner ראשון) נשארים מאחורי ה-API — לא שולחים שם ספק ולא image id של ספק.

Workspace בקונסול: **`/console/compute`** — טאבים **מכונות** ו-**מפתחות SSH**, ו-workspace לפרטי מכונה (סקירה, טרמינל, קבצים, ביצועים, Snapshots). פקודות CLI/SDK יגיעו אחרי שהחוזה יתייצב.

| פריט | ערך |
|------|--------|
| API | `/api/v1/accounts/{account_id}/compute` |
| Auth | JWT של סשן או Access Key (`compute.create` / `update` / `delete` / `read`) |
| Async | קריאות שינוי מחזירות **202** `{ machine_id, operation_id }` |
| Operation GET | `GET /api/v1/accounts/{account_id}/operations/{operation_id}` |

## מושגים

| מונח | משמעות |
|------|--------|
| **Machine** | VM באזור + AZ של HomeCloud |
| **Basic** | דיסק מקומי. Rebuild מחליף את ה-VM. |
| **Standard** | volume אתחול קבוע. Recover מצמיד את אותו volume ל-VM חדש. |
| **Image** | מזהה HomeCloud בלבד: `ubuntu-24.04`, `debian-12`, `almalinux-9` |
| **Agent** | זהות צומת יוצאת (טוקן כרגע, mTLS בהמשך). JWT של המשתמש לא נכנס לאורח. |
| **Health triad** | `desired_state`, `provider_state`, `agent_state` — שלושה שדות, לא מחרוזת status אחת |
| **rebuild** | פעולת משתמש, אותו `machine_id` |
| **recover** | מישור הבקרה מחליף VM מת, שומר volumes |

מכסת ברירת מחדל: **10 מכונות** בטבלת ה-quota הקיימת (`409 compute.quota_exceeded`). קיבולת אזור מלאה: `409 compute.capacity_exhausted`.

## Images

| `image_id` | חבילת Agent |
|------------|----------------|
| `ubuntu-24.04` | `homecloud-agent.deb` |
| `debian-12` | `homecloud-agent.deb` |
| `almalinux-9` | `homecloud-agent.rpm` |

אין Windows. יוצרים עם `image_id` בלבד — המתאם ממפה בפנים.

## יצירה

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/machines" `
  -Headers @{ Authorization = "Bearer $token"; "Idempotency-Key" = "create-web-1" } `
  -ContentType "application/json" `
  -Body '{"name":"web-1","class":"standard","image_id":"ubuntu-24.04","region_code":"eu-central","ssh_key_ids":["KEY_ID"]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/machines" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: create-web-1" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-1","class":"standard","image_id":"ubuntu-24.04","region_code":"eu-central","ssh_key_ids":["KEY_ID"]}'
```

`region_code=eu-central` הוא קיבולת Hetzner (`fsn1`). יצירה חיה דורשת `HETZNER_API_TOKEN` על ה-API. בלי טוקן ה-Operation מסתיים ב-**FAILED** (עדיין HTTP 202) בלי קריאה לספק.

אותו `Idempotency-Key` + אותו גוף מחזירים את אותו `machine_id` / `operation_id`.

## מפתחות SSH

מפתחות SSH הם **ברמת החשבון**, לא פר-מכונה. HomeCloud מייצר מפתחות Ed25519. הקובץ **הפרטי** מוחזר **פעם אחת** ב-`POST .../compute/ssh-keys` ואינו נשמר. רשימה מחזירה שם, fingerprint ומפתח ציבורי בלבד. אותו מפתח אפשר להזריק לכמה מכונות דרך `ssh_key_ids`.

| Method | Path |
|--------|------|
| GET | `/api/v1/accounts/{id}/compute/ssh-keys` |
| POST | `/api/v1/accounts/{id}/compute/ssh-keys` `{"name":"laptop"}` → כולל `private_key` **פעם אחת** |
| DELETE | `/api/v1/accounts/{id}/compute/ssh-keys/{key_id}` |

יצירת מכונה עם `"ssh_key_ids": ["<uuid>"]`. מחרוזות `ssh_keys` ציבוריות עדיין מתקבלות לאוטומציה.

## מחזור חיים

| Method | Path | `action` |
|--------|------|--------------------|
| POST | `.../machines/{id}/start` | `start` |
| POST | `.../machines/{id}/stop` | `stop` |
| POST | `.../machines/{id}/reboot` | `reboot` |
| POST | `.../machines/{id}/rebuild` | `rebuild` |
| POST | `.../machines/{id}/recover` | `recover` |
| DELETE | `.../machines/{id}` | `delete` |

Stop / reboot / delete עוברים בספק גם כש-`agent_state=OFFLINE`.

שינוי CPU/RAM הוא **Standard בלבד** ודורש מכונה **עצורה**:

`POST .../machines/{id}/resize` `{"vcpus":4,"memory_mb":4096}`

דיסק הוא **גידול בלבד**: `POST .../volumes/{volume_id}/resize` `{"size_gb":80}`.

## Firewall, volumes, snapshots

- ברירת מחדל לכניסה **TCP 22**. כללים נוספים: TCP/UDP בלבד (`PUT .../machines/{id}/firewall`).
- מוקצה IPv4; IPv6 נשמר כ-null ולא נדרש.
- Snapshot ל-**volume** (`POST .../volumes/{id}/snapshots`), רשימה ב-`GET .../volumes/{id}/snapshots`, שחזור ל-**volume חדש** (`POST .../snapshots/{id}/restore`). לא snapshot של מכונה.

## Agent

ה-Agent פותח HTTPS **יוצא** אל `/internal/compute/agent/heartbeat` עם `X-Homecloud-Agent-Token`. אין פורט Agent נכנס ציבורי. **אין API להסרה**.

אם היחידה כבויה, heartbeat `{ "enabled": false }` קובע `agent_state=OFFLINE` בזמן שה-VM יכול להישאר `RUNNING` — ניהול מוחלש, לא מכונה מתה. `POST .../machines/{id}/repair` מנפיק מחדש זהות צומת ולא עוצר את ה-VM.

Exec וקבצים דורשים Agent **ONLINE**:

- `POST .../machines/{id}/exec` `{"command":"hostname"}`
- `GET/PUT .../machines/{id}/files`

אחרת `409 compute.agent_offline`.

## ספקים

HomeCloud הוא הענן. **Hetzner** הוא מתאם הקיבולת הראשון (אחר כך Scaleway, אחר כך OVH). לא מריצים מכונות לקוח על שרת ה-control-plane ב-homelab. MDB, Mail, SO ו-MQ לא רצים על Compute.

## קונסול

| דף | נתיב |
|------|------|
| מכונות + מפתחות SSH | `/console/compute` |
| Workspace | `/console/compute/{machine_id}` |

טאבי שירות: **מכונות**, **מפתחות SSH**. טאבי מכונה: **סקירה** (משולש בריאות, מחזור חיים, firewall), **טרמינל** (exec של Agent), **קבצים**, **ביצועים**, **Snapshots**. טרמינל וקבצים דורשים `agent_state=ONLINE`. בלי `HETZNER_API_TOKEN` יצירה עדיין מחזירה HTTP 202; ה-Operation הוא **FAILED**.

## שינויים שוברים

אין — Compute חדש. הקטלוג בקונסול כולל עכשיו את Compute.

## קשור

- [מפתחות SSH ומכונות ב-Terraform](../terraform/index.md) (`homecloud_compute_machine` / `homecloud_ssh_key`)
