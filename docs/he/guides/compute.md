# Compute

Compute הוא שכבת ה-**IaaS** של HomeCloud: קונים **קונספט מכונה** באזור HomeCloud. HomeCloud הוא הענן. ספקי קיבולת נשארים מאחורי ה-API — לא שולחים שם ספק, SKU של ספק, או image id של ספק.

קונים `hc.general.small` ב-`eu-central`, לא “CX22 ב-Falkenstein”. מישור הבקרה בוחר **Provider Offering** בפנים. מחיר הלקוח חי על הקונספט. עלות הספק חיה על ה-Offering ואינה חוזרת ללקוח.

Workspace בקונסול: **`/console/compute`** — טאבים **מכונות**, **מפתחות SSH**, **Security groups**, **Floating IPs** ו-**Load balancers**, ו-workspace לפרטי מכונה (סקירה, טרמינל, קבצים, ביצועים, Snapshots). פקודות CLI/SDK יגיעו אחרי שהחוזה יתייצב.

| פריט | ערך |
|------|--------|
| API | `/api/v1/accounts/{account_id}/compute` |
| Auth | JWT של סשן או Access Key (`compute.create` / `update` / `delete` / `read`) |
| Async | קריאות שינוי מחזירות **202** `{ machine_id, operation_id }` |
| Operation GET | `GET /api/v1/accounts/{account_id}/operations/{operation_id}` |

## מושגים

| מונח | משמעות |
|------|--------|
| **קונספט** | המוצר שקונים (`hc.shared.small`, `hc.general.small`): שיתוף CPU, ארכיטקטורה, סוג דיסק, locality, **מחיר לקוח** |
| **Machine** | VM באזור + AZ של HomeCloud |
| **Basic / Standard** | כינויי תאימות ל-persistence (`ephemeral` מול `volume`). עדיף `concept_id`. |
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

יוצרים עם `image_id` בלבד — המתאם ממפה בפנים. הלקוח לא שולח את ה-id של הספק.

**Windows Server אינו זמין מהקיבולת הנוכחית.** המימוש הנוכחי הוא Hetzner Cloud, ואין לו image מערכת של Windows. הקטלוג עדיין מציג `windows-2022`; יצירה נדחית עם `compute.concept_unavailable`.

התקנת Agent ב-AlmaLinux משתמשת בקבוצת `wheel` (לא `sudo` של Ubuntu) וב-`pip` ל-`websocket-client`. סקריפט ה-Agent תואם **Python 3.9** (AlmaLinux 9; `datetime.UTC` רק מ-3.11). אורחים שנוצרו לפני ה-cloud-init הזה נשארים ב**אורח בעלייה** עד **rebuild**.

## יצירה

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/machines" `
  -Headers @{ Authorization = "Bearer $token"; "Idempotency-Key" = "create-web-1" } `
  -ContentType "application/json" `
  -Body '{"name":"web-1","concept_id":"hc.general.small","image_id":"ubuntu-24.04","region_code":"eu-central","ssh_key_ids":["KEY_ID"]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/machines" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: create-web-1" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-1","concept_id":"hc.general.small","image_id":"ubuntu-24.04","region_code":"eu-central","ssh_key_ids":["KEY_ID"]}'
