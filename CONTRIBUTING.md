# Contributing

## Setup

```bash
bun install
```

## Checks

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

## Pull requests

1. Branch from `main`.
2. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit subjects and the PR title (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`).
3. Keep PRs focused. `main` requires review and green CI.

## Engineering principles

- **YAGNI** — only build what v0.1 needs (browse via CLI Open).
- Prefer trusted libraries over custom parsers/servers for solved problems.
- Prefer deep modules (small surface, clear responsibility) over shallow wrappers.
- Separation of concerns: CLI opens and serves; route handlers read the Bundle; UI browses.
- No premature optimization; comment the *why*; update docs with behavior changes.

See `CONTEXT.md` for product language.
