# Test Plan: Program List Filtering and Display

**Feature:** Program list filtering and display  
**Author:** QA Engineering  
**Date:** 2026-06-25  
**Scope:** Programs page list rendering, empty state, and display of program details

---

## Positive Flows

### TC-001 — Program list displays name and description for each program

**Title:** All existing programs show name and description on the Programs page

**Preconditions:**
- User is logged in as admin
- Programs exist:
  - **Web Development 2026** — **Full-stack web development program**
  - **Data Science Fundamentals** — **Introductory data science course**
  - **Cybersecurity Bootcamp** — **Hands-on security operations**

**Steps:**
1. Navigate to the Programs page
2. Review the program list

**Gherkin:**
```gherkin
Scenario: Display program list with key details
  Given programs exist in the system
  When I navigate to the Programs page
  Then I see a list showing each program's name and description
```

**Expected result:**
- Each program row/card shows **name** and **description**
- **Web Development 2026** shows **Full-stack web development program**
- **Data Science Fundamentals** shows **Introductory data science course**
- **Cybersecurity Bootcamp** shows **Hands-on security operations**
- List is readable and scannable

**Priority:** High

---

### TC-002 — Empty state shown when no programs exist

**Title:** User sees helpful empty state when program list is empty

**Preconditions:**
- User is logged in as admin
- No programs exist in the system

**Steps:**
1. Navigate to the Programs page
2. Observe page content

**Gherkin:**
```gherkin
Scenario: Empty state when no programs exist
  Given no programs exist
  When I navigate to the Programs page
  Then I see a message indicating no programs have been created
  And I see a prompt to create the first program
```

**Expected result:**
- Empty state message visible (e.g., "No programs yet")
- Call-to-action to create first program (e.g., **+ New Program** button or link)
- No broken or blank list area

**Priority:** High

---

### TC-003 — List updates after creating a new program

**Title:** Newly created program appears in list with name and description

**Preconditions:**
- User is logged in as admin
- At least zero or more programs may exist

**Steps:**
1. Navigate to Programs page
2. Create program **Mobile App Development** with Description **iOS and Android development**
3. Return to or observe program list

**Gherkin:**
```gherkin
Scenario: New program appears in list after creation
  Given I am on the Programs page
  When I create a program "Mobile App Development" with description "iOS and Android development"
  Then the list shows "Mobile App Development"
  And the description "iOS and Android development" is visible
```

**Expected result:**
- New entry visible without full page reload (if SPA)
- Name and description match created values

**Priority:** High

---

### TC-004 — List reflects edits immediately

**Title:** Updated program name and description appear in list after save

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists in list

**Steps:**
1. Edit program name to **Web Development 2026 - Updated**
2. Edit description to **Updated full-stack curriculum**
3. Save and view list

**Gherkin:**
```gherkin
Scenario: List reflects program edits
  Given "Web Development 2026" is shown in the program list
  When I edit the program to name "Web Development 2026 - Updated" and description "Updated full-stack curriculum"
  And I save the changes
  Then the list shows "Web Development 2026 - Updated"
  And the description shows "Updated full-stack curriculum"
```

**Expected result:**
- Old name no longer shown
- Updated values displayed

**Priority:** Medium

---

### TC-005 — List reflects deletion immediately

**Title:** Deleted program is removed from list without stale entries

**Preconditions:**
- User is logged in as admin
- Program **Test Program** exists in list

**Steps:**
1. Delete **Test Program** and confirm
2. Observe list

**Gherkin:**
```gherkin
Scenario: List reflects program deletion
  Given "Test Program" is shown in the program list
  When I delete "Test Program" and confirm
  Then "Test Program" is no longer shown in the list
```

**Expected result:**
- Entry removed immediately
- List count updated

**Priority:** Medium

---

### TC-006 — Programs with empty description display appropriately

**Title:** Program without description shows sensible empty state in list

**Preconditions:**
- User is logged in as admin
- Program **UX Design Certificate** exists with empty Description

**Steps:**
1. Navigate to Programs page
2. Locate **UX Design Certificate**

**Gherkin:**
```gherkin
Scenario: Empty description display in list
  Given a program "UX Design Certificate" exists with no description
  When I navigate to the Programs page
  Then I see "UX Design Certificate" in the list
  And the description area shows empty state or em dash per design
```

**Expected result:**
- Name always visible
- Empty description handled gracefully (blank, "—", or "No description")

**Priority:** Medium

---

## Negative Flows

### TC-007 — List does not show programs user is unauthorized to view

**Title:** Restricted programs are hidden from unauthorized users

**Preconditions:**
- User is logged in with limited role
- Programs exist that user should not access

