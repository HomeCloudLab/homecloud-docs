# Secrets

Secrets מאחסנים ערכים רגישים (טוקני API, סיסמאות DB, מפתחות webhook) כרשומות בשם עם מפות מפתח/ערך. אפליקציות, Functions ומפעילים שולפים אותם בלי להקשיח סודות במקור.

| פריט | ערך |
|------|--------|
| Console | **Secrets** → `/console/secrets` |
| Data plane | `secrets.{apex}` (Access Key) |
| Reveal | מתועד ב-control plane |

## הליכה בקונסול

### יצירה

1. פתחו **Secrets** → **Create**.  
2. בחרו שם (מזהה יציב שהאפליקציה תפנה אליו).  
3. הוסיפו מפתח אחד או יותר (למשל `username`, `password`, `url`).  
4. שמרו.

### צפייה וסיבוב

1. פתחו את הסוד.  
2. השתמשו ב-**Values** לחשיפה (מתועדת) או לעדכון מפתחות.  
3. העדיפו סיבוב על פני שיתוף צילומי מסך בצ'אט.  
4. לשוניות **Settings** / **API** מציגות מטא־נתונים ודוגמאות קריאות.

### מחיקה

מחקו סודות שאינם בשימוש כדי להפחית חשיפה. עדכנו צרכנים קודם כדי שפריסות לא יישברו.

## שימוש מעומסים

דפוסים שתראו ב-HomeCloud:

- הגדרות Application מפנות לשם סוד / מפתח  
- תצורת Function מזריקה ערכי סוד בזמן ריצה  
- תבניות Kubernetes / אפליקציה ממפות מפתחות סוד למשתני סביבה  

ממשק הקישור המדויק תלוי בשירות הצורך — חפשו בוחרי «Secret» ב-Applications, Functions ועוזרי חיבור Databases.

## Access Keys ומדיניות

קריאה בזמן ריצה לסודות דרך ה-data plane דורשת Access Key (או תפקיד מונח) עם פעולות `secrets:…` הנכונות. הגבילו מדיניות ל-ARNs ספציפיים של סודות כשאפשר. ראו [IAM](iam.md).

## SDK

```python
from homecloud import HomeCloud

client = HomeCloud.from_env()
print(client.secrets.list())
```

ניהול וחשיפה לעיתים עוברים דרך APIs של JWT קונסול; שמרו אוטומציה ארוכת־חיים על Access Keys עם הרשאה מינימלית.

## טיפים

- לעולם אל תעלו ערכי סוד ל-git או תשימו אותם בקבצי מקור של Function.  
- השתמשו בסוד אחד לכל אינטגרציה (מסד נתונים, Stripe, SMTP) כדי שסיבוב יהיה מוגבל.  
- אחרי סיבוב סיסמת DB ב-MDB, עדכנו את ה-Secret שהאפליקציה קוראת.

## קשור

- [IAM](iam.md)  
- [Databases](databases.md)  
- [Functions](functions.md)  
- [Applications](applications.md)  
