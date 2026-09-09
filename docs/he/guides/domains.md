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

השאירו DNS אצל הרשם. אחרי אימות TXT, פתחו **Hosts** וחברו אפליקציה, Function URL, אתר SO (קודם הפעילו website hosting על ה-bucket), **מכונה**, או **מאזן עומסים ציבורי**. אפשר לחבר יותר משם אחד על אותו דומיין. כדי ש-HomeCloud יארח את האזור אחר כך, פתחו **הגדרות** ועברו ל-**DNS של HomeCloud**, ואז החליפו nameservers אצל הרשם.

| מה מחברים | איזו רשומה להוסיף |
|-----------|-------------------|
| תת-שם (`www`, `app`, `api`, `test`, …) לאפליקציה / Function / SO | בשדה **תת-שם** הזינו רק את התווית, חברו, ואז הוסיפו **CNAME** ששם הרשומה הוא אותה תווית (לא השם המלא) ליעד שמוצג |
| השם הראשי (`example.com`) לאפליקציה / Function / SO | השאירו תת-שם ריק. **ALIAS** או **ANAME** עבור `@` לשם הזה, אם מארח ה-DNS תומך. אחרת שנו את השם לתת-שם, שמרו, והשתמשו ב-CNAME. |
| מכונה או מאזן עומסים ציבורי | חברו את ה-hostname למשאב. הגילוי הוא **A** / **AAAA** מכתובת ציבורית או VIP — לא CNAME לקצה Function/SO. |

בצירוף ממתין אפשר **לשנות את השם** ו**לנתק**. בדיקת DNS בודקת רק את השם השמור. SSL מונפק אוטומטית אחרי שה-DNS מצביע לכאן. טאב **SSL** מציג פעיל / ממתין / נכשל / עומד לפוג / פג ו-**Refresh**.

## DNS של HomeCloud

כשהמצב זמין, העבירו nameservers ל-`ns1.{apex}` ו-`ns2.{apex}`, ואז Verify. זה יוצר **אזור מארח**: SOA ו-NS לקריאה בלבד. נהלו A, AAAA, CNAME, TXT, MX, CAA ו-SRV בטאב **DNS**. Apex לשירות הוא **צירוף**, לא סוג רשומה בשם ALIAS. בטאב אפשר גם **לייצא או לייבא** קובץ אזור BIND.

אחרי שה-NS תואמים, **חיבור** במפת Hosts כותב את הרשומה ומפעיל ניתוב — בלי Verify שני. חברו את השם הראשי (host ריק), `www`, `api` או כל תווית אחרת. בצירוף apex אפשר גם ליצור alias ל-**www** לאותו שירות (תיבת סימון בחיבור; כבויה כברירת מחדל). הפעילו **DNSSEC** בטאב DNS והעתיקו את רשומות ה-DS אצל הרשם.

לכל רשומה מארחת יש **מקור** (`origin`): `system` (SOA/NS), `service` (חיבור), `mail` (תיקון Deliverability), `user` (אתם / CLI / Terraform), או `dynamic` (DDNS). טאב DNS עורך או מוחק רק שורות `user`. ניתוק מסיר שורות `service`; תיקון דואר מעדכן שורות `mail`.

### שמות מארח ל-Compute { #compute-hostnames }

Hostname נקשר ל-**משאב** (`machine` או `load_balancer`), לא לכתובת שהודבקה. DNS של HomeCloud כותב **A** / **AAAA** (`origin=service`, `mode=static`) מ-IPv4 ציבורי, IPv6 ציבורי, Floating IP משויך (מועדף על פני IPv4 דביק), או VIP ציבורי של LB. כשהכתובת או ה-VIP משתנים, הצירוף כותב מחדש את הרשומה — זה לא DDNS (`nic/update` / `myip` הוא שינוי מאוחר יותר).

- מכונה **בלי IPv4 ציבורי ובלי IPv6 ציבורי** לא יכולה לקבל hostname ציבורי. חברו את השם ל-**מאזן עומסים ציבורי** שה-backends שלו יכולים להיות NIC פרטיים.
- צירוף ציבורי ל-LB **פנימי** (`scheme=internal`) נדחה.
- **Agent Session** הוא נתיב קונסול למכונה פרטית. זה לא DNS.
- TLS ל-LB ציבורי עם HTTPS נשאר **מנוהל ב-Compute**. TLS על המכונה הוא על האורח. צירוף Compute לא יוצר ingress של Function/SO.

CLI:

```bash
homecloud domains attach DOMAIN_ID --target-id MACHINE_ID --target-type machine --host api
homecloud domains attach DOMAIN_ID --target-id LB_ID --target-type load_balancer
```

PowerShell (JSON זהה):

```powershell
homecloud domains attach $domainId --target-id $machineId --target-type machine --host api
```

### DNS דינמי

