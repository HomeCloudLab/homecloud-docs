# billing / usage / monitoring

פקודות מישור ניהול (`homecloud login`).

## usage

```bash
homecloud usage list
homecloud usage list --group-by service_id --output json
```

מחזיר **כמויות בלבד** — בלי מחירים. השימוש משוחזר ממצב עסקי עמיד: החזקות לפי זמן משתמשות ב-watermark של `last_reported_at` (זמן × גודל), Mail/Functions מנקזים שורות sent/invocation, ו-MQ publish/deliver מודד דלתא של רצף JetStream. reconcile שעתי כותב תיקונים חתומים (כולל שליליים); זו לא שיטת המדידה.

## billing

```bash
homecloud billing summary
homecloud billing forecast --horizon 7
homecloud billing invoices
```

אומדנים ב-USD. בהומלאב הסכום `$0.00` עד מחירי ייצור.

## monitoring

```bash
homecloud monitoring workspace
homecloud monitoring dashboards
```
