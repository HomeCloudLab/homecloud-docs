# homecloud-docs

HomeCloud documentation site — [https://docs.web.holab.abrdns.com](https://docs.web.holab.abrdns.com)

Built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) (GitHub-like Markdown rendering with syntax highlighting, admonitions, tabs, and search).

## Local preview

```bash
pip install -r requirements.txt
mkdocs serve
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Build

```bash
mkdocs build --strict
# output → site/
```

## Deploy

Automatic on push to `main` via GitHub Actions → `homecloud so sync` → bucket `docs`.

Manual:

```bash
mkdocs build
homecloud so sync ./site so://docs/ --delete
```

## First-time setup

See [docs/operations/docs-site.md](docs/operations/docs-site.md) for bucket, website, and GitHub secrets configuration.

## Structure

```text
docs/
  index.md                 # Home
  getting-started/         # Platform onboarding
  cli/                     # CLI reference
  sdk/                     # Python SDK
  platform/                # Architecture
  operations/              # Runbooks (this site, etc.)
```
