# Test Plan: Create New Academic Program

**Feature:** Create new academic program  
**Author:** QA Engineering  
**Date:** 2026-06-25  
**Scope:** Program creation modal on the Programs page (admin role)

---

## Positive Flows

### TC-001 — Program creation form displays required fields

**Title:** Admin sees Program Name and Description fields when opening the creation form

**Preconditions:**
- User is logged in as admin
- At least one program may or may not exist in the system

**Steps:**
1. Navigate to the Programs page
2. Click "+ New Program"

**Gherkin:**
```gherkin
Scenario: Navigate to program creation form
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description
```

**Expected result:**
- A modal (or form panel) opens for program creation
- **Program Name** field is visible and editable
- **Description** field is visible and editable
- **Create** and **Cancel** (or equivalent dismiss) actions are visible

**Priority:** High

---

### TC-002 — New program appears in list after successful creation

**Title:** Valid program name and description are saved and shown in the program list

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- No existing program named "Web Development 2026" (or it is acceptable to create a duplicate if duplicates are allowed)

**Steps:**
1. Enter **Web Development 2026** in the Program Name field
2. Enter **Full-stack web development program** in the Description field
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Successfully create a program
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
```

**Expected result:**
- The creation modal closes
- The Programs page program list includes a row/card for **Web Development 2026**
- The stored description for the program is **Full-stack web development program** (visible on detail view or list if description is displayed)

**Priority:** High

---

### TC-003 — Create button remains disabled when Program Name is empty

**Title:** Empty Program Name prevents form submission

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Leave the Program Name field empty
2. Optionally enter text in the Description field (e.g., **Full-stack web development program**)
3. Observe the Create button state
4. Attempt to click **Create** if the button appears enabled

**Gherkin:**
```gherkin
Scenario: Validation prevents empty program name
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

**Expected result:**
- **Create** button is disabled while Program Name is empty
- No program is created
- Modal remains open

**Priority:** High

---

### TC-004 — Program can be created with Program Name only

**Title:** Program is created when Description is left empty but Program Name is provided

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- No existing program named **Data Science Fundamentals**

**Steps:**
1. Enter **Data Science Fundamentals** in the Program Name field
2. Leave the Description field empty
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Create program with name only
  Given I am on the program creation form
  When I fill in Program Name with "Data Science Fundamentals"
  And I leave the Description field empty
  And I click Create
  Then the modal closes
  And the program list shows "Data Science Fundamentals"
```

**Expected result:**
- Program is created successfully
- Modal closes
- **Data Science Fundamentals** appears in the program list
- Description is stored as empty or displays an appropriate empty state in the UI

**Priority:** Medium

---

### TC-005 — Cancel closes form without creating a program

**Title:** Dismissing the form does not add a program to the list

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- Note the current count of programs in the list

**Steps:**
1. Enter **Cybersecurity Bootcamp 2026** in Program Name
2. Enter **Introductory cybersecurity program** in Description
3. Click **Cancel** (or close icon / click outside modal if supported)

**Gherkin:**
```gherkin
Scenario: Cancel program creation
  Given I am on the program creation form
  When I fill in Program Name with "Cybersecurity Bootcamp 2026"
  And I fill in Description with "Introductory cybersecurity program"
  And I click Cancel
  Then the modal closes
  And the program list does not show "Cybersecurity Bootcamp 2026"
```

**Expected result:**
- Modal closes
- **Cybersecurity Bootcamp 2026** is not present in the program list
- Program count is unchanged

**Priority:** Medium

---

### TC-006 — Create button enables after clearing and re-entering Program Name

**Title:** Create button state updates correctly when Program Name is cleared and refilled

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter **Mobile App Development** in Program Name
2. Verify **Create** is enabled
3. Clear the Program Name field completely
4. Verify **Create** is disabled
5. Re-enter **Mobile App Development**
6. Click **Create**

**Gherkin:**
```gherkin
Scenario: Create button re-enables after valid name is re-entered
  Given I am on the program creation form
  When I fill in Program Name with "Mobile App Development"
  Then the Create button is enabled
  When I clear the Program Name field
  Then the Create button is disabled
  When I fill in Program Name with "Mobile App Development"
  And I click Create
  Then the modal closes
  And the program list shows "Mobile App Development"
