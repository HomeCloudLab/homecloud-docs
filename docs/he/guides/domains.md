# דומיינים ו-DNS

הוסיפו hostname שכבר בבעלותכם (כל רשם), או **חפשו** שם בקונסול. HomeCloud מאמת בעלות ואז מחברים אותו לשירות. **רישום (קניית שם) עדיין לא זמין.** חיפוש לא מחייב תשלום.

| פריט | ערך |
|------|--------|
| Console | **חשבון → דומיינים** (`/console/account/domains`) |

האפקס של הפלטפורמה (כיום `holab.abrdns.com`) הוא מערכת DNS אחרת. דומיינים של דיירים הם ה-hostnames **שלכם**.

## חיפוש דומיין

ב־**חשבון → דומיינים** השתמשו בתיבת החיפוש כדי לבדוק אם שם נראה פנוי.

- צריך להיות מחוברים. החיפוש לא דורש בילינג.
- תוצאה **פנוי** לא שומרת ולא קונה את השם.
- ייתכן שלא יוצג מחיר. זה צפוי עד שרישום יופעל.
- פעולת **קנייה** נשארת כבויה עד שבילינג יופעל בפלטפורמה.

אם DNS של HomeCloud מופעל בסביבה זו, שם שתרשמו בעתיד יהפוך לאזור מארח אוטומטית. עד שהרישום קיים, הוסיפו דומיין שכבר בבעלותכם (למטה).

## הוספת דומיין

1. **דומיינים** → **הוסף דומיין**.
2. הזינו את ה-hostname (`example.com` או `app.example.com`).
3. בחרו **DNS חיצוני** (הרשומות נשארות אצל הרשם) או **DNS של HomeCloud** (אזור מארח).
4. לחצו **Verify** כשה-TXT או ה-nameservers תואמים.

אם DNS של HomeCloud אינו מופעל בסביבה זו, האפשרות גלויה אבל כבויה. DNS חיצוני ממשיך לעבוד.

## DNS חיצוני

השאירו DNS אצל הרשם.

1. צרו את רשומת ה-**TXT** שמוצגת בקונסול.
2. לחצו **Verify**.
3. בטאב **שירותים** של הדומיין חברו אפליקציה, Function URL או אתר SO (קודם הפעילו website hosting על ה-bucket). ב-DNS חיצוני יש hostname HTTP אחד.
4. צרו את ה-**CNAME** שהקונסול מציג.
5. SSL מונפק אוטומטית אחרי שה-CNAME מצביע לפלטפורמה. טאב **SSL** מציג פעיל / ממתין / נכשל / עומד לפוג / פג ו-**Refresh**.

## DNS של HomeCloud

כשהמצב זמין, העבירו nameservers ל-`ns1.{apex}` ו-`ns2.{apex}`, ואז Verify. זה יוצר **אזור מארח**: SOA ו-NS לקריאה בלבד. נהלו A, AAAA, CNAME, TXT, MX, CAA ו-SRV בטאב **DNS**. Apex לשירות הוא **צירוף**, לא סוג רשומה בשם ALIAS.

אחרי שה-NS תואמים, **צירוף** כותב את הרשומה ומפעיל ניתוב — בלי Verify שני. אפשר לצרף יותר מ-host אחד על אותו אזור (host ריק = apex, `www` = `www.example.com`). בצירוף apex אפשר גם ליצור alias ל-**www** לאותו שירות (תיבת סימון בצירוף; בקונסול ברירת המחדל דלוקה). הפעילו **DNSSEC** בטאב DNS והעתיקו את רשומות ה-DS אצל הרשם.

## דף הדומיין

לכל דומיין יש **סקירה**, **DNS**, **SSL**, **שירותים**, **דואר** ו-**הגדרות**.

- **שירותים** — צירוף או ניתוק של אפליקציה, Function URL או אתר SO. כל יעד מקבל HTTPS על ה-hostname. אין custom domain ל-Compute.
- **דואר** — פותח את [Deliverability](mail.md) (מקור אחד ל-MX / SPF / DKIM / DMARC).
- **הגדרות** — מחיקת הדומיין אחרי ניתוק שירותים.

באפליקציות, Function URL ואתרי SO מוצגים hostnames כ-**מנוהל ב-Domains**. הצירוף רק מדף הדומיין. `custom_domain` באפליקציה אינו שדה לכתיבה.

## CLI ו-Terraform

```bash
homecloud domains create example.com --dns-mode homecloud
homecloud domains record-create DOMAIN_ID --type A --record 1.2.3.4 --host www
homecloud domains attach DOMAIN_ID --target-id FUNCTION_ID --target-type function --host www
```

משאבי Terraform: `homecloud_domain` (`wait_for_verified` אופציונלי), `homecloud_dns_record`, `homecloud_domain_attachment`. חיפוש וקניית דומיין הם רק בקונסול/API.

## טיפים

- שינוי nameservers יכול לקחת דקות עד שעות.
- ב-DNS חיצוני אי אפשר CNAME על ה-apex; השתמשו ב-`www` או ב-DNS של HomeCloud כשהוא זמין.
- נתקו כל hostname לפני מחיקת הדומיין.
- החיפוש הוא בדיקת זמינות בלבד. קניית שם עדיין לא מוצעת.

## קשור

- [Applications](applications.md)
- [SSL](ssl.md)
- [Mail](mail.md)
- [Terraform](../terraform/index.md)
