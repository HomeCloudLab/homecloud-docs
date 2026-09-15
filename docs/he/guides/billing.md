# Billing

**Billing** הוא שירות קונסול עצמאי (`/console/billing`). ב-Overview יש **Glance** קלנדרי (הוצאה + תחזית) ומתחתיו **Billing Explorer** לניתוח לפי טווח — בסגנון Cost Explorer עם עיצוב HomeCloud, לא העתקה של AWS.

המטר שומר **כמויות בלבד**. Billing עושה `שימוש × מחיר מחירון נטו ב-USD = חיוב`. מע״מ הוא שורה נפרדת בחשבונית — לא בתוך מחירי SKU. חשבוניות עדיין מופקות. תשלום בכרטיס עדיין לא פעיל — סימון שולם ידני בלבד. נתיב PDF: `so://billing/{account_id}/{period}.pdf`.

**Compute** מחויב ממחירון Compute: wholesale של הספק → FX (EURUSD) → markup בטווח **2×–4×** (ברירת מחדל **3×**). שעות מכונה לפי ה-**Offering/SKU שמומש** (`offering_id`), ב-snapshot ב-USD. שירותים אחרים (SO, MQ, Mail, …) עדיין עשויים להשתמש במחירי placeholder עד שיהיה להם wholesale.

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

**נוסחה אחת; אפשר לפתוח פירוט.** כל מטר Compute: `FX(wholesale) × GTM markup (2×–4×, ברירת מחדל 3×)`. שורות חשבונית נשארות מקופלות לפי מדד. בקונסול אפשר לפתוח שורת Compute ולראות **כמויות לפי משאב** (rollup יומי קומפקטי — לא סריקה של כל tick). פס **מחויב כרגע** מציג מה נצבר *עכשיו* מהמלאי, כדי לא לבלבל שעות מכונה היסטוריות עם VM חי.

מחיקת מכונה מסמנת ווליומי boot/data מצורפים כ-deleting כדי **שיפסיקו להימדד מיד**; ה-purge מוחק אותם אחר כך. ווליום מנותק שנשמר נשאר מחויב עד מחיקה. שעות מכונה מהעבר נשארות בגרף עם תמחור sticky/offering.

הכמות תמיד שעות שעון או GiB×זמן — לא «שעות אפקטיביות» לפי עלות.

## איך נרשם שימוש

המטר הוא ה-ledger היחיד. הוא שומר **כמויות**, לא מחירים. פעולת המשתמש לא ממתינה למטר.

`usage.refresh` הוא **רמז dirty בלבד** — הוא לא יוצר אירוע חיוב. Worker נועל את ה-watermark (`lock → קריאת last_size/last_at → חישוב → כתיבת usage + watermark` באותה טרנזקציה), כך שרענונים כפולים לא מכפילים חיוב. ה-hint מתפרסם ב-subject פנימי `hc.usage.refresh` (queue group), **לא** על `hc.events.>` (SSE לדפדפן).

אם ה-hint נפל, ה-**hourly checkpoint** או reconcile חתום עדיין משחזרים ממצב עמיד (fail-open).