על רשומת **A** או **AAAA** מארחת אפשר להפעיל DNS דינמי. הקונסול מציג טוקן **פעם אחת**. הפנו ddclient (או דומה) ל-dyndns2:

```text
protocol=dyndns2
server=console.holab.abrdns.com
login=home.example.com
password=TOKEN
```

```bash
curl -u 'home.example.com:TOKEN' \
  'https://console.holab.abrdns.com/nic/update?hostname=home.example.com&myip=203.0.113.10'
```

אותו עדכון זמין גם ב־`/api/v1/dyn/nic/update`. בלי JWT של החשבון. גוף התשובה הוא טקסט dyndns2 (`good`, `nochg`, `badauth`, `nohost`, `abuse`). סובבו או בטלו את הטוקן מטאב DNS.

חלק מהרשמים דוחים את שרתי השמות של HomeCloud עד שהם רשומים ב-TLD. עד שהפלטפורמה תסיים את זה (שלב מאוחר יותר עם דומיין ייצור), **השאירו DNS חיצוני**.

## דף הדומיין

לכל דומיין יש **Hosts** (ברירת מחדל), **DNS**, **SSL**, **דואר** ו-**הגדרות**. קישור עם `tab=overview` או `tab=services` פותח את Hosts.

- **Hosts** — hostname → אפליקציה, Function URL, אתר SO, מכונה, או מאזן עומסים ציבורי, עם DNS / ניתוב / TLS. חיבור וניתוק מהמפה. לצירוף DNS חיצוני שממתין, העתיקו את רשומת ה-discovery (CNAME, או A/AAAA/ALIAS ב-apex) שמוצגת בשורה. מכונה פרטית עוברת דרך LB (או Agent Session — לא DNS).
- **DNS** — עורך אזור מארח (עם מקור). DNS חיצוני אינו עורך אזור; הוראות discovery ממתינות ב-Hosts.
- **דואר** — הפעילו דואר על ה-hostname המאומת, ואז צרו תיבות (`hello@הדומיין-שלכם`). DNS חיצוני: העתיקו את שורות MX / SPF / DKIM / DMARC אצל הרשם — **בלי להחליף nameservers**. ב-DNS של HomeCloud אפשר לכתוב את הרשומות (Deliverability → תיקון). בדיקות חיות באותו טאב. דואר אינו עורך DNS שני.
- **הגדרות** — מעבר בין DNS חיצוני ל-DNS של HomeCloud, ואז מחיקת הדומיין אחרי ניתוק שירותים.

באפליקציות, Function URL ואתרי SO מוצגים hostnames כ-**מנוהל ב-Domains**. הצירוף רק מדף הדומיין. `custom_domain` באפליקציה אינו שדה לכתיבה.

## CLI ו-Terraform

```bash
homecloud domains create example.com --dns-mode homecloud
homecloud domains record-create DOMAIN_ID --type A --record 1.2.3.4 --host www
homecloud domains record-update DOMAIN_ID RECORD_ID --type A --record 1.2.3.5 --host www
homecloud domains record-delete DOMAIN_ID RECORD_ID
homecloud domains attach DOMAIN_ID --target-id FUNCTION_ID --target-type function --host test
homecloud domains attach DOMAIN_ID --target-id MACHINE_ID --target-type machine --host api
homecloud domains detach ATTACHMENT_ID
```

`--host` הוא התווית היחסית (`test`, `www`). ריק = השם הראשי. ל-Compute: `machine` או `load_balancer` (`compute` / `vm` הם כינויים ל-`machine`). `homecloud domains records` כולל `origin` ו-`mode`. ב-Terraform `homecloud_dns_record.origin` מחושב; `mode` אופציונלי (`static` או `dynamic`). `homecloud_domain_attachment.host` גם יחסי; שינוי שלו מחליף את המשאב.

משאבי Terraform: `homecloud_domain` (`wait_for_verified` אופציונלי), `homecloud_dns_record`, `homecloud_domain_attachment`. חיפוש וקניית דומיין הם רק בקונסול/API.

## טיפים

- שינוי nameservers יכול לקחת דקות עד שעות.
- חלק מהרשמים דוחים את שרתי השמות של HomeCloud עד שהם רשומים ב-TLD. עד שזה יושלם בפלטפורמה, השאירו DNS חיצוני והשתמשו ב-CNAME או ALIAS.
- ב-DNS חיצוני: CNAME על תת-שם; ALIAS או ANAME על השם הראשי אם מארח ה-DNS תומך. DNS של HomeCloud כותב את שניהם בשבילכם.
- נתקו כל hostname לפני מחיקת הדומיין.
- החיפוש הוא בדיקת זמינות בלבד. קניית שם עדיין לא מוצעת.

## קשור

- [Applications](applications.md)
- [SSL](ssl.md)
- [Mail](mail.md)
- [Terraform](../terraform/index.md)
