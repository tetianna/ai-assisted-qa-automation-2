# Test Plan: Delete Program with Confirmation

**Feature:** Delete program with confirmation  
**Author:** QA Engineering  
**Date:** 2026-06-25  
**Scope:** Program deletion flow with confirmation dialog on the Programs page

---

## Positive Flows

### TC-001 — Confirmed deletion removes program from list

**Title:** Program is deleted after user confirms in the confirmation dialog

**Preconditions:**
- User is logged in as admin
- Program **Test Program** exists with Description **Program used for deletion testing**

**Steps:**
1. Navigate to the Programs page
2. Click the delete icon for **Test Program**
3. Verify confirmation dialog appears
4. Click **Confirm** (or equivalent confirm action)

**Gherkin:**
```gherkin
Scenario: Delete program with confirmation
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  Then I see a confirmation dialog
  When I confirm deletion
  Then "Test Program" is removed from the program list
```

**Expected result:**
- Confirmation dialog shown before deletion
- After confirm, **Test Program** no longer appears in list
- Program count decreases by one

**Priority:** High

---

### TC-002 — Cancelled deletion keeps program in list

**Title:** Program remains when user dismisses the confirmation dialog

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists

**Steps:**
1. Navigate to the Programs page
2. Click the delete icon for **Web Development 2026**
3. When confirmation dialog appears, click **Cancel**

**Gherkin:**
```gherkin
Scenario: Cancel program deletion
  Given I click the delete icon for a program
  When I see the confirmation dialog
  And I click Cancel
  Then the program still exists in the list
```

**Expected result:**
- Dialog closes
- **Web Development 2026** still visible in program list
- No data loss or partial delete state

**Priority:** High

---

### TC-003 — Confirmation dialog displays program identifier

**Title:** User sees which program will be deleted before confirming

**Preconditions:**
- User is logged in as admin
- Program **Data Science Fundamentals** exists

**Steps:**
1. Click delete icon for **Data Science Fundamentals**
2. Read confirmation dialog content

**Gherkin:**
```gherkin
Scenario: Confirmation dialog shows program name
  Given a program "Data Science Fundamentals" exists
  When I click the delete icon for "Data Science Fundamentals"
  Then I see a confirmation dialog
  And the dialog mentions "Data Science Fundamentals"
```

**Expected result:**
- Dialog clearly identifies **Data Science Fundamentals**
- Destructive action is unambiguous (e.g., "Are you sure you want to delete...")

**Priority:** High

---

### TC-004 — List updates immediately after successful deletion

**Title:** Program list reflects deletion without manual refresh

**Preconditions:**
- User is logged in as admin
- Program **Cybersecurity Bootcamp** exists
- User is on Programs page

**Steps:**
1. Note **Cybersecurity Bootcamp** in list
2. Delete and confirm
3. Observe list without refreshing browser

**Gherkin:**
```gherkin
Scenario: List updates immediately after delete
  Given a program "Cybersecurity Bootcamp" exists
  When I delete "Cybersecurity Bootcamp" and confirm
  Then "Cybersecurity Bootcamp" is removed from the list immediately
  And I do not need to refresh the page
```

**Expected result:**
- List updates in real time
- No stale entry visible

**Priority:** Medium

---

### TC-005 — Success feedback shown after deletion

**Title:** User receives confirmation that deletion succeeded

**Preconditions:**
- User is logged in as admin
- Program **Mobile App Development** exists

**Steps:**
1. Delete **Mobile App Development** and confirm
2. Observe UI feedback

**Gherkin:**
```gherkin
Scenario: Success message after delete
  Given a program "Mobile App Development" exists
  When I delete "Mobile App Development" and confirm
  Then I see a success indication that the program was deleted
```

**Expected result:**
- Toast, banner, or inline success message (per design)
- No error state after successful delete

**Priority:** Medium

---

## Negative Flows

### TC-006 — Delete icon click alone does not remove program

**Title:** Program is not deleted until confirmation is explicitly given

**Preconditions:**
- User is logged in as admin
- Program **UX Design Certificate** exists

**Steps:**
1. Click delete icon for **UX Design Certificate**
2. Do not confirm — close dialog via Cancel or X
3. Verify program still exists

**Gherkin:**
```gherkin
Scenario: No delete without confirmation
  Given a program "UX Design Certificate" exists
  When I click the delete icon for "UX Design Certificate"
  And I dismiss the dialog without confirming
  Then "UX Design Certificate" still exists in the program list
```

