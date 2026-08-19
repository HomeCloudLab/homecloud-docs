# SDK ל-Java

גישה תכנותית ל-HomeCloud מ-Java 17+.

**Maven:** `com.homecloudlab:homecloud-sdk`  
**Package:** `com.homecloudlab.sdk`  
**ADR:** [ADR-052](https://github.com/HomeCloudLab/homecloud-infra/blob/master/docs/adr/adr-052-java-sdk.md)

אותן יכולות HomeCloud כמו [Python](python.md), [Node.js](nodejs.md) ו-[Go](go.md). ה-API הציבורי אידיומטי ל-Java (`HomeCloud.builder()`, records, חריגות unchecked) ורשאי להיראות אחרת. ההתנהגות שקולה אלא אם תיעדנו תיקון בטיחות (למשל Java **לא** מריטריא `mq().send` אוטומטית).

`HomeCloud` הוא thread-safe אחרי הבנייה. עשו reuse (למשל Spring `@Bean`). Login אינטראקטיבי ב-`HomeCloudAuth` ומחזיר client **חדש**.

## התקנה

```xml
<dependency>
  <groupId>com.homecloudlab</groupId>
  <artifactId>homecloud-sdk</artifactId>
  <version>0.5.10</version>
</dependency>
```

עד Maven Central (שער GA ציבורי) מורידים מ-**GitHub Packages** — ראו את [README של Java](https://github.com/HomeCloudLab/homecloud-sdk/blob/master/java/README.md) ל-repository + PAT. Maven Central לא דורש PAT.

## יצירת לקוח

```java
HomeCloud client = HomeCloud.fromEnv();
client.so().upload("docs", UploadOptions.builder().filePath("./a.txt").key("a.txt").build());
```

מפתחות מפורשים:

```java
HomeCloud client = HomeCloud.fromCredentials("HCAK...", "secret");
```

פרופיל `~/.homecloud/credentials`:

```java
HomeCloud client = HomeCloud.fromProfile("ci");
```

קונפיגורציה מתקדמת:

```java
HomeCloud client = HomeCloud.builder()
    .apex("holab.abrdns.com")
    .accessKey("HCAK...", "secret")
    .requestTimeout(Duration.ofSeconds(30))
    .build();
```

### מתוך Function (STS)

```java
HomeCloud client = HomeCloud.fromSts(new Sts(
    entry.accessKeyId(),
    entry.secretAccessKey(),
    entry.sessionToken(),
    entry.baseUrl(),
    null,
    "so"
));
```

## Object Storage

```java
client.so().putJson("docs", "a.json", Map.of("ok", true));
ObjectHead meta = client.so().headObject("docs", "a.json");
```

## תורים

```java
client.mq().send("orders", Map.of("id", 1));
List<Message> msgs = client.mq().receive("orders", new ReceiveOptions(10, 5, false));
```

`send` **לא** מרוטרי על 502/503/504 (בניגוד ל-Python/Node) כדי לא לשכפל הודעות.

## שגיאות

```java
try {
    client.so().headObject("docs", "missing.txt");
} catch (NotFoundException e) {
    System.out.println(e.getResourceType() + " " + e.getResource());
}
```

## משתני סביבה

כמו ב-Python: `HC_ACCESS_KEY_ID`, `HC_SECRET_ACCESS_KEY`, `HC_APEX`, `HC_PROFILE` (וגם `HOMECLOUD_*`).

## קשור

- [סקירת SDK](index.md)
- [Python SDK](python.md)
- [Node.js SDK](nodejs.md)
- [SDK ל-Go](go.md)
