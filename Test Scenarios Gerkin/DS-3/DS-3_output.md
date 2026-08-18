# Test Plan: Program Name Validation and Duplicate Prevention

**Feature:** Program name validation and duplicate prevention  
**Author:** QA Engineering  
**Date:** 2026-06-25  
**Scope:** Program Name validation on create (and applicable edit) flows

---

## Positive Flows

### TC-001 — Valid program name with special characters is accepted

**Title:** Program name containing allowed special characters creates successfully

**Preconditions:**
- User is logged in as admin
- No program named **Informatique & IA - Niveau 2** exists
- Program creation form is open

**Steps:**
1. Enter **Informatique & IA - Niveau 2** in the Program Name field
2. Enter **Programme bilingue en informatique et intelligence artificielle** in Description
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Accept program name with special characters
  Given I am on the program creation form
  When I enter "Informatique & IA - Niveau 2" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

**Expected result:**
- Program is created
- List shows **Informatique & IA - Niveau 2** exactly as entered
- Special characters display correctly

**Priority:** High

---

### TC-002 — Standard alphanumeric program name is accepted

**Title:** Simple valid program name passes validation and creates successfully

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- No existing program **Web Development 2026**

**Steps:**
1. Enter **Web Development 2026** in Program Name
2. Enter **Full-stack web development program** in Description
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Valid standard program name accepted
  Given I am on the program creation form
  When I enter "Web Development 2026" as the program name
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the program is created successfully
  And the program list shows "Web Development 2026"
```

**Expected result:**
- Creation succeeds without validation errors

**Priority:** High

---

### TC-003 — Program name with hyphens and numbers is accepted

**Title:** Name with punctuation commonly used in titles is valid

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter **AI-101: Intro to Machine Learning (2026)** in Program Name
2. Fill required fields
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Hyphens numbers and colon in program name
  Given I am on the program creation form
  When I enter "AI-101: Intro to Machine Learning (2026)" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

**Expected result:**
- Name stored and displayed exactly

**Priority:** Medium

---

## Negative Flows

### TC-004 — Whitespace-only program name is rejected

**Title:** Name consisting only of spaces is treated as empty and blocks submission

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `   ` (three spaces) in Program Name
2. Fill Description with **Full-stack web development program**
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Reject program name with only whitespace
  Given I am on the program creation form
  When I enter "   " as the program name
  And I click Create
  Then the form is not submitted (name is trimmed, treated as empty)
```

**Expected result:**
- Form is not submitted
- Name trimmed to empty internally
- **Create** disabled or inline validation shown
- No program created

**Priority:** High

---

### TC-005 — Empty program name is rejected

**Title:** Blank Program Name prevents program creation

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Leave Program Name empty
2. Enter **Full-stack web development program** in Description
3. Attempt to click **Create**

**Gherkin:**
```gherkin
Scenario: Empty program name rejected
  Given I am on the program creation form
  When I leave the Program Name field empty
  And I click Create
  Then the Create button is disabled or validation prevents submission
  And no program is created
```

**Expected result:**
- Submission blocked
- Clear indication that Program Name is required

**Priority:** High

---

### TC-006 — Duplicate program name is rejected on create

**Title:** Creating a program with an existing name shows duplicate error

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** already exists
- Program creation form is open

**Steps:**
1. Enter **Web Development 2026** in Program Name
2. Enter **Another description for duplicate test** in Description
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Reject duplicate program name
  Given a program "Web Development 2026" already exists
  When I try to create a new program with the same name
  Then I see an error indicating the name already exists
```

**Expected result:**
- Error message visible (e.g., "A program with this name already exists")
- Form remains open
- Only one **Web Development 2026** in list

**Priority:** High

---

### TC-007 — Duplicate check is case-insensitive (if product rule applies)

**Title:** Name differing only by case is treated as duplicate

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists
- Program creation form is open

**Steps:**
1. Enter **web development 2026** in Program Name
2. Fill required fields
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Case-insensitive duplicate rejected
  Given a program "Web Development 2026" already exists
  When I try to create a new program with name "web development 2026"
  Then I see an error indicating the name already exists
  And no second program is created
```

