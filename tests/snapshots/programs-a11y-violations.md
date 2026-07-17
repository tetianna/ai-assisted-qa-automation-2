# Programs page accessibility violations

Recorded by `tests/programs.a11y.spec.ts` on 2026-07-17. These are real axe findings — rules were **not** disabled to make tests pass.

## Full page scan (`ProgramsPage.goto()`)

### color-contrast (serious)

Elements must meet minimum color contrast ratio thresholds.

| Element | Foreground | Background | Ratio | Required |
|---------|------------|------------|-------|----------|
| Sign out label | rgba(255,255,255,0.5) | (nav button) | — | 4.5:1 |
| Page subtitle "Manage academic programs and semesters" | #8892a4 | #ffffff | — | 4.5:1 |
| Empty state "No programs yet..." | #868e96 | #ffffff | 3.32 | 4.5:1 |

Help: https://dequeuniversity.com/rules/axe/4.12/color-contrast

### page-has-heading-one (moderate)

The Programs page has a visible "Programs" heading but no `<h1>`. Axe requires a level-one heading on the page.

Help: https://dequeuniversity.com/rules/axe/4.12/page-has-heading-one

## Scoped scan — New Program modal (`.include(modal dialog)`)

### button-name (critical)

The Mantine modal close button (`.mantine-Modal-close`) has no discernible accessible name — no visible text, `aria-label`, `aria-labelledby`, or `title`.

Help: https://dequeuniversity.com/rules/axe/4.12/button-name

## Evidence

- Full page: `test-results/tests-programs.a11y-Progra-a69ed--page-has-no-axe-violations-chromium/test-failed-1.png`
- Modal: `test-results/tests-programs.a11y-Progra-57d5f-modal-has-no-axe-violations-chromium/test-failed-1.png`