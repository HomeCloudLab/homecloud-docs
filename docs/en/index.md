# HomeCloud documentation

These docs explain **how to use HomeCloud** after you open an account — in the web console, with the CLI, and from your own apps via the SDK.

They are written for **account owners, developers, and DevOps** who build and run workloads on the platform. They are not an internal engineering handbook.

**Live site:** [https://docs.web.holab.abrdns.com](https://docs.web.holab.abrdns.com)

## What you can do

| You want to… | Start here |
|--------------|------------|
| Open an account and sign in | [Open an account](getting-started/accounts.md) |
| Learn the console layout | [Using the console](getting-started/console.md) |
| Store and sync files / static sites | [Object Storage (SO)](guides/object-storage.md) |
| Send and receive messages | [Message Queues (MQ)](guides/queues.md) |
| Run PostgreSQL / MySQL / MongoDB | [Managed Databases (MDB)](guides/databases.md) |
| Run serverless code | [Functions](guides/functions.md) |
| Deploy an app from a template | [Applications](guides/applications.md) |
| Push Docker images | [Image Registry (IR)](guides/registry.md) |
| Send and read email | [Mail](guides/mail.md) |
| Automate with scripts | [CLI](cli/index.md) · [SDK](sdk/index.md) · [Terraform](terraform/index.md) |

## How HomeCloud is organized (for users)

Everything you create belongs to an **account**. Inside an account you use services from the console sidebar (Storage, Queues, Databases, Functions, and so on).

There are two ways to authenticate:

| How you work | Credential | Typical use |
|--------------|------------|-------------|
| Browser console, or `homecloud login` | Username + password (+ MFA) → short-lived session | Create resources, invite people, manage settings |
| Scripts, CI, apps, `homecloud so` / `mq` / Terraform | **Access Key** ID + secret | Upload objects, publish messages, invoke functions, provision queues/buckets |

You create Access Keys once in the console. Runtime automation never asks for MFA.

## Suggested path

1. [What is HomeCloud?](getting-started/overview.md) — mental model in plain language  
2. [Open an account](getting-started/accounts.md) — signup and first login  
3. [Using the console](getting-started/console.md) — where things live  
4. [Access Keys](getting-started/access-keys.md) — credentials for CLI and SDK  
5. Pick a [service guide](guides/index.md) for the product you need  

## Consoles and hostnames

Your platform uses one apex domain (for example `holab.abrdns.com`):

| Surface | Typical hostname | What it is |
|---------|------------------|------------|
| Console | `console.{apex}` | Web UI and control-plane API |
| Object Storage | `so.{apex}` | Object API; websites at `{bucket}.web.{apex}` |
| Queues | `mq.{apex}` | Message queue API |
| Functions | `fn.{apex}` | Function runtime |
| Registry | `ir.{apex}` | Private container images |
| Databases | `*.mdb.{apex}` | Managed DB connection endpoints |
| Secrets | `secrets.{apex}` | Secrets data plane |

You normally open the **console** URL your admin or signup page gave you. The other hostnames appear in connection strings, CLI config, and SDK clients.