```

**Expected result:**
- Create button toggles disabled/enabled in sync with Program Name validity
- Program is created successfully after re-entry

**Priority:** Medium

---

## Negative Flows

### TC-007 — Program is not created when submission is blocked by empty name

**Title:** Submitting with whitespace-only Program Name does not create a program

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter only spaces in the Program Name field (e.g., `   `)
2. Enter **Full-stack web development program** in Description
3. Observe Create button state and attempt submission

**Gherkin:**
```gherkin
Scenario: Whitespace-only program name is rejected
  Given I am on the program creation form
  When I fill in Program Name with "   "
  And I fill in Description with "Full-stack web development program"
  Then the Create button is disabled
  And no program is created
```

**Expected result:**
- **Create** remains disabled OR submission shows a validation error
- No new program appears in the list
- Modal stays open

**Priority:** High

---

### TC-008 — Duplicate program name is not allowed

**Title:** System prevents creating a second program with the same name

**Preconditions:**
- User is logged in as admin
- A program named **Web Development 2026** already exists in the program list

**Steps:**
1. Open the program creation form
2. Enter **Web Development 2026** in Program Name
3. Enter **Duplicate attempt description** in Description
4. Click **Create**

**Gherkin:**
```gherkin
Scenario: Duplicate program name is rejected
  Given a program named "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate attempt description"
  And I click Create
  Then the modal remains open
  And an error message indicates the program name already exists
  And the program list contains only one "Web Development 2026" entry
```

**Expected result:**
- Creation fails with a clear, user-visible error (e.g., "Program name already exists")
- Modal remains open with entered values preserved or cleared per product rules
- No duplicate row appears in the program list

**Priority:** High

---

### TC-009 — Non-admin user cannot create a program

**Title:** Users without admin role cannot access program creation

**Preconditions:**
- User is logged in with a non-admin role (e.g., instructor or read-only user)
- Programs page is accessible to that role (if applicable)

**Steps:**
1. Navigate to the Programs page
2. Look for **+ New Program** control
3. If visible, click it and attempt to create a program

**Gherkin:**
```gherkin
Scenario: Non-admin cannot create programs
  Given I am logged in as a non-admin user
  When I navigate to the Programs page
  Then I do not see the "+ New Program" button
  And I cannot open the program creation form
```

**Expected result:**
- **+ New Program** is hidden or disabled for non-admin users
- Program creation form is not accessible
- No program can be created via UI or direct URL without authorization

**Priority:** High

---

### TC-010 — Program is not created when Create is clicked with invalid server-side validation

**Title:** Server rejects malformed or unauthorized create requests without persisting data

**Preconditions:**
- User is logged in as admin
- Ability to intercept or simulate API failure (optional for manual; required for automation)

**Steps:**
1. Open program creation form
2. Enter valid **Program Name** and **Description**
3. Simulate server error (network failure or 500 response) on create
4. Observe UI behavior

**Gherkin:**
```gherkin
Scenario: Server error during create does not add program to list
  Given I am on the program creation form
  When I fill in Program Name with "Cloud Computing 2026"
  And I fill in Description with "AWS and Azure fundamentals"
  And the create request fails due to a server error
  Then the modal remains open or shows an error state
  And the program list does not show "Cloud Computing 2026"
  And a user-friendly error message is displayed
```

**Expected result:**
- No partial or ghost program entry in the list
- User receives actionable error feedback
- User can retry or cancel without data corruption

**Priority:** Medium

---

### TC-011 — XSS payload in Description is not executed in the program list

**Title:** Script content in Description is stored safely and rendered without execution

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter **Secure Coding 2026** in Program Name
2. Enter `<script>alert('xss')</script>` in Description
3. Click **Create**
4. View the program in the list and any detail view

**Gherkin:**
```gherkin
Scenario: XSS in description is sanitized
  Given I am on the program creation form
  When I fill in Program Name with "Secure Coding 2026"
  And I fill in Description with "<script>alert('xss')</script>"
  And I click Create
  Then the modal closes
  And the program list shows "Secure Coding 2026"
  And no script alert is executed
  And the description is displayed as plain text or safely escaped
