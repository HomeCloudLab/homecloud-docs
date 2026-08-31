# Mail

HomeCloud Mail נותן לחשבון **תיבות דואר**, לקוח webmail מלא, **תבניות**, **אנשי קשר** ו**אוטומציות** (העברה / כללים בסגנון Sieve). דוא״ל יוצא ונכנס מטופל על ידי מנוע הדואר של הפלטפורמה; הקונסול שומר מטא־נתונים לרשימה מהירה.

| פריט | ערך |
|------|--------|
| Console | **Mail** → `/console/mail` |
| Per mailbox | `/console/mail/{mailboxId}` |
| Templates | `/console/mail?tab=templates` (עורך: `/console/mail/templates/{id}`) |
| Contacts | `/console/mail?tab=contacts` |

## מפת קונסול

1. **טאבים תיבות / אנשי קשר / תבניות** — מסונכרנים ל-URL (`?tab=`). **רענון** תמיד בכותרת; **צור תיבה / איש קשר / תבנית** לפי הטאב הפעיל. יצירת איש קשר בדיאלוג.  
2. **לקוח תיבה** — תיקיות (Inbox, Sent, Drafts, Trash, Archive), חיפוש, כתיבה, הגדרות. פעמון הכותרת התחתונה מציג **שורה אחת של לא-נקראו לכל תיבה** (ספירה בלבד) ופותח את ה-inbox (`/console/mail/{email}`). הלקוח משתמש ב**חיבור SSE האחד** של הטאב (`mail.received` מרענן את הרשימה); הוא לא פותח `/realtime/events` נוסף.  
3. **Template Studio** — בונה דוא״ל חזותי עם תצוגה מקדימה וקוד.  
4. **אנשי קשר** — פנקס כתובות לכתיבה.

## יצירה ושימוש בתיבה

1. הוסיפו ואמתו דומיין תחת **דומיינים** (DNS חיצוני מספיק — בלי להחליף nameservers).
2. בדף הדומיין → **דואר** → **הפעלת דואר**.
3. צרו תיבה (`hello@הדומיין-שלכם`). ב-DNS חיצוני העתיקו את שורות MX / SPF / DKIM / DMARC אצל הרשם, ואז בדקו ב-**Deliverability**.
4. פתחו את התיבה. שלחו הודעת בדיקה; השתמשו ב-**Sync inbox** אם הודעה חדשה מתעכבת.
5. פתחו **Settings** בתוך התיבה לשם תצוגה, חתימה, העברה וכללי אוטומציה.

כתובות על דומיין הדואר של הפלטפורמה נשארות מוגבלות לחשבון Platform Mail. hostname שלכם לא.

### כתיבה

- סרגל עשיר (מודגש, רשימות, קישורים, תמונות מוטמעות, …)  
- שבבים בסגנון Gmail ל-To / Cc / Bcc  
- קבצים מצורפים דרך מהדק נייר או גרירה  
- הכנסת **תבנית** (שומרת HTML מלא של האימייל)  
- Ctrl+Enter לשליחה  

Reply / Reply all / Forward שומרים כותרות threading.

### תיקיות ומחיקה

| פעולה | תוצאה |
|-------|-------|
| Delete | מעביר ל-Trash |
| Restore | חזרה ל-Inbox |
| Permanent delete (מתוך Trash) | נמחק לצמיתות |

### Deliverability

פתחו **Status → Deliverability** (מאזור שירות הדואר) לבדיקות SPF / DKIM / DMARC. השתמשו ב-**Fix** כשהפלטפורמה יכולה לפרסם רשומות DNS בטוחות אוטומטית. deliverability טובה דורשת DNS נכון ודואר שיוצא מ-MTA של הפלטפורמה — לא מ-IP מגורים אקראי.

## תבניות

1. פתחו **דואר → תבניות** → **תבנית חדשה** (ריק) או בחרו starter (welcome, invoice, promo, …).  
2. עצבו עם בלוקים (כותרת, טקסט, כפתור, עמודות, …).  
3. תצוגה מקדימה בדסקטופ/טאבלט/מובייל.  
4. הכניסו מכתיבה, או שלחו דרך API עם `template_id` + משתנים.

תגי מיזוג נראים כמו `{{user_name}}`, `{{cta_url}}` וכו'.

## אנשי קשר

תחזקו פנקס כתובות מטאב **אנשי קשר**; **צור איש קשר** נפתח בדיאלוג. בחירה מרובה ומחיקה מרובה בניקוי. כתיבה יכולה לבחור אנשי קשר ל-To.

## אוטומציות

בתיבה **Settings → Automations**:

- בנו כללי **When… Then…** (from, subject, has attachment, …)  
- פעולות כמו הגשה לתיקייה, העברה ופעולות Sieve קשורות  
- סידור עדיפות מחדש, הפעלה/השבתה, ייצוא/ייבוא JSON  
- העברה יכולה גם להיות מוגדרת כ-`forward_to` פשוט ששומר עותק מקומי  

## CLI

```bash
homecloud mail mailboxes
homecloud mail messages --mailbox <id>
homecloud mail get <message-id>
homecloud mail attachment <message-id> <part-id> -o ./file.bin
```

ראו [CLI `mail`](../cli/commands/mail.md).

## SDK

```python
from homecloud import HomeCloud

client = HomeCloud.from_env()
boxes = client.mail.list_mailboxes()
msgs = client.mail.list_messages(mailbox_id=boxes[0]["id"], direction="INBOUND")
detail = client.mail.get_message(msgs[0]["id"])
data = client.mail.download_attachment(msgs[0]["id"], "0")
```

## דוגמאות API (JWT קונסול)

```bash
# הפעלת דואר על דומיין מאומת
curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"hostname":"example.com"}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/mail/domains"

# List mailboxes
curl -sS -H "Authorization: Bearer $TOKEN" \
  "$API/api/v1/accounts/$ACCOUNT_ID/mail/mailboxes"

# Send
curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"mailbox_id":"…","to":["you@example.com"],"subject":"Hello","body_html":"<p>Hi</p>","body_text":"Hi"}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/mail/messages"
```

## טיפים ומלכודות

- רענון רך של הממשק קורא מחדש מטא־נתונים; הוא עשוי **לא** למשוך מ-IMAP — השתמשו ב-**Sync inbox** או המתינו ל-worker סנכרון ברקע.  
- «Sent» אומר ש-MTA של הפלטפורמה **קיבל** את ההודעה; דואר bounce מרוחק עדיין יכול להגיע מאוחר יותר.  
- הדביקו כתובות בזהירות מקליינטי RTL — סימני Unicode בלתי נראים יכולים לשבור נמענים (הקונסול מסיר רבים מהם אוטומטית).  
- כתובות מערכת כמו `noreply@` עשויות להתקיים לדואר פלטפורמה; בדרך כלל לא ניתן למחוק תיבות בבעלות מערכת.

## קשור

- [Domains](domains.md)  
- [Functions](functions.md) (אירועי mail → function כשמופעל)  
- [CLI `mail`](../cli/commands/mail.md)  
