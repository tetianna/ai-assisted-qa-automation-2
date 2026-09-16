# Eval report

Generated: 2026-09-16T10:51:58.743Z  
Trigger: `backlog-mode run; queue unfetchable, fell back to explore-and-generate`  
Window: last **10** CI runs (when `gh` is authenticated). Cursor has **no built-in telemetry** for these metrics.

## Flake rate

**Number:** 0 flaky mentions / 10 runs (last 10 completed)

**How measured:** `gh run list` for Smoke / Sanity / Regression / E2E Tests / Test Generation (last 10 completed), then `gh run view <id> --log` counted Playwright `flaky` lines (passed only after retry). 

**What it tells us:** How often CI green is bought with retries rather than a first-pass pass.

## Heal success rate

**Number:** 2/2 clean heals; **masked-regression = 0** (must be 0)

**How measured:** `git log --all` for subjects matching self-heal / locator after drift / `fix(pom)`. A heal is **masked** if the same commit diffs `expect(` in `tests/**` or `TestCases/**`. POM-only locator diffs count as clean.

**What it tells us:** Heals are not silencing product bugs by editing assertions.

- `a1c4104` fix(pom): batch-read program list names for CI scale
- `ee27e89` fix(pom): correct New Program Cancel button locator after drift

## Generation-gate pass rate

**Number:** 0/3

**How measured:** `gh pr list` for `qa/*` or label `tests-generated`, then first-check conclusions. Conforming = generation-gate rules (has `expect(`, no CSS/XPath `page.locator`). Maps-to-AC = PR links a DS ticket. Fallback without `gh`: count local `qa/DS-*` branches only.

**What it tells us:** Whether test-writer output is shippable without a repair cycle.

## Ask vs guess

**Number:** 2 asked / 1 guessed

**How measured:** .eval/session.json (session review; no Cursor telemetry). Not inferred from model traces.

**What it tells us:** The agent preferred questions over invented values.

## Top reliability risk

Generated specs are not green+conforming on the first PR.

## Next action

Tighten test-writer + generation-gate; do not open the PR until the spec is green locally.
