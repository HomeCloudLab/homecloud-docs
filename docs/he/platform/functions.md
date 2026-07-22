# פונקציות

HomeCloud Functions הן יחידות compute serverless מנוהלות — המקבילה בפלטפורמה ל-AWS Lambda. כותבים handlers ב-Python 3.12 בסביבת קונסול בסגנון VS Code, פורסים גרסאות בלתי משתנות, ומריצים invoke סינכרוני דרך ה-control plane (ה-runtime החם נמצא ב-data plane של Functions).

## יצירה

1. פתחו **Console → Functions**.
2. **Create function** — שם תואם DNS, handler (ברירת מחדל `main.handler`), זיכרון ו-timeout.
3. הפלטפורמה מזריעה workspace עם `main.py`.

## סביבת קוד

לשונית **Code**: עץ קבצים עם אייקונים ותגי תפקיד, עורך Monaco עם לשוניות, שמירה, Format, Outline ו-Problems.

## תצוגת Build ו-Deploy

לפני Deploy אפשר לפתוח **Build & Deploy Preview**: Runtime, Entrypoint (נגזר מ-handler), Handler, רשימת קבצים בחבילה, גודל ואזהרות. אותם כללי אריזה כמו Deploy; Deploy נחסם כשיש שגיאות אימות.

## Deploy / Invoke / Triggers / Layers

ראו את הגרסה האנגלית לפרטים מלאים על deploy (`so://` לארטיפקטים), invoke, triggers ו-layers.

## קישורים

- [שירותי הפלטפורמה](services.md)