```

**Expected result:**
- Program may be created (if input is allowed) but script does not execute
- Description displays escaped/sanitized content
- No security vulnerability in list or detail views

**Priority:** High

---

## Edge Cases

### TC-012 — Program Name at maximum allowed length is accepted

**Title:** Program Name at the upper character limit is saved successfully

**Preconditions:**
- User is logged in as admin
- Maximum Program Name length is known (assume **255 characters** unless specified otherwise)
- Program creation form is open

**Steps:**
1. Enter a Program Name of exactly 255 characters (e.g., `A` repeated 255 times, or a realistic max-length name)
2. Enter **Boundary length validation program** in Description
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Maximum length program name is accepted
  Given I am on the program creation form
  When I fill in Program Name with a 255-character string
  And I fill in Description with "Boundary length validation program"
  And I click Create
  Then the modal closes
  And the program list shows the 255-character program name
```

**Expected result:**
- Program is created at max allowed length
- Full name is visible or truncates with tooltip per UI design
- No truncation in persisted data unless product spec defines truncation

**Priority:** Medium

---

### TC-013 — Program Name exceeding maximum length is rejected

**Title:** Program Name one character over the limit cannot be submitted

**Preconditions:**
- User is logged in as admin
- Maximum Program Name length is **255 characters**
- Program creation form is open

**Steps:**
1. Enter a Program Name of 256 characters
2. Enter **Over limit test** in Description
3. Attempt to click **Create**

**Gherkin:**
```gherkin
Scenario: Program name over max length is rejected
  Given I am on the program creation form
  When I fill in Program Name with a 256-character string
  And I fill in Description with "Over limit test"
  Then the Create button is disabled or a validation error is shown
  And no program is created
```

**Expected result:**
- Input is blocked at field level OR validation error on submit
- No program created with truncated name without user awareness

**Priority:** Medium

---

### TC-014 — Program Name with special characters is handled correctly

**Title:** Program Name containing special characters is accepted or rejected per defined rules

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter **AI & ML: Phase-1 (2026)** in Program Name
2. Enter **Covers neural networks and NLP** in Description
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Special characters in program name
  Given I am on the program creation form
  When I fill in Program Name with "AI & ML: Phase-1 (2026)"
  And I fill in Description with "Covers neural networks and NLP"
  And I click Create
  Then the modal closes
  And the program list shows "AI & ML: Phase-1 (2026)"
```

**Expected result:**
- If special characters are allowed: program is created with exact name preserved
- If disallowed: clear validation message listing permitted characters
- No broken display or encoding issues in the list

**Priority:** Medium

---

### TC-015 — Leading and trailing whitespace in Program Name is trimmed

**Title:** Program is saved without leading or trailing spaces in the name

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `  Web Development 2026  ` (spaces before and after) in Program Name
2. Enter **Whitespace trim test** in Description
3. Click **Create**
4. Inspect the program list entry

**Gherkin:**
```gherkin
Scenario: Leading and trailing whitespace is trimmed from program name
  Given I am on the program creation form
  When I fill in Program Name with "  Web Development 2026  "
  And I fill in Description with "Whitespace trim test"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
  And the program list does not show "  Web Development 2026  "
```

**Expected result:**
- Stored and displayed name is **Web Development 2026** (trimmed)
- Trim behavior is consistent on create and edit (if edit exists)

**Priority:** Medium

---

### TC-016 — Description at maximum allowed length is accepted

**Title:** Long Description within the character limit is saved in full

**Preconditions:**
- User is logged in as admin
- Assume maximum Description length is **2000 characters** unless specified otherwise
- Program creation form is open

**Steps:**
1. Enter **UX Design Certificate** in Program Name
2. Enter a Description of exactly 2000 characters
3. Click **Create**
4. Open program detail or hover/list view where description appears

**Gherkin:**
```gherkin
Scenario: Maximum length description is accepted
  Given I am on the program creation form
  When I fill in Program Name with "UX Design Certificate"
  And I fill in Description with a 2000-character string
  And I click Create
  Then the modal closes
  And the program "UX Design Certificate" is created with the full description stored
