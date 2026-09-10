# Billing

**Billing** הוא שירות קונסול עצמאי (`/console/billing`). **Billing Explorer** משתמש בלוגיקת ניתוח בסגנון Cost Explorer (טווח תאריכים, מגמה, לפי שירות) עם עיצוב HomeCloud — לא העתקה ויזואלית של AWS.

המטר שומר **כמויות בלבד**. Billing עושה `שימוש × מחיר מחירון נטו ב-USD = חיוב`. מע״מ הוא שורה נפרדת בחשבונית — לא בתוך מחירי SKU. חשבוניות עדיין מופקות. תשלום בכרטיס עדיין לא פעיל — סימון שולם ידני בלבד. נתיב PDF: `so://billing/{account_id}/{period}.pdf`.

**Compute** מחויב ממחירון Compute: wholesale של הספק → FX (EURUSD) → markup בטווח **2×–4×** (ברירת מחדל **2×**). שעות מכונה לפי ה-**Offering/SKU שמומש** (`offering_id`), ב-snapshot ב-USD. שירותים אחרים (SO, MQ, Mail, …) עדיין עשויים להשתמש במחירי placeholder עד שיהיה להם wholesale.

### מטרים של Compute

| מטר | מה מחויב |
|--------|----------------|
| `compute.machine.hours` | מכונה RUNNING × זמן, במחיר ה-snapshot מה-offering |
| `compute.volume.gb_hours` | GiB ווליום × זמן |
| `compute.snapshot.gb_hours` | GiB snapshot × זמן |
| `compute.lb.hours` | LB פעיל × זמן |
| `compute.vpc.hours` | VPC פעיל × זמן (לעיתים **$0** אם הרשת אצל הספק חינם) |
| `compute.fip.hours` | Floating IP מוקצה × זמן |
| `compute.egress.gb` | GiB יציאה שנצפה ב-Compute |

IPv4 דביק על NIC אינו SKU של reserved IP. שערי overlay אינם מכונות לקוח ואינם מחויבים. אין SKU נפרד לכתובת IPv6.

**נוסחה אחת, שורה אחת לכל סוג SKU.** כל מטר Compute עובר את אותו צינור מחירון: `FX(wholesale) × GTM markup (2×–4×)`. Billing מחשב כל מכונה לפי snapshot ה-offering (תוספות לפי הקטלוג), ואז **מקפל שורות Explorer וחשבונית לפי מדד** — לא לפי VM או ווליום. שעות מכל המכונות מצטרפות לשורת `compute.machine.hours` אחת (מחיר יחידה ממוצע אם ה-offerings שונים). ווליום, snapshot, LB, VPC, FIP ויציאה — כל אחד כמות כוללת × מחיר קטלוג. המטר עדיין יכול לשמור `resource_arn` לצורך snapshot; זו לא שורת פירוט.

מחיקת VM **לא** מוחקת את שעות המטר. Billing ממשיך לחשב מחיר מה-resource בפלטפורמה (`offering_id` ב-`desired_spec`, ו-snapshot דביק ב-USD כשהמכונה נמחקת מהמלאי). ימים עם שימוש נשארים בגרף — לא $0 רק כי שורת המלאי נמחקה.

## איך נרשם שימוש

המטר הוא ה-ledger היחיד. הוא שומר **כמויות**, לא מחירים. פעולת המשתמש לא ממתינה למטר.

`usage.refresh` הוא **רמז dirty בלבד** — הוא לא יוצר אירוע חיוב. Worker נועל את ה-watermark (`lock → קריאת last_size/last_at → חישוב → כתיבת usage + watermark` באותה טרנזקציה), כך שרענונים כפולים לא מכפילים חיוב. ה-hint מתפרסם ב-subject פנימי `hc.usage.refresh` (queue group), **לא** על `hc.events.>` (SSE לדפדפן).

אם ה-hint נפל, ה-**hourly checkpoint** או reconcile חתום עדיין משחזרים ממצב עמיד (fail-open).

```text
עובדה עסקית (commit) → חזרה מיידית
        ↓
סימון dirty + usage.refresh  (זהות בלבד — לא חשבון)
        ↓
usage worker  (lock watermark → דלתא → usage_events + usage_daily + watermark חדש)
        ↓
Billing Explorer / חשבונית  ← usage_daily × catalog/snapshot
```

`usage_events` גולמי נשאר ל-audit ול-reconcile. פתיחת Billing **לא** סורקת שורות גולמיות.

שלושה primitives בלבד: **A** occupancy `from → to`, **B** `size × Δt`, **C** counter/drain. מיפוי: Compute machine/LB/FIP/VPC = A; volume/snapshot = B; egress = C; SO/IR/MQ `gb_hours` = B; MQ publish/deliver = C; Mail/Functions = C/drain; Secrets = A ברמת חשבון; MDB = A+B; Redis = A. `mq.message_hours` **לא** מחויב ב-v1. אין writer של holdings כל דקה.

