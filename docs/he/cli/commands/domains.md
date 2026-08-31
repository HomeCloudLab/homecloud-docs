# domains

דומיינים מותאמים, רשומות DNS מארח, וצירוף לשירות.

```bash
homecloud domains list
homecloud domains create example.com --dns-mode external
homecloud domains get DOMAIN_ID
homecloud domains verify DOMAIN_ID
homecloud domains attach DOMAIN_ID --target-id FUNCTION_ID --target-type function --host test
homecloud domains records DOMAIN_ID
homecloud domains record-create DOMAIN_ID --type A --record 1.2.3.4 --host www
homecloud domains delete DOMAIN_ID
```

`--host` בצירוף יחסי לדומיין (`test`, `www`). ריק = השם הראשי. בדיקת DNS, שינוי שם ממתין, ניתוק, מעבר בין DNS חיצוני ל-DNS של HomeCloud וייבוא/ייצוא קובץ אזור הם בקונסול.

מדריך: [דומיינים](../../guides/domains.md).
