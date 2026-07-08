# so

פקודות אחסון אובייקטים.

## ls-buckets

דורש התחברות ל-console:

```bash
homecloud login --username alice
homecloud so ls-buckets
```

## ls

```bash
homecloud so ls media
homecloud so ls media --prefix photos/ --recursive
```

## cp

העלאת קובץ יחיד:

```bash
homecloud so cp ./build.zip so://media/releases/build.zip
```

מציג התקדמות חיה כברירת מחדל.

## sync

סנכרון תיקיות דו-כיווני. הכיוון נקבע לפי סדר הארגומנטים.

**ברירת מחדל:** דריסה של כל קובץ שקיים בצד המקור (העלאה או הורדה).

| דגל | התנהגות |
|------|----------|
| *(ללא)* | דריסת מפתחות/קבצים תואמים |
| `--skip` | דילוג כשהגודל ביעד כבר תואם (לפי size בלבד, לא hash) |
| `--delete` | גם מחיקת עודפים ביעד (מצב mirror) |

=== "העלאה (מקומי → SO)"

    ```bash
    homecloud so sync ./dist so://my-website/
    homecloud so sync ./dist so://my-website/ --delete
    homecloud so sync ./dist so://my-website/ --skip
    ```

    ‏`--delete` מסיר אובייקטים מרוחקים שאינם קיימים מקומית (מצב mirror).

=== "הורדה (SO → מקומי)"

    ```powershell
    homecloud so sync so://docs/ ./site
    homecloud so sync so://docs/ ./site --delete
    homecloud so sync so://docs/ ./site --skip
    ```

    ‏`--delete` מסיר קבצים מקומיים שאינם קיימים ב-bucket (מצב mirror).

!!! warning "שינוי שובר תאימות (v0.2.15)"
    לפני v0.2.15, sync דילג כברירת מחדל על קבצים באותו גודל (סגנון AWS S3 sync). מ-v0.2.15, sync **דורס כברירת מחדל**. השתמשו ב-`--skip` להתנהגות הישנה.

### פלט חי (ברירת מחדל)

```
scan  57 local, 12 remote, 57 operations
sync → so://my-website/  ━━━━━━━━━━━━━━━━━━━━ 100%

upload  index.html
upload  assets/app.js
upload  favicon.ico
delete  old-bundle.js
```

עם `--skip`, קבצים באותו גודל מוצגים כ-`skip` במקום `upload`/`download`.

בהורדה מוצג `sync ← so://bucket/` ושורות `download` במקום `upload`.

### העברות מקביליות

כברירת מחדל **10 קבצים** מועברים בו-זמנית (‏`-j` / `--workers`, מקסימום 64). שימוש חוזר בחיבורי HTTP למהירות:

```bash
homecloud so sync so://docs/ ./site -j 20
homecloud so sync ./dist so://my-website/ --delete -j 16
homecloud so sync ./dist so://my-website/ --skip -j 16
```

השתמשו ב-`--output json` ב-CI כדי לדכא התקדמות ולפלוט סיכום JSON.

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

## כתובת האתר

הפעילו **Static Website** על bucket ב-console, ואז:

```text
https://{bucket}.web.{apex}
```

דוגמה: `https://docs.web.holab.abrdns.com`
