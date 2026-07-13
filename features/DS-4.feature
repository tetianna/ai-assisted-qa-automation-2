Feature: Delete program with confirmation
  DS-4 — Admin deletes programs with a confirmation step to prevent accidents

  # Happy paths

  @TC-001 @AC-DeleteWithConfirmation
  Scenario: Confirmed deletion removes program from list
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    When I confirm deletion
    Then "Test Program" is removed from the program list

  @TC-002 @AC-CancelDeletion
  Scenario: Cancelled deletion keeps program in list
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists
    When I click the delete icon for "Web Development 2026"
    And I see the confirmation dialog
    And I click Cancel
    Then the program still exists in the list
    And the program list shows "Web Development 2026"

  @TC-003
  Scenario: Confirmation dialog displays program identifier
    Given I am logged in as admin
    And a program "Data Science Fundamentals" exists
    When I click the delete icon for "Data Science Fundamentals"
    Then I see a confirmation dialog
    And the dialog mentions "Data Science Fundamentals"
    And the dialog text indicates deletion or removal

  @TC-004
  Scenario: List updates immediately after successful deletion
    Given I am logged in as admin
    And a program "Cybersecurity Bootcamp" exists
    When I click the delete icon for "Cybersecurity Bootcamp"
    And I confirm deletion
    Then "Cybersecurity Bootcamp" is removed from the program list immediately
    And I remain on the Programs page without manually refreshing

  @TC-005
  Scenario: Success feedback shown after deletion
    Given I am logged in as admin
    And a program "Mobile App Development" exists
    When I click the delete icon for "Mobile App Development"
    And I confirm deletion
    Then "Mobile App Development" is removed from the program list
    And a success toast or message is displayed when the product supports it

  # Negative

  @TC-006
  Scenario: Delete icon click alone does not remove program
    Given I am logged in as admin
    And a program "UX Design Certificate" exists
    When I click the delete icon for "UX Design Certificate"
    And I dismiss the confirmation dialog without confirming
    Then the program list still shows "UX Design Certificate"

  @TC-007
  Scenario: Non-admin user cannot delete programs
    Given I am logged in as a non-admin user
    And I am on the Programs page
    And a program "Web Development 2026" exists
    Then I do not see a delete control for "Web Development 2026"
    And I cannot delete "Web Development 2026"

  @TC-008
  Scenario: Server error during delete leaves program intact
    Given I am logged in as admin
    And a program "Cloud Computing 2026" exists
    When I click the delete icon for "Cloud Computing 2026"
    And I confirm deletion
    And the delete request fails due to a server error
    Then the program list still shows "Cloud Computing 2026"
    And a user-friendly error message is displayed

  @TC-009
  Scenario: Deleting already-deleted program shows appropriate error
    Given I am logged in as admin
    And a program "DevOps Engineering 2026" was just deleted
    When I attempt to delete "DevOps Engineering 2026" again
    Then the program list does not show "DevOps Engineering 2026"
    And an appropriate not-found or already-deleted error is shown if applicable

  @TC-010
  Scenario: Program with linked courses or enrollments cannot be deleted
    Given I am logged in as admin
    And a program with linked courses or enrollments exists
    When I click the delete icon for that program
    And I confirm deletion
    Then deletion is blocked with a clear dependency error
    And the program remains in the list

  # Edge cases

  @TC-011
  Scenario: Delete program with long name displays correctly in dialog
    Given I am logged in as admin
    And a program with a 255-character name exists
    When I click the delete icon for that program
    Then I see a confirmation dialog
    And the dialog displays the full program name or a readable truncation

  @TC-012
  Scenario: Delete program with special characters in name
    Given I am logged in as admin
    And a program "AI & ML: Phase-1 (2026)" exists
    When I click the delete icon for "AI & ML: Phase-1 (2026)"
    Then I see a confirmation dialog mentioning "AI & ML: Phase-1 (2026)"

  @TC-013
  Scenario: Escape key dismisses confirmation without deleting
    Given I am logged in as admin
    And a program "Escape Delete Test" exists
    When I click the delete icon for "Escape Delete Test"
    And I press Escape on the confirmation dialog
    Then the program list still shows "Escape Delete Test"

  @TC-014
  Scenario: Double-click confirm does not cause errors
    Given I am logged in as admin
    And a program "Double Confirm Delete" exists
    When I click the delete icon for "Double Confirm Delete"
    And I double-click confirm on the deletion dialog
    Then "Double Confirm Delete" is removed from the program list exactly once
    And no error state is shown

  @TC-015
  Scenario: Delete last remaining program transitions to empty state
    Given I am logged in as admin
    And only one program "Last Program Probe" exists
    When I click the delete icon for "Last Program Probe"
    And I confirm deletion
    Then the program list does not show "Last Program Probe"
    And I see a message indicating no programs have been created
    And I see a prompt to create the first program

  @TC-016
  Scenario: Click outside dialog cancels deletion
    Given I am logged in as admin
    And a program "Outside Click Delete" exists
    When I click the delete icon for "Outside Click Delete"
    And I click outside the confirmation dialog
    Then the program list still shows "Outside Click Delete"

  # Ambiguities and gaps
  # - AC says "delete icon"; live UI may expose an accessible "Delete <ProgramName>" button.
  # - Confirmation dialog copy and button labels not specified.
  # - Role-based access not mentioned in ACs (TC-007).
  # - Behavior when program has dependencies not in ACs (TC-010).
  # - Undo after delete not defined.
  # - Success feedback after deletion not in ACs (TC-005).
  # - Escape vs Cancel vs click-outside dismiss behaviors not defined in ACs.
  # - Soft delete vs hard delete not specified.
