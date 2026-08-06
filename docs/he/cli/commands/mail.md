# mail

פקודות Mail לרשימת תיבות דואר וקריאת הודעות מהטרמינל.

## mailboxes

```bash
homecloud mail mailboxes
homecloud mail mailboxes --output json
```

עובד עם Access Key שכולל `mail:*` או סשן התחברות לקונסול (לפי חיבור הפלטפורמה שלכם).

## messages

רשימת מטא־נתונים של הודעות (התחברות לקונסול):

```bash
homecloud mail messages --mailbox-id <id>
homecloud mail messages --mailbox-id <id> --folder INBOX --limit 50
homecloud mail messages --mailbox-id <id> --output json
```

## get

שליפת הודעה מלאה כולל גוף HTML ומטא־נתונים של קבצים מצורפים:

```bash
homecloud mail get <message-id>
homecloud mail get <message-id> --output json
```

## attachment

הורדת חלק קובץ מצורף אחד לקובץ מקומי:

```bash
homecloud mail attachment <message-id> <part-id> --dest ./invoice.pdf
```

## טיפים

- העדיפו את הקונסול לכתיבה, תבניות ואוטומציות.  
- השתמשו ב-CLI/SDK לסקריפטי ייצוא ודיבוג מזהי הודעות.  
- אם רשימות נראות ישנות, סנכרנו מהקונסול (**Sync inbox**) ונסו שוב.

## קשור

- [מדריך Mail](../../guides/mail.md)  