```bash
homecloud usage list
homecloud usage list --group-by service_id --output json
```

PowerShell: אותן פקודות (אין הבדל בציטוט).

| פריט | ערך |
|------|------|
| קונסול | **Billing** → `/console/billing` |
| Catalog | `billing` (גלובלי — בלי אזור) |
| מטבע | USD |
| תשלומים (v1) | ידני (אדמין מסמן שולם). Stripe בגל הבא. |

## Billing Explorer

מסך אחד — בלי פיצול Overview / Cost Explorer / Budgets.

| אזור | התנהגות |
|------|----------|
| **טווח תאריכים** | לוח שנה עם סימון טווח (presets + range). ימי חיוב לפי UTC. |
| **Estimate** | שימוש × מחירון ל**טווח שנבחר** |
| **Forecast** | החודש הקלנדרי השוטף, עם הסבר קצר (קצב ריצה + שעות RUNNING) |
| **מה גורם לעלות?** | שירותים מובילים עם סיכום שימוש ברור (למשל ממוצע GB באחסון) |
| **עלות לאורך זמן** | עמודות מוערמות **לפי שירות**; יומי / חודשי. לכל תקופה **רוחב קבוע** (הגרף הפנימי נגלל הצידה — העמודות לא מצטמצמות לקווים ולא נמתחות על כל הכרטיס). בתצוגה חודשית מוצגים **לפחות 6 חודשי UTC** עד החודש הנוכחי (ריפוד `$0`). |
| **פירוט עלויות** | שורה אחת לכל שירות; בפתיחה — לפי **סוג SKU** (שעות מכונה, נפח GB·h, …), לא לפי VM |
| **חשבוניות** | הפקה לפי דרישה; סימון שולם ידני |
| **התראות הוצאה** | התראה בלבד — לא עוצרות ולא משעות משאבים |

עלות Object Storage נצברת כל עוד יש אובייקטים (GB × זמן). סכום SO גבוה אחרי פעילות Monitoring חדשה לרוב אומר שאחסון קיים נמדד לאורך הימים שנבחרו.

### חוזה אזור זמן (v1)

באקטים יומיים הם **ימי לוח UTC**. ה-API של explore מחזיר `"timezone": "UTC"`. ה-UI מציג זאת במפורש. אזור זמן מקומי לחשבון עדיין לא מיושם.

### API

```http
GET /api/v1/accounts/{id}/billing/explore?from=&to=
```

מחזיר `timezone`, `estimate`, `daily_series`, `by_service`, `prices_are_placeholder`, `has_usage`, ו-`has_unpriced_usage`.

`GET …/billing/forecast` נשאר נפרד לחודש השוטף.

## התראות מול מגבלת הוצאה

התראות הוצאה הן **התראה בלבד**. חציית סף לא עוצרת Compute ולא משעה משאבים. ב-v1 **אין מגבלת הוצאה קשיחה**. מכסות משאבים (מספר מכונות וכו׳) נשארות בנפרד מ-Billing.

בדיקת רקע רצה בערך כל **15 דקות** (`billing_alert_interval_seconds`). כשהאומדן מגיע לסף או עובר אותו:

1. בעלים ומנהלים מקבלים **נוטיפיקציה אחת** בקונסול (פעמון + התראות, מקור Billing) עם קישור ל-**Billing → התראות**.
2. אותם אנשים מקבלים **מייל אחד**. שליחה שנכשלה לא מנסה שוב באותה תקופה.
3. SSE `spend.alert` מרענן את הפעמון. אותה ירייה לא כותבת סוג אירוע שני.

**אין שליחה כפולה באותה תקופה.** כל התראה שומרת `last_fired_period`. חלון **חודש** נורה לכל היותר פעם בחודש קלנדרי UTC (`YYYY-MM`). חלון **שבוע** משווה את 7 הימים האחרונים ונורה לכל היותר פעם בשבוע ISO (`YYYY-Www`). שתי התראות שונות (שבוע + חודש) יכולות כל אחת לירות בנפרד.

| חלון | מה משווים | מניעת כפילות |
|------|-----------|----------------|
| חודש קלנדרי (UTC) | אומדן מתחילת החודש | פעם אחת באותו חודש |
| 7 הימים האחרונים | אומדן 7 ימים מתגלגל | פעם אחת באותו שבוע ISO |

## CLI

```bash
homecloud usage list
homecloud billing summary
homecloud billing invoices
homecloud billing forecast --horizon 7
```

PowerShell: אותן פקודות (אין הבדל בציטוט).

## Related

- [Monitoring](monitoring.md)
- [Compute](compute.md)
