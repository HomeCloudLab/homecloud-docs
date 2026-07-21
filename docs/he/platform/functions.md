# פונקציות

HomeCloud Functions הן יחידות compute serverless מנוהלות — המקבילה בפלטפורמה ל-AWS Lambda. כותבים handlers ב-Python 3.12 בסביבת קונסול בסגנון VS Code, פורסים גרסאות בלתי משתנות, ומריצים invoke סינכרוני דרך ה-control plane (ה-runtime החם נמצא ב-data plane של Functions).

## יצירה

1. פתחו **Console → Functions**.
2. **Create function** — שם תואם DNS, handler (ברירת מחדל `main.handler`), זיכרון ו-timeout.
3. הפלטפורמה מזריעה workspace עם `main.py`.

## סביבת קוד

לשונית **Code**: עץ קבצים, עורך Monaco עם לשוניות (`vs-dark`), שמירה ופריסת גרסה.

## Deploy / Invoke / Triggers / Layers

ראו את הגרסה האנגלית לפרטים מלאים על deploy (`so://` לארטיפקטים), invoke, triggers ו-layers.

## קישורים

- [שירותי הפלטפורמה](services.md)
