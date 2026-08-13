# Billing

**Billing** הוא שירות קונסול עצמאי (`/console/billing`). זה לא Cost Explorer.

המטר שומר **כמויות בלבד**. Billing עושה `שימוש × מחיר מחירון נטו ב-USD = חיוב`. מע״מ הוא שורה נפרדת בחשבונית — לא בתוך מחירי SKU. בהומלאב המחירון **$0**; חשבונית עדיין מופקת כדי לבדוק Meter → Invoice → PDF (`so://billing/{account_id}/{period}.pdf`).

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
Billing
```

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

## מה תראו

- **Estimate** מתחילת החודש
- **Forecast** (קצב 7/30 יום + שעות RUNNING שנותרו) — מסומן כאומדן
- סיכומי שימוש לפי שירות
- חשבוניות כולל `$0.00` בהומלאב
- התראות הוצאה (רק התראה — לא עוצרות Compute)

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
