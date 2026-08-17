# Didaxis QA automation

Playwright tests for [Didaxis Studio](https://test.didaxis.studio), plus Cursor agents and skills that turn Jira tickets into specs.

## Run tests

Requires Node 20+ and a Didaxis account.

```bash
git clone https://github.com/tetianna/ai-assisted-qa-automation-2.git
cd ai-assisted-qa-automation-2
npm ci
```

```powershell
Copy-Item .env.example .env
```

(or `cp .env.example .env`). Edit `.env` with your Didaxis URL and credentials. See [.env.example](.env.example). Never commit `.env`.

```bash
npx playwright test --project=chromium
```

That runs specs under `TestCases/**/*.spec.ts`. Auth setup (`tests/auth.setup.ts`) runs first and writes `playwright/.auth/user.json`. Other feature tests reuse that session.

### Tagged slice

Each `test()` has exactly one tag: `@smoke`, `@sanity`, `@regression`, `@api`, `@e2e`, or `@destructive`. Do not tag `describe`.

```bash
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:api
npm run test:e2e
npm run test:destructive
```

`test:destructive` uses `--workers=1` (shared/global state: locale, roles, flags, settings). A test that only creates and cleans up its own data keeps an importance tag — it is not `@destructive`.

`npm run test:regression` is the **`@regression` tag** only. The CI **Regression** workflow runs the **full** Chromium suite on demand (see below).

Or filter directly:

```bash
npx playwright test --project=chromium --grep @smoke
```

Run one spec:

```bash
npx playwright test TestCases/DS-1.spec.ts --project=chromium
```

Other scripts: `npm test`, `npm run test:headed`, `npm run test:ui`, `npm run eval-report`.

## CI

GitHub Actions uses the same `DIDAXIS_*` secrets as `.env`:

| Workflow | When | Command |
|----------|------|---------|
| [Smoke](.github/workflows/smoke.yml) | Every pull request | `npm run test:smoke` |
| [Sanity](.github/workflows/sanity.yml) | Every push | `npm run test:sanity` |
| [Regression](.github/workflows/regression.yml) | Manual (**Run workflow**) | all tests, `--project=chromium` |
| [Test Generation](.github/workflows/test-generation.yml) | Weekdays 06:00 UTC, or manual | Headless backlog agent (at most 5 DS tickets) |

Start a full run from Actions → **Regression** → **Run workflow**. Smoke/sanity only pick up tests that already have those tags.

## Environment

**Required to clone and run Playwright**

| Variable | Purpose |
|----------|---------|
| `DIDAXIS_URL` | App base URL |
| `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD` | Login for `storageState` |
| `DIDAXIS_API_TOKEN` | API cleanup (`trackProgram`) |

Permission-probe specs skip unless **`DIDAXIS_NON_ADMIN_EMAIL` / `DIDAXIS_NON_ADMIN_PASSWORD`** are set (that is what `tests/helpers/didaxis.ts` reads). `.env.example` also lists `DIDAXIS_ALT_*`; those names are not wired in the specs yet.

**Agent / CI only** (not needed for `npx playwright test`)

| Variable | Purpose |
|----------|---------|
| `CURSOR_API_KEY` | Headless agent in `.github/workflows/test-generation.yml` |
| `ATLASSIAN_API_TOKEN` | Jira from CI / MCP |
| `ATLASSIAN_BASE_URL` | Jira Cloud site |
| `ATLASSIAN_EMAIL` | Atlassian account for the API token |

MCP tokens belong in Cursor settings (or user `~/.cursor/mcp.json`), not in committed files. GitHub Actions uses repository secrets with the same names. Jira MCP must use project **DS**, cloud `https://legionqaschool.atlassian.net`, and `maxResults`/`limit` **10** — see `.cursor/rules/constitution.mdc` (Atlassian Rovo MCP).

## Cursor agents and skills

Project guidance lives under `.cursor/`:

- **Rules** (always on): `.cursor/rules/constitution.mdc` (including **Agent governance**: Proposal + confidence gate before non-trivial edits), `qa-orchestrator.mdc`, `playwright-conventions.mdc`
- **Skills**: `.cursor/skills/` — Gherkin from Jira, POM conventions, cleanup, a11y, triage, self-heal, exploratory charters
- **Agents**: `.cursor/agents/` — `test-writer`, `triage`, `bug-reporter`

Open this repo in Cursor. Name a skill or agent when you want it (for example “apply jira-ticket-to-gherkin to DS-1”). The orchestrator routes a ticket → plan → spec → run; a red run goes to triage, then self-heal (drift) or bug-reporter (app bug). Do not merge PRs or file bugs without a human.

## Reliability

After any orchestrator or test-generation run, refresh [eval-report.md](eval-report.md):

```bash
npm run eval-report
```

Record ask-vs-guess in `.eval/session.json` first (gitignored). Test Generation CI uploads the report as an artifact. Cursor has no built-in telemetry for flake/heal/gate metrics.
