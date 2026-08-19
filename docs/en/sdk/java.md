# Java SDK

Programmatic access to HomeCloud from Java 17+.

**Maven:** `com.homecloudlab:homecloud-sdk`  
**Package:** `com.homecloudlab.sdk`  
**ADR:** [ADR-052](https://github.com/HomeCloudLab/homecloud-infra/blob/master/docs/adr/adr-052-java-sdk.md)

Same HomeCloud capabilities as [Python](python.md), [Node.js](nodejs.md), and [Go](go.md). The Java API is idiomatic (`HomeCloud.builder()`, records, unchecked exceptions) and is allowed to look different. Behavior matches unless a difference is documented as a safety fix (for example Java does **not** auto-retry `mq().send`).

`HomeCloud` is thread-safe after construction. Reuse one client (for example a Spring `@Bean`). Interactive login is `HomeCloudAuth` and returns a **new** client.

## Install

```xml
<dependency>
  <groupId>com.homecloudlab</groupId>
  <artifactId>homecloud-sdk</artifactId>
  <version>0.5.10</version>
</dependency>
```

Until Maven Central (public GA), install from **GitHub Packages** — see the [Java README](https://github.com/HomeCloudLab/homecloud-sdk/blob/master/java/README.md) for the repository + PAT. Maven Central is the public GA gate (no PAT).

## Create a client

```java
HomeCloud client = HomeCloud.fromEnv();
client.so().upload("docs", UploadOptions.builder().filePath("./a.txt").key("a.txt").build());
```

Explicit credentials:

```java
HomeCloud client = HomeCloud.fromCredentials("HCAK...", "secret");
```

Profile file `~/.homecloud/credentials`:

```java
HomeCloud client = HomeCloud.fromProfile("ci");
```

Advanced configuration:

```java
HomeCloud client = HomeCloud.builder()
    .apex("holab.abrdns.com")
    .accessKey("HCAK...", "secret")
    .requestTimeout(Duration.ofSeconds(30))
    .connectTimeout(Duration.ofSeconds(10))
    .build();
```

### Inside a Function (STS)

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

### Interactive login (CLI / desktop)

```java
HomeCloud client = HomeCloudAuth.login("100", "alice", "password");
```

## Object Storage

```java
client.so().putJson("docs", "a.json", Map.of("ok", true));
ObjectHead meta = client.so().headObject("docs", "a.json");
client.so().download("docs", "a.json", "./a.json");
client.so().sync("./dist", "so://my-website/", new SyncOptions(true, false, 0));
```

`listObjects` returns a page (`ListObjectsResult`). `listAllObjects` materializes every object.

## Message Queues

```java
client.mq().send("orders", Map.of("id", 1));
List<Message> msgs = client.mq().receive("orders", new ReceiveOptions(10, 5, false));
for (Message msg : msgs) {
    client.mq().delete("orders", msg.sequence());
}
```

`send` is **not** retried on 502/503/504 (unlike Python/Node) so a lost response cannot duplicate messages.

## Errors

```java
try {
    client.so().headObject("docs", "missing.txt");
} catch (NotFoundException e) {
    System.out.println(e.getResourceType() + " " + e.getResource());
}
```

## Timeouts and cancellation

Default `requestTimeout` is 30 seconds on non-streaming calls. Streaming downloads do not apply that timeout to the whole body. Cancel by interrupting the calling thread. `HomeCloud` implements `AutoCloseable` (Java 17 `HttpClient` keep-alive connections expire on their own).

## Environment variables

Same as Python: `HC_ACCESS_KEY_ID`, `HC_SECRET_ACCESS_KEY`, `HC_APEX`, `HC_PROFILE` (and `HOMECLOUD_*`).

## Related

- [SDK overview](index.md)
- [Python SDK](python.md)
- [Node.js SDK](nodejs.md)
- [Go SDK](go.md)
- [Object Storage guide](../guides/object-storage.md)
- [Queues guide](../guides/queues.md)
