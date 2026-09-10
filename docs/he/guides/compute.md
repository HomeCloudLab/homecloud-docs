# Compute

Compute הוא שכבת ה-**IaaS** של HomeCloud: קונים **קונספט מכונה** באזור HomeCloud. HomeCloud הוא הענן. ספקי קיבולת נשארים מאחורי ה-API — לא שולחים שם ספק, SKU של ספק, או image id של ספק.

קונים `hc.general.small` ב-`eu-central`, לא “CX22 ב-Falkenstein”. מישור הבקרה בוחר **Provider Offering** בפנים. מחיר הלקוח הוא **USD**: FX(wholesale) × markup GTM (ברירת מחדל **2×**, תקרה **4×**). עלות הספק חיה על ה-Offering ואינה חוזרת ללקוח. שעות מכונה רצה מחויבות מה-snapshot של אותו offering, לא ממחיר קונספט גנרי.

Workspace בקונסול: **`/console/compute`** — טאבים **מכונות**, **מפתחות SSH**, **Security groups**, **Floating IPs**, **Load balancers** ו-**VPC** (VPC מסונן לפי יכולת), ו-workspace לפרטי מכונה (סקירה, רשת, סשן, קבצים, ביצועים, Snapshots). פקודות CLI/SDK יגיעו אחרי שהחוזה יתייצב.

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
| **VPC** | רשת IPv4 פרטית ברמת חשבון באזור HomeCloud (CIDR). לא שם “network” של ספק. |
| **Subnet** | חיתוך CIDR **בתוך** ה-CIDR של ה-VPC. מכונות מתחברות ל-subnet. |
| **NIC** | ממשק רשת של המכונה. Stage 6.1: לכל היותר **NIC פרטי אחד** (חיבור ל-subnet) למכונה; במלאי מופיע `nic.private_ip` אחרי חיבור. |

מכסת ברירת מחדל: **10 מכונות** בטבלת ה-quota הקיימת (`409 compute.quota_exceeded`). קיבולת אזור מלאה: `409 compute.capacity_exhausted`. מכסות VPC: **5 VPCs** ו-**20 subnets** לחשבון.

## Images

| `image_id` | חבילת Agent |
|------------|----------------|
| `ubuntu-24.04` | `homecloud-agent.deb` |
| `debian-12` | `homecloud-agent.deb` |
| `almalinux-9` | `homecloud-agent.rpm` |
| `windows-2022` | HomeCloud Agent (PowerShell `#ps1`) כשתמונת bootstrap מוכנה |

יוצרים עם `image_id` בלבד — המתאם ממפה בפנים. הלקוח לא שולח את ה-id של הספק.

**Windows הוא `image ∩ offering`, לא נתיב מוצר.** `GET /concepts?image_id=windows-2022` מסמן קונספט כ-`available` רק כשיש offering ב-placement שיודע לבוט אותו והצורה היא לפחות **4 GiB** RAM. הקונסול לא מחיל סינון Windows מקומי. יצירה של צורה קטנה מדי או placement בלי offering מתאים מחזירה `compute.invalid_image` / `compute.placement_unavailable`.

`windows-2022` נשאר `available=false` כשתמונת ה-bootstrap הפרטית לא מוגדרת **או כשה-UUID שמוגדר כבר לא קיים** ב-Scaleway. משתנה סביבה מת לא אמור למכור יצירה שנכשלת ב-404. `available=true` בקטלוג אומר ש־UUID חי קיים — לא ש־bootstrap של האורח או Agent ONLINE הוכחו. סשן עדיין דורש `agent_state=ONLINE`.

התקנת Agent ב-AlmaLinux משתמשת בקבוצת `wheel` (לא `sudo` של Ubuntu) וב-`pip` ל-`websocket-client`. סקריפט ה-Agent תואם **Python 3.9** (AlmaLinux 9; `datetime.UTC` רק מ-3.11). מכונות שנוצרו לפני ה-cloud-init הזה נשארות ב**השרת עולה** עד **rebuild**.

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
| `boot_disk_gb` | גודל דיסק אתחול ב-GB (בחירה חופשית). מינימום פלטפורמה **10** GB; מקסימום ממדיניות הקונספט. **חיוב לפי GB על כל הגודל**. |
| `data_disk_gb` | Volume נתונים בודד אופציונלי (תאימות). עדיף `data_disk_sizes`. |
| `data_disk_sizes` | רשימה אופציונלית של גדלי Volumes נתונים (GB כל אחד, בחירה חופשית, מינ׳ 10). עד 5. נדחה עם `compute.data_volume_unsupported` כשאין `volume_attach`. |

אחרי יצירה, `POST .../machines/{id}/volumes` עם `{ "size_gb": N }` מצרף volume נתונים נוסף.
| `security_group_ids` | קבוצות נוספות (default תמיד מחוברת). נדחה עם `compute.firewall_unsupported` כשאין firewall. |
| `ssh_key_ids` | מפתחות SSH של החשבון בהפעלה ראשונה. |

