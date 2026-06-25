# Test Plan: Edit Existing Program Details

**Feature:** Edit existing program details  
**Author:** QA Engineering  
**Date:** 2026-06-25  
**Scope:** Program edit modal on the Programs page

---

## Positive Flows

### TC-001 — Edit form opens with current program data pre-populated

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

**Priority:** High

---

### TC-002 — Updated program name is reflected immediately in the list

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

**Title:** Name and other fields are preserved when only Description is modified

**Preconditions:**
- User is logged in as admin
- Program **Data Science Fundamentals** exists with Name **Data Science Fundamentals** and Description **Introductory data science course**
- Edit form is open for this program

**Steps:**
1. Note the current Name value
2. Change Description to **Advanced data science and machine learning track**
3. Click **Save**
4. Re-open the edit form for the program

**Gherkin:**
```gherkin
Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged
```

**Expected result:**
- Name remains **Data Science Fundamentals**
- Description updates to **Advanced data science and machine learning track**
- No unintended changes to other fields (dates, status, IDs, etc.)

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

## Acceptance Criteria Coverage Matrix

| AC Scenario | Covered by |
|---|---|
| Open program for editing | TC-001 |
| Successfully edit a program name | TC-002 |
| Edit preserves unchanged fields | TC-003 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Field naming inconsistency:** AC uses **Name** in edit scenarios vs **Program Name** in create flows — confirm single label across create and edit.

2. **Required vs optional Description on edit** not specified (TC-017).

3. **Maximum field lengths** not defined for edit validation (TC-012, TC-013).

4. **Duplicate name rules on edit** not in ACs — confirm case sensitivity and self-rename behavior (TC-019).

5. **Role-based access** not mentioned — only implied admin context (TC-010).

6. **Cancel vs close (X) vs Escape** dismiss behaviors not defined (TC-005).

7. **Optimistic vs pessimistic UI update** — AC says list updates "immediately"; confirm behavior on slow network (TC-009).

8. **Concurrent edits** by two admins on same program not covered.

9. **Audit trail / version history** not mentioned — unclear if edits should log who changed what.

10. **Validation for whitespace-only Name** on edit not specified (similar to create validation).

11. **Success feedback** (toast, inline message) after save not defined.

12. **Programs with linked courses/enrollments** — unclear if edit restrictions apply when program is in use.
