# Test Plan: Edit Existing Program Details

**Feature:** Edit existing program details  
**Jira:** [DS-2](https://legionqaschool.atlassian.net/browse/DS-2) — Edit existing program details  
**Status:** To Do | **Priority:** High | **Labels:** `mvp`, `program-setup`  
**Author:** QA Engineering  
**Date:** 2026-06-25  
**Last synced with Jira:** 2026-07-07  
**Scope:** Program edit modal on the Programs page  
**Playwright spec:** `TestCases/block4/DS-2.spec.ts` (TC-001–TC-029)

**User story (from Jira):**

> As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

**Acceptance criteria (from Jira):**

```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data

Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"

Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged
```

---

## Positive Flows

### TC-001 — Edit form opens with current program data pre-populated

**Jira AC:** Open program for editing

**Title:** Existing program fields are shown when opening the edit form

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists with Description **Full-stack web development program**

**Steps:**
1. Navigate to the Programs page
2. Locate **Web Development 2026** in the program list
3. Click the edit icon on **Web Development 2026**

**Gherkin:**
```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data
```

**Expected result:**
- Edit modal (or form panel) opens
- **Name** field shows **Web Development 2026**
- **Description** field shows **Full-stack web development program**
- **Save** and **Cancel** actions are visible
- If the product exposes an **AI configuration** section, it is visible and pre-populated with the program's current values (Total Program Hours, Default Session Hours, Default Exam Hours, Target Audience, Focus Areas)

**Priority:** High

---

### TC-002 — Updated program name is reflected immediately in the list

**Jira AC:** Successfully edit a program name

**Title:** Program name change is saved and displayed in the program list

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Web Development 2026**

**Steps:**
1. Change the Name field to **Web Development 2026 - Updated**
2. Click **Save**

**Gherkin:**
```gherkin
Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"
```

**Expected result:**
- Modal closes
- Program list no longer shows **Web Development 2026**
- Program list shows **Web Development 2026 - Updated**
- Change is visible without manual page refresh

**Priority:** High

---

### TC-003 — Unchanged fields remain intact when only Description is edited

**Jira AC:** Edit preserves unchanged fields

**Title:** Name and other fields are preserved when only Description is modified

**Preconditions:**
- User is logged in as admin
- Program **Data Science Fundamentals** exists with Name **Data Science Fundamentals** and Description **Introductory data science course**
- Edit form is open for this program

**Steps:**
1. Note the current Name value
2. Change Description to **Advanced data science and machine learning track**
3. Click **Save**
4. Confirm the edit modal closes
5. Confirm the program list still shows **Data Science Fundamentals** with the updated description — without refreshing the page
6. Re-open the edit form for the program

**Gherkin:**
```gherkin
Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the modal closes
  And the Name and other fields remain unchanged
  And the program list immediately shows the unchanged name with the updated description
```

**Expected result:**
- Modal closes after Save
- Program list immediately shows **Data Science Fundamentals** (name unchanged) with description **Advanced data science and machine learning track**
- Change is visible without manual page refresh
- Re-opening the edit form confirms Name remains **Data Science Fundamentals**
- Description updates to **Advanced data science and machine learning track**
- No unintended changes to other fields (dates, status, IDs, AI configuration values, etc.)

**Priority:** High

---

### TC-004 — Both Name and Description can be updated in a single save

**Title:** Multiple fields are saved together when edited simultaneously

**Preconditions:**
- User is logged in as admin
- Program **Cybersecurity Bootcamp** exists
- Edit form is open

**Steps:**
1. Change Name to **Cybersecurity Bootcamp 2026**
2. Change Description to **Hands-on security operations and incident response**
3. Click **Save**

**Gherkin:**
```gherkin
Scenario: Edit both name and description
  Given I am editing "Cybersecurity Bootcamp"
  When I change the Name to "Cybersecurity Bootcamp 2026"
  And I change the Description to "Hands-on security operations and incident response"
  And I click Save
  Then the modal closes
  And the program list shows "Cybersecurity Bootcamp 2026"
  And the description shows "Hands-on security operations and incident response"
```

**Expected result:**
- Both fields persist correctly
- List reflects updated name and description

**Priority:** Medium

---

### TC-005 — Cancel discards unsaved edits

**Title:** Closing the edit form without saving reverts to original values

**Preconditions:**
- User is logged in as admin
- Program **Mobile App Development** exists with original name and description
- Edit form is open

**Steps:**
1. Change Name to **Mobile App Development - Draft**
2. Click **Cancel**
3. Inspect the program list
4. Re-open edit form

**Gherkin:**
```gherkin
Scenario: Cancel edit discards changes
  Given I am editing "Mobile App Development"
  When I change the Name to "Mobile App Development - Draft"
  And I click Cancel
  Then the modal closes
  And the program list still shows "Mobile App Development"
  When I click the edit icon on "Mobile App Development"
  Then the Name field shows "Mobile App Development"
```

**Expected result:**
- No changes persisted after Cancel
- Original data intact in list and edit form

**Priority:** Medium

---

### TC-006 — Save button enables when valid changes are made

**Title:** Save action becomes available after a valid field modification

**Preconditions:**
- User is logged in as admin
- Edit form is open for **UX Design Certificate**

**Steps:**
1. Observe initial Save button state
2. Modify Description to **User research and prototyping fundamentals**
3. Observe Save button state
4. Click **Save**

**Gherkin:**
```gherkin
Scenario: Save enabled after valid edit
  Given I am editing "UX Design Certificate"
  When I change the Description to "User research and prototyping fundamentals"
  Then the Save button is enabled
  When I click Save
  Then the modal closes
  And the updated description is saved
```

**Expected result:**
- Save is enabled when valid changes exist
- Save completes successfully

**Priority:** Medium

---

### TC-024 — Close (X) button discards unsaved edits

**Title:** Closing the edit modal via the X control reverts to original values

**Preconditions:**
- User is logged in as admin
- Program **Mobile App Development Close** exists with original name and description
- Edit form is open

**Steps:**
1. Change Name to **Mobile App Development Close - Draft**
2. Click the modal **Close (X)** control
3. Inspect the program list
4. Re-open edit form

**Gherkin:**
```gherkin
Scenario: Close button discards edit changes
  Given I am editing "Mobile App Development Close"
  When I change the Name to "Mobile App Development Close - Draft"
  And I click the Close button on the modal
  Then the modal closes
  And the program list still shows "Mobile App Development Close"
  When I click the edit icon on "Mobile App Development Close"
  Then the Name field shows "Mobile App Development Close"
```

**Expected result:**
- No changes persisted after Close (X)
- Original data intact in list and edit form

**Priority:** Medium

---

### TC-025 — Escape key discards unsaved edits

**Title:** Pressing Escape while editing reverts to original values

**Preconditions:**
- User is logged in as admin
- Program **Mobile App Development Escape** exists with original name and description
- Edit form is open

**Steps:**
1. Change Name to **Mobile App Development Escape - Draft**
2. Press **Escape**
3. Inspect the program list
4. Re-open edit form

**Gherkin:**
```gherkin
Scenario: Escape key discards edit changes
  Given I am editing "Mobile App Development Escape"
  When I change the Name to "Mobile App Development Escape - Draft"
  And I press Escape
  Then the modal closes
  And the program list still shows "Mobile App Development Escape"
  When I click the edit icon on "Mobile App Development Escape"
  Then the Name field shows "Mobile App Development Escape"
```

**Expected result:**
- No changes persisted after Escape
- Original data intact in list and edit form

**Priority:** Medium

---

## Negative Flows

### TC-007 — Empty Name prevents save on edit

**Title:** Program cannot be saved with an empty Name field

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Cloud Computing 2026**

**Steps:**
1. Clear the Name field completely
2. Observe Save button state
3. Attempt to click **Save**

**Gherkin:**
```gherkin
Scenario: Empty name blocks save on edit
  Given I am editing "Cloud Computing 2026"
  When I clear the Name field
  Then the Save button is disabled
  And the program is not updated
```

**Expected result:**
- Save is disabled or validation error shown
- Original program **Cloud Computing 2026** remains unchanged in list

**Priority:** High

---

### TC-008 — Duplicate name on edit is rejected

**Title:** Renaming a program to an existing name is not allowed

**Preconditions:**
- User is logged in as admin
- Programs **Web Development 2026** and **AI Fundamentals** exist
- Edit form is open for **AI Fundamentals**

**Steps:**
1. Change Name to **Web Development 2026**
2. Click **Save**

**Gherkin:**
```gherkin
Scenario: Duplicate name on edit is rejected
  Given programs "Web Development 2026" and "AI Fundamentals" exist
  And I am editing "AI Fundamentals"
  When I change the Name to "Web Development 2026"
  And I click Save
  Then the modal remains open
  And an error indicates the name already exists
  And the program list still shows "AI Fundamentals"
```

**Expected result:**
- Save fails with clear duplicate-name error
- **AI Fundamentals** unchanged in list
- No duplicate **Web Development 2026** entries

**Priority:** High

---

### TC-009 — Server error during save does not corrupt program data

**Title:** Failed save request leaves original program data intact

**Preconditions:**
- User is logged in as admin
- Edit form is open for **DevOps Engineering 2026**
- Ability to simulate server/network failure

**Steps:**
1. Change Description to **Updated DevOps curriculum**
2. Trigger a server error on save
3. Inspect program list and re-open edit form

**Gherkin:**
```gherkin
Scenario: Server error on edit preserves original data
  Given I am editing "DevOps Engineering 2026"
  When I change the Description to "Updated DevOps curriculum"
  And the save request fails due to a server error
  Then an error message is displayed
  And the program list still shows the original description for "DevOps Engineering 2026"
```

**Expected result:**
- Original data unchanged
- User-friendly error with retry option

**Priority:** Medium

---

### TC-010 — Non-admin user cannot edit programs

**Title:** Edit controls are unavailable to unauthorized users

**Preconditions:**
- User is logged in as non-admin (e.g., instructor)
- Program **Web Development 2026** exists

**Steps:**
1. Navigate to Programs page
2. Locate **Web Development 2026**
3. Attempt to access edit functionality

**Gherkin:**
```gherkin
Scenario: Non-admin cannot edit programs
  Given I am logged in as a non-admin user
  And a program "Web Development 2026" exists
  When I navigate to the Programs page
  Then I do not see an edit icon for "Web Development 2026"
  And I cannot open the edit form
```

**Expected result:**
- Edit icon hidden or disabled
- Direct URL access blocked if applicable

**Priority:** High

---

### TC-011 — Saving with no changes does not trigger unnecessary update

**Title:** Opening edit form and saving without changes does not alter data or cause errors

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Secure Coding 2026**
- Note current Name and Description values

**Steps:**
1. Do not modify any fields
2. Click **Save** (if enabled) or observe button state

**Gherkin:**
```gherkin
Scenario: Save with no changes
  Given I am editing "Secure Coding 2026"
  When I click Save without making changes
  Then the modal closes or Save remains disabled
  And the program data for "Secure Coding 2026" is unchanged
```

**Expected result:**
- No erroneous updates or duplicate audit entries
- Consistent UX (Save disabled or no-op with success)

**Priority:** Low

---

### TC-026 — XSS payload in edited Description is not executed in the program list

**Title:** Script tags in Description are stored safely and do not run in the UI

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Secure Coding 2026**

**Steps:**
1. Change Description to `<script>alert('xss')</script>`
2. Click **Save**
3. Observe the program list and browser dialogs

**Gherkin:**
```gherkin
Scenario: XSS in edited description is neutralized
  Given I am editing "Secure Coding 2026"
  When I change the Description to "<script>alert('xss')</script>"
  And I click Save
  Then the modal closes
  And no JavaScript alert is executed
  And the program list still shows "Secure Coding 2026"
```

**Expected result:**
- Save completes without executing injected script
- No browser alert/dialog triggered from the payload
- Program name remains unchanged

**Priority:** Medium

---

## Edge Cases

### TC-012 — Name at maximum length can be saved on edit

**Title:** Program Name at upper character limit is accepted during edit

**Preconditions:**
- User is logged in as admin
- Assume max Name length is **255 characters**
- Edit form is open for **Short Name Program**

**Steps:**
1. Change Name to a 255-character string
2. Click **Save**

**Gherkin:**
```gherkin
Scenario: Max length name on edit
  Given I am editing "Short Name Program"
  When I change the Name to a 255-character string
  And I click Save
  Then the modal closes
  And the program list shows the 255-character name
```

**Expected result:**
- Full name saved and displayed per UI truncation rules

**Priority:** Medium

---

### TC-013 — Name exceeding max length is rejected on edit

**Title:** Program Name one character over the limit cannot be saved

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Boundary Test Program**

**Steps:**
1. Change Name to a 256-character string
2. Attempt to save

**Gherkin:**
```gherkin
Scenario: Over max length name rejected on edit
  Given I am editing "Boundary Test Program"
  When I change the Name to a 256-character string
  And I click Save
  Then validation prevents the save
  And the original name "Boundary Test Program" remains in the list
```

**Expected result:**
- Validation error or disabled Save
- Original name preserved

**Priority:** Medium

---

### TC-014 — Special characters in edited Name are preserved

**Title:** Name with special characters saves and displays correctly

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Web Development 2026**

**Steps:**
1. Change Name to **Informatique & IA - Niveau 2 (2026)**
2. Click **Save**

**Gherkin:**
```gherkin
Scenario: Special characters preserved on edit
  Given I am editing "Web Development 2026"
  When I change the Name to "Informatique & IA - Niveau 2 (2026)"
  And I click Save
  Then the program list shows "Informatique & IA - Niveau 2 (2026)"
```

**Expected result:**
- Exact characters preserved in storage and display

**Priority:** Medium

---

### TC-015 — Leading and trailing whitespace is trimmed on save

**Title:** Edited Name is stored without leading or trailing spaces

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Web Development 2026**

**Steps:**
1. Change Name to `  Web Development 2026 - Trimmed  `
2. Click **Save**

**Gherkin:**
```gherkin
Scenario: Whitespace trimmed on edit save
  Given I am editing "Web Development 2026"
  When I change the Name to "  Web Development 2026 - Trimmed  "
  And I click Save
  Then the program list shows "Web Development 2026 - Trimmed"
```

**Expected result:**
- Trimmed name stored and displayed

**Priority:** Medium

---

### TC-016 — Unicode and emoji in edited fields are preserved

**Title:** International characters and emoji survive edit and display

**Preconditions:**
- User is logged in as admin
- Edit form is open for **French Program**

**Steps:**
1. Change Name to **Programme Français 🎓 2026**
2. Change Description to **Cours pour étudiants internationaux**
3. Click **Save**

**Gherkin:**
```gherkin
Scenario: Unicode and emoji preserved on edit
  Given I am editing "French Program"
  When I change the Name to "Programme Français 🎓 2026"
  And I change the Description to "Cours pour étudiants internationaux"
  And I click Save
  Then the program list shows "Programme Français 🎓 2026"
```

**Expected result:**
- No encoding corruption in list or detail views

**Priority:** Low

---

### TC-017 — Description cleared to empty is handled per product rules

**Title:** Removing all Description text on edit behaves consistently

**Preconditions:**
- User is logged in as admin
- Edit form is open for program with non-empty Description

**Steps:**
1. Clear Description field entirely
2. Click **Save**
3. Re-open edit form

**Gherkin:**
```gherkin
Scenario: Clear description on edit
  Given I am editing "Web Development 2026"
  When I clear the Description field
  And I click Save
  Then the modal closes
  And the program "Web Development 2026" exists with an empty description
```

**Expected result:**
- If Description is optional: empty value saved
- If required: validation prevents save with clear message

**Priority:** Medium

---

### TC-018 — Rapid double-click on Save does not cause duplicate updates

**Title:** Only one update is applied when Save is clicked multiple times

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Web Development 2026**

**Steps:**
1. Change Name to **Web Development 2026 - Final**
2. Double-click **Save** rapidly

**Gherkin:**
```gherkin
Scenario: Double submit prevention on edit
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Final"
  And I double-click Save
  Then the modal closes
  And exactly one "Web Development 2026 - Final" entry exists in the list
```

**Expected result:**
- Single update applied
- Save disabled during submission

**Priority:** Medium

---

### TC-019 — Editing program to same name as itself succeeds

**Title:** Saving without meaningful name change (same name) is allowed

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Web Development 2026**

**Steps:**
1. Change Description only
2. Leave Name as **Web Development 2026**
3. Click **Save**

**Gherkin:**
```gherkin
Scenario: Edit with unchanged name succeeds
  Given I am editing "Web Development 2026"
  When I change the Description to "Updated full-stack curriculum"
  And I leave the Name as "Web Development 2026"
  And I click Save
  Then the save succeeds
  And no duplicate name error is shown
```

**Expected result:**
- Save succeeds without false duplicate error

**Priority:** Medium

---

### TC-027 — Description at maximum allowed length is accepted on edit

**Title:** Program Description at upper character limit is accepted during edit

**Preconditions:**
- User is logged in as admin
- Assume max Description length is **2000 characters**
- Edit form is open for **UX Design Certificate**

**Steps:**
1. Change Description to a 2000-character string
2. Click **Save**

**Gherkin:**
```gherkin
Scenario: Max length description on edit
  Given I am editing "UX Design Certificate"
  When I change the Description to a 2000-character string
  And I click Save
  Then the modal closes
  And the program list shows the full 2000-character description
```

**Expected result:**
- Full description saved and displayed per UI truncation rules

**Priority:** Medium

---

### TC-028 — Single-character Name is accepted on edit

**Title:** Program Name reduced to one character is accepted when product allows it

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Rename Source**

**Steps:**
1. Change Name to a single character (e.g., **A**)
2. Click **Save**

**Gherkin:**
```gherkin
Scenario: Single character name on edit
  Given I am editing "Rename Source"
  When I change the Name to "A"
  And I click Save
  Then the modal closes
  And the program list shows "A"
```

**Expected result:**
- Program is saved if minimum length is 1 character
- OR validation error if minimum length is greater than 1 (document actual rule)

**Priority:** Low

---

## Defect Probes

Regression checks for known bugs linked to DS-2. These extend AC coverage where product behavior was ambiguous or previously broken.

### TC-020 — Case-only duplicate name on edit is rejected

**Title:** Renaming a program to differ only by letter case from an existing name is not allowed

**Preconditions:**
- User is logged in as admin
- Programs **CaseDuplicate** and **CaseDuplicate Target** exist
- Edit form is open for **CaseDuplicate Target**

**Steps:**
1. Change Name to the lowercase form of **CaseDuplicate**
2. Click **Save**

**Gherkin:**
```gherkin
Scenario: Case-insensitive duplicate name on edit is rejected
  Given programs "CaseDuplicate" and "CaseDuplicate Target" exist
  And I am editing "CaseDuplicate Target"
  When I change the Name to the lowercase form of "CaseDuplicate"
  And I click Save
  Then the modal remains open
  And an error indicates the name already exists
  And both original program names remain in the list
```

**Expected result:**
- Save fails with duplicate-name error (if product uses case-insensitive uniqueness)
- Both programs remain unchanged
- Related bugs: [DS-106](https://legionqaschool.atlassian.net/browse/DS-106), [DS-126](https://legionqaschool.atlassian.net/browse/DS-126)

**Priority:** High

---

### TC-021 — Renamed program appears in list without page refresh

**Title:** Program list reflects a successful rename without manual reload

**Preconditions:**
- User is logged in as admin
- Program **NoRefresh Rename** exists
- Edit form is open

**Steps:**
1. Change Name to **NoRefresh Rename - Live**
2. Click **Save**
3. Without refreshing the browser, inspect the program list and URL

**Gherkin:**
```gherkin
Scenario: List updates immediately after rename
  Given I am editing "NoRefresh Rename"
  When I change the Name to "NoRefresh Rename - Live"
  And I click Save
  Then the modal closes
  And I remain on the Programs page
  And the program list shows "NoRefresh Rename - Live"
  And the program list no longer shows "NoRefresh Rename"
```

**Expected result:**
- List updates in place without F5/navigation
- Related bugs: [DS-9](https://legionqaschool.atlassian.net/browse/DS-9), [DS-108](https://legionqaschool.atlassian.net/browse/DS-108)

**Priority:** High

---

### TC-022 — Whitespace-only Name on edit is rejected

**Title:** Program cannot be saved with a Name containing only spaces

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Whitespace Edit**

**Steps:**
1. Change Name to three spaces (`   `)
2. Observe Save button state
3. Attempt to click **Save**

**Gherkin:**
```gherkin
Scenario: Whitespace-only name blocks save on edit
  Given I am editing "Whitespace Edit"
  When I change the Name to "   "
  Then the Save button is disabled or validation prevents save
  And the program list still shows "Whitespace Edit"
```

**Expected result:**
- Save is disabled or validation error shown
- Original name preserved in list

**Priority:** Medium

---

### TC-023 — Saving 255-character name on edit completes without hanging

**Title:** Edit save with a 255-character Name completes within a reasonable time

**Preconditions:**
- User is logged in as admin
- Edit form is open for **MaxLen Hang**

**Steps:**
1. Change Name to a 255-character string
2. Click **Save**
3. Wait for the modal to close (within 45 seconds)

**Gherkin:**
```gherkin
Scenario: Max length name save completes on edit
  Given I am editing "MaxLen Hang"
  When I change the Name to a 255-character string
  And I click Save
  Then the modal closes within a reasonable timeout
  And the program list shows the 255-character name
```

**Expected result:**
- Save completes without hanging or timing out
- Related bug: [DS-40](https://legionqaschool.atlassian.net/browse/DS-40) (255-character save timeout)

**Priority:** Medium

---

### TC-029 — Success feedback shown after save when product displays it

**Title:** User receives visible confirmation after a successful edit save

**Preconditions:**
- User is logged in as admin
- Edit form is open for **Success Feedback**
- Product shows toast or inline success message on save (if implemented)

**Steps:**
1. Change Name to **Success Feedback - Saved**
2. Click **Save**
3. Observe post-save feedback on the Programs page

**Gherkin:**
```gherkin
Scenario: Success feedback after edit save
  Given I am editing "Success Feedback"
  When I change the Name to "Success Feedback - Saved"
  And I click Save
  Then the modal closes
  And the program list shows "Success Feedback - Saved"
  And a success toast or message is displayed when the product supports it
```

**Expected result:**
- Save succeeds and list updates
- If the product implements success feedback, it is shown; otherwise test passes on list update alone

**Priority:** Low

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Covered by |
|---|---|
| Open program for editing | TC-001 |
| Successfully edit a program name | TC-002 |
| Edit preserves unchanged fields | TC-003 |
| List updates immediately after rename (AC implied) | TC-002, TC-021 |
| Cancel / dismiss without saving | TC-005, TC-024, TC-025 |

---

## Playwright Automation Coverage

| TC ID | Section | Automated |
|---|---|---|
| TC-001 | Positive | Yes |
| TC-002 | Positive | Yes |
| TC-003 | Positive | Yes |
| TC-004 | Positive | Yes |
| TC-005 | Positive | Yes |
| TC-006 | Positive | Yes |
| TC-007 | Negative | Yes |
| TC-008 | Negative | Yes |
| TC-009 | Negative | Yes |
| TC-010 | Negative | Yes (requires `DIDAXIS_NON_ADMIN_EMAIL` / `DIDAXIS_NON_ADMIN_PASSWORD` in `.env`; skipped otherwise) |
| TC-011 | Negative | Yes |
| TC-012 | Edge | Yes |
| TC-013 | Edge | Yes |
| TC-014 | Edge | Yes |
| TC-015 | Edge | Yes |
| TC-016 | Edge | Yes |
| TC-017 | Edge | Yes |
| TC-018 | Edge | Yes |
| TC-019 | Edge | Yes |
| TC-020 | Defect probe | Yes |
| TC-021 | Defect probe | Yes |
| TC-022 | Defect probe | Yes |
| TC-023 | Defect probe | Yes |
| TC-024 | Positive | Yes |
| TC-025 | Positive | Yes |
| TC-026 | Negative | Yes |
| TC-027 | Edge | Yes |
| TC-028 | Edge | Yes |
| TC-029 | Defect probe | Yes |

**Run:** `npx playwright test TestCases/block4/DS-2.spec.ts`

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Edit control discoverability:** Jira AC says "edit icon"; the live UI may expose an accessible **Edit \<ProgramName\>** button instead of a pencil emoji. Playwright locators must match the actual accessible name (see linked bugs DS-93, DS-81).

2. **Field naming inconsistency:** AC uses **Name** in edit scenarios vs **Program Name** in create flows — confirm single label across create and edit.

3. **Required vs optional Description on edit** not specified (TC-017).

4. **Maximum field lengths** not defined for edit validation (TC-012, TC-013).

5. **Duplicate name rules on edit** not in ACs — confirm case sensitivity and self-rename behavior (TC-008, TC-019). Open Jira bugs: DS-126, DS-127, DS-106.

6. **Role-based access** not mentioned — only implied admin context (TC-010).

7. **Cancel vs close (X) vs Escape** dismiss behaviors not defined — covered by TC-005, TC-024, TC-025; confirm all three are supported consistently.

8. **Optimistic vs pessimistic UI update** — AC says list updates "immediately"; confirm behavior on slow network (TC-009). Open Jira bugs [DS-9](https://legionqaschool.atlassian.net/browse/DS-9), [DS-108](https://legionqaschool.atlassian.net/browse/DS-108) report stale list after edit until refresh (TC-021).

9. **Concurrent edits** by two admins on same program not covered — no TC yet; add if product requires conflict handling.

10. **Audit trail / version history** not mentioned — unclear if edits should log who changed what.

11. **Validation for whitespace-only Name** on edit not specified — covered by TC-022 (similar to create validation).

12. **Success feedback** (toast, inline message) after save not defined — covered by TC-029 when product implements it.

13. **Double-submit on Save** not in ACs — open Jira bugs [DS-128](https://legionqaschool.atlassian.net/browse/DS-128), [DS-97](https://legionqaschool.atlassian.net/browse/DS-97), [DS-41](https://legionqaschool.atlassian.net/browse/DS-41) (TC-018).

14. **Programs with linked courses/enrollments** — unclear if edit restrictions apply when program is in use.

15. **Description maximum length** not defined in ACs — TC-027 assumes 2000 characters (align with create flow / schema).

16. **Minimum Name length on edit** not specified — TC-028 probes single-character acceptance.

17. **XSS / HTML injection in Description** not in ACs — TC-026 covers safe rendering in the list.

18. **AI configuration fields in edit form** not in ACs — TC-001 and TC-003 assert pre-population and preservation when the section exists in the UI.