אין Offering מתאים: `400 compute.placement_unavailable` (לא שגיאת concept כללית). רשימה/GET של מכונות כוללים `operation_id`, `operation_status`, `operation_action` ו-`operation_progress` עבור ה-Operation האחרון. התקדמות ביצירה: ~10 (running), ~35 (לפני create אצל הספק), ~80 (אחרי), 100 (succeeded).

`region_code` הוא מיקום, לא ספק. `eu-central` יכול להתמלא על ידי יותר מ-Offering אחד. יצירה חיה דורשת טוקן מתאים ב-API. בלי קיבולת מוגדרת ה-Operation מסתיים ב-**FAILED** (עדיין HTTP 202) עם שגיאת HomeCloud — בלי שם ספק. `class` נשאר כינוי (`basic` → `hc.shared.small`, `standard` → `hc.general.small`).

רשימת קונספטים: `GET /api/v1/accounts/{id}/compute/concepts` (מחירי לקוח בלבד). מעבירים `image_id` כדי ש-`available` יהיה חיתוך image∩offering לאורח הזה (נדרש ליושר Windows).

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

Stop / reboot / delete עוברים בספק גם כש-`agent_state=OFFLINE`. מחיקה מסירה את המופע **וגם** את דיסק ה-boot ב-placement (כולל דיסקי block ברשת). מחיקת Load balancer ו-VPC ממתינה שהאובייקט אצל הספק ייעלם לפני ש-HomeCloud מוחק את השורה.

שינוי CPU/RAM הוא **Standard בלבד** ודורש מכונה **עצורה**:

`POST .../machines/{id}/resize` `{"vcpus":4,"memory_mb":4096}`

דיסק הוא **גידול בלבד**: `POST .../volumes/{volume_id}/resize` `{"size_gb":80}`.

## Firewall, volumes, snapshots