**Steps:**
1. Navigate to Programs page
2. Compare visible programs to authorized set

**Gherkin:**
```gherkin
Scenario: Unauthorized programs hidden from list
  Given I am logged in as a user with limited program access
  When I navigate to the Programs page
  Then I only see programs I am authorized to view
  And I do not see restricted program names or descriptions
```

**Expected result:**
- No unauthorized data leakage in list
- Appropriate empty or partial list state

**Priority:** High

---

### TC-008 — API failure shows error state instead of empty list

**Title:** Failed program fetch displays error, not misleading empty state

**Preconditions:**
- User is logged in as admin
- Programs exist but list API fails

**Steps:**
1. Navigate to Programs page with simulated API failure
2. Observe UI

**Gherkin:**
```gherkin
Scenario: List load failure shows error
  Given programs exist in the system
  When the program list fails to load
  Then I see an error message
  And I do not see the empty state message for no programs
```

**Expected result:**
- Clear error with retry option
- Empty state not shown incorrectly

**Priority:** High

---

### TC-009 — Partial data does not break list rendering

**Title:** Program missing description field still renders name in list

**Preconditions:**
- User is logged in as admin
- Program record exists with null/missing description in API response

**Steps:**
1. Navigate to Programs page
2. Locate affected program row

**Gherkin:**
```gherkin
Scenario: Missing description does not break list row
  Given a program exists with a name but missing description data
  When I navigate to the Programs page
  Then the program name is still displayed
  And the list row renders without error
```

**Expected result:**
- Row renders with fallback for missing description
- No console errors or broken layout

**Priority:** Medium

---

### TC-010 — XSS in stored description is not executed in list

**Title:** Malicious description content displays safely in list

**Preconditions:**
- User is logged in as admin
- Program exists with Description `<script>alert('xss')</script>`

**Steps:**
1. Navigate to Programs page
2. View program row with malicious description

**Gherkin:**
```gherkin
Scenario: XSS in description not executed in list
  Given a program exists with description "<script>alert('xss')</script>"
  When I navigate to the Programs page
  Then the description is displayed safely
  And no script is executed
```

**Expected result:**
- Escaped/sanitized display
- No alert or script injection

**Priority:** High

---

## Edge Cases

### TC-011 — Long program name displays with truncation or wrap

**Title:** Very long program name does not break list layout

**Preconditions:**
- User is logged in as admin
- Program with 255-character name exists

**Steps:**
1. Navigate to Programs page
2. Inspect long-name program row

**Gherkin:**
```gherkin
Scenario: Long program name display
  Given a program with a 255-character name exists
  When I navigate to the Programs page
  Then the program name is displayed with truncation or wrapping per design
  And the list layout remains intact
```

**Expected result:**
- Full name available via tooltip/expand if truncated
- No horizontal overflow breaking page

**Priority:** Medium

---

### TC-012 — Long description displays with truncation or expand

**Title:** Very long description is handled in list view

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** has 2000-character description

**Steps:**
1. Navigate to Programs page
2. Inspect description display

**Gherkin:**
```gherkin
Scenario: Long description display
  Given a program "Web Development 2026" has a 2000-character description
  When I navigate to the Programs page
  Then the description is truncated or expandable per design
  And the list remains readable
```

**Expected result:**
- Truncation with "Read more" or ellipsis per UX spec
- Full text accessible elsewhere if needed

**Priority:** Medium

---

### TC-013 — Special characters in name and description render correctly

**Title:** List displays special and unicode characters without corruption

**Preconditions:**
- User is logged in as admin
- Program **Informatique & IA - Niveau 2** with Description **Cours & ateliers — niveau avancé** exists

**Steps:**
1. Navigate to Programs page
2. Verify display of name and description

**Gherkin:**
```gherkin
Scenario: Special characters in list display
  Given a program "Informatique & IA - Niveau 2" with description "Cours & ateliers — niveau avancé" exists
  When I navigate to the Programs page
  Then the name and description display exactly as stored
```

**Expected result:**
- `&`, `—`, accents render correctly
- No HTML entity leakage or mojibake

**Priority:** Medium

---

### TC-014 — Large number of programs renders performantly

**Title:** List remains usable with many programs (e.g., 100+)

**Preconditions:**
- User is logged in as admin
- 100+ programs exist

**Steps:**
1. Navigate to Programs page
2. Scroll through list
3. Measure load time and responsiveness

**Gherkin:**
```gherkin
Scenario: Large program list performance
  Given 100 or more programs exist
  When I navigate to the Programs page
  Then all programs load within acceptable time
  And scrolling or pagination works smoothly
```

**Expected result:**
- Acceptable load time (define SLA, e.g., < 3s)
- Pagination or virtual scroll if implemented

