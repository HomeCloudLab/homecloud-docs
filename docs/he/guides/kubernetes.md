# Kubernetes

קונסול Kubernetes מאפשר **לעיין ולהפעיל עומסים** ב-namespace של החשבון באשכול הפלטפורמה. לשימוש רגיל אין צורך להדביק kubeconfig — הקונסול מדבר עם האשכול בשמכם.

| פריט | ערך |
|------|--------|
| Console | **Kubernetes** → `/console/kubernetes` |
| Scope | ה-namespace של החשבון (סגנון `acc-{shortId}`). אדמיני פלטפורמה רואים גם namespaces מערכתיים, אף פעם לא namespaces מסוג `acc-*` של דיירים אחרים |

## מה אפשר לעשות

- לרשום namespaces שמותר לראות  
- לעיין ב-**Deployments** ו-**Pods**  
- לבדוק סטטוס, הפעלות מחדש ואירועים  
- לכוון **scaling** / HPA כשחשוף  
- לצפות ולערוך **configuration**  
- **Apply YAML** למשאבים מותאמים מתקדמים (אמתו לפני apply)

## הליכה בקונסול

### מציאת העומסים שלכם

1. פתחו **Kubernetes**.  
2. בחרו את ה-namespace של החשבון.  
3. פתחו **Workloads** / Deployments כדי לראות ספירות replicas ומוכנות.

### Pods

פתחו deployment → **Pods**:

- ראו pods רצים, הפעלות מחדש, מיקום node  
- השתמשו בזה כשאפליקציה «עולה» ב-Applications אבל התעבורה נכשלת — ודאו שה-pods ב-Ready

### Scaling

פתחו **Scaling**:

- הגדירו מספר replicas רצוי  
- הגדירו או בדקו Horizontal Pod Autoscaler כשזמין  
- השתמשו בפאנלי בריאות / מדדים / ציר זמן כשגרסת הקונסול מציגה אותם (Info בקונסול מסביר כל גרף)

### Configuration

צפו בסביבה, mounts והגדרות קשורות. העדיפו לשנות **Settings** של Applications כשהעומס נוצר מתבנית Application, כדי לא לסטות ממודל האפליקציה.

### Apply YAML

למשתמשים מתקדמים:

1. הדביקו מניפסט.  
2. **Validate**.  
3. **Apply** רק כשהאימות מצליח.

הימנעו מהחלת שינויים שנלחמים ב-operator או ב-controller של Application.

## קשר לשירותים אחרים

| שירות | קשר |
|-------|-----|
| **Applications** | פריסה ברמה גבוהה יותר; משתמשת ב-Kubernetes מאחורי הקלעים |
| **MDB / Redis** | עשויים להציג pods קשורים לדיבוג; נהלו יום־2 דרך הקונסולים שלהם |
| **Functions** | runtime נפרד; לא נערך כ-Deployments גולמיים לשימוש רגיל |

## טיפים ומלכודות

- בידוד חשבון מבוסס namespace — לא תראו עומסים של לקוחות אחרים.  
- ניהול אשכול (nodes, Traefik, storage classes) הוא עניין של **מפעיל פלטפורמה**.  
- אם Apply נכשל, קראו Events על המשאב לפני ניסיון חוזר.  
- הגדלה לאפס עשויה להיות מוגבלת במדיניות הפלטפורמה לחלק מהעומסים.

## קשור

- [Applications](applications.md)  
- [Image Registry](registry.md)  
