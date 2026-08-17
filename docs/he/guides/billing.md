# Billing

**Billing** הוא שירות קונסול עצמאי (`/console/billing`). **Billing Explorer** משתמש בלוגיקת ניתוח בסגנון Cost Explorer (טווח תאריכים, מגמה, לפי שירות) עם עיצוב HomeCloud — לא העתקה ויזואלית של AWS.

המטר שומר **כמויות בלבד**. Billing עושה `שימוש × מחיר מחירון נטו ב-USD = חיוב`. מע״מ הוא שורה נפרדת בחשבונית — לא בתוך מחירי SKU. חשבוניות עדיין מופקות; **מחירי המחירון כרגע זמניים** (לבדיקת מוצר, לא מחיר GTM סופי). תשלום בכרטיס עדיין לא פעיל — סימון שולם ידני בלבד. נתיב PDF: `so://billing/{account_id}/{period}.pdf`.

## איך נרשם שימוש

המטר הוא ה-ledger היחיד. הוא שומר **כמויות**, לא מחירים. פעולת המשתמש לא ממתינה למטר: אם המטר נפל, הרשומה העסקית נשארת, וה-drain או ה-holdings הבא כותבים את השימוש.

אין טבלת Outbox חדשה, אין NATS stream לשימוש, ואין סורק Billing מרכזי. כל SKU משוחזר ממצב שכבר קיים:

```text
עובדה עסקית (MailMessage, FunctionInvocation, JetStream seq, Compute / MinIO / IR / MDB / Redis / Secrets)
        ↓
drain או holdings  (אותה טרנזקציית DB כמו record_usage + watermark)
        ↓
Ledger של המטר (בלתי ניתן לשינוי)
        ↓
Billing Explorer (תצוגה בלבד)
```

Billing לא שולף טבלאות Compute / SO / Mail לחישוב עלות — רק Meter דרך `query_usage`.

| שירות | מדידה | Watermark |
|---------|--------|-----------|
| Compute | RUNNING × זמן | timestamp |
| SO | bytes × זמן (גודל חי מ-MinIO) | timestamp |
| IR | storage bytes × זמן | timestamp |
| MDB | instance / storage × זמן | timestamp |
| Redis | instance × זמן | timestamp |
| Secrets | secrets × זמן | timestamp |
| MQ | publish / deliver | רצף JetStream |
| MQ | הודעות / bytes × זמן | timestamp |
| Mail | sent | מזהה שורה (`mail.sent:{id}`) |
| Functions | invocation | מזהה הפעלה (`fn.invoke:{id}`) |

**החזקות לפי זמן** מחייבות את המרווח מאז `last_reported_at`, לא slot קבוע של 60 שניות. אם העובד התעורר באיחור של 7 דקות — המרווח הוא 7 דקות. אם הוא נפל ל-17 דקות — המרווח הוא 17 דקות. אין חור.

**Mail ו-Functions** הם רשומה עסקית עמידה + drain אסינכרוני עם idempotency. `MailMessage.status = sent` הוא מקור האמת; ה-drain קורא אחר כך ל-`record_usage` עם `source_id` דטרמיניסטי. ניסיון חוזר לא יוצר UUID חדש.

**MQ publish/deliver** מודד דלתא של רצף JetStream (`current_seq − last_metered_seq`). התצפית הראשונה רק שומרת watermark, בלי לחייב backlog היסטורי.

**Reconcile** הוא רשת ביטחון, לא שיטת המדידה. הוא משווה את המטר למלאי וכותב דלתא **חתומה** (חיובית או שלילית). השורה המקורית לא מתעדכנת. עודף מדידה מתוקן, לא מתעלמים ממנו.

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
| **פירוט עלויות** | שורה אחת לכל שירות; פתיחה למדד / מחיר יחידה / כמות |
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
