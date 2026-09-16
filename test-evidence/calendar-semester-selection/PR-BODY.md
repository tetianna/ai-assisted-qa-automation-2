# PR body (paste into GitHub)

> The agent could not open this PR itself: `GITHUB_TOKEN` is refused with
> `GitHub Actions is not permitted to create or approve pull requests (createPullRequest)`.
> The branch `qa/calendar-semester-selection-tests` is pushed. Open the PR here:
> https://github.com/tetianna/ai-assisted-qa-automation-2/compare/main...qa/calendar-semester-selection-tests
>
> Title: `test(calendar): cover program/semester selection gating (no Jira ticket — backlog mode blocked)`

---

## Why this PR is not linked to a Jira ticket

This run was triggered as **Backlog mode**, which requires the DS queue:

```
project = DS AND status = "In Progress" AND labels != tests-generated ORDER BY updated ASC
```

**That queue could not be fetched.** `ATLASSIAN_API_TOKEN` is rejected for API-token access on the `legionqaschool` site, so no ticket could be read, and the `tests-generated` label could **not** be applied to anything.

Evidence gathered this run:

| Probe | Result |
|---|---|
| Atlassian MCP `initialize` | `200` — endpoint reachable with `Basic base64(email:token)` |
| MCP `tools/list` | only 4 Teamwork Graph tools; **no `getJiraIssue` / JQL tools** |
| MCP `getTeamworkGraphObject` on DS-1 | `"You don't have permission to connect via API token. Please ask your organization admin for access."` |
| `GET /rest/api/3/issue/DS-1` | `404` — "does not exist or you do not have permission to see it" |
| `GET /rest/api/3/project/search` | `total: 0` — no visible projects |
| The queue JQL | `{"issues":[]}` — **but a bogus project `ZZZZ` returns the same empty 200**, so this is silent filtering, not an empty backlog |

That last row matters: the empty result is **not** evidence that the backlog is clear.

Rather than invent ticket keys or acceptance criteria (forbidden by `.cursor/rules/constitution.mdc`), this run fell back to the supported no-ticket route, **`explore-and-generate`**, against the live UI.

### Three config gaps that need a human

1. **`ATLASSIAN_EMAIL` is never passed to CI.** `.github/workflows/test-generation.yml` forwards only `ATLASSIAN_API_TOKEN`, but `scripts/setup-atlassian-mcp-auth.mjs` needs `base64(email:token)` and reads the email from `.env`, which does not exist on a runner. Fixing this alone is **not** sufficient — the org-level API-token permission above is the real blocker.
2. **Actions cannot open PRs.** Enable *Settings → Actions → General → Allow GitHub Actions to create and approve pull requests*, or give the agent a PAT. Otherwise every backlog run stops at the push step, as this one did.
3. **Enforcement hooks do not cover the directory specs actually live in** (see below).

## Coverage gap addressed

`playwright.config.ts` matches `TestCases/**/*.spec.ts`. The Calendar page had **only** navigation coverage (`DS-119` TC-003 just asserts the heading). The `Program -> Semester` cascade gates the entire scheduling surface — grid, view switching, `+ New Session`, `Publish` — so a regression in the gating silently hides all of it behind an empty state.

Chosen because it is the highest-risk uncovered flow with fully observable outcomes; one flow per run per the skill.

## What's here

- `Test Scenarios Gerkin/calendar-semester-selection.feature` — the reviewable plan
- `TestCases/calendar-semester-selection.spec.ts` — 3 tests, one tag each
- `pages/CalendarPage.ts` — new role-based locators for the loaded calendar

| Test | Tag | Asserts |
|---|---|---|
| TC-001 — program + semester loads grid in Week view | `@e2e` | grid visible, `Week` has `aria-pressed=true`, `+ New Session` visible, summary `0 sessions scheduled • 2026-09-01 to 2026-12-15` |
| TC-002 — switching to Month view | `@regression` | `Month` pressed, `Week` not pressed, heading `September 2026`, `Next Month` visible |
| TC-003 — semester gated until program chosen | `@sanity` | Semester disabled + empty-state copy, then enabled + `Choose a semester from the dropdown to load its sessions` |

All locators are `getByRole`/`getByText` in the POM; no inline locators in the spec, no CSS/XPath, no `waitForTimeout`, no `isVisible()` booleans, no `any`. All UI copy was read off the live accessibility tree, not invented.

## Test run

```
npx playwright test TestCases/calendar-semester-selection.spec.ts --project=chromium
4 passed (20.2s)   # 3 spec tests + auth setup
```

Run **twice** consecutively, green both times (no flake). Cleanup verified on every run:

```
[cleanup] Program named "Calendar Host Program-..." was deleted as part of trackProgram cleanup
```

Each test creates its own unique program + semester and removes it via `trackProgram`, so no `@destructive` tag and no data left behind.

## Possible app bug — needs human confirmation, NOT filed

Selecting a semester consistently fires:

```
GET /api/semesters/<uuid>/publish  ->  HTTP 500
```

Reproduced on every exploration run. The UI still renders the grid, so it is **not** asserted in the spec and the tests are honestly green. Per the constitution no Jira bug was filed without approval. **Please confirm whether this warrants a ticket.**

## Also worth a look: `tests/` vs `TestCases/` inconsistency

`.cursor/rules/qa-orchestrator.mdc` and the workflow prompt both say to write specs under `tests/`, but `playwright.config.ts` only matches `TestCases/**/*.spec.ts`, and all 9 existing specs live in `TestCases/`. **A spec written to `tests/` would never execute.** This spec is in `TestCases/` to match the working config.

Knock-on effect: all three `.cursor/hooks/` gates skip this file —

```
[generation-gate] ALLOW: skipped (not a tests/**/*.spec file): .../TestCases/calendar-semester-selection.spec.ts
[no-weakened-assertions] ALLOW: skipped (not tests/**/*.spec): ...
```

So the assertion-weakening and generation gates are **not currently protecting the specs that actually run**. Recommend either widening the hook matchers to `TestCases/**` or aligning on one directory.

## Review checklist

- [ ] Confirm the Jira/org token permission fix (blocks all future backlog runs)
- [ ] Allow Actions to create PRs (or supply a PAT)
- [ ] Decide `tests/` vs `TestCases/` and widen hook matchers accordingly
- [ ] Triage the `GET /api/semesters/<uuid>/publish` 500
- [ ] Approve merge — no PR is merged without human approval

🤖 Generated with [Cursor Agent](https://cursor.com)