```

שדות יצירה אופציונליים:

| שדה | משמעות |
|-----|--------|
| `placement_scope` | `region` (ברירת מחדל) או `flex` (הזול ביותר באירופה). לא זמין ב-`homelab`. |
| `boot_disk_gb` | גודל דיסק אתחול בצעדי GB. המינימום הוא הדיסק הכלול בקונספט. |
| `data_disk_gb` | Volume נתונים מצורף אופציונלי. נדחה עם `compute.data_volume_unsupported` כשאין `volume_attach`. |
| `security_group_ids` | קבוצות נוספות (default תמיד מחוברת). נדחה עם `compute.firewall_unsupported` כשאין firewall. |
| `ssh_key_ids` | מפתחות SSH של החשבון בהפעלה ראשונה. |

אין Offering מתאים: `400 compute.placement_unavailable` (לא שגיאת concept כללית). רשימה/GET של מכונות כוללים `operation_id`, `operation_status`, `operation_action` ו-`operation_progress` עבור ה-Operation האחרון. התקדמות ביצירה: ~10 (running), ~35 (לפני create אצל הספק), ~80 (אחרי), 100 (succeeded).

`region_code` הוא מיקום, לא ספק. `eu-central` יכול להתמלא על ידי יותר מ-Offering אחד. יצירה חיה דורשת טוקן מתאים ב-API. בלי קיבולת מוגדרת ה-Operation מסתיים ב-**FAILED** (עדיין HTTP 202) עם שגיאת HomeCloud — בלי שם ספק. `class` נשאר כינוי (`basic` → `hc.shared.small`, `standard` → `hc.general.small`).

רשימת קונספטים: `GET /api/v1/accounts/{id}/compute/concepts` (מחירי לקוח בלבד).

אותו `Idempotency-Key` + אותו גוף מחזירים את אותו `machine_id` / `operation_id`.

## מפתחות SSH

מפתחות SSH הם **ברמת החשבון**, לא פר-מכונה. HomeCloud מייצר את זוג המפתחות. בוחרים **ED25519** (ברירת מחדל, מומלץ) או **RSA** (2048 / 3072 / 4096 ביט), כמו באופציות של AWS EC2. הקובץ **הפרטי** מוחזר **פעם אחת** ב-`POST .../compute/ssh-keys` ואינו נשמר. רשימה מחזירה שם, fingerprint, סוג ומפתח ציבורי בלבד. אותו מפתח אפשר להזריק לכמה מכונות דרך `ssh_key_ids`.

| Method | Path |
|--------|------|
| GET | `/api/v1/accounts/{id}/compute/ssh-keys` |
| POST | `/api/v1/accounts/{id}/compute/ssh-keys` `{"name":"laptop","key_type":"ed25519"}` → כולל `private_key` **פעם אחת** |
| DELETE | `/api/v1/accounts/{id}/compute/ssh-keys/{key_id}` |

`key_type` הוא `ed25519` (ברירת מחדל) או `rsa`. ל-RSA, `rsa_bits` יכול להיות `2048` (ברירת מחדל), `3072` או `4096`.

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

## Firewall, volumes, snapshots, Floating IP

- **Security groups** הם מקור האמת ל-ingress (ברמת חשבון; מחברים למכונות). קבוצת ברירת המחדל מאפשרת **TCP 22**. כללים נוספים: TCP/UDP בלבד.
- בקונסול: Compute → **Security groups**. `PUT .../machines/{id}/firewall` הוא shim תאימות שכותב לקבוצת **default** של החשבון.
- דרייברים בלי firewall אצל הספק (Scaleway כרגע) שומרים את המדיניות ב-HomeCloud ולא מתיימרים שהספק החיל אותה.
- מוקצה IPv4; IPv6 נשמר כ-null ולא נדרש.
- Snapshot ל-**volume** (`POST .../volumes/{id}/snapshots`), רשימה ב-`GET .../volumes/{id}/snapshots`, שחזור ל-**volume חדש** (`POST .../snapshots/{id}/restore`). לא snapshot של מכונה.

## Floating IP

Floating IP הוא **זהות רשת** שנשארת אחרי מכונה. מקצים באזור, ואז מחברים ל**מכונה אחת** באותו אזור. מחיקת המכונה **מנתקת** את הכתובת; **שחרור** מחזיר אותה לקיבולת. מכסה: **10** לחשבון (`409 compute.floating_ip_quota`).

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/floating-ips" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-public","region_code":"eu-central"}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/floating-ips" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-public","region_code":"eu-central"}'
```

| פעולה | בקשה |
|--------|---------|
| רשימה | `GET .../floating-ips?region_code=` (מציב `can_allocate`) |
| קריאה | `GET .../floating-ips/{id}` |
| חיבור | `POST .../floating-ips/{id}/associate` `{"machine_id":"..."}` |
| ניתוק | `POST .../floating-ips/{id}/disassociate` |
| שחרור | `DELETE .../floating-ips/{id}` |
| על מכונה | `GET .../machines/{id}/floating-ips` |

קריאות שינוי מחזירות **202** `{ floating_ip_id, operation_id }`. Recover מחבר מחדש Floating IPs ש-`desired_machine_id` שלהם עדיין המכונה הזו.

| קוד | משמעות |
|------|---------|
| `compute.floating_ip_unsupported` | אין יכולת Floating IP ב-placement |
| `compute.floating_ip_quota` | בחשבון כבר יש 10 Floating IPs |
| `compute.floating_ip_exists` | השם כבר בשימוש בחשבון |
| `compute.floating_ip_region` | ה-IP והמכונה באזורים שונים |
| `compute.floating_ip_provider` | ה-IP והמכונה אינם באותו placement קיבולת |
| `compute.floating_ip_attached` | למכונה כבר יש Floating IP |
| `compute.floating_ip_busy` | הקצאה/שחרור עדיין בתהליך |
| `compute.invalid_floating_ip_name` | השם אינו תואם את התבנית |
| `compute.floating_ip_not_found` | מזהה לא מוכר |

בקונסול: Compute → **Floating IPs**, וכרטיס בסקירת המכונה כשה-placement תומך.

## Load balancers

