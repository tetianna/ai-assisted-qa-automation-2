# Home page accessibility violations

Recorded by `tests/home.a11y.spec.ts` against https://test.didaxis.studio/ on 2026-07-17. Real axe findings — rules were **not** disabled.

## Full page scan (`HomePage.goto()` → `/`)

### color-contrast (serious)

Insufficient contrast on dashboard copy and cards:

| Element | Foreground | Background | Ratio | Required |
|---------|------------|------------|-------|----------|
| Sign out label (nav) | rgba(255,255,255,0.5) / #9499b1 | #293263 | 4.3 | 4.5:1 |
| Welcome subtitle | #8892a4 | #ffffff | 3.13 | 4.5:1 |
| Feature card subtitles (Programs, Schedule, Conflicts, AI editing) | #8892a4 | #ffffff | 3.13 | 4.5:1 |
| Getting-started body text | #8892a4 | #ffffff | 3.13 | 4.5:1 |

Help: https://dequeuniversity.com/rules/axe/4.12/color-contrast

### page-has-heading-one (moderate)

Dashboard shows a "Dashboard" heading but no `<h1>` on the page.

Help: https://dequeuniversity.com/rules/axe/4.12/page-has-heading-one

## Scoped scan — Navigation (`.include(await homePage.axeIncludeSelector())`)

### color-contrast (serious)

Sign out button label fails contrast (4.3:1 vs 4.5:1 required).

Help: https://dequeuniversity.com/rules/axe/4.12/color-contrast

## Evidence

- Full page: `test-results/tests-home.a11y-Home-acces-b43a8--page-has-no-axe-violations-chromium/test-failed-1.png`
- Navigation: `test-results/tests-home.a11y-Home-acces-58779-ation-has-no-axe-violations-chromium/test-failed-1.png`