```text
עובדה עסקית (commit) → חזרה מיידית
        ↓
סימון dirty + usage.refresh  (זהות בלבד — לא חשבון)
        ↓
usage worker  (lock watermark → דלתא → usage_events + usage_daily + usage_resource_daily + watermark חדש)
        ↓
Billing Explorer / חשבונית  ← usage_daily × catalog/snapshot
פתיחת פירוט                 ← usage_resource_daily × resolve
מחויב כרגע                  ← holdings של Compute
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

## Billing Overview

מסך אחד — טאבים Overview ו-Invoices בלבד (בלי Cost Explorer / Budgets נפרדים).

### Glance (אמת קלנדרית)

קבוע בראש ה-Overview. לא עוקב אחרי טווח ה-Explorer.

| כרטיס | התנהגות |
|------|----------|
| **הוצאה (Spending)** | החודש הנוכחי **MTD** והחודש הקודם **סופי** בכרטיס אחד. MoM משווה MTD לאותה תקופה בחודש שעבר. |
| **תחזית (Forecast)** | עלות **מלאה** חזויה לחודש הקלנדרי השוטף (אותו API תחזית). MoM מול סך החודש הקודם. |
| **מחויב כרגע** | מלאי חי שנצבר עכשיו — נפרד מהיסטוריית Explorer. |

אין KPI של **Estimate** ב-Overview ואין KPI של **מע״מ** ב-Overview. מע״מ נשאר בחשבוניות.

### Billing Explorer (ניתוח לפי בחירה)

מתחת ל-Glance. טווח ותצוגה משפיעים **רק** על הגרף והפירוט.

| אזור | התנהגות |
|------|----------|
| **טווח תאריכים** | לוח שנה (presets + מותאם). ימי חיוב לפי UTC. |
| **Granularity** | **יום** / **שבוע** / **חודש** (שבוע = שבוע UTC שמתחיל ביום שני, מצבירה יומית) |
| **עלות לאורך זמן** | עמודות מוערמות **לפי שירות**. לכל תקופה **רוחב קבוע** (הגרף הפנימי נגלל הצידה). בתצוגה חודשית מוצגים **לפחות 6 חודשי UTC** (ריפוד `$0`). |
| **פירוט עלויות** | שורה אחת לכל שירות; בפתיחה — לפי **סוג SKU** ואז **סיכום לפי סוג משאב** |
| **חשבוניות** | הפקה לפי דרישה; סימון שולם ידני; מע״מ בסה״כ החשבונית |
| **התראות הוצאה** | התראה בלבד — לא עוצרות ולא משעות משאבים |

עלות Object Storage נצברת כל עוד יש אובייקטים (GB × זמן). סכום SO גבוה אחרי פעילות Monitoring חדשה לרוב אומר שאחסון קיים נמדד לאורך הימים שנבחרו.

### איך לקרוא פתיחה של Compute

הפתיחה מציגה שלוש רמות של **אותו סכום** — אין חיוב כפול:

1. **שורות SKU** — שעות מכונה, נפח GB·h, יציאה GB
2. **שורות לפי סוג משאב** — מכונות / ווליומים / צילומי מצב / מאזני עומסים…, כל אחת עם מספר המשאבים שתרמו בטווח
3. **משאבים מובילים** (אופציונלי) — המשאבים הגדולים בלבד, מסומנים *מחויב כרגע* או *היסטורי*; היתר נשארים מסוכמים בשורת הסוג

כמות נפח היא קיבולת × זמן, ולכן שורת העזר מציגה **ממוצע קיבולת כוללת** לאורך הטווח (סכום כל הווליומים), לא גודל של דיסק אחד. כמות מכונה היא שעות שעון.

### הימים הם הימים שבהם זה קרה

שימוש מ-holdings נרשם ל**יום ה-UTC שבו התרחש**, כולל כשמכונה נעצרת או ווליום נעלם מהמלאי: פיגור של כמה ימים מפוצל לרשומה אחת לכל יום. אם גרף העלות מציג קפיצה על היום הנוכחי עבור משאבים שנעצרו קודם, ה-rollups נכתבו לפני השינוי הזה — יש לבנות אותם מחדש:

```bash
# הרצה יבשה
python scripts/rebuild_usage_rollups.py --from 2026-09-01 --to 2026-09-14
# כתיבה
python scripts/rebuild_usage_rollups.py --account <account-uuid> --from 2026-09-01 --to 2026-09-14 --apply
```

הסקריפט פורש מחדש את `usage_events` (ה-`source_id` מכיל את תחילת המקטע) על הימים שהמקטע מכסה, וכותב מחדש את `usage_daily` / `usage_resource_daily`. הסכומים לא משתנים — רק היום שאליו הם משויכים.

### חוזה אזור זמן (v1)

באקטים יומיים הם **ימי לוח UTC**. ה-API של explore מחזיר `"timezone": "UTC"`. ה-UI מציג זאת במפורש. אזור זמן מקומי לחשבון עדיין לא מיושם.

### API

```http
GET /api/v1/accounts/{id}/billing/explore?from=&to=
```

מחזיר `timezone`, `estimate`, `daily_series`, `by_service`, `prices_are_placeholder`, `has_usage`, ו-`has_unpriced_usage`.

```http
GET /api/v1/accounts/{id}/billing/explore/resources?metric=&from=&to=&limit=20
```

מחזיר `groups` (סיכום לכל סוג משאב), `items` (המשאבים המובילים לפי `limit`), `resource_count` ו-`truncated`.

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
