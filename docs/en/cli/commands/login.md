# login

Console authentication (JWT). Supports password-only, MFA (TOTP / backup codes), and browser login for passkeys.

```bash
homecloud login
homecloud login --username alice --password 'secret'
homecloud login --profile staging
```

## Username vs email

The API expects `username`, not email:

```bash
# ✓ Correct
homecloud login --username daivid

# ✗ Wrong (401 or invalid credentials)
homecloud login --username daivid.aba@gmail.com
```

## MFA (TOTP / backup codes)

If MFA is enabled for your platform admin user, the CLI prompts for a verification code after password:

```bash
$ homecloud login --username alice
Password:
Verification code: 123456
✓ Logged in
```

Non-interactive / scripts:

```bash
homecloud login --username alice --password 'secret' --mfa-code 123456
```

`mfa_token` and verification codes are never written to disk — only the resulting JWT is stored in `~/.homecloud/session`.

## Browser login (passkeys / security keys)

Recommended when you use passkeys or hardware security keys:

```bash
homecloud login --browser
```

Flow:

1. CLI starts a short-lived session and opens the Console
2. You sign in in the browser (password, TOTP, backup code, or passkey)
3. Click **Authorize CLI**
4. CLI receives a one-time JWT and exits

```text
Opening browser...
Complete authentication in your browser.
  https://console.…/auth/cli?session=…
Waiting for authentication...
✓ Logged in
```

## After login

```bash
homecloud accounts list
homecloud queues list
homecloud so ls-buckets
```

Session persists in `~/.homecloud/session`.
