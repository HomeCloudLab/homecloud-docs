# Account & team

The Account hub is where you manage the **tenant itself**: people, security, projects, audit, and inventory — not a single product like Storage or Queues.

| Item | Value |
|------|--------|
| Console | **Account** → `/console/account` |
| Projects | `/console/account/projects` |
| Resources | `/console/account/resources` |

## Overview

Account summary: name, identifiers (including the 12-digit account number used in ARNs), and high-level status.

## Security & sessions

- Change password  
- Enroll **MFA** (authenticator app and/or passkeys)  
- Review **active sessions** and revoke unknown ones  

Owners should require MFA for privileged users.

## Members

Invite colleagues and assign a **console role** (Owner / Admin / Developer / Viewer). Remove access when someone leaves.

Invites are emailed; the invitee accepts via the link.

## IAM users & Access Keys

Manage console users and data-plane Access Keys. Prefer the dedicated [IAM](iam.md) and [Access Keys](../getting-started/access-keys.md) guides for policies and automation credentials.

## Audit

The audit log shows important account actions (who created keys, revealed secrets, changed members, …). Use it during incident review.

## Projects

Projects group related Applications and resources so a team can find “everything for product X” in one place.

1. Create a project.  
2. Assign applications / resources when creating or editing them.  
3. Filter by project in list views when available.

## Resources

Cross-service inventory of what exists in the account (buckets, queues, databases, …). Useful before cleanup or quota conversations.

## Quotas

Plans enforce limits (counts, storage, …). If create fails with a quota error, free unused resources or ask a platform admin to raise limits.

## Tips

- Keep at least two Owners or Admins so you are not locked out.  
- Use Viewer for stakeholders who only need visibility.  
- Review Access Keys and members quarterly.

## Related

- [Open an account](../getting-started/accounts.md)  
- [IAM](iam.md)  
- [Using the console](../getting-started/console.md)  