Load Balancer ציבורי הוא **VIP** מול מכונות Compute. היעדים נגישים ב-**IPv4 ציבורי** — Stage 5 לא דורש VPC. היעדים חייבים לשתף את **אותו placement קיבולת** כמו ה-LB (כמו Floating IP). פרוטוקולים בגרסה זו: **TCP** ו-**HTTP** (HTTPS בהמשך). מכסה: **5** לחשבון (`409 compute.load_balancer_quota`).

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/load-balancers" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-front","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080}],"machine_ids":["MACHINE_ID"]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-front","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080}],"machine_ids":["MACHINE_ID"]}'
```

| פעולה | בקשה |
|--------|---------|
| רשימה | `GET .../load-balancers?region_code=` (מציב `can_create`) |
| קריאה | `GET .../load-balancers/{id}` |
| עדכון | `PUT .../load-balancers/{id}` `{ listeners, machine_ids }` |
| מחיקה | `DELETE .../load-balancers/{id}` |

קריאות שינוי מחזירות **202** `{ load_balancer_id, operation_id }`.

| קוד | משמעות |
|------|---------|
| `compute.load_balancer_unsupported` | אין יכולת LB ב-placement |
| `compute.load_balancer_quota` | בחשבון כבר יש 5 LBs |
| `compute.load_balancer_exists` | השם כבר בשימוש |
| `compute.load_balancer_region` | LB ויעדים באזורים שונים |
| `compute.load_balancer_provider` | יעדים אינם באותו placement |
| `compute.load_balancer_target_ip` | למכונת יעד אין IPv4 ציבורי |
| `compute.invalid_listener` | פרוטוקול/פורט לא תקין |

בקונסול: Compute → **Load balancers**.

## Agent

ה-Agent פותח TLS **יוצא** אל Compute. אורחים חדשים משתמשים ב-WebSocket `wss://…/internal/compute/agent/v1/connect` עם כותרת `X-Homecloud-Agent-Token` ו-`machine_id`. JWT של המשתמש מנוטרל בנקודה הזו ולא נכנס לאורח. HTTP `POST /internal/compute/agent/heartbeat` נשאר **נסיגה** לדיסקים ישנים עד rebuild. אין פורט Agent נכנס ציבורי. **אין API להסרה**.

אם היחידה כבויה, heartbeat `{ "enabled": false }` קובע `agent_state=OFFLINE` בזמן שה-VM יכול להישאר `RUNNING`. ניתוק הערוץ, או היעדר heartbeat כ־45 שניות, גם מציגים `OFFLINE`. `POST .../machines/{id}/repair` מנפיק מחדש זהות צומת **וסוגר** ערוץ חי; לא עוצר את ה-VM.

כלי אורח מנוהלים ב-IAM (צופה יכול לרשום/תצוגה מקדימה/הורדה; לא Session, exec או כתיבת קבצים):

| פעולה | הרשאה |
|--------|--------|
| רשימה / קריאה / הורדת קבצים | `compute.read` |
| סשן PTY ו-`POST …/exec` | `compute.terminal` (או `compute.update` ישן) |
| יצירה / העלאה / עריכה / mkdir / מחיקה | `compute.files.write` (או `compute.update` ישן) |
| start / stop / rebuild / firewall | `compute.update` |

Exec וקבצים דורשים Agent **ONLINE**. כשהערוץ למעלה הם רצים כ-RPC (וסשן כ-PTY `stream.*`) על אותו socket:

- `POST .../machines/{id}/exec` `{"command":"hostname"}`
- `GET .../machines/{id}/files?path=/` — רשימה (שם, גודל, שינוי, תיקייה/קובץ)
- `GET .../machines/{id}/files/content?path=` — קריאת טקסט
- `PUT .../machines/{id}/files` `{"path","content"}` — יצירה או דריסה של טקסט
- `GET .../machines/{id}/files/blob?path=` — הורדה (עד 1 MiB)
- `POST .../machines/{id}/files/blob?path=` — העלאת בינארי (`write_b64` מקוטע, עד 32 MiB)
- `POST .../machines/{id}/files/mkdir` `{"path"}` — יצירת תיקייה
- `GET .../machines/{id}/metrics/history?range=1h|24h|7d|30d` — סדרה עם downsample (Postgres של Compute, לא האורח)

אחרת `409 compute.agent_offline`.

טאב **סשן** לא מתחבר עד שבוחרים שיטה ולוחצים התחבר. אורחי לינוקס מציעים **מעטפת Agent** (PTY). אורחי Windows מציגים גם **שולחן עבודה** (עדיין לא זמין). SSH `:22` נשאר break-glass ואינו שיטת סשן בקונסול.