**Expected result:**
- Duplicate error shown if case-insensitive rule applies
- Document actual behavior if case-sensitive

**Priority:** High

---

### TC-008 — Duplicate name after trim is rejected

**Title:** Name that trims to an existing name is blocked

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists
- Program creation form is open

**Steps:**
1. Enter `  Web Development 2026  ` in Program Name
2. Fill required fields
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Duplicate after trim rejected
  Given a program "Web Development 2026" already exists
  When I enter "  Web Development 2026  " as the program name
  And I click Create
  Then I see an error indicating the name already exists
```

**Expected result:**
- Trimmed name compared against existing names
- Duplicate error displayed

**Priority:** High

---

### TC-009 — Program is not created when validation API fails

**Title:** Server-side validation failure does not persist invalid program

**Preconditions:**
- User is logged in as admin
- Program creation form open
- Simulate validation service failure

**Steps:**
1. Enter **Cloud Computing 2026** in Program Name
2. Fill required fields
3. Trigger server validation error
4. Inspect program list

**Gherkin:**
```gherkin
Scenario: Validation service failure blocks create
  Given I am on the program creation form
  When I enter "Cloud Computing 2026" as the program name
  And the validation service returns an error
  Then the program is not created
  And an error message is displayed to the user
```

**Expected result:**
- No partial program record
- User can retry or correct input

**Priority:** Medium

---

## Edge Cases

### TC-010 — Program name at maximum length passes validation

**Title:** Name at exact character limit is accepted

**Preconditions:**
- User is logged in as admin
- Assume max length **255 characters**
- Program creation form is open

**Steps:**
1. Enter a 255-character Program Name
2. Fill Description
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Max length name accepted
  Given I am on the program creation form
  When I enter a 255-character string as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

**Expected result:**
- Validation passes at boundary
- Full name persisted

**Priority:** Medium

---

### TC-011 — Program name one character over max length is rejected

**Title:** Name exceeding limit fails validation before or on submit

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter a 256-character Program Name
2. Fill required fields
3. Attempt **Create**

**Gherkin:**
```gherkin
Scenario: Over max length name rejected
  Given I am on the program creation form
  When I enter a 256-character string as the program name
  And I click Create
  Then validation prevents program creation
  And a max-length error message is shown
```

**Expected result:**
- Clear max-length validation message
- No truncated save without user consent

**Priority:** Medium

---

### TC-012 — Single-character program name validation

**Title:** Minimum-length boundary for Program Name is enforced correctly

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter **X** in Program Name
2. Fill required fields
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Single character program name
  Given I am on the program creation form
  When I enter "X" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully or a minimum-length error is shown
```

**Expected result:**
- Behavior matches defined minimum length rule

**Priority:** Low

---

### TC-013 — Unicode and emoji in program name pass validation

**Title:** International characters and emoji are valid if allowed by character set rules

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter **Programme Français 🎓 2026** in Program Name
2. Fill required fields
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Unicode emoji program name accepted
  Given I am on the program creation form
  When I enter "Programme Français 🎓 2026" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

**Expected result:**
- Created if unicode allowed; otherwise explicit charset error

**Priority:** Low

---

### TC-014 — Disallowed special characters are rejected with clear message

**Title:** Characters outside permitted set fail validation with guidance

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- Product defines disallowed characters (e.g., `<`, `>`, `"`)

**Steps:**
1. Enter **Program<script>Name</script>** in Program Name
2. Fill required fields
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Disallowed characters rejected
  Given I am on the program creation form
  When I enter "Program<script>Name</script>" as the program name
  And I click Create
  Then validation prevents program creation
  And an error describes invalid characters in the program name
