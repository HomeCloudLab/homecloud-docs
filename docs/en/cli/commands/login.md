# login

Console authentication (JWT). Supports password-only, MFA (TOTP / backup codes), and browser login for passkeys.

```bash
homecloud login
homecloud login --account 100200300400 --username alice --password 'secret'
homecloud login --profile staging
```

## Account, then username

Login resolves **Account → Username → Password → MFA**. `--account` takes the account
number or the account alias, and is required for terminal login (browser login resolves
it on the Console login page instead):

```bash
# ✓ Correct — account number or alias, then username (not email)
homecloud login --account 100200300400 --username daivid
homecloud login --account acme-corp --username daivid

# ✗ Wrong (401 or invalid credentials)
homecloud login --account acme-corp --username daivid.aba@gmail.com
```

## Interactive menus

On a real terminal (TTY), `homecloud login` asks how to sign in with arrow keys:

```text
? How do you want to sign in?
❯ Terminal  — username, password, authenticator / backup code
  Browser   — passkeys & security keys (recommended if you use a passkey)
```

If MFA offers both authenticator and passkey:

```text
? Choose second factor
❯ Authenticator app or backup code
  Passkey / security key (YubiKey) — opens browser
```

Flags skip the menus: `--browser`, `--mfa-code`, `--account` / `--username` / `--password`.

## MFA (TOTP / backup codes)


If MFA is enabled for your user, the CLI prompts for a verification code after password:

```bash
$ homecloud login --account 100200300400 --username alice
Password:
Verification code: 123456
✓ Logged in
```

Non-interactive / scripts:

```bash
homecloud login --account 100200300400 --username alice --password 'secret' --mfa-code 123456
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
3. After successful sign-in the CLI is authorized automatically
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
