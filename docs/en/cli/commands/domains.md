# domains

Custom domains, hosted DNS records, and service attach.

```bash
homecloud domains list
homecloud domains create example.com --dns-mode external
homecloud domains get DOMAIN_ID
homecloud domains verify DOMAIN_ID
homecloud domains attach DOMAIN_ID --target-id FUNCTION_ID --target-type function --host test
homecloud domains detach ATTACHMENT_ID
homecloud domains records DOMAIN_ID
homecloud domains record-create DOMAIN_ID --type A --record 1.2.3.4 --host www
homecloud domains record-update DOMAIN_ID RECORD_ID --type A --record 1.2.3.5 --host www
homecloud domains record-delete DOMAIN_ID RECORD_ID
homecloud domains delete DOMAIN_ID
```

`--host` on attach is relative to the domain (`test`, `www`). Empty is the root name. `records` includes `origin` and `mode`. Dynamic DNS updates use `/nic/update` (dyndns2) with the one-time token from the console — not an account JWT. Check DNS, changing a pending host, switching External DNS ↔ HomeCloud DNS, and zone-file import/export are in the Console.

Guide: [Domains](../../guides/domains.md).