**Expected result:**
- No deletion on dialog open alone
- Program intact after dismiss

**Priority:** High

---

### TC-007 — Non-admin user cannot delete programs

**Title:** Delete action is unavailable to unauthorized users

**Preconditions:**
- User is logged in as non-admin
- Program **Test Program** exists

**Steps:**
1. Navigate to Programs page
2. Locate **Test Program**
3. Attempt to delete

**Gherkin:**
```gherkin
Scenario: Non-admin cannot delete programs
  Given I am logged in as a non-admin user
  And a program "Test Program" exists
  When I navigate to the Programs page
  Then I do not see a delete icon for "Test Program"
  And I cannot delete the program
```

**Expected result:**
- Delete icon hidden or disabled
- API/direct access blocked if attempted

**Priority:** High

---

### TC-008 — Server error during delete leaves program intact

**Title:** Failed delete request does not remove program from list

**Preconditions:**
- User is logged in as admin
- Program **Cloud Computing 2026** exists
- Ability to simulate server failure on delete

**Steps:**
1. Initiate delete for **Cloud Computing 2026**
2. Confirm deletion
3. Simulate server error
4. Inspect program list

**Gherkin:**
```gherkin
Scenario: Server error preserves program
  Given a program "Cloud Computing 2026" exists
  When I confirm deletion of "Cloud Computing 2026"
  And the delete request fails due to a server error
  Then "Cloud Computing 2026" remains in the program list
  And an error message is displayed
```

**Expected result:**
- Program not removed on failure
- User informed and can retry

**Priority:** High

---

### TC-009 — Deleting already-deleted program shows appropriate error

**Title:** Stale delete attempt does not cause inconsistent UI state

**Preconditions:**
- User is logged in as admin
- Program **DevOps Engineering 2026** was deleted in another session/tab
- Programs list may be stale

**Steps:**
1. Attempt to delete **DevOps Engineering 2026** from stale view
2. Confirm if dialog appears

**Gherkin:**
```gherkin
Scenario: Delete already deleted program
  Given program "DevOps Engineering 2026" no longer exists
  When I attempt to delete "DevOps Engineering 2026"
  Then I see an error that the program was not found or list refreshes
  And no erroneous UI state occurs
```

**Expected result:**
- Graceful handling (404 message or auto-refresh)
- No crash or ghost deletion

**Priority:** Medium

---

### TC-010 — Program with dependencies cannot be deleted (if business rule applies)

**Title:** Deletion blocked when program has linked courses or enrollments

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** has active courses or student enrollments

**Steps:**
1. Click delete icon for **Web Development 2026**
2. Confirm deletion

**Gherkin:**
```gherkin
Scenario: Delete blocked when program has dependencies
  Given program "Web Development 2026" has linked courses or enrollments
  When I click the delete icon for "Web Development 2026"
  And I confirm deletion
  Then deletion is blocked
  And an error explains why the program cannot be deleted
  And "Web Development 2026" remains in the list
```

**Expected result:**
- Clear dependency error if rule exists
- Data integrity maintained

**Priority:** High

---

## Edge Cases

### TC-011 — Delete program with long name displays correctly in dialog

**Title:** Confirmation dialog handles very long program names

**Preconditions:**
- User is logged in as admin
- Program exists with 255-character name

**Steps:**
1. Click delete icon for long-named program
2. Inspect dialog layout and text

**Gherkin:**
```gherkin
Scenario: Long name in delete confirmation
  Given a program with a 255-character name exists
  When I click the delete icon for that program
  Then the confirmation dialog displays the program name without layout breakage
```

**Expected result:**
- Name visible (truncated with tooltip if needed)
- Confirm/Cancel remain accessible

**Priority:** Low

---

### TC-012 — Delete program with special characters in name

**Title:** Confirmation and deletion work for names with special characters

**Preconditions:**
- User is logged in as admin
- Program **Informatique & IA - Niveau 2** exists

**Steps:**
1. Click delete icon
2. Confirm deletion

**Gherkin:**
```gherkin
Scenario: Delete program with special characters in name
  Given a program "Informatique & IA - Niveau 2" exists
  When I delete "Informatique & IA - Niveau 2" and confirm
  Then "Informatique & IA - Niveau 2" is removed from the program list
```

**Expected result:**
- Correct program identified and removed
- No encoding issues in dialog

**Priority:** Medium

---

### TC-013 — Escape key dismisses confirmation without deleting

**Title:** Keyboard dismiss cancels deletion same as Cancel button

**Preconditions:**
- User is logged in as admin
- Program **Secure Coding 2026** exists

**Steps:**
1. Click delete icon for **Secure Coding 2026**
2. Press **Escape** when dialog is focused

**Gherkin:**
```gherkin
Scenario: Escape cancels delete confirmation
  Given a program "Secure Coding 2026" exists
  When I click the delete icon for "Secure Coding 2026"
  And I press Escape
  Then the confirmation dialog closes
  And "Secure Coding 2026" remains in the list
```

**Expected result:**
- Same as Cancel — no deletion

**Priority:** Medium

---

### TC-014 — Double-click confirm does not cause errors

**Title:** Rapid double confirmation triggers only one delete operation

**Preconditions:**
- User is logged in as admin
- Program **AI Fundamentals** exists

**Steps:**
1. Open delete confirmation for **AI Fundamentals**
2. Double-click **Confirm** rapidly

**Gherkin:**
```gherkin
Scenario: Double confirm prevention
  Given a program "AI Fundamentals" exists
  When I confirm deletion twice rapidly
  Then the program is deleted once
  And no duplicate delete errors break the UI
```

**Expected result:**
- Single delete executed
- Confirm button disabled during request

**Priority:** Medium

---

### TC-015 — Delete last remaining program transitions to empty state

**Title:** Deleting the only program shows empty state if applicable

**Preconditions:**
- User is logged in as admin
- Only one program **Test Program** exists

**Steps:**
1. Delete **Test Program** and confirm
2. Observe Programs page

**Gherkin:**
```gherkin
Scenario: Delete last program shows empty state
  Given only program "Test Program" exists
  When I delete "Test Program" and confirm
  Then the program list is empty
  And I see a message indicating no programs exist
```

**Expected result:**
- Empty state displayed per list feature spec
- No broken list UI

**Priority:** Medium

---

### TC-016 — Click outside dialog cancels deletion (if supported)

**Title:** Overlay click dismisses dialog without deleting

**Preconditions:**
- User is logged in as admin
- Program **Test Program** exists
- Product supports click-outside to dismiss

**Steps:**
1. Open delete confirmation
2. Click outside the dialog on the overlay

**Gherkin:**
```gherkin
Scenario: Click outside cancels delete
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  And I click outside the confirmation dialog
  Then the dialog closes
  And "Test Program" remains in the list
```

**Expected result:**
- No deletion on overlay click (if feature supported)
- Document behavior if click-outside is disabled

**Priority:** Low

---

### TC-017 — Undo after delete (if feature exists)

**Title:** Optional undo restores recently deleted program

**Preconditions:**
- User is logged in as admin
- Undo feature exists in product

**Steps:**
1. Delete **Test Program** and confirm
2. Click **Undo** on success toast within timeout

**Gherkin:**
```gherkin
Scenario: Undo delete restores program
  Given a program "Test Program" exists
  When I delete "Test Program" and confirm
  And I click Undo within the allowed time
  Then "Test Program" reappears in the program list
```

**Expected result:**
- Program restored if undo supported
- N/A if undo not in scope

**Priority:** Low

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Covered by |
|---|---|
| Delete program with confirmation | TC-001, TC-003, TC-004 |
| Cancel program deletion | TC-002, TC-006, TC-013 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Confirmation dialog copy** not specified — exact wording, warning severity, and button labels undefined.

2. **Program dependencies** — unclear if programs with courses, cohorts, or enrollments can be deleted (TC-010).

3. **Soft delete vs hard delete** not specified — recovery/undo not mentioned (TC-017).

4. **Role-based access** not in ACs — only implied admin context (TC-007).

5. **Success/error feedback** after delete or cancel not defined (TC-005, TC-008).

6. **Keyboard accessibility** — Escape, Enter on confirm, focus trap not specified (TC-013).

7. **Click outside / X button** dismiss behavior not defined (TC-016).

8. **Concurrent deletion** by two admins on same program not covered.

9. **Audit log** requirements for deletions not mentioned.

10. **Empty state transition** when deleting last program crosses into list feature but not referenced in delete ACs (TC-015).

11. **Delete from detail view vs list only** — AC references delete icon; unclear if other entry points exist.

12. **Internationalization** — dialog and messages for non-English locales not addressed.