- **Security groups** הם מקור האמת ל-ingress (ברמת חשבון). מחברים ל**מכונה** ו/או ל-**NIC** פרטי (`target_type` `machine` | `nic`). כל כלל הוא TCP/UDP + פורט + **CIDR מקור** (למשל `0.0.0.0/0`, מארח ציבורי, או CIDR של VPC/subnet). דומיינים לא נתמכים.
- כללי האפקטיביים למכונה = **איחוד** הקבוצות המחוברות למכונה **ול-NICs** שלה (בלי כפילויות). בקיבולת Hetzner הנוכחית הדרייבר עדיין מחיל את האיחוד על firewall של ה**שרת** — מיקוד ל-NIC הוא SoT של HomeCloud לספקים עתידיים לפי ממשק.
- קבוצת **default** כוללת **TCP 22**. קבוצות נוספות **לא** כופות SSH — אפשר ליצור קבוצה ל-HTTPS בלבד.
- בקונסול: Compute → **Security groups** (יצירה מהירה בפופאפ; עריכה בעמוד מלא). הרשימה מציגה מכונות מחוברות. ניתוק מסיר את ה-firewall מה-VM אצל הספק; מחיקה מוחקת את אובייקט ה-firewall. מחיקה חסומה כל עוד הקבוצה מחוברת למכונה או NIC **חיים**. מחיקת מכונה מנתקת את הקבוצות שלה. חיבור למכונה שכבר נמחקה מנוקה ואינו חוסם מחיקה. `PUT .../machines/{id}/firewall` הוא shim תאימות שכותב לקבוצת **default**.
- API חיבור: `POST .../security-groups/{group_id}/attachments` `{"target_type":"machine"|"nic","target_id":"…"}`. קיצור מכונה `POST .../machines/{id}/security-groups/{group_id}` תמיד משתמש ב-`target_type=machine`.
- דרייברים בלי firewall אצל הספק (Scaleway כרגע) שומרים את המדיניות ב-HomeCloud ולא מתיימרים שהספק החיל אותה.
- IPv4 ציבורי מוקצה על NIC של המכונה; IPv4 פרטי מופיע אחרי [חיבור ל-subnet ב-VPC](#vpc-subnets-private-nic). מכונות חדשות ב-placement שמפרסם `ipv6` הן **dual-stack**: ה-NIC שומר גם `public_ipv6` שנצפה. מכונות קיימות נשארות IPv4 בלבד עד recreate. CIDR של VPC/subnet נשאר IPv4 — קידומת IPv6 אצל הספק אינה ה-subnet של HomeCloud. hostname על מכונה או LB ציבורי הוא **צירוף** (A/AAAA מהמשאב; Floating IP מועדף ל-A). ראו [דומיינים — שמות מארח ל-Compute](domains.md#compute-hostnames). `vip_address` של Load balancer נשאר IPv4; יעדי כתובת IPv6 נדחים אלא אם ה-placement מפרסם `lb_ipv6`.
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

Load Balancer ציבורי הוא **VIP** מול מכונות Compute. יעדים רצויים הם אובייקטי HomeCloud — `machine`, `nic` או `address` — לא מזהה שרת של ספק. `machine_ids` הוא קיצור ל-`{ "type": "machine", "id": "…" }`. המתאמים הנוכחיים מממשים **machine**, **nic** ו-**address** באזורים שה-offerings שלהם מפרסמים `load_balancer` (`eu-central` ו-`eu-west` היום). יעד **nic** משתמש ב-IPv4 הפרטי אחרי חיבור VPC; המתאם מחבר את **אותו** מוצר LB ציבורי ל-VPC (לא SKU נפרד). NIC בלי `private_ip` עדיין מדולג עד שהחיבור מסתיים. NIC ממספק אחר מחזיר `compute.unsupported_target`. היעדים חייבים לשתף **אזור** HomeCloud. ב-`eu-west` ה-LB יושב באותו אזור קיבולת כמו המכונה כדי שתעודות HTTPS ו-backends פרטיים יוכלו לעלות. אותו גוף create/update עובד בשני האזורים. פרוטוקולים: **TCP**, **HTTP** ו-**HTTPS**. HTTPS מסיים TLS ב-LB: מעבירים `hostname` DNS (לא מזהה תעודה של ספק) ומפנים רשומת **A** ל-VIP כדי שהתעודה המנוהלת תונפק. ה-backends נשארים HTTP. Listeners של HTTP/HTTPS מקבלים `sticky: true` (affinity בעוגייה; שם העוגיה נשאר במתאם). בדיקות HTTP מקבלות `path` (ברירת מחדל `/`). משקל ליעד אינו זמין ב-SKU הציבורי הנוכחי. מכסה: **5** לחשבון (`409 compute.load_balancer_quota`) וכוללת ציבורי + פנימי.

משמיטים `scheme` (או שולחים `public`) ל-VIP הציבורי של היום. `scheme` ו-`vpc_id` **לא משתנים** אחרי יצירה.

### VIP פנימי (`scheme=internal`)

Load balancer פנימי הוא **אותו** מוצר LB של HomeCloud עם VIP פרטי ב-**VPC של HomeCloud**. ה-domain הוא `vpc_id` + יעדי HomeCloud — לא «רשת Scaleway» ולא «רשת Hetzner». ה-underlay הוא פרט מימוש של ה-placement הנוכחי.

**ב-slice הזה:** חבילות באותו underlay נשארות על הבד המקורי. כש-overlay של ה-VPC `ready`, LB פנימי יכול לכוון `nic` / `machine` על underlay אחר של אותו `vpc_id`. עד שה-overlay מוכן, NIC שה-underlay לא מגיע אליו מחזיר `compute.unsupported_target` (או `compute.overlay_unavailable` אם overlay ב-`error`). Overlay לא מוסיף סוג ALB חדש ולא סוג יעד חדש.

**לא ב-slice הזה:** נגישות מהאינטרנט הציבורי, DNS פנימי של HomeCloud, HTTPS / תעודות מנוהלות (Let's Encrypt לא מנפיק ל-RFC1918), מוצר load balancer שני, VPN ללקוח, או peering בין VPCs.

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/load-balancers" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-int","region_code":"eu-west","scheme":"internal","vpc_id":"VPC_ID","listeners":[{"protocol":"http","port":80,"target_port":8080,"sticky":true}],"health_check":{"path":"/readyz"},"targets":[{"type":"nic","id":"NIC_ID"}]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-int","region_code":"eu-west","scheme":"internal","vpc_id":"VPC_ID","listeners":[{"protocol":"http","port":80,"target_port":8080,"sticky":true}],"health_check":{"path":"/readyz"},"targets":[{"type":"nic","id":"NIC_ID"}]}'
```

יעדים ריקים עדיין מחזירים **202** ומקצים VIP פרטי. מוכיחים תעבורה מ-NIC של מכונה באותו VPC — לקוח ציבורי לא אמור להגיע אליו.

| יכולת | ציבורי | פנימי |
|--------|--------|--------|
| `scheme` | `public` (ברירת מחדל) | `internal` (דורש `vpc_id`) |
| VIP | IPv4 ציבורי | IPv4 פרטי ב-CIDR של ה-VPC |
| Listeners | TCP, HTTP, HTTPS | TCP, HTTP |
| Sticky | HTTP / HTTPS | HTTP |
| Hetzner / Scaleway / stub | כן | `lb_internal` |
| OVH | לא | `compute.lb_internal_unsupported` |

תשובת הרשימה מוסיפה `can_create_internal` ליד `can_create`.

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

גוף `targets` שקול (אותו קיצור מכונה, וגם יעד address):

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-front","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080}],"targets":[{"type":"machine","id":"MACHINE_ID"},{"type":"address","address":"203.0.113.10"}]}'
```

יעד NIC פרטי (המכונה כבר מחוברת ל-subnet; משתמשים במזהה NIC של HomeCloud מהמלאי, לא ב-ref של ספק):

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/load-balancers" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-priv","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080}],"targets":[{"type":"nic","id":"NIC_ID"}]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-priv","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080}],"targets":[{"type":"nic","id":"NIC_ID"}]}'
```

סיום HTTPS (תעודה מנוהלת לשם DNS; ה-backends נשארים HTTP). היצירה מחזירה VIP **פעיל** גם אם התעודה עדיין ממתינה ל-DNS. חברו את ה-hostname ל-LB ב-[דומיינים → Hosts](domains.md#compute-hostnames) (או הפנו רשומת A ל-VIP), ואז **מעדכנים** את ה-LB (אותו גוף) כדי שהמתאם יחבר את התעודה:

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/load-balancers" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-tls","region_code":"eu-central","listeners":[{"protocol":"https","port":443,"target_port":8080,"hostname":"app.example.com"}],"machine_ids":["MACHINE_ID"]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-tls","region_code":"eu-central","listeners":[{"protocol":"https","port":443,"target_port":8080,"hostname":"app.example.com"}],"machine_ids":["MACHINE_ID"]}'
```

Sticky sessions (affinity בעוגיית HTTP ל-HTTP/HTTPS) ונתיב health:

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/load-balancers" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web-stick","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080,"sticky":true}],"health_check":{"protocol":"http","path":"/readyz"},"machine_ids":["MACHINE_ID"]}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/load-balancers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web-stick","region_code":"eu-central","listeners":[{"protocol":"http","port":80,"target_port":8080,"sticky":true}],"health_check":{"protocol":"http","path":"/readyz"},"machine_ids":["MACHINE_ID"]}'
```

| פעולה | בקשה |
|--------|---------|
| רשימה | `GET .../load-balancers?region_code=` (מציב `can_create` ו-`can_create_internal`) |
| קריאה | `GET .../load-balancers/{id}` |
| עדכון | `PUT .../load-balancers/{id}` `{ listeners, machine_ids }` או `{ targets }` (`scheme` / `vpc_id` לא משתנים) |
| מחיקה | `DELETE .../load-balancers/{id}` |

קריאות שינוי מחזירות **202** `{ load_balancer_id, operation_id }`.

| קוד | משמעות |
|------|---------|
| `compute.load_balancer_unsupported` | אין יכולת LB ב-placement |
| `compute.lb_internal_unsupported` | ה-placement לא יכול להשמיט את הממשק הציבורי (`lb_internal=false`) |
| `compute.load_balancer_quota` | בחשבון כבר יש 5 LBs |
| `compute.load_balancer_exists` | השם כבר בשימוש |
| `compute.load_balancer_region` | LB ויעדים באזורי HomeCloud שונים (פנימי + overlay `ready` יכולים לחצות אזורים מחוברים) |
| `compute.vpc_not_found` / `compute.vpc_busy` / `compute.vpc_region` | VPC של LB פנימי חסר, עדיין בעלייה, או באזור אחר |
| `compute.unsupported_target` | המתאם לא מממש את סוג היעד, היעד לא ב-VPC הזה, או שה-underlay הנוכחי לא מגיע אליו (overlay לא מוכן) |
| `compute.overlay_unavailable` | Overlay ב-`error`; לא מתייחסים ל-NIC המרוחק כ-backend בריא |
| `compute.invalid_targets` | רשימת יעדים לא תקינה, או כתובת מחוץ ל-CIDR של ה-VPC |
| `compute.invalid_listener` | פרוטוקול/פורט/hostname לא תקין, TCP+sticky, HTTPS על פנימי, או HTTPS/sticky לא זמין |

בקונסול: Compute → **Load balancers**. **מחק** בשורה משחרר את ה-VIP (`DELETE .../load-balancers/{id}`).

## VPC / subnets / private NIC

**VPC** הוא רשת IPv4 פרטית ברמת חשבון באזור HomeCloud. בוחרים CIDR (בדרך כלל RFC1918), חותכים **subnets** שחייבים לשבת **בתוך** ה-CIDR של ה-VPC, ואז **מחברים** מכונה ל-subnet (NIC פרטי אחד למכונה בגרסה זו). במלאי מופיעה הכתובת הפרטית ב-`nic.private_ip`. IPv4 ציבורי / Floating IP לא משתנים.

שער יכולת: placements עם `private_network` תומכים ב-VPC (`eu-central` ו-`eu-west` היום). placements אחרים מחזירים `compute.vpc_unsupported`, והקונסול **מסתיר** את טאב VPC כשאין אזור תומך — אותה כנות כמו Floating IP. אותו גוף create/attach עובד בשני האזורים (`machine_id` + `subnet_id`; לא מזהה רשת של ספק).

ב-`eu-west` מכונות, VPC ו-LB ציבורי שצריכים להתחבר (NIC פרטי או תעודות HTTPS) יושבים ב**אותו אזור קיבולת**. CIDR של VPC ב-placement הזה חייב להיות **`/29`–`/20`** (`compute.invalid_cidr` לקידומת רחבה כמו `/16`). `eu-central` עדיין מקבל fabrics של `/16`. subnet שנמצא בתוך ה-CIDR של ה-VPC נרשם גם כשה-placement לא יכול להוסיף קידומת ספק שנייה אחרי היצירה.

מכסות: **5 VPCs** ו-**20 subnets** לחשבון (`409 compute.vpc_quota` / `compute.subnet_quota`). חיבור subnet פרטי אחד למכונה.

### יצירת VPC

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/vpcs" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"app-net","region_code":"eu-central","cidr":"10.0.0.0/16"}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/vpcs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"app-net","region_code":"eu-central","cidr":"10.0.0.0/16"}'
```

### יצירת subnet

CIDR של subnet חייב להיות subnet של ה-CIDR של ה-VPC ולא לחפוף subnets אחים.

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/vpcs/$vpcId/subnets" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"name":"web","cidr":"10.0.1.0/24"}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/vpcs/$VPC_ID/subnets" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web","cidr":"10.0.1.0/24"}'
```

### חיבור / ניתוק מכונה

`POST .../machines` יכול לכלול `subnet_id` אופציונלי (אותו UUID כמו בחיבור). אחרי שהשרת קיים, Compute מזמן את אותו חיבור NIC כמו בסקירה. בלי השדה המכונה ציבורית בלבד. `subnet_id` דורש placement לפי **אזור** (לא flex) כדי שהמכונה תישאר באזור ה-VPC. הגוף מדבר רק `subnet_id` — לא `server_ref` של ספק.

`POST .../machines/{machine_id}/subnets/{subnet_id}` מחבר את ה-NIC הפרטי של המכונה (אותו אזור + placement כמו ה-VPC). `DELETE` באותו נתיב מנתק. קריאות שינוי מחזירות **202** `{ nic_id, machine_id, subnet_id, operation_id }` (בניתוק `subnet_id` מתאפס בתשובה).

| פעולה | בקשה |
|--------|---------|
| רשימת VPCs | `GET .../vpcs?region_code=` (מגדיר `can_create` ו-`can_bind_overlay` כשהאזור תומך) |
| קריאת VPC | `GET .../vpcs/{id}` (כולל `subnets`, `overlay_status`, `underlay_regions`) |
| יצירת VPC | `POST .../vpcs` `{ name, region_code, cidr, description? }` |
| חיבור overlay | `POST .../vpcs/{id}/underlays` `{ region_code }` — אזור HomeCloud בלבד; בלי מזהי ספק |
| מחיקת VPC | `DELETE .../vpcs/{id}` — subnets ריקים נמחקים יחד עם ה-VPC |
| רשימת subnets | `GET .../vpcs/{id}/subnets` |
| יצירת subnet | `POST .../vpcs/{id}/subnets` `{ name, cidr }` |
| מחיקת subnet | `DELETE .../vpcs/{id}/subnets/{subnet_id}` או `DELETE .../subnets/{subnet_id}` |
| יצירת מכונה (subnet אופציונלי) | `POST .../machines` `{ …, subnet_id? }` — חיבור אחרי שהשרת קיים |
| חיבור | `POST .../machines/{machine_id}/subnets/{subnet_id}` |
| ניתוק | `DELETE .../machines/{machine_id}/subnets/{subnet_id}` |

קריאות שינוי ל-VPC/subnet/NIC מחזירות **202** עם `operation_id`. מכונה ו-VPC חייבים לשתף **אזור** HomeCloud עד ש-overlay `ready` ל-binding שמכסה את אזור המכונה. אותו ספק הוא פרט מתאם: אם המתאם לא יכול לחבר את המכונה הוא מחזיר `compute.unsupported_target`.

### Overlay

VPC של HomeCloud הוא `vpc_id` + CIDR אחד. יצירה עדיין בוחרת אזור **בית** (underlay ראשון). Overlay מחבר אזור HomeCloud נוסף לאותו VPC כדי שחבילות פרטיות יוכלו לחצות fabrics. VIP פנימי נשאר אותו מוצר LB (`scheme=internal`); overlay **לא** ממציא ALB רב-ספקים.

`GET` מציג `overlay_status` (`absent` | `pending` | `ready` | `error`) ו-`underlay_regions` (קודי אזור HomeCloud בלבד — לא מזהי רשת של ספק).

יכולת `vpc_overlay`: אם false, `POST .../underlays` מחזיר `compute.overlay_unsupported`. ה-stub מממש שני fabrics בתהליך. placements של Hetzner ו-Scaleway נשארים כבויים עד שיהיו overlay gateways על ה-underlays האלה.

PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$env:HOMECLOUD_API/api/v1/accounts/$accountId/compute/vpcs/$vpcId/underlays" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body '{"region_code":"eu-central"}'
```

bash:

```bash
curl -sS -X POST "$HOMECLOUD_API/api/v1/accounts/$ACCOUNT_ID/compute/vpcs/$VPC_ID/underlays" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"region_code":"eu-central"}'
```

| קוד | משמעות |
|------|---------|
| `compute.vpc_unsupported` | אין יכולת רשת פרטית באזור/placement |
| `compute.vpc_quota` | בחשבון כבר יש 5 VPCs |
| `compute.subnet_quota` | בחשבון כבר יש 20 subnets |
| `compute.invalid_cidr` | CIDR לא תקין, או subnet לא בתוך CIDR של ה-VPC |
| `compute.subnet_overlap` | CIDR של subnet חופף subnet אחר ב-VPC |
| `compute.vpc_in_use` | מחיקה חסומה כל עוד למכונה יש NIC פרטי על ה-VPC |
| `compute.vpc_region` | מכונה ו-VPC באזורי HomeCloud שונים (עד ש-overlay `ready` ל-binding הזה) |
| `compute.overlay_unsupported` | ה-placement לא יכול לחבר underlay שני (`vpc_overlay=false`) |
| `compute.overlay_unavailable` | Overlay ב-`error` או שנתיב ה-gateway נעלם |
| `compute.overlay_bound` | אזור HomeCloud זה כבר מחובר ל-VPC |
| `compute.unsupported_target` | המתאם לא יכול לחבר את המכונה ל-fabric, או overlay לא מוכן ל-NIC חוצה-underlay |
| `compute.nic_busy` | חיבור/ניתוק עדיין בתהליך, או למכונה כבר יש subnet פרטי |
| `compute.subnet_busy` | ה-subnet עדיין ב-provisioning |
| `compute.vpc_not_found` / `compute.subnet_not_found` | מזהה לא מוכר |

בקונסול: Compute → **VPC** (כשהאזור שנבחר יכול ליצור). **מחק** זמין גם כשיש subnets ריקים — הם נמחקים עם ה-VPC. נתקו או מחקו מכונות מחוברות קודם אם המחיקה מחזירה `compute.vpc_in_use`. ב**יצירת מכונה** אפשר לבחור subnet אופציונלי כשיש `private_network` וה-placement הוא האזור הזה. ב**סקירה** של המכונה — IPv4 פרטי וחיבור/ניתוק כשה-placement תומך ברשת פרטית.

אחרי חיבור אפשר לחבר Security group ל-NIC: `POST .../security-groups/{group_id}/attachments` עם `{"target_type":"nic","target_id":"<nic_id>"}` (`nic_id` מתשובת החיבור).

## Agent

ה-Agent פותח TLS **יוצא** אל Compute. אורחים חדשים משתמשים ב-WebSocket `wss://…/internal/compute/agent/v1/connect` עם כותרת `X-Homecloud-Agent-Token` ו-`machine_id`. JWT של המשתמש מנוטרל בנקודה הזו ולא נכנס לאורח. HTTP `POST /internal/compute/agent/heartbeat` נשאר **נסיגה** לדיסקים ישנים עד rebuild. אין פורט Agent נכנס ציבורי. **אין API להסרה**.

אם היחידה כבויה, heartbeat `{ "enabled": false }` קובע `agent_state=OFFLINE` בזמן שה-VM יכול להישאר `RUNNING`. ניתוק הערוץ, או היעדר heartbeat כ־45 שניות, גם מציגים `OFFLINE`. `POST .../machines/{id}/repair` מנפיק מחדש זהות צומת **וסוגר** ערוץ חי; לא עוצר את ה-VM.

כלי אורח מנוהלים ב-IAM (צופה יכול לרשום/תצוגה מקדימה/הורדה; לא Session, exec או כתיבת קבצים):

| פעולה | הרשאה |
|--------|--------|
| רשימה / קריאה / הורדת קבצים | `compute.read` |
| סשן PTY ו-`POST …/exec` | `compute.terminal` (או `compute.update` ישן) |
| יצירה / העלאה / עריכה / mkdir / rename / העברה / מחיקה | `compute.files.write` (או `compute.update` ישן) |
| start / stop / rebuild / firewall | `compute.update` |

Exec וקבצים דורשים Agent **ONLINE**. כשהערוץ למעלה הם רצים כ-RPC (וסשן כ-PTY `stream.*`) על אותו socket:

- `POST .../machines/{id}/exec` `{"command":"hostname"}`
- `GET .../machines/{id}/files?path=/` — רשימה (שם, גודל, שינוי, תיקייה/קובץ)
- `GET .../machines/{id}/files/content?path=` — קריאת טקסט
- `PUT .../machines/{id}/files` `{"path","content"}` — יצירה או דריסה של טקסט
- `GET .../machines/{id}/files/blob?path=` — הורדה (עד 1 MiB)
- `POST .../machines/{id}/files/blob?path=` — העלאת בינארי (`write_b64` מקוטע, עד 32 MiB)
- `POST .../machines/{id}/files/mkdir` `{"path"}` — יצירת תיקייה
- `POST .../machines/{id}/files/rename` `{"path","dest"}` — שינוי שם או העברה של קובץ או תיקייה
- `DELETE .../machines/{id}/files?path=` — מחיקת קובץ או תיקייה (רקורסיבי כשהסוכן תומך)
- `GET .../machines/{id}/metrics/history?range=1h|24h|7d|30d` — סדרה עם downsample (Postgres של Compute, לא האורח)

אחרת `409 compute.agent_offline`.

טאב **סשן** לא מתחבר עד שבוחרים שיטה ולוחצים התחבר. מכונות לינוקס מציעות **מעטפת** (PTY). מכונות Windows מציגות גם **שולחן עבודה** (עדיין לא זמין). SSH `:22` נשאר break-glass ואינו שיטת סשן בקונסול. המעטפת המנוהלת מתחילה בשורש מערכת הקבצים (`/` בלינוקס, `C:\` ב-Windows) — אותו שורש כמו סייר הקבצים — לא תחת `$HOME`. משתמש הכניסה לפי ה-image (`ubuntu` / `debian` / `alma`); ה-prompt נראה כמו `ubuntu@hostname:/`. מכונות שנוצרו לפני השינוי עשויות להישאר על `homecloud` עד **rebuild**. שם מכונה ריק הופך ל־`i-{12 hex}` (ה-hostname עוקב).

מסך מלא מכסה את **כל הדפדפן**: בלי כותרת סשן, בלי שוליים בצדדים. סרגל הסשן החי נצמד לערכת הנושא של **עמוד** הקונסול (רקע, מסגרות וכפתורים) כדי שהפקדים יישארו קריאים — בערכת AWS זה פס בהיר עם פעולות כתומות, לא ה-chrome הכהה של שורת הכלים העליונה. בד הטרמינל נשאר כהה. Esc או יציאה ממסך מלא מחזירים בלי לנתק את הסשן. החיפוש בשורה נפרדת מתחת לסטטוס ולפעולות הסשן (רישיות / מילה שלמה / regex, מספר תוצאות, הקודם / הבא). הקלדה מחפשת. Ctrl+F ממקד אותו. החיבור נשאר כל עוד כרטיסיית הדפדפן גלויה (פינגים בפרוטוקול כל 20 שניות כדי שפרוקסי IDLE לא ינתק). עזיבת הכרטיסייה ל־**4 דקות** מנתקת ומציגה התחבר מחדש. סיום סשן, יציאה מטאב הסשן, או WebSocket שנפל גם סוגרים אותו. חוסר הקלדה לא סוגר. העתקה/הדבקה: תפריט ימני או **Ctrl+Shift+C** / Ctrl+V / **Ctrl+Shift+X**. **Ctrl+C** רגיל הוא תמיד SIGINT ל-shell (כמו SSH).

טאב **קבצים** יש שני מצבים (ההעדפה נשמרת מקומית):

- **סייר** — רשימה או רשת, כמו Object Storage. תיקיית ברירת המחדל היא שורש מערכת הקבצים (`/` או `C:\` ב-Windows). תיקיות נפתחות במקום. קבצים נפתחים ב-`/console/compute/{id}/file?path=` (Monaco, **שמירה ידנית** בלבד). תמונות בתצוגה מקדימה; קבצים גדולים או בינאריים להורדה.
- **VS Code** — עץ וטאבי עורך **בתוך** קבצים, באותו שורש. פתיחת קובץ לא עוזבת את הטאב. טאבים לא שמורים מסומנים; אין שמירה אוטומטית. בסרגל סביבת העבודה אותן פעולות **חדש**, **העלאה**, **גזור**, **העתק**, **הדבק**, **שינוי שם**, **הורדה** ו**מחיקה** כמו בסייר (חדש/העלאה/הדבק לתיקייה הממוקדת, או לתיקיית האב של הקובץ הממוקד). ערכת הנושא (עקוב אחרי קונסול / כהה / בהיר) חלה על העץ, הטאבים, שמירה ו-Monaco. ב־**JS / TS / JSON** יש שירות שפה מובנה של Monaco בדפדפן (השלמה ואבחנות). בשפות אחרות (כולל Python) יש בעיקר צבעי תחביר והשלמה לפי מילים במסמך — אין BasedPyright / LSP על קבצי האורח (בניגוד לפונקציות).

כללי שחרור כמו Object Storage: שחרור על **תיקייה** מעלה לתוכה, או **מעביר** פריטים שכבר בסייר/VS Code; שחרור על אזור ריק מעלה ל**תיקייה הנוכחית**; **קובץ** אינו יעד. שכבת ההעלאה המלאה מופיעה רק בגרירת קבצים מהמערכת. העלאת תיקייה מתפריט **העלאה** או בגרירת תיקייה. תקרה **32 MiB** לקובץ.

סרגל: תפריט **חדש** אחד (קובץ או תיקייה) ותפריט **העלאה** אחד (קבצים או תיקייה). **גזור**, **העתק**, **הדבק**, **שינוי שם**, **מחק** ו**הורדה** מופיעים אחרי בחירת פריטים (סייר), בעמוד הקובץ, או במיקוד/פתיחה ב-VS Code. הדבקה לתיקייה הנוכחית (סייר) או הממוקדת (VS Code). גזירה מעבירה קבצים ותיקיות דרך rename של הסוכן; העתקה מדביקה **קבצים בלבד**. לחיצה ימנית על קובץ או תיקייה בסייר (רשימה או רשת) או בעץ/טאבים של VS Code פותחת את הפעולות שרלוונטיות לפריט. במסך צר פעולות הסרגל הן אייקונים בלבד. שינוי שם הוא **באותה תיקייה** לקבצים ולתיקיות (RPC של `rename`). אפשר למחוק תיקיות באופן רקורסיבי כשהסוכן תומך; הורדה נשארת לקבצים בלבד (בלי zip מהקונסול).

סינון שמות חל על **הרשימה הנוכחית בלבד**. חיפוש בתוך קובץ הוא Ctrl+F של Monaco על קובץ שכבר נטען. אין grep על כל האורח.

נתיבי פלטפורמה מושמטים מהרשימה ונדחים בקריאה/כתיבה: `/etc/homecloud/**`, `/home/homecloud/**` (ישן), `/usr/local/bin/homecloud-agent`, יחידת systemd, ו-Windows `C:\ProgramData\HomeCloud\` ו-`C:\Users\homecloud\`. בתי משתמש הלקוח (`/home/ubuntu`, `/home/debian`, `/home/alma`) **אינם** ברשימת החסימה. שמות שמתחילים ב-`.` מוסתרים בסייר.

מכונות ישנות עשויות לדרוש **rebuild** כדי שהסוכן יכלול מחיקת תיקיות (`rmtree`) ואת עבודת ה-`rename` לשינוי שם/העברה בקונסול.

## ספקים

HomeCloud הוא הענן. בוחרים **קונספט** ו**אזור**. Offerings (Hetzner, Scaleway, בהמשך OVH) הם פנימיים. לא מריצים מכונות לקוח על שרת ה-control-plane ב-homelab. MDB, Mail, SO ו-MQ לא רצים על Compute.

## קונסול

| דף | נתיב |
|------|------|
| מכונות + מפתחות SSH + Security groups + Floating IPs + Load balancers + VPC | `/console/compute` |
| Workspace | `/console/compute/{machine_id}` |

טאבי שירות: **מכונות**, **מפתחות SSH**, **Security groups**, **Floating IPs**, **Load balancers**, **VPC** (מוסתר כשאין יכולת `private_network` באזור). רשימת המכונות **ברירת המחדל היא כל האזורים** כדי שמכונת Windows ב-`eu-west` לא תוסתר כשהכותרת על `eu-central` — הן ממשיכות לחייב. יצירה / VPC / LB נשארים לפי האזור שנבחר.

טאבי workspace של מכונה: **סקירה** (בריאות, גישה, resize — פעולות מחזור חיים בכותרת), **רשת** (Security groups / Floating IP / VPC כשה-placement תומך), **סשן**, **קבצים**, **ביצועים**, **Snapshots**. סשן וקבצים ממתינים לתגובת השרת. בזמן עבודה, תא **המצב** ברשימה וכותרת הפרטים מציגים **טבעת התקדמות** קומפקטית (מילוי קו, בלי אחוזים) ותג שלב קצר (provisioning, השרת עולה, עצירה, אתחול מחדש, …). הטבעת נעלמת כשה-VM Running והשרת מגיב. מצב תקוע בעליית השרת מופיע אחרי 20 דקות.

בלי `HETZNER_API_TOKEN` יצירה עדיין מחזירה HTTP 202; ה-Operation הוא **FAILED**.

## עדכונים חיים

Compute מפרסם `machine.updated`, `operation.updated`, `floating_ip.updated`, `load_balancer.updated`, `vpc.updated`, `subnet.updated` ו-`nic.updated` ל-Event Bus של ה-API. Realtime Gateway מפיץ אותם ב-**SSE**. לטאב בקונסול יש כבר זרם חשבון אחד; Compute נרשם לפילטר עליו ושולף את המכונה או הרשימה רק כשמגיע אירוע. כניסה ל-Compute לא פותחת חיבור SSE שני.

heartbeat של Agent (~כל 2 שניות) **לא** מפרסם `machine.updated` אלא אם נראות ה-Agent באמת השתנתה (`ONLINE` / `OFFLINE` / שגיאה). heartbeat שגרתי לא אמור לפתוח מחדש SSE או לפולל את רשימת המכונות.

פולינג HTTP הוא רק fallback כשזרם ה-SSE למטה, ורק בזמן שמכונה busy (provisioning, מחיקה, או boot עד ש-Agent ONLINE).

## היסטוריית ביצועים

ה-Agent נשאר חסר-מצב: `/proc` → צילום → heartbeat. Compute מחזיק את ההיסטוריה (`MetricsRepository` → Postgres). לוגים הם מחסן אחר בהמשך (ADR-046). לא כותבים סדרות על האורח.

שמירה: 15ש׳ גולמי ל-24ש׳, דקה ל-7י׳, 5ד׳ ל-30י׳, שעה ל-90י׳ (min/max/avg). רשת נשמרת כ-bytes/sec ב-ingest. טאב הביצועים מציג ארבעה גרפים עם בחירת טווח. אריחי הסיכום מציגים **שימוש / סה״כ (אחוז)** ל-CPU (מתוך vCPU מוקצה), RAM ודיסק; רשת מציגה קצב חי ב-KiB/s או MiB/s וסה״כ בתים שהועברו. מעבר עם הסמן על גרף משתמש באותן יחידות כמו הציר.

## שינויים שוברים

אין — Compute חדש. הקטלוג בקונסול כולל עכשיו את Compute.

## קשור

- [מפתחות SSH ומכונות ב-Terraform](../terraform/index.md) (`homecloud_compute_machine` / `homecloud_ssh_key`)
