# login

Console authentication (JWT).

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

## After login

```bash
homecloud accounts list
homecloud queues list
homecloud so ls-buckets
```

Session persists in `~/.homecloud/session`.
