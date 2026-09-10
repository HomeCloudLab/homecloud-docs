# billing / usage / monitoring

פקודות מישור ניהול (`homecloud login`).

## usage

```bash
homecloud usage list
homecloud usage list --group-by service_id --output json
```

מחזיר **כמויות בלבד** — בלי מחירים. ה-CLI קורא סיכומי SKU יומיים (`usage_daily`). הכתיבה היא dirty worker + checkpoint שעתי: `usage.refresh` הוא זהות בלבד (לא חיוב). החזקות לפי זמן משתמשות ב-watermark נעול של `last_reported_at` (זמן × גודל). Mail/Functions מנקזים שורות sent/invocation. MQ publish/deliver מודד דלתא של רצף JetStream. reconcile שעתי כותב תיקונים חתומים (כולל שליליים); זו לא שיטת המדידה.

## billing

```bash
homecloud billing summary
homecloud billing forecast --horizon 7
homecloud billing invoices
```

אומדנים ב-USD. **Compute** לפי מחירון הקטלוג (wholesale × FX × markup 2×–4×; ברירת מחדל 2×). שירותים אחרים עשויים עדיין להשתמש במחירי placeholder. סימון שולם ידני — אין גביית כרטיס עדיין.

## monitoring

```bash
homecloud monitoring workspace
homecloud monitoring dashboards
```
