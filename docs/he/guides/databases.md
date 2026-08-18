# Managed Databases (MDB)

MDB נותן לכם מופעי **PostgreSQL**, **MySQL** או **MongoDB** מנוהלים בלי לערוך CRDs של Kubernetes ידנית. יוצרים ומפעילים אותם מקונסול ה-**Databases** (ומה-APIs התואמים).

| פריט | ערך |
|------|--------|
| Console | **Databases** → `/console/database` |
| Endpoints | `*.mdb.{apex}` (מחבר TLS ו/או TCP ישיר) |
| Credentials | חשיפה מלשונית **Connection** (מתועדת בביקורת) |

## מה מקבלים

| יכולת | PostgreSQL | MySQL | MongoDB |
|-------|------------|-------|---------|
| יצירה / מחיקת מופע | כן | כן | כן |
| גישה חיצונית | כן | כן | כן |
| מסדי נתונים לוגיים | כן | כן | כן |
| משתמשים מנוהלים + סיבוב סיסמה | כן | כן | כן |
| גיבוי ידני | כן | כן | כן |
| שחזור למופע **חדש** | כן | עדיין לא | עדיין לא |

הלשוניות המדויקות בממשק מונעות מ**יכולות** המנוע — אם תכונה לא נתמכת למנוע הזה, הלשונית או הפעולה מוסתרות או מחזירות שגיאה.

## הליכה בקונסול

### יצירת מופע

1. פתחו **Databases** → **Create**.  
2. בחרו מנוע (PostgreSQL / MySQL / MongoDB), שם, גודל/מחלקה ואפשרויות בטופס.  
3. המתינו עד שהסטטוס בריא/מוכן.  
4. פתחו את המופע.

### לשונית Connection

1. פתחו **Connection**.  
2. **Reveal** אישורים כשצריך אותם (זה מתועד בביקורת).  
3. העתיקו host, port, שם משתמש, סיסמה והערות TLS לקליינט שלכם (`psql`, `mysql`, Compass, הגדרת אפליקציה וכו').

מצבי חיבור שעשויים להופיע:

| מצב | שימוש טיפוסי |
|-----|--------------|
| **Connector** על `*.mdb.{apex}:443` | מנהרת TLS — ברירת מחדל טובה מבחוץ לאשכול |
| **Direct TCP** | פורטים native (`5432` / `3306` / `27017`) כשמופעל למופע |

### MySQL TCP ישיר — שם משתמש מיוחד

פרוטוקול MySQL לא מעביר את שם ה-host מוקדם מספיק לניתוב בפורט משותף. ל-TCP ישיר בפורט `3306`, התחברו עם:

```text
{db_user}__{instance_name}
```

דוגמה: מופע `mydb-sql`, משתמש `root` → שם משתמש `root__mydb-sql`. הסיסמה היא סיסמת מסד הנתונים האמיתית.

```bash
mysql -h "mydb-sql.mdb.holab.abrdns.com" -P 3306 -u "root__mydb-sql" -p
```

לשונית Connection מתעדת את ה-`routing_username` המדויק כשהוא שונה.

### מסדי נתונים לוגיים

פתחו את לשונית **Databases** (לוגית):

- צרו מסדי נתונים לאפליקציה (למשל `analytics`).  
- שייכו בעלים כשהמנוע תומך בכך.

### משתמשים

פתחו **Users**:

- צרו משתמשי `readwrite` / `readonly` מוגבלים למסד נתונים.  
- **Rotate** סיסמאות כשאישורים עלולים לדלוף.

שמרו סיסמאות פרודקשן ב-[Secrets](secrets.md) ולא בצ'אט או ב-git.

### גיבויים

פתחו **Backups**:

- הפעילו **גיבוי ידני**.  
- ב-PostgreSQL, **Restore to new instance** יוצר משאב מסד נתונים **חדש** מגיבוי (לא דורס את המופע החי במקום).

MySQL ו-MongoDB תומכים במשימות גיבוי ידני; שחזור-לחדש עשוי עדיין לא להיות זמין בגרסת הפלטפורמה שלכם.

### אבטחה

השתמשו בלשונית **Security** להגדרות רשת / TLS שחשופות למנוע הזה. העדיפו משתמשי DB עם הרשאה מינימלית לאפליקציות.

## חיבור מאפליקציה

1. חשפו מידע חיבור פעם אחת.  
2. שימו שם משתמש/סיסמה ב-**Secret** של HomeCloud (או במאגר סודות של האפליקציה).  
3. כוונו את האפליקציה ל-hostname של המחבר.  
4. דרשו TLS כפי שמתועד בלשונית Connection.

## דוגמאות API (JWT קונסול)

החליפו `$TOKEN`, `$API`, `$ACCOUNT_ID`, `$DB_ID`.

```bash
# List logical databases
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/logical-databases"

# Create logical database
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"analytics","owner":"app"}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/logical-databases"

# Create readonly user
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"username":"readonly1","role":"readonly","database":"app"}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/users"

# Rotate password
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{}' \
  "$API/api/v1/accounts/$ACCOUNT_ID/databases/$DB_ID/users/readonly1/rotate"
```

## Scale / HA

חלק מהמנועים חושפים scale (ספירת `instances`) מהקונסול או מה-API. בפרופילי homelab קטנים יותר, `instances > 1` עשוי להידחות כדי להגן על זיכרון. שינוי גודל אנכי בלי downtime עשוי להיות מוגבל — בדקו בממשק אילו פעולות מותרות.

## טיפים ומלכודות

- תמיד השתמשו בערכי לשונית **Connection** למופע הנוכחי — אל תנחשו פורטים.  
- MySQL TCP ישיר **חייב** להשתמש בצורת שם המשתמש `__instance`.  
- חשיפת סיסמאות מתועדת — העדיפו Secrets + סיבוב על פני שיתוף צילומי מסך.  
- גיבויים דורשים object storage מוגדר בפלטפורמה; אם גיבוי נכשל, פנו למפעיל הפלטפורמה.  
- Kubernetes עשוי להציג pods של MDB ב-namespace של החשבון לנראות; תפעול יום־2 עדיין צריך לעבור דרך ממשק Databases, לא עריכות CR ידניות.

## קשור

- [Secrets](secrets.md)  
- [Applications](applications.md)  
- [Kubernetes](kubernetes.md)  
- [Terraform](../terraform/index.md) (`homecloud_mdb_instance` / `homecloud_mdb_user`)  
