# Eval report

Generated: 2026-08-17T22:26:00Z  
Trigger: `local-orchestrator`  
Window: last **10** CI runs (4 Playwright `test` jobs exist on PRs). Cursor has **no built-in telemetry** for these metrics.

## Flake rate

**Number:** **0** retry-only passes observed / **4** PR CI jobs (last-10 window; only 4 jobs exist)

**How measured:** GitHub MCP `pull_request_read` / `get_check_runs` on PRs #1–#4 (the only PRs in the repo). Each has one completed job named `test`. Conclusions: #1 success, #2 failure, #3 success, #4 success. None are named `flaky`. Job-level API does **not** expose Playwright retries (`retries: 2` in CI). `gh run view --log` is still 401, so tests that passed only on retry cannot be counted.

**What it tells us:** CI looks stable at the job level, but true flake (pass-on-retry) is still invisible without logs or a JSON reporter.

## Heal success rate

**Number:** **1/2** clean heals; **masked-regression = 1** (must be 0)

**How measured:** GitHub MCP PR/commit history plus git.

| Heal | Evidence | Clean? |
|------|----------|--------|
| `ee27e89` Cancel button locator | `pages/NewProgramModal.ts` only (+1/−1); no spec `expect(` edits | Yes |
| [PR #4](https://github.com/tetianna/ai-assisted-qa-automation-2/pull/4) `heal/ci-ds5-tc017-list-scan` | POM `querySelector` plus `test` → `test.fixme` on DS-2 TC-008 / TC-020 (DS-126, DS-106) | **No — masked** |

A heal is **masked** if it skips, fixmes, or edits `expect(` so a red test goes green without a locator-only POM fix.

**What it tells us:** One real drift heal was clean; the CI “heal” PR hid failing assertions with `fixme` instead of healing locators or filing bugs only.

## Generation-gate pass rate

**Number:** **2/3** first-PR CI green with a DS ticket link

**How measured:** GitHub MCP listed `qa/*` PRs and their first `test` check:

| PR | Ticket | First `test` check | Maps to AC |
|----|--------|--------------------|------------|
| [#3](https://github.com/tetianna/ai-assisted-qa-automation-2/pull/3) (merged) | DS-213 | success | Jira linked; body says **no formal AC** (scenarios from summary + UI) |
| [#1](https://github.com/tetianna/ai-assisted-qa-automation-2/pull/1) (open) | DS-5 | success | Ticket in title |
| [#2](https://github.com/tetianna/ai-assisted-qa-automation-2/pull/2) (open) | DS-212 | **failure** | Ticket in title |

Conforming (has `expect(`, no CSS/XPath `page.locator`) was not re-scanned from CI logs this pass; the generation-gate hook is `.cursor/hooks/enforce-generation-gate.sh`.

**What it tells us:** Most generated PRs go green on first CI, but DS-212 did not, and DS-213 was not mapped from formal AC.

## Ask vs guess

**Number:** **0 asked / 0 guessed** (this refresh)

**How measured:** Session review of this orchestrator pass (no Cursor telemetry). Counts and classifications came from GitHub MCP (PR list, check runs, files, commit `ee27e89`). Previous chat had 3 asked / 6 guessed; that is not this run.

**What it tells us:** This report did not invent CI numbers. Earlier agent work still guessed tags and env names more than it asked.

## Top reliability risk

**Masked-regression is 1, not 0.** Heal [PR #4](https://github.com/tetianna/ai-assisted-qa-automation-2/pull/4) used `test.fixme` on failing cases. That is not a drift heal.

## Next action

Do not merge heal PRs that skip or fixme assertions. File DS-126 / DS-106 as bugs; keep heals to POM locators only. Add a Playwright JSON reporter on CI so flake rate can use retries instead of job success/fail.
