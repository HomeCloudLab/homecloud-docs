# Node.js SDK

גישה תוכנתית ל-HomeCloud מ-Node.js 20+.

**חבילה:** `@homecloud-platform/sdk`

## התקנה

```bash
npm install @homecloud-platform/sdk
```

## יצירת קליינט

```js
const { HomeCloud } = require("@homecloud-platform/sdk");

// Environment: HC_ACCESS_KEY_ID / HC_SECRET_ACCESS_KEY / HC_APEX
const client = HomeCloud.fromEnv();

// Explicit
const client2 = new HomeCloud({
  accessKeyId: process.env.HC_ACCESS_KEY_ID,
  secretAccessKey: process.env.HC_SECRET_ACCESS_KEY,
  apex: process.env.HC_APEX,
});

// From ~/.homecloud credentials profile
const client3 = HomeCloud.fromProfile("ci");
```

### בתוך Function (STS)

כש-runtime של Function מספק אישורי STS זמניים:

```js
exports.handler = async (event, context) => {
  const client = HomeCloud.fromSts(context.sts.archive, {
    accountId: context.account_id,
  });
  await client.so.putJson("my-bucket", "proof/ok.json", { ok: true });
  return { ok: true };
};
```

`fromFunctionContext` גם זמין כשה-runtime אורז אובייקט context מלא — ראו את README של החבילה לשמות העוזרים המדויקים בגרסה שלכם.

## Object Storage

```js
await client.so.putJson("docs", "a.json", { ok: true });

await client.so.upload("media", null, {
  body: Buffer.from("..."),
  key: "videos/clip.mp4",
  contentType: "video/mp4",
});

const meta = await client.so.headObject("docs", "a.json");
await client.so.download("docs", "a.json", "./a.json");
```

## Message Queues

```js
await client.mq.send("orders", { id: 1 });
await client.mq.send("orders", [{ id: 1 }, { id: 2 }]);

const messages = await client.mq.receive("orders", {
  maxMessages: 10,
  waitSeconds: 5,
});
for (const msg of messages) {
  // process…
  await client.mq.delete("orders", msg.sequence);
}

await client.mq.receive("orders", { maxMessages: 10, delete: true });
```

## Functions, Mail, Secrets, Apps

קליינט Node משקף את משטח Python ל-Functions, Mail, Secrets, Apps, Accounts ועוזרי ניהול Queues. דפוס טיפוסי:

```js
const functions = await client.functions.list();
const result = await client.functions.invoke("hello", { name: "Ada" });

const boxes = await client.mail.listMailboxes();
const secrets = await client.secrets.list();
```

שמות שיטות עוקבים אחרי מוסכמות JavaScript (`listMailboxes`, `putJson`, …). בדקו טיפוסי TypeScript בחבילה לחתימות המדויקות של הגרסה המותקנת.

## שגיאות

שגיאות מוקלדות משקפות את Python SDK (not found, unauthorized, permission denied, rate limit, …). תפסו את סוג השגיאה הבסיסי מהחבילה ופצלו לפי `statusCode` / name.

```js
try {
  await client.so.headObject("docs", "missing.txt");
} catch (err) {
  console.error(err.name, err.statusCode, err.message);
}
```

## משתני סביבה

כמו ב-Python: `HC_ACCESS_KEY_ID`, `HC_SECRET_ACCESS_KEY`, `HC_APEX`, `HC_PROFILE` (וגם צורות `HOMECLOUD_*` הארוכות).

## גרסאות

SDKs של Node ו-Python מתפרסמים יחד על אותו תג `v*` כדי שהגרסאות יישארו מיושרות.

## קשור

- [סקירת SDK](index.md)  
- [Python SDK](python.md)  
- [SDK ל-Go](go.md)  
- [SDK ל-Java](java.md)  
- [מדריך Functions](../guides/functions.md)  
