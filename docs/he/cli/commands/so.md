# so

פקודות object storage.

## ls-buckets

דורש התחברות לקונסול:

```bash
homecloud login --username alice
homecloud so ls-buckets
```

## ls

מציג אובייקטים ועובר על **כל העמודים** (כמו `aws s3 ls`).

```bash
homecloud so ls media
homecloud so ls media --prefix photos/ --recursive
homecloud so ls media --prefix photos/ --recursive --name ".jpg"
```

| דגל | התנהגות |
|------|----------|
| `--prefix` | הגבלה למפתחות תחת ה-prefix |
| `--recursive` | עץ שטוח (קבצים בלבד; בלי placeholders של תיקיות) |
| `--name` | סינון substring לא רגיש לרישיות על מפתחות (אחרי pagination מלא) |

## cp

העתקת קובץ יחיד. הכיוון נקבע לפי סדר הארגומנטים.

=== "העלאה (מקומי → SO)"

    ```bash
    homecloud so cp ./build.zip so://media/releases/build.zip
    ```

=== "הורדה (SO → מקומי)"

    ```powershell
    homecloud so cp "so://media/releases/build.zip" ".\build.zip"
    homecloud so cp "so://my-bucket/watch/spider noir/1/file.mkv" ".\local-dir\"
    ```

    אם היעד הוא תיקייה, שם הקובץ המקומי הוא ה-basename של מפתח ה-object.

=== "בשרת (SO → SO)"

    ```bash
    homecloud so cp so://media/a.txt so://media/backup/a.txt
    homecloud so cp so://media/a.txt so://other-bucket/a.txt
    ```

    אותו bucket או בין buckets. התקדמות היא סטטוס בלבד (אין זרם בתים).

מציג התקדמות חיה לפי בתים עבור מקומי ↔ bucket כברירת מחדל.

## sync

סנכרון תיקייה דו־כיווני. הכיוון נקבע לפי סדר הארגומנטים.

בקונסול, פתחו לשונית **Properties** של אובייקט והעתיקו את **SO URI** (`so://bucket/key`) — השתמשו בערך הזה כארגומנט `so://` למטה.

**ברירת מחדל:** דריסת כל קובץ שקיים בצד המקור (העלאה או הורדה).

| דגל | התנהגות |
|-----|---------|
| *(none)* | דריסת מפתחות/קבצים תואמים |
| `--skip` | דילוג כשגודל היעד כבר תואם (גודל בלבד, לא hash תוכן) |
| `--delete` | גם הסרת עודפים ביעד (מראה) |

פקודה אחת מכסה **מקומי → באקט**, **באקט → מקומי**, ו-**באקט → באקט** (`so://` → `so://`, העתקה בצד השרת).

=== "העלאה (מקומי → SO)"

    ```bash
    homecloud so sync ./dist so://my-website/
    homecloud so sync ./dist so://my-website/ --delete
    homecloud so sync ./dist so://my-website/ --skip
    ```

    `--delete` מסיר אובייקטים מרוחקים שאינם קיימים מקומית (מצב מראה).

=== "הורדה (SO → מקומי)"

    ```powershell
    homecloud so sync so://docs/ ./site
    homecloud so sync so://docs/ ./site --delete
    homecloud so sync so://docs/ ./site --skip
    ```

    אובייקט בודד (העתיקו SO URI מ-**Properties** בקונסול):

    ```powershell
    homecloud so sync "so://my-bucket/watch/spider noir/1/file.mkv" ".\local-dir\"
    ```

    `--delete` מסיר קבצים מקומיים שאינם קיימים ב-bucket (מצב מראה).

    מפתחות עם רווחים חייבים להיות מצוטטים ב-PowerShell:

    ```powershell
    homecloud so sync "so://watch/spider noir/1/" ".\local-dir\"
    ```

    קבצים גדולים נזרמים לדיסק (בלי buffer של הקובץ המלא בזיכרון). מפתחות אובייקט עם רווחים משתמשים בנתיבים מקודדי URL ל-HTTP בזמן חתימת נתיב המפתח הקנוני.

=== "באקט → באקט"

    ```bash
    homecloud so sync so://photos/ so://backup/photos/
    homecloud so sync so://src-bucket/prefix/ so://dest-bucket/prefix/ --delete
    homecloud so sync so://a/ so://b/ --skip -j 16
    ```

    סנכרון מרוחק משתמש בהעתקה בצד השרת (בלי הורדה דרך המחשב שלכם). `--delete` מסיר אובייקטים תחת prefix היעד שאינם קיימים תחת prefix המקור.

!!! warning "שינוי שובר (v0.2.15)"
    לפני v0.2.15, sync דילג על קבצים באותו גודל כברירת מחדל. מ-v0.2.15, sync **דורס כברירת מחדל**. השתמשו ב-`--skip` כדי לשחזר את התנהגות הדילוג לפי גודל הישנה.

### פלט חי (ברירת מחדל)

ההתקדמות **מבוססת בתים** להעלאות והורדות: סרגל משותף אחד מציג גודל שהועבר, מהירות, ETA וספירת קבצים. Workers מעדכנים מונה בתים thread-safe; הממשק מרענן ב-10 Hz (workers אף פעם לא נוגעים ב-Rich ישירות). שורות לפי קובץ עדיין מציגות `upload`, `download`, `skip` או `delete`.

```
scan  57 local, 12 remote, 57 operations
sync → so://my-website/  |  3/57 files  |  index.html  ━━━━━━━━  42%  12.3 MB/s  0:01:20  120/280 MB

upload  index.html
upload  assets/app.js
```

עם `--skip`, קבצים שלא השתנו ובאותו גודל מוצגים כ-`skip` במקום `upload`/`download`.

הורדה מציגה `sync ← so://bucket/` ושורות `download` במקום `upload`.

### העברות מקבילות

כברירת מחדל **10 קבצים** מועברים בבת אחת (`-j` / `--workers`, מקסימום 64). משתמש מחדש בחיבורי HTTP למהירות:

```bash
homecloud so sync so://docs/ ./site -j 20
homecloud so sync ./dist so://my-website/ --delete -j 16
homecloud so sync ./dist so://my-website/ --skip -j 16
```

השתמשו ב-`--output json` ב-CI כדי לדכא התקדמות ולהפיק סיכום JSON.

### פריסת אתר סטטי (GitHub Actions)

```yaml
- name: Deploy site
  env:
    HOMECLOUD_ACCESS_KEY_ID: ${{ secrets.HOMECLOUD_ACCESS_KEY_ID }}
    HOMECLOUD_SECRET_ACCESS_KEY: ${{ secrets.HOMECLOUD_SECRET_ACCESS_KEY }}
    HOMECLOUD_APEX: holab.abrdns.com
  run: |
    curl -fsSL https://homecloud-cli.so.holab.abrdns.com/releases/latest/homecloud-linux-amd64 -o homecloud
    chmod +x homecloud && sudo mv homecloud /usr/local/bin/
    homecloud so sync ./site so://my-website/ --delete --output json
```

## rm

```bash
homecloud so rm so://media/path/file.txt
homecloud so rm so://media/old-site/ --recursive
```

## כתובת אתר

הפעילו **Static Website** על bucket בקונסול, ואז:

```text
https://{bucket}.web.{apex}
```

דוגמה: `https://docs.web.holab.abrdns.com`
