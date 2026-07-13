# Example: Stale program list after edit (DS-2)

Worked example for `jira-bug-reporter` when `TestCases/block6_7/DS-2.spec.ts` fails.

## Failure input

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('cell').getByText('Web Development 2026 - Updated', { exact: true })
Expected: visible
Received: <element(s) not found>

  at TestCases/block6_7/DS-2.spec.ts:56:7
```

Test: `TC-002: Updated program name is reflected immediately in the list`

## Step 1 — Resolve parent story

From `test.describe('DS-2: Edit Existing Program Details')` → parent is **DS-2**.

## Step 2 — Reproduce

```bash
npx playwright test TestCases/block6_7/DS-2.spec.ts -g "TC-002" --workers=1
npx playwright test TestCases/block6_7/DS-2.spec.ts -g "TC-002" --workers=1 --repeat-each=2
node scripts/collect-failure-screenshots.mjs --latest
```

## Step 3 — Duplicate check (JQL)

```jql
parent = DS-2 AND issuetype = Sub-task AND text ~ "stale" AND status != Done
```

If DS-108 is open and matches, attach new screenshots to DS-108 instead of creating a duplicate.

## Step 4 — Draft report

**Summary:** `Taya [Composer] Program list shows stale name after editing program`

**Description (markdown for Jira):**

```markdown
**Severity:** High
**Priority:** High

**Playwright error:**
```
expect(locator).toBeVisible() failed
Locator: getByRole('cell').getByText('Web Development 2026 - Updated', { exact: true })
Expected: visible
Received: <element(s) not found>
```

**Steps to Reproduce:**
1. Log in as admin at https://test.didaxis.studio/login
2. Navigate to Programs page
3. Create program "Web Development 2026" with any description
4. Open edit form for "Web Development 2026"
5. Change Name to "Web Development 2026 - Updated"
6. Click Save
7. Observe the program list without refreshing the page

**Expected Result:** Program list immediately shows "Web Development 2026 - Updated" (features/DS-2.feature TC-002).

**Actual Result:** List still shows the old name "Web Development 2026" until page refresh.

**Environment:**
- URL: https://test.didaxis.studio
- Browser: Chromium (Playwright)
- Account: value from DIDAXIS_EMAIL in .env

**Evidence:**
- Screenshot: test-results/.../test-failed-1.png (attached)
- Spec: TestCases/block6_7/DS-2.spec.ts
- Feature: features/DS-2.feature @TC-002

**Linked Story:** DS-2
```

## Step 5 — Create sub-task (MCP)

Call `createJiraIssue` with:

- `parent`: `DS-2`
- `issueTypeName`: `Sub-task`
- `summary`: `Taya [Composer] Program list shows stale name after editing program`
- `description`: markdown body above
- `additional_fields`: `{"priority": {"name": "High"}}`

## Step 6 — Attach screenshots (required)

```bash
node scripts/jira-attach-screenshots.mjs DS-NEW $(node scripts/collect-failure-screenshots.mjs --latest)
```

Do not mark the workflow complete until the script exits 0.

## Step 7 — Return to user

```
Created DS-NEW: https://legionqaschool.atlassian.net/browse/DS-NEW
Parent: DS-2
Screenshots: 1 attached
```
