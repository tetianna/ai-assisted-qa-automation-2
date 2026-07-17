---
name: a11y-checks
description: Adds @axe-core/playwright accessibility scans when generating or reviewing Playwright tests for new pages or components. Apply whenever creating, extending, or reviewing UI tests — even if the user does not mention accessibility, a11y, or axe.
---

# Accessibility Checks

Every Playwright test for a new page or component **must** include an axe-core scan. If you are generating or reviewing a UI test, add or verify an a11y check before considering the work complete.

Also read [pom-conventions](../pom-conventions/SKILL.md): navigate via POMs; assertions stay in specs.

## When to apply

- Generate a new Playwright spec or test case for a page or component
- Extend an existing test to cover a new page, modal, drawer, or widget
- Review or refactor any UI test — even functional or E2E tests with no a11y mention

If the test navigates to or interacts with UI, it needs an axe scan.

## Required pattern

1. Import `AxeBuilder` from `@axe-core/playwright`.
2. Navigate via POM; wait for target UI (`waitForLoaded`, `waitForOpen`, or `await expect(locator).toBeVisible()`).
3. Scan and assert:

```typescript
import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/cleanup.fixture'; // authed pages
import { formatViolations, recordViolations } from './helpers/a11y';

const results = await new AxeBuilder({ page }).analyze();
recordViolations('Page name (full scan)', results.violations);
await expect(results.violations, formatViolations(results.violations)).toEqual([]);
```

Use web-first `await expect(results.violations).toEqual([])` — never bare `assert`, `if (violations.length)`, or manual length checks.

**Auth:** use `fixtures/cleanup.fixture` for authenticated routes (chromium + `storageState`). Use `@playwright/test` only for unauthenticated pages (e.g. login).

## Scoping

| Target | Scope |
|--------|-------|
| Full page | No `.include()` |
| Modal, drawer, panel, nav | `.include(await pom.axeIncludeSelector())` |

Component POMs expose `axeIncludeSelector()` derived from a role-based root locator (see `NewProgramModal`, `HomePage`):

```typescript
const results = await new AxeBuilder({ page })
  .include(await modal.axeIncludeSelector())
  .analyze();

await expect(results.violations).toEqual([]);
```

Do not use brittle CSS unrelated to the component under test.

## disableRules — strict policy

`.disableRules()` only for known false positives that cannot be fixed now.

- **Always** comment why and what tracks the fix (ticket, upstream issue).
- **Never** silence a real failure or disable preemptively.
- Prefer fixing the violation or scoping with `.include()` first.

```typescript
// color-contrast: modal overlay uses design-system tokens — tracked in PROJ-1234
.disableRules(['color-contrast'])
```

## Real violations

Do **not** disable rules to go green. When axe finds real issues:

1. Let the test fail.
2. Call `recordViolations()` (logs formatted output).
3. Write `tests/snapshots/<page>-a11y-violations.md` with rule id, impact, nodes, screenshot paths.
4. Offer [jira-bug-reporter](../jira-bug-reporter/SKILL.md) — file only with user confirmation.

## File placement

- Dedicated: `tests/<feature>.a11y.spec.ts` (see `tests/programs.a11y.spec.ts`, `tests/home.a11y.spec.ts`)
- Or append an axe assertion at the end of a functional test that already reaches the target UI state

Helpers: `tests/helpers/a11y.ts`. Scans and assertions in specs only — not in Page Objects.

## Checklists

**Generating**

- [ ] Target UI loaded and visible before scan
- [ ] Full-page scan; component scan with `.include()` when applicable
- [ ] `await expect(results.violations).toEqual([])`
- [ ] Any `.disableRules()` has a commented reason

**Reviewing**

- [ ] Every new page/component has axe coverage
- [ ] Scan runs in the state under test (modal open, form filled, etc.)
- [ ] Web-first `expect` on violations — no manual checks
- [ ] No `.disableRules()` without documented reason
- [ ] Coverage not skipped because the user did not say "accessibility"

## Reference

- `tests/programs.a11y.spec.ts`, `tests/home.a11y.spec.ts`
- `tests/snapshots/programs-a11y-violations.md`
- `tests/helpers/a11y.ts`