```

**Expected result:**
- Rejection with actionable error
- No XSS or broken list rendering if somehow stored

**Priority:** High

---

### TC-015 — Leading and trailing whitespace is trimmed before duplicate check

**Title:** Trimmed name used for uniqueness comparison

**Preconditions:**
- User is logged in as admin
- Program **Data Science Fundamentals** exists
- Program creation form is open

**Steps:**
1. Enter `  Data Science Fundamentals  ` in Program Name
2. Fill required fields
3. Click **Create**

**Gherkin:**
```gherkin
Scenario: Trim before duplicate check
  Given a program "Data Science Fundamentals" already exists
  When I enter "  Data Science Fundamentals  " as the program name
  And I click Create
  Then I see an error indicating the name already exists
```

**Expected result:**
- Duplicate detected on trimmed value

**Priority:** Medium

---

### TC-016 — Tab and newline characters in name are handled

**Title:** Invisible whitespace characters do not bypass validation

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter name containing tab or newline (e.g., `Web\tDevelopment`)
2. Fill required fields
3. Attempt **Create**

**Gherkin:**
```gherkin
Scenario: Tab newline in program name handled
  Given I am on the program creation form
  When I enter a program name containing tab or newline characters
  And I click Create
  Then the name is rejected or sanitized per validation rules
  And no malformed program name appears in the list
```

**Expected result:**
- Consistent reject or normalize behavior documented

**Priority:** Medium

---

### TC-017 — Duplicate prevention on edit when renaming

**Title:** Renaming during edit to existing name triggers duplicate error

**Preconditions:**
- User is logged in as admin
- Programs **Web Development 2026** and **AI Fundamentals** exist
- Edit form open for **AI Fundamentals**

**Steps:**
1. Change Name to **Web Development 2026**
2. Click **Save**

**Gherkin:**
```gherkin
Scenario: Duplicate name rejected on edit
  Given programs "Web Development 2026" and "AI Fundamentals" exist
  And I am editing "AI Fundamentals"
  When I change the Name to "Web Development 2026"
  And I click Save
  Then I see an error indicating the name already exists
```

**Expected result:**
- Same duplicate rules as create flow

**Priority:** High

---

### TC-018 — Concurrent duplicate create by two users

**Title:** Only one program created when two users submit same name simultaneously

**Preconditions:**
- Two admin sessions
- No program **Concurrent Test Program** exists

**Steps:**
1. Both users open create form
2. Both enter **Concurrent Test Program**
3. Both click **Create** within seconds

**Gherkin:**
```gherkin
Scenario: Concurrent duplicate create
  Given no program "Concurrent Test Program" exists
  When two users simultaneously try to create "Concurrent Test Program"
  Then exactly one program is created
  And the other user sees a duplicate name error
```

**Expected result:**
- Database uniqueness enforced
- Second user gets clear error

**Priority:** Medium

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Covered by |
|---|---|
| Reject program name with only whitespace | TC-004 |
| Accept program name with special characters | TC-001 |
| Reject duplicate program name | TC-006 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Exact duplicate error message text** not specified — wording and placement (inline vs toast) undefined.

2. **Case sensitivity** for duplicate checks not stated (TC-007).

3. **Maximum and minimum name length** not in ACs (TC-010, TC-011, TC-012).

4. **Full list of allowed special characters** not defined — AC shows one example with `&` and `-` but not full charset (TC-014).

5. **Trim behavior** implied for whitespace AC but not explicitly stated for all inputs (TC-008, TC-015).

6. **Edit flow validation** not mentioned in ACs but likely shares rules (TC-017).

7. **"Fill other required fields"** — which fields are required besides name not specified.

8. **Duplicate scope** — global uniqueness vs per-organization/tenant not defined.

9. **Normalized comparison** — whether accents, homoglyphs, or unicode normalization affect duplicates (e.g., `café` vs `cafe`).

10. **Real-time vs on-submit validation** — AC shows click Create; unclear if inline validation exists while typing.

11. **Soft-deleted programs** — unclear if deleted program names can be reused.

12. **Leading/trailing special characters only** (e.g., `---`) not covered — treat as empty or valid?