**Priority:** Medium

---

### TC-015 — Single program list displays correctly

**Title:** List with exactly one program shows full details without empty state

**Preconditions:**
- User is logged in as admin
- Exactly one program **Web Development 2026** exists

**Steps:**
1. Navigate to Programs page

**Gherkin:**
```gherkin
Scenario: Single program in list
  Given only program "Web Development 2026" exists
  When I navigate to the Programs page
  Then I see one program in the list
  And I do not see the empty state message
  And the program shows name and description
```

**Expected result:**
- Normal list view, not empty state
- Create/add actions still available if designed

**Priority:** Medium

---

### TC-016 — Emoji in program name and description display correctly

**Title:** Emoji characters render in list without replacement boxes

**Preconditions:**
- User is logged in as admin
- Program **Programme Français 🎓 2026** with Description **Cours pour étudiants 🌍** exists

**Steps:**
1. Navigate to Programs page
2. Verify emoji rendering

**Gherkin:**
```gherkin
Scenario: Emoji in list display
  Given a program "Programme Français 🎓 2026" with description "Cours pour étudiants 🌍" exists
  When I navigate to the Programs page
  Then emoji render correctly in name and description
```

**Expected result:**
- Emoji visible in supported browsers/fonts

**Priority:** Low

---

### TC-017 — List sort order is consistent

**Title:** Programs appear in defined sort order (e.g., alphabetical or newest first)

**Preconditions:**
- User is logged in as admin
- Multiple programs exist with known creation order/names

**Steps:**
1. Navigate to Programs page
2. Record order of program names
3. Refresh page and compare

**Gherkin:**
```gherkin
Scenario: Consistent list sort order
  Given multiple programs exist
  When I navigate to the Programs page
  Then programs appear in a consistent defined order
  And the order is the same after page refresh
```

**Expected result:**
- Documented sort rule applied (A–Z, created date, etc.)
- Stable order across sessions

**Priority:** Medium

---

### TC-018 — Empty state CTA navigates to create flow

**Title:** Create-first-program prompt opens program creation form

**Preconditions:**
- User is logged in as admin
- No programs exist

**Steps:**
1. Navigate to Programs page
2. Click create prompt / **+ New Program** from empty state

**Gherkin:**
```gherkin
Scenario: Empty state create prompt works
  Given no programs exist
  When I navigate to the Programs page
  And I click the prompt to create the first program
  Then the program creation form opens
```

**Expected result:**
- Empty state CTA functional
- User can create first program from empty state

**Priority:** High

---

### TC-019 — List filtering by search (if feature exists)

**Title:** Search/filter narrows visible programs by name or description

**Preconditions:**
- User is logged in as admin
- Programs **Web Development 2026**, **Data Science Fundamentals**, **Web Design Basics** exist
- Search/filter UI exists

**Steps:**
1. Navigate to Programs page
2. Enter **Web** in search/filter field

**Gherkin:**
```gherkin
Scenario: Filter programs by search term
  Given programs "Web Development 2026", "Data Science Fundamentals", and "Web Design Basics" exist
  When I navigate to the Programs page
  And I filter by "Web"
  Then I see "Web Development 2026" and "Web Design Basics"
  And I do not see "Data Science Fundamentals"
```

**Expected result:**
- Filter matches name (and description if spec says so)
- Clear filter restores full list

**Priority:** Medium

---

## Acceptance Criteria Coverage Matrix

| AC Scenario | Covered by |
|---|---|
| Display program list with key details | TC-001, TC-003, TC-004, TC-006 |
| Empty state when no programs exist | TC-002, TC-015, TC-018 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **"Filtering" in feature title** but ACs only cover display and empty state — no search, sort, or filter criteria defined (TC-019).

2. **List layout** not specified — table vs cards, columns beyond name/description, actions column (edit/delete icons).

3. **Sort order** not defined (TC-017).

4. **Pagination vs infinite scroll** for large lists not mentioned (TC-014).

5. **Description display rules** for empty, null, or very long text not specified (TC-006, TC-012).

6. **Empty state exact copy and CTA** not defined — message text and button label unknown (TC-002, TC-018).

7. **Role-based visibility** not in ACs — who can see the list and which programs (TC-007).

8. **Loading state** while fetching programs not specified.

9. **Refresh behavior** — manual refresh, auto-refresh on tab focus not defined.

10. **Additional metadata** (created date, status, course count) not mentioned — scope of "key details" unclear.

11. **Responsive/mobile layout** for list not addressed.

12. **Accessibility** — screen reader announcements for list and empty state not specified.

13. **Internationalization** of empty state message and list labels not covered.

14. **Interaction** — whether rows are clickable to detail view not stated.
