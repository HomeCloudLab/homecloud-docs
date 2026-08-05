# מסדי נתונים מנוהלים (MDB)

MDB של HomeCloud הוא שירות מנוהל ל־**PostgreSQL**, **MySQL** ו־**MongoDB**.

פעולות יומיומיות דרך קונסול **Databases**, API ו־CLI — לא עריכת CRD ביד. בסביבת הפיתוח/הומלאב עדיין רואים pods ו־CRs ב־Kubernetes לצורך דיבוג.

## מה השתנה

פרטי MSP בין מנועים (logical DBs, users, backups); חיזוק secrets של MySQL (`monitor` / `clustercheck`); RoutingPlatform; טאבים בקונסול לפי capabilities.

## יכולות לפי מנוע

| יכולות | PostgreSQL | MySQL | MongoDB |
|--------|------------|-------|---------|
| יצירה / מחיקה | כן | כן | כן |
| גישה חיצונית | כן | כן (handshake) | כן (SNI) |
| Logical databases | כן | כן | כן |
| משתמשים מנוהלים | כן | כן | כן |
| גיבוי ידני | כן | כן (mysqldump) | כן (mongodump) |
| שחזור ל־instance חדש | כן | עדיין לא | עדיין לא |

## חיבור, Logical DB, Users, Backups

דוגמאות API זהות לגרסה האנגלית — ראו [MDB](mdb.md) בעמוד האנגלי של האתר, או הריצו את אותם נתיבי REST:

- `GET/POST …/logical-databases`
- `GET/POST …/users` ו־`POST …/users/{name}/rotate`
- `GET/POST …/backups`

### MySQL `direct_tcp` — שם משתמש

ב־`:3306` משותף אי־אפשר לנתב לפי hostname (אין SNI). ה־edge בוחר מופע לפי שם המשתמש ב־handshake:

`{db_user}__{instance_name}` — למשל `root__mydb-sql` + `--enable-cleartext-plugin`.

הסיסמה היא של המשתמש האמיתי (`root` / משתמש מנוהל). בטאב Connection ל־MySQL מוצג **`root`** (bootstrap). `app` בטופס יצירה הוא שם DB/owner מתוכנן — צריך ליצור ב־Databases / Users אם רוצים login בשם `app`.

## MySQL Access denied עבור `monitor`

אם בלוגים מופיע `Access denied for user 'monitor'`, בדקו ש־Secret `{cluster}-mysql-secrets` כולל את כל מפתחות המערכת של Percona. שינוי סיסמה ב־Secret מפעיל רוטציה אצל האופרטור. מופעים חדשים נוצרים עם סט מלא.

## HA

`POST …/scale` עם `instances=1` כברירת מחדל. בפרופיל פיתוח `instances > 1` נדחה. Resize אנכי אונליין מתוכנן בהמשך.