מסך מלא מכסה את **כל הדפדפן**: בלי כותרת סשן, בלי שוליים בצדדים. סרגל הסשן החי נצמד לערכת הנושא של **עמוד** הקונסול (רקע, מסגרות וכפתורים) כדי שהפקדים יישארו קריאים — בערכת AWS זה פס בהיר עם פעולות כתומות, לא ה-chrome הכהה של שורת הכלים העליונה. בד הטרמינל נשאר כהה. Esc או יציאה ממסך מלא מחזירים בלי לנתק את הסשן. החיפוש בשורה נפרדת מתחת לסטטוס ולפעולות הסשן (רישיות / מילה שלמה / regex, מספר תוצאות, הקודם / הבא). הקלדה מחפשת. Ctrl+F ממקד אותו. החיבור נשאר כל עוד כרטיסיית הדפדפן גלויה (פינגים בפרוטוקול כל 20 שניות כדי שפרוקסי IDLE לא ינתק). עזיבת הכרטיסייה ל־**4 דקות** מנתקת ומציגה התחבר מחדש. סיום סשן, יציאה מטאב הסשן, WebSocket שנפל או Agent OFFLINE גם סוגרים אותו. חוסר הקלדה לא סוגר. העתקה/הדבקה: תפריט ימני או Ctrl+C / Ctrl+V / Ctrl+X (Ctrl+C מעתיק כשיש בחירה; אחרת SIGINT).

טאב **סייר** מציג תיקיות וקבצים (רשימה או רשת). יצירה, העלאה (גרירה, עד 32 MiB), mkdir, הורדה ומחיקת קבצים. העברת תיקיות אינה בגרסה זו. rebuild כדי לקבל `write_b64`.

## ספקים

HomeCloud הוא הענן. בוחרים **קונספט** ו**אזור**. Offerings (Hetzner, Scaleway, בהמשך OVH) הם פנימיים. לא מריצים מכונות לקוח על שרת ה-control-plane ב-homelab. MDB, Mail, SO ו-MQ לא רצים על Compute.

## קונסול

| דף | נתיב |
|------|------|
| מכונות + מפתחות SSH + Security groups + Floating IPs + Load balancers | `/console/compute` |
| Workspace | `/console/compute/{machine_id}` |

טאבי שירות: **מכונות**, **מפתחות SSH**, **Security groups**, **Floating IPs**, **Load balancers**. טאבי מכונה: **סקירה** (משולש בריאות, מחזור חיים, קבוצות מחוברות, Floating IP), **סשן** (בחירת מעטפת Agent ואז התחבר; מסך מלא קצה-לקצה), **סייר**, **ביצועים**, **Snapshots**. סשן וסייר דורשים `agent_state=ONLINE`. בלי `HETZNER_API_TOKEN` יצירה עדיין מחזירה HTTP 202; ה-Operation הוא **FAILED**.

## עדכונים חיים

Compute מפרסם `machine.updated`, `operation.updated`, `floating_ip.updated` ו-`load_balancer.updated` ל-Event Bus של ה-API. Realtime Gateway מפיץ אותם ב-**SSE**. לטאב בקונסול יש כבר זרם חשבון אחד; Compute נרשם לפילטר עליו ושולף את המכונה או הרשימה רק כשמגיע אירוע. כניסה ל-Compute לא פותחת חיבור SSE שני.

heartbeat של Agent (~כל 2 שניות) **לא** מפרסם `machine.updated` אלא אם נראות ה-Agent באמת השתנתה (`ONLINE` / `OFFLINE` / שגיאה). heartbeat שגרתי לא אמור לפתוח מחדש SSE או לפולל את רשימת המכונות.

פולינג HTTP הוא רק fallback כשזרם ה-SSE למטה, ורק בזמן שמכונה busy (provisioning, מחיקה, או boot עד ש-Agent ONLINE).

## היסטוריית ביצועים

ה-Agent נשאר חסר-מצב: `/proc` → צילום → heartbeat. Compute מחזיק את ההיסטוריה (`MetricsRepository` → Postgres). לוגים הם מחסן אחר בהמשך (ADR-046). לא כותבים סדרות על האורח.

שמירה: 15ש׳ גולמי ל-24ש׳, דקה ל-7י׳, 5ד׳ ל-30י׳, שעה ל-90י׳ (min/max/avg). רשת נשמרת כ-bytes/sec ב-ingest. טאב הביצועים מציג ארבעה גרפים עם בחירת טווח. אריחי הסיכום מציגים **שימוש / סה״כ (אחוז)** ל-CPU (מתוך vCPU מוקצה), RAM ודיסק; רשת מציגה קצב חי ב-KiB/s או MiB/s וסה״כ בתים שהועברו. מעבר עם הסמן על גרף משתמש באותן יחידות כמו הציר.

## שינויים שוברים

אין — Compute חדש. הקטלוג בקונסול כולל עכשיו את Compute.

## קשור

- [מפתחות SSH ומכונות ב-Terraform](../terraform/index.md) (`homecloud_compute_machine` / `homecloud_ssh_key`)
