# Test Plan: TodoMVC (Playwright Demo)

**Feature:** Todo list — add, complete, and delete items  
**Application:** [React • TodoMVC](https://demo.playwright.dev/todomvc/#/)  
**Author:** QA Engineering  
**Date:** 2026-06-25  
**Scope:** Core todo CRUD actions on the main list view (add, mark complete, delete)

---

## Positive Flows

### TC-001 — Single todo appears in the list after submission

**Title:** Valid todo text is added to the list when the user submits the new-todo field

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty (no items under `.todo-list`)
- The **What needs to be done?** input is visible and focused

**Steps:**
1. Click into the **What needs to be done?** input field
2. Type `Buy groceries`
3. Press **Enter**

**Expected result:**
- A new row appears in the todo list with label text **Buy groceries**
- The row includes an unchecked completion toggle (checkbox)
- The footer shows **1 item left** (or equivalent singular counter)
- The **What needs to be done?** input is cleared and ready for another entry

---

### TC-002 — Multiple todos are retained in creation order

**Title:** Each submitted todo is appended to the list without removing prior entries

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Enter `Buy groceries` in **What needs to be done?** and press **Enter**
2. Enter `Walk the dog` and press **Enter**
3. Enter `Pay electricity bill` and press **Enter**

**Expected result:**
- The list contains three items in order: **Buy groceries**, **Walk the dog**, **Pay electricity bill**
- All three completion toggles are unchecked
- The footer shows **3 items left**

---

### TC-003 — Todo is marked completed when the user toggles its checkbox

**Title:** Completed todo displays struck-through styling and updates the active-item count

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- Todo list contains exactly one item: **Buy groceries** (unchecked)

**Steps:**
1. Click the completion toggle (checkbox) to the left of **Buy groceries**
2. Observe the item styling and footer counter

**Expected result:**
- **Buy groceries** is shown as completed (strikethrough / `completed` styling)
- The completion toggle for that row is checked
- The footer shows **0 items left**
- The item remains in the list (not removed)

---

### TC-004 — Completed todo returns to active state when toggled again

**Title:** Unchecking a completed todo restores active styling and increments the items-left count

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- Todo **Buy groceries** exists and is marked completed

**Steps:**
1. Click the completion toggle for **Buy groceries** again
2. Observe styling and footer counter

**Expected result:**
- **Buy groceries** no longer has completed/strikethrough styling
- The completion toggle is unchecked
- The footer shows **1 item left**

---

### TC-005 — Todo is removed from the list when the user deletes it

**Title:** Destroy control removes only the targeted todo from the list

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- Todo list contains:
  - **Buy groceries** (active)
  - **Walk the dog** (active)

**Steps:**
1. Hover over the row for **Buy groceries** until the **×** (destroy) control is visible
2. Click the **×** destroy control for **Buy groceries**
3. Review the remaining list and footer

**Expected result:**
- **Buy groceries** is no longer in the list
- **Walk the dog** remains visible and unchanged
- The footer shows **1 item left**
- No empty or broken list rows remain

---

### TC-006 — User can add, complete, and delete the same todo in one session

**Title:** Full lifecycle of one todo (create → complete → delete) succeeds without errors

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Add `Schedule dentist appointment` via **What needs to be done?** and **Enter**
2. Mark **Schedule dentist appointment** complete via its checkbox
3. Hover the row and click **×** to delete it

**Expected result:**
- After step 1: item appears active; counter shows **1 item left**
- After step 2: item shows completed styling; counter shows **0 items left**
- After step 3: list is empty; main section shows only **What needs to be done?** (no `.todo-list` or footer counter for items)

---

## Negative Flows

### TC-007 — Empty submission does not create a todo

**Title:** Pressing Enter with no text leaves the list unchanged

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Click **What needs to be done?**
2. Press **Enter** without typing any characters

**Expected result:**
- No new todo row is added
- No `.todo-list` appears (or list remains empty)
- No footer item counter is shown
- The app does not show an error state or crash

---

### TC-008 — Whitespace-only input does not create a todo

**Title:** Spaces or tabs alone are rejected and do not produce a list entry

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Enter three spaces `   ` in **What needs to be done?**
2. Press **Enter**
3. Enter a tab character (if keyboard allows) and press **Enter**

**Expected result:**
- No todo is added for whitespace-only submissions
- List remains empty
- Input field is cleared or ready for valid input without side effects

---

### TC-009 — Deleting one item does not remove sibling todos

**Title:** Destroy action affects only the selected row

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- Todo list contains **Buy groceries**, **Walk the dog**, and **Pay electricity bill** (all active)

**Steps:**
1. Delete **Walk the dog** using its **×** control
2. Verify the other two items

**Expected result:**
- **Walk the dog** is removed
- **Buy groceries** and **Pay electricity bill** remain, unchanged and active
- Footer shows **2 items left**
- **Walk the dog** does not reappear after delete

---

### TC-010 — Completing a todo does not delete it from the list

**Title:** Marking complete must not remove the item unless explicitly deleted

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- Todo **Buy groceries** exists and is active

**Steps:**
1. Click the completion toggle for **Buy groceries**
2. Confirm the item text is still visible in the list

**Expected result:**
- **Buy groceries** remains in the DOM/list with completed styling
- Item is not auto-deleted
- **×** destroy control is still available on hover (unless product explicitly hides it for completed items — observe actual behavior)

---

### TC-011 — Invalid keyboard submit without focus does not add phantom todos

**Title:** Enter key pressed outside the new-todo field does not create items

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty
- Focus is on the page body (not in **What needs to be done?**)

**Steps:**
1. Click a neutral area of the page header (e.g., **todos** title) to ensure input is not focused
2. Press **Enter**

**Expected result:**
- No todo is added
- List remains empty

---

## Edge Cases

### TC-012 — Todo text containing special characters is stored and displayed correctly

**Title:** Symbols and punctuation in todo text render without corruption

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Enter `Pay rent: $1,250.00 (due 6/30!)` in **What needs to be done?**
2. Press **Enter**

**Expected result:**
- List shows exactly: **Pay rent: $1,250.00 (due 6/30!)**
- Characters `:`, `$`, `,`, `.`, `(`, `)`, `!` display correctly
- Item can be completed and deleted normally

---

### TC-013 — Duplicate todo titles are allowed as separate list entries

**Title:** Two todos with identical text coexist as independent rows

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Add `Buy groceries` and press **Enter**
2. Add `Buy groceries` again and press **Enter**
3. Complete the first **Buy groceries** only
4. Delete the second **Buy groceries**

**Expected result:**
- After step 2: two separate rows both labeled **Buy groceries**; footer shows **2 items left**
- After step 3: first row completed, second remains active; footer shows **1 item left**
- After step 4: one completed **Buy groceries** remains until manually changed or cleared

---

### TC-014 — Very long todo text is accepted and fully visible or ellipsized consistently

**Title:** Long input (500+ characters) does not break layout or truncate silently without display

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Paste a 500-character string starting with `Plan quarterly roadmap:` followed by repeated ` milestone review session.`
2. Press **Enter**
3. Complete and delete the long item

**Expected result:**
- Item is added without JavaScript error or blank row
- Full text is stored (verify by double-click edit if supported, or inspect label text)
- Complete and delete actions work on the long-text row
- Page layout does not overlap footer or break responsiveness

---

### TC-015 — Single-character todo is valid

**Title:** Minimum-length meaningful input of one character creates a list item

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Enter `A` in **What needs to be done?**
2. Press **Enter**

**Expected result:**
- List contains one row labeled **A**
- Footer shows **1 item left**
- Item supports complete and delete

---

### TC-016 — Unicode and emoji characters display correctly in todo labels

**Title:** Non-ASCII text (e.g., Japanese and emoji) is preserved in the list

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Enter `買い物 🛒 milk & パン` in **What needs to be done?**
2. Press **Enter**
3. Mark the item complete, then delete it

**Expected result:**
- Label renders as **買い物 🛒 milk & パン** without mojibake or missing glyphs
- Complete and delete behave the same as ASCII todos

---

### TC-017 — Leading and trailing whitespace handling is consistent

**Title:** Trim behavior for padded input is predictable (trimmed or preserved — document actual behavior)

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Enter `  Trim me  ` (leading and trailing spaces) and press **Enter**
2. Observe displayed label text

**Expected result:**
- Either the displayed text is **Trim me** (trimmed) or **  Trim me  ** (preserved) — record actual behavior for regression baseline
- A valid non-empty todo is created (not rejected as whitespace-only)
- Complete and delete work on the stored label

---

### TC-018 — HTML-like input is shown as plain text, not executed

**Title:** Script or markup in todo text is escaped and displayed literally

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Enter `<script>alert('xss')</script>` in **What needs to be done?**
2. Press **Enter**
3. Enter `<b>Bold todo</b>` and press **Enter**

**Expected result:**
- No alert dialog or script execution occurs
- List shows literal text `<script>alert('xss')</script>` and `<b>Bold todo</b>` (not rendered as HTML bold)
- App remains stable

---

### TC-019 — Rapid sequential adds create distinct items without loss

**Title:** Fast entry of multiple todos does not drop or merge entries

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- The todo list is empty

**Steps:**
1. Quickly add five todos in succession: `Task 1`, `Task 2`, `Task 3`, `Task 4`, `Task 5` (Enter after each)
2. Count list rows and footer

**Expected result:**
- Exactly five items appear in order **Task 1** through **Task 5**
- Footer shows **5 items left**
- No duplicate omission or UI freeze

---

### TC-020 — Delete last remaining todo returns app to initial empty state

**Title:** Removing the final item clears list chrome appropriate for zero todos

**Preconditions:**
- Browser is open at `https://demo.playwright.dev/todomvc/#/`
- Single active todo **Buy groceries** exists

**Steps:**
1. Delete **Buy groceries** via **×**
2. Observe main content area

**Expected result:**
- No todos remain in `.todo-list`
- Footer filters (**All** / **Active** / **Completed**) and item counter are hidden or not shown for empty state (per TodoMVC spec)
- **What needs to be done?** remains available for new input

---

## Acceptance Criteria Coverage Matrix

| Acceptance Criterion | Covered by |
|---|---|
| User can add a todo item to the list | TC-001, TC-002, TC-006 |
| User can complete an item | TC-003, TC-004, TC-006, TC-010 |
| User can delete item from the list | TC-005, TC-006, TC-009, TC-020 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Whitespace-only input** — ACs do not define whether spaces/tabs should be rejected, trimmed, or saved. TC-007 and TC-008 assume rejection; TC-017 documents trim behavior for padded valid text — confirm with product/spec.

2. **Leading/trailing whitespace on valid text** — No rule for trimming **Buy groceries** vs **  Buy groceries  **. TC-017 captures actual behavior but ACs are silent.

3. **Duplicate todos** — ACs neither allow nor forbid identical labels. TC-013 assumes duplicates are permitted (standard TodoMVC behavior); confirm if deduplication is ever required.

4. **Maximum todo length** — No limit stated. TC-014 uses 500 characters as a stress case; actual max (if any) should come from implementation or UX guidelines.

5. **Minimum todo length** — ACs require “add a todo” but not minimum characters. TC-015 assumes single-character todos are valid.

6. **Complete vs delete semantics** — ACs treat completion and deletion separately. TC-010 clarifies that complete should not remove items; **Clear completed** bulk action and filter views are out of AC scope but exist in TodoMVC.

7. **Edit todo (double-click)** — Not in ACs. The demo supports inline edit on double-click; edit flow, empty edit save, and cancel (Escape) are untested by AC coverage.

8. **Filter tabs (All / Active / Completed)** — Not in ACs. Behavior when completing or deleting while a filter is active is undefined for this test plan scope.

9. **Toggle all complete** — Master checkbox behavior when list is empty, partial, or all complete is not specified in ACs.

10. **Persistence** — ACs do not state whether todos survive page refresh or navigation. Playwright demo may use in-memory state only; localStorage/session behavior should be confirmed if persistence is a requirement.

11. **Accessibility** — Keyboard-only completion/delete, screen reader labels for **×** and checkboxes, and focus order are not mentioned in ACs.

12. **Error messaging** — No AC defines user-visible feedback for invalid input (empty submit); TC-007 expects silent no-op rather than an error banner.

13. **Destroy control visibility** — ACs say “delete” but not whether delete requires hover, keyboard shortcut, or swipe. TC-005 assumes hover-revealed **×** per TodoMVC demo.

14. **Counter grammar** — Footer text for **1 item left** vs **2 items left** is implied but not spelled out in ACs; pluralization edge cases (0 items) should be verified against spec.
