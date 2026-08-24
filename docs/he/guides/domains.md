# דומיינים ו-DNS

הוסיפו hostname שכבר בבעלותכם (כל רשם). HomeCloud מאמת בעלות ואז מחברים אותו לשירות. זה **לא** רשם דומיינים — אין קנייה, העברה או חידוש TLD.

| פריט | ערך |
|------|--------|
| Console | **חשבון → דומיינים** (`/console/account/domains`) |

האפקס של הפלטפורמה (כיום `holab.abrdns.com`) הוא מערכת DNS אחרת. דומיינים של דיירים הם ה-hostnames **שלכם**.

## הוספת דומיין

1. **דומיינים** → **הוסף דומיין**.
2. הזינו את ה-hostname (`example.com` או `app.example.com`).
3. בחרו **DNS חיצוני** (הרשומות נשארות אצל הרשם) או **DNS של HomeCloud**.
4. לחצו **Verify** כשה-TXT או ה-nameservers תואמים.

אם DNS של HomeCloud אינו מופעל בסביבה זו, האפשרות גלויה אבל כבויה. DNS חיצוני ממשיך לעבוד.

## DNS חיצוני

השאירו DNS אצל הרשם.

1. צרו את רשומת ה-**TXT** שמוצגת בקונסול.
2. לחצו **Verify**.
3. בטאב **שירותים** של הדומיין חברו אפליקציה, Function URL או אתר SO.
4. צרו את ה-**CNAME** שהקונסול מציג.
5. SSL מונפק אוטומטית אחרי שה-CNAME מצביע לפלטפורמה. טאב **SSL** מציג פעיל / ממתין / נכשל / עומד לפוג / פג ו-**Refresh**.

## DNS של HomeCloud

כשהמצב זמין, העבירו nameservers ל-`ns1.{apex}` ו-`ns2.{apex}`, ואז Verify. נהלו A, AAAA, CNAME, TXT, MX, CAA ו-SRV בטאב **DNS**. Apex לשירות הוא **צירוף**, לא סוג רשומה בשם ALIAS.

## דף הדומיין

לכל דומיין יש **סקירה**, **DNS**, **SSL**, **שירותים**, **דואר** ו-**הגדרות**.

- **שירותים** — צירוף או ניתוק של אפליקציה, Function URL או אתר SO. אין custom domain ל-Compute. חיבור HTTP אחד לכל דומיין.
- **דואר** — פותח את [Deliverability](mail.md) (מקור אחד ל-MX / SPF / DKIM / DMARC).
- **הגדרות** — מחיקת הדומיין אחרי ניתוק שירותים.

באפליקציות, Function URL ואתרי SO מוצגים hostnames כ-**מנוהל ב-Domains**. הצירוף רק מדף הדומיין.

## טיפים

- שינוי nameservers יכול לקחת דקות עד שעות.
- ב-DNS חיצוני אי אפשר CNAME על ה-apex; השתמשו ב-`www` או ב-DNS של HomeCloud כשהוא זמין.
- נתקו את ה-hostname לפני מחיקת הדומיין.

## קשור

- [Applications](applications.md)
- [SSL certificates](ssl.md)
- [Mail](mail.md)
- [Terraform](../terraform/index.md) (`homecloud_domain` — יצירה לא ממתינה לאימות DNS)
