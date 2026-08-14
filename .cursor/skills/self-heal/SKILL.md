---
name: self-heal
description: >-
  Heal Playwright tests when a locator drifted after a UI change. Use ONLY when
  ci-failure-triage already classified the red run as a test issue (drift) - NEVER
  for a real app bug. MUST use when the user says "the build is red because a locator
  broke", "fix the drifted selector", "the test broke after a UI change", or "heal
  the suite" and triage confirms drift. If classification is missing or says app bug,
  stop and route to jira-bug-reporter instead.
---

# Self-Heal (locator drift)

Repair **one** broken locator per run when triage says **test issue / drift** - not when the app is wrong.

Also read when relevant:
- [ci-failure-triage](../ci-failure-triage/SKILL.md) - required gate; must show drift classification before healing
- [pom-conventions](../pom-conventions/SKILL.md) - role-based locators only; patch POMs, never specs
- [jira-bug-reporter](../jira-bug-reporter/SKILL.md) - when triage says app bug, or heal would weaken assertions

## Gate (step 0)

**Do not start self-heal unless triage output explicitly classifies the failure as a test issue (drift).**

| Triage says | Action |
|-------------|--------|
| **Test issue / drift** (wrong locator, typo, renamed label, stale POM) | Continue self-heal |
| **App bug** or **Inconclusive** | **Stop.** Route to [jira-bug-reporter](../jira-bug-reporter/SKILL.md) or ask human to confirm |
| No triage yet | Run [ci-failure-triage](../ci-failure-triage/SKILL.md) first, then re-evaluate |

Never heal by weakening assertions, skipping checks, or changing expected behavior to match a broken app.

---

## Steps

### 1. Require triage drift classification

Confirm in handoff or PR comment:
- Failing test file + title
- Classification: **Test issue (drift)**
- Root cause points to locator/POM, not application logic

If not drift - **stop** and route to **bug-reporter** (human confirms before filing).

### 2. From the trace, find the failing locator and its POM

From Playwright error + trace (local `test-results/` or CI `playwright-report` artifact):
- Failing step: `locator.click`, `expect(locator)...`, timeout on which selector
- Source file: `pages/*.ts` or legacy `TestCases/block4/helpers/locators.ts` - identify the **POM property or helper**, not just the spec line
- Note the **old** locator string (role, name, filter) exactly as committed

Do not patch the spec assertions in this workflow.

### 3. Re-discover the element via Agent-Browser a11y tree

Use the **Agent-Browser** (Playwright MCP or headed trace) on `DIDAXIS_URL`:
- Navigate to the page/state at failure (auth via `.env` / `tests/auth.setup.ts` storageState)
- Read the **accessibility tree** for the target control
- Record **role** + **current accessible name** (and dialog/region scope if needed)
- Prefer the same role the test intended (`button`, `textbox`, `dialog`, etc.)

The new locator must match what a user sees in the a11y tree - not a guessed CSS path.

### 4. Patch the locator in the POM - minimal role-based diff

- Edit **only** the POM (or shared locator module the POM uses)
- Use `getByRole` / `getByLabel` / scoped dialog locators per [pom-conventions](../pom-conventions/SKILL.md)
- **Minimal diff:** change only the broken name/scope/filter; do not refactor unrelated POM code
- **Never** change spec assertions, expected strings, or AC meaning

Example (drift):
```diff
- this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel1' });
+ this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
```

### 5. Re-run and prove green WITH assertions unchanged

```bash
npx playwright test <spec> -g "<failing test title>" --project=chromium
```

Rules:
- Spec assertion lines must be **byte-identical** before/after (except imports if POM path moved - avoid that)
- **Green via a weakened assertion is a bug** - if the only way to pass is changing `expect(...)`, **escalate**; do not merge
- If still red after one locator fix, **stop** (one repair per run); report findings for human follow-up

### 6. Report and open a PR

Every heal becomes **one PR** (branch e.g. `heal/<ticket-or-spec>-<short-slug>`).

PR body must include:

```markdown
## Self-heal: locator drift

**Triage:** Test issue (drift) - <link to triage comment or summary>
**Test:** `<spec>` - "<test title>"

### Locator diff
| Location | Before | After |
|----------|--------|-------|
| `pages/Foo.ts` `barButton` | `getByRole('button', { name: 'Old' })` | `getByRole('button', { name: 'New' })` |

### Proof
- Re-run: `npx playwright test ...` -> **passed**
- Assertions in spec: **unchanged**

**Human:** review and merge. Do not auto-merge.
```

---

## Limits

- **One repair per run** - one failing locator chain -> one POM patch -> one PR
- **Never** heal real app bugs (validation missing, wrong API behavior, duplicate data)
- **Never** merge without human approval
- **Never** use CSS/XPath as the fix unless pom-conventions documents an approved escape hatch

## Checklist

- [ ] Triage classification = test issue (drift)
- [ ] Trace + failing POM identified
- [ ] Agent-Browser a11y re-discovery recorded (role + name)
- [ ] POM patched only; spec assertions unchanged
- [ ] Target test green on re-run
- [ ] PR opened with old->new locator table + proof
