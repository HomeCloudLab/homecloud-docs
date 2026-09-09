# domains

דומיינים מותאמים, רשומות DNS מארח, וצירוף לשירות.

```bash
homecloud domains list
homecloud domains create example.com --dns-mode external
homecloud domains get DOMAIN_ID
homecloud domains verify DOMAIN_ID
homecloud domains attach DOMAIN_ID --target-id FUNCTION_ID --target-type function --host test
homecloud domains detach ATTACHMENT_ID
homecloud domains records DOMAIN_ID
homecloud domains record-create DOMAIN_ID --type A --record 1.2.3.4 --host www
homecloud domains record-update DOMAIN_ID RECORD_ID --type A --record 1.2.3.5 --host www
homecloud domains record-delete DOMAIN_ID RECORD_ID
homecloud domains delete DOMAIN_ID
```

`--host` בצירוף יחסי לדומיין (`test`, `www`). ריק = השם הראשי. `records` כולל `origin` ו-`mode`. עדכוני DNS דינמי עוברים ב־`/nic/update` (dyndns2) עם הטוקן החד-פעמי מהקונסול — לא JWT של החשבון. בדיקת DNS, שינוי שם ממתין, מעבר בין DNS חיצוני ל-DNS של HomeCloud וייבוא/ייצוא קובץ אזור הם בקונסול.

מדריך: [דומיינים](../../guides/domains.md).
