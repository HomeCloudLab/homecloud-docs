# Open an account

An **account** is your isolated HomeCloud workspace. Buckets, queues, databases, apps, and Access Keys all live inside it.

## Self-service signup

If public signup is enabled on your platform:

1. Open `https://console.{apex}/open-account` (also linked from the **Sign in** page).  
2. Enter your **email** and request a verification code.  
3. Enter the **6-digit OTP** from the email.  
4. Choose an **account name**, **username**, and **password**. The account slug is derived from the name.  
5. You land in the console as the **account owner**.

Signup creates a **bare** tenant: the account plus your owner user. No buckets, databases, or apps are created automatically — you add them when you need them.

## Join an existing account (invite)

1. Open the invite link from email (`/invite/...`).  
2. Sign in or create your user as prompted.  
3. Accept the invite. Your **console role** (Owner / Admin / Developer / Viewer) is set by whoever invited you.

Owners and admins invite people later under **Account → Members** (or **IAM → Users**, depending on your console version).

## Sign in

1. Go to `https://console.{apex}/login`.  
2. Enter account identifier (account number or alias), username, and password.  
3. Complete **MFA** if it is enabled for your user (TOTP or passkey).  

After login you see the dashboard. If you belong to several accounts, use the **account switcher** in the top bar.

## First things to do after signup

| Step | Why |
|------|-----|
| Enable MFA on your owner user | Protects console access |
| Invite teammates with the right role | Viewer cannot change resources; Developer can build |
| Create an [Access Key](access-keys.md) | Needed for CLI / SDK / CI |
| Skim [Using the console](console.md) | Learn where each service lives |

## CLI: list and switch accounts

```bash
homecloud login --username alice
homecloud accounts list
homecloud accounts switch my-team
```

Access Keys always belong to **one** account. When you run `homecloud configure` with a key, that account is selected automatically for data-plane commands.

## Platform-admin created accounts

If a platform administrator created your tenant for you, they may have chosen a bootstrap mode (bare / minimal / full). You still sign in the same way. Ask them for the console URL and your initial username.

## Related

- [Using the console](console.md)  
- [Access Keys](access-keys.md)  
- [Account & team](../guides/account.md)  
- [IAM](../guides/iam.md)  
