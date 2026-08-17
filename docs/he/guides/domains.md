# דומיינים ו-DNS

הוסיפו דומיין שכבר בבעלותכם (כל רשם). HomeCloud הוא מישור הבקרה; DNS ו-TLS מתפרסמים דרך ה-backends של הפלטפורמה.

| פריט | ערך |
|------|--------|
| Console | **Domains** (קטלוג החשבון) |

## שני מצבי הגדרה

### DNS חיצוני

השאירו DNS אצל הרשם הנוכחי.

1. **Domains** → **Add domain** → **DNS חיצוני**.
2. צרו את רשומת ה-**TXT** שמוצגת בקונסול.
3. לחצו **Verify**.
4. בצירוף hostname ל-Application, צרו את ה-**CNAME** שהקונסול מציג.

SSL ל-hostname הזה משתמש ב-HTTP-01 אחרי שה-CNAME מצביע לפלטפורמה.

### DNS של HomeCloud

HomeCloud מארח את ה-zone. אצל הרשם רק משנים nameservers (GoDaddy, Namecheap, Google או כל רשם אחר). ה-nameservers נראים כמו `ns1.{apex}` ו-`ns2.{apex}` (כרגע ה-apex של המעבדה הוא `holab.abrdns.com` עד לקניית דומיין הייצור).

1. **Add domain** → **DNS של HomeCloud**.
2. הגדירו את ה-nameservers שמופיעים בקונסול.
3. לחצו **Verify** (או המתינו לסריקה ברקע).
4. נהלו רשומות בקונסול (A, AAAA, CNAME, TXT, MX, CAA, SRV).
5. צרפו Applications, Function URLs, אתרים או Mail — רשומות ותעודות מוחלות עבורכם.

Apex (`example.com` → Application) הוא צירוף לשירות, לא סוג רשומה בשם ALIAS.

## צירוף לשירות

- **Applications → Domains** — hostname מותאם  
- **אתר SO** — hostname מותאם בנוסף ל-`{bucket}.web.{apex}`  
- **Mail** — ב-DNS של HomeCloud אפשר להחיל רשומות deliverability מפאנל הדואר  

## טיפים

- שינוי nameservers יכול לקחת דקות עד שעות.  
- ב-DNS חיצוני אי אפשר CNAME על ה-apex; השתמשו ב-`www` או עברו ל-DNS של HomeCloud.  
- נתקו hostname מאפליקציה לפני מחיקת הדומיין.

## קשור

- [Applications](applications.md)  
- [SSL certificates](ssl.md)  
- [Mail](mail.md)  
