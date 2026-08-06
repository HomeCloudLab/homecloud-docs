# fn

פקודות Functions.

## list

דורש התחברות לקונסול:

```bash
homecloud login --username alice
homecloud fn list
homecloud fn list --output json
```

## invoke

Invoke דרך Function URL עם HMAC של Access Key. לפונקציה חייב להיות Function URL מופעל (ראו `fn url --enable`).

```bash
homecloud fn invoke hello --payload '{"name":"Ada"}'
homecloud fn invoke hello --payload-file event.json
homecloud fn invoke hello -p '{}' --output json
```

## url

הצגה או הפעלה/השבתה של Function URL (JWT קונסול):

```bash
homecloud fn url hello
homecloud fn url hello --enable
homecloud fn url hello --enable --public    # WARNING: anonymous invoke
homecloud fn url hello --disable
```

`--public` מאפשר invoke אנונימי — השתמשו רק כשאתם רוצים במכוון נקודת קצה HTTP פתוחה.

## logs

רשימת invocations אחרונות, או הדפסת פרטי ולוגי invocation אחד:

```bash
homecloud fn logs hello
homecloud fn logs hello --id <invocation-id>
homecloud fn logs hello --id <invocation-id> --output json
```

## watch

המתנה ל-invocation הבא שהושלם והדפסת הלוגים שלו (לוגים זמינים אחרי סיום הריצה, לא בזרם באמצע):

```bash
homecloud fn watch hello
homecloud fn watch hello --wait 300 --poll 2
homecloud fn watch hello --wait 0              # wait forever
homecloud fn watch hello --since-id <id>
```

קוד יציאה `1` אם חולפים `--wait` שניות בלי invocation חדש.

## דרישות קדם

- הפונקציה קיימת ופורסה ([מדריך Functions](../../guides/functions.md))
- `fn list` / `fn url` / `fn logs` / `fn watch` → התחברות לקונסול
- `fn invoke` → Access Key + Function URL מופעל

## קשור

- [מדריך Functions](../../guides/functions.md)  
- [SDK](../../sdk/index.md)  
