# Node.js SDK

Programmatic access to HomeCloud from Node.js 20+.

**Package:** `@homecloud-platform/sdk`

## Install

```bash
npm install @homecloud-platform/sdk
```

## Create a client

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

### Inside a Function (STS)

When your Function runtime provides temporary STS credentials:

```js
exports.handler = async (event, context) => {
  const client = HomeCloud.fromSts(context.sts.archive, {
    accountId: context.account_id,
  });
  await client.so.putJson("my-bucket", "proof/ok.json", { ok: true });
  return { ok: true };
};
```

`fromFunctionContext` is also available when the runtime packs a full context object — see the package README for the exact helper names in your version.

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

The Node client mirrors the Python surface for Functions, Mail, Secrets, Apps, Accounts, and Queues management helpers. Typical pattern:

```js
const functions = await client.functions.list();
const result = await client.functions.invoke("hello", { name: "Ada" });

const boxes = await client.mail.listMailboxes();
const secrets = await client.secrets.list();
```

Method names follow JavaScript conventions (`listMailboxes`, `putJson`, …). Check TypeScript types in the package for the exact signatures of your installed version.

## Errors

Typed errors mirror the Python SDK (not found, unauthorized, permission denied, rate limit, …). Catch the base error type from the package and branch on `statusCode` / name.

```js
try {
  await client.so.headObject("docs", "missing.txt");
} catch (err) {
  console.error(err.name, err.statusCode, err.message);
}
```

## Environment variables

Same as Python: `HC_ACCESS_KEY_ID`, `HC_SECRET_ACCESS_KEY`, `HC_APEX`, `HC_PROFILE` (and long `HOMECLOUD_*` forms).

## Versioning

Node and Python SDKs publish together on the same `v*` tag so versions stay aligned.

## Related

- [SDK overview](index.md)  
- [Python SDK](python.md)  
- [Functions guide](../guides/functions.md)  