```

**Expected result:**
- Program created successfully
- Full description persisted (verify via detail view or API)
- UI handles long text with expand/truncate per design

**Priority:** Low

---

### TC-017 — Unicode and emoji in Program Name are preserved

**Title:** International characters and emoji in Program Name display correctly after creation

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter **Programme Français 🎓 2026** in Program Name
2. Enter **Programme bilingue pour étudiants internationaux** in Description
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Unicode and emoji in program name
  Given I am on the program creation form
  When I fill in Program Name with "Programme Français 🎓 2026"
  And I fill in Description with "Programme bilingue pour étudiants internationaux"
  And I click Create
  Then the modal closes
  And the program list shows "Programme Français 🎓 2026"
```

**Expected result:**
- Characters and emoji render correctly in list and detail views
- No mojibake or replacement characters in storage

**Priority:** Low

---

### TC-018 — Single-character Program Name is accepted

**Title:** Minimum-length valid Program Name creates a program successfully

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter **X** in Program Name
2. Enter **Single character name boundary test** in Description
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Single character program name
  Given I am on the program creation form
  When I fill in Program Name with "X"
  And I fill in Description with "Single character name boundary test"
  And I click Create
  Then the modal closes
  And the program list shows "X"
```

**Expected result:**
- Program is created if minimum length is 1 character
- OR validation error if minimum length is greater than 1 (document actual rule)

**Priority:** Low

---

### TC-019 — Rapid double-click on Create does not create duplicate programs

**Title:** Only one program is created when Create is clicked multiple times quickly

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- No existing program named **DevOps Engineering 2026**

**Steps:**
1. Enter **DevOps Engineering 2026** in Program Name
2. Enter **CI/CD and infrastructure automation** in Description
3. Double-click **Create** rapidly

**Gherkin:**
```gherkin
Scenario: Double submit prevention
  Given I am on the program creation form
  When I fill in Program Name with "DevOps Engineering 2026"
  And I fill in Description with "CI/CD and infrastructure automation"
  And I double-click the Create button
  Then the modal closes
  And the program list shows exactly one "DevOps Engineering 2026" entry
```

**Expected result:**
- Only one program record is created
- Create button is disabled during submission (loading state)
- No duplicate entries from double-submit

**Priority:** Medium

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Covered by |
|---|---|
| Navigate to program creation form | TC-001 |
| Successfully create a program | TC-002 |
| Validation prevents empty program name | TC-003, TC-007 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Description required or optional?** ACs imply Description is filled for the happy path, but do not state whether it is mandatory. TC-004 assumes optional; confirm with product owner.

2. **Maximum field lengths** not specified for Program Name or Description. TC-012, TC-013, and TC-016 assume 255 and 2000 characters respectively — replace with actual limits from the spec or database schema.

3. **Duplicate program names** not addressed in ACs. TC-008 assumes duplicates are blocked; confirm whether case-insensitive matching applies (e.g., `web development 2026` vs `Web Development 2026`).

4. **Whitespace handling** not defined. TC-007 and TC-015 assume trim/reject rules that are not in the ACs.

5. **Minimum Program Name length** not specified (TC-018). Confirm whether single-character or very short names are valid.

6. **Allowed character set** for Program Name not defined (TC-014). Clarify whether symbols, emoji, and non-Latin scripts are supported.

7. **Modal dismiss behavior** not specified — click outside, Escape key, or Cancel only (TC-005). Confirm expected behavior for each dismiss action.

8. **Role-based access** only mentions admin in ACs. TC-009 covers non-admin but other roles (e.g., program manager) are not defined.

9. **Post-create UX** not fully specified — success toast, sort order in list, whether list refreshes automatically, or navigation to new program detail page.

10. **Edit and delete flows** are out of scope for these ACs but may affect duplicate-name and validation testing strategy.

11. **Error messaging** not specified for validation failures (empty name, duplicate, max length). Expected message text and placement (inline vs banner) should be defined.

12. **Concurrent creation** by two admins with the same name is not covered; consider adding if multi-user environment is expected.
