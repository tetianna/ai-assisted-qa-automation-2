Feature: Edit existing program details
  DS-2 — Admin edits program Name, Description, and related fields after creation

  # Happy paths

  @TC-001 @AC-OpenProgramForEditing
  Scenario: Edit form opens pre-populated with current program data
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    When I click the edit icon on "Web Development 2026"
    Then I see the edit form pre-populated with the program's current data
    And the Name field shows "Web Development 2026"
    And the Description field shows "Full-stack web development program"
    And Save and Cancel actions are visible

  @TC-002 @AC-SuccessfullyEditProgramName
  Scenario: Updated program name is reflected immediately in the list
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Updated"
    And the program list does not show "Web Development 2026"

  @TC-003 @AC-EditPreservesUnchangedFields
  Scenario: Unchanged fields remain intact when only Description is edited
    Given I am logged in as admin
    And I am editing "Data Science Fundamentals" with Description "Introductory data science course"
    When I only change the Description to "Advanced data science and machine learning track"
    And I click Save
    Then the modal closes
    And the Name remains "Data Science Fundamentals"
    And the program list immediately shows "Data Science Fundamentals" with the updated description

  @TC-004
  Scenario: Both Name and Description can be updated in a single save
    Given I am logged in as admin
    And I am editing "Cybersecurity Bootcamp" with Description "Original"
    When I change the Name to "Cybersecurity Bootcamp 2026"
    And I change the Description to "Hands-on security operations and incident response"
    And I click Save
    Then the modal closes
    And the program list shows "Cybersecurity Bootcamp 2026"
    And the program list shows description "Hands-on security operations and incident response"

  @TC-005
  Scenario: Cancel discards unsaved edits
    Given I am logged in as admin
    And I am editing "Mobile App Development" with Description "Original description"
    When I change the Name to "Mobile App Development - Draft"
    And I click Cancel
    Then the modal closes
    And the program list shows "Mobile App Development"
    And the program list does not show "Mobile App Development - Draft"

  @TC-006
  Scenario: Save button enables when valid changes are made
    Given I am logged in as admin
    And I am editing "UX Design Certificate" with Description "Original"
    When I change the Description to "User research and prototyping fundamentals"
    Then the Save button is enabled
    When I click Save
    Then the modal closes
    And the program list shows description "User research and prototyping fundamentals"

  @TC-024
  Scenario: Close button discards unsaved edits
    Given I am logged in as admin
    And I am editing "Mobile App Development" with Description "Original description"
    When I change the Name to "Mobile App Development - Draft"
    And I click the close button on the edit modal
    Then the modal closes
    And the program list shows "Mobile App Development"
    And the program list does not show "Mobile App Development - Draft"

  @TC-025
  Scenario: Escape key discards unsaved edits
    Given I am logged in as admin
    And I am editing "Mobile App Development" with Description "Original description"
    When I change the Name to "Mobile App Development - Draft"
    And I press Escape
    Then the modal closes
    And the program list shows "Mobile App Development"
    And the program list does not show "Mobile App Development - Draft"

  # Negative

  @TC-007
  Scenario: Empty Name prevents save on edit
    Given I am logged in as admin
    And I am editing "Cloud Computing 2026" with Description "Description"
    When I clear the Name field
    Then the Save button is disabled or validation prevents save
    And the program list still shows "Cloud Computing 2026"

  @TC-008
  Scenario: Duplicate name on edit is rejected
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am editing "AI Fundamentals"
    When I change the Name to "Web Development 2026"
    And I click Save
    Then the modal remains open
    And a validation error indicates the program name already exists
    And the program list shows exactly one "Web Development 2026" entry
    And the program list still shows "AI Fundamentals"

  @TC-009
  Scenario: Server error during save does not corrupt program data
    Given I am logged in as admin
    And I am editing "DevOps Engineering 2026" with Description "Original DevOps curriculum"
    When I change the Description to "Updated DevOps curriculum"
    And the save request fails due to a server error
    Then the modal remains open or shows an error state
    And a user-friendly error message is displayed
    And the program list still shows "DevOps Engineering 2026" with description "Original DevOps curriculum"

  @TC-010
  Scenario: Non-admin user cannot edit programs
    Given I am logged in as a non-admin user
    And I am on the Programs page
    And a program "Web Development 2026" exists
    Then I do not see an edit control for "Web Development 2026"
    And I cannot open the edit form for "Web Development 2026"

  @TC-011
  Scenario: Saving with no changes does not corrupt program data
    Given I am logged in as admin
    And I am editing "Secure Coding 2026" with Description "Secure coding basics"
    When I click Save without making any changes
    Then the modal closes
    And the program list shows exactly one "Secure Coding 2026" entry
    And the program list shows description "Secure coding basics"

  @TC-026
  Scenario: XSS payload in edited Description is not executed in the program list
    Given I am logged in as admin
    And I am editing "Secure Coding 2026" with Description "Original safe description"
    When I change the Description to "<script>alert('xss')</script>"
    And I click Save
    Then the modal closes
    And the program list shows "Secure Coding 2026"
    And no script alert is executed
    And the description is displayed as plain text or safely escaped

  @TC-022
  Scenario: Whitespace-only Name on edit is rejected
    Given I am logged in as admin
    And I am editing "Whitespace Edit"
    When I change the Name to "   "
    Then the Save button is disabled or validation prevents save
    And the program list still shows "Whitespace Edit"

  # Edge cases

  @TC-012
  Scenario: Name at maximum length can be saved on edit
    Given I am logged in as admin
    And I am editing a program with a short name
    When I change the Name to a 255-character string
    And I click Save
    Then the modal closes
    And the program list shows the 255-character name

  @TC-013
  Scenario: Name exceeding max length is rejected on edit
    Given I am logged in as admin
    And I am editing "Boundary Test Program"
    When I change the Name to a 256-character string
    Then the Save button is disabled or validation prevents save
    And the program list still shows "Boundary Test Program"

  @TC-014
  Scenario: Special characters in edited Name are preserved
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I change the Name to "Informatique & IA - Niveau 2 (2026)"
    And I click Save
    Then the modal closes
    And the program list shows "Informatique & IA - Niveau 2 (2026)"

  @TC-015
  Scenario: Leading and trailing whitespace is trimmed on save
    Given I am logged in as admin
    And I am editing "TrimTest"
    When I change the Name to "  Trimmed Name  "
    And I click Save
    Then the modal closes
    And the program list shows "Trimmed Name"
    And the program list does not show "  Trimmed Name  "

  @TC-016
  Scenario: Unicode and emoji in edited fields are preserved
    Given I am logged in as admin
    And I am editing "French Program"
    When I change the Name to "Programme Français 🎓 2026"
    And I change the Description to "Cours pour étudiants internationaux"
    And I click Save
    Then the modal closes
    And the program list shows "Programme Français 🎓 2026"
    And the program list shows description "Cours pour étudiants internationaux"

  @TC-017
  Scenario: Description cleared to empty is handled per product rules
    Given I am logged in as admin
    And I am editing "Web Development 2026" with Description "Has description"
    When I clear the Description field
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026"
    And the Description field is empty when the edit form is reopened

  @TC-018
  Scenario: Rapid double-click on Save does not cause duplicate updates
    Given I am logged in as admin
    And I am editing "Web Development 2026" with Description "Original"
    When I change the Name to "Web Development 2026 - Final"
    And I double-click the Save button
    Then the modal closes
    And the program list shows exactly one "Web Development 2026 - Final" entry

  @TC-019
  Scenario: Editing program to same name as itself succeeds
    Given I am logged in as admin
    And I am editing "Web Development 2026" with Description "Description"
    When I only change the Description to "Updated full-stack curriculum"
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026"
    And no duplicate-name error is shown

  @TC-027
  Scenario: Description at maximum allowed length is accepted on edit
    Given I am logged in as admin
    And I am editing "UX Design Certificate" with Description "Short description"
    When I change the Description to a 2000-character string
    And I click Save
    Then the modal closes
    And the program list shows the full 2000-character description

  @TC-028
  Scenario: Single-character Name is accepted on edit
    Given I am logged in as admin
    And I am editing "Rename Source"
    When I change the Name to "X"
    And I click Save
    Then the modal closes
    And the program list shows "X"

  @TC-020
  Scenario: Case-only duplicate name on edit is rejected
    Given I am logged in as admin
    And a program "CaseDuplicate" already exists
    And I am editing "CaseDuplicate Target"
    When I change the Name to "caseduplicate"
    And I click Save
    Then the modal remains open
    And validation prevents the rename
    And the program list still shows "CaseDuplicate Target"

  @TC-021
  Scenario: Renamed program appears in list without page refresh
    Given I am logged in as admin
    And I am editing "NoRefresh Rename" with Description "Refresh probe"
    When I change the Name to "NoRefresh Rename - Live"
    And I click Save
    Then the modal closes
    And the program list immediately shows "NoRefresh Rename - Live"
    And I remain on the Programs page without manually refreshing

  @TC-023
  Scenario: Saving 255-character name on edit completes without hanging
    Given I am logged in as admin
    And I am editing "MaxLen Hang"
    When I change the Name to a 255-character string
    And I click Save
    Then the modal closes within a reasonable timeout
    And the program list shows the 255-character name

  @TC-029
  Scenario: Success feedback shown after save when product displays it
    Given I am logged in as admin
    And I am editing "Success Feedback"
    When I change the Name to "Success Feedback - Saved"
    And I click Save
    Then the modal closes
    And the program list shows "Success Feedback - Saved"
    And a success toast or message is displayed when the product supports it

  # Ambiguities and gaps
  # - AC says "edit icon"; live UI may expose an accessible "Edit <ProgramName>" button instead.
  # - Field naming: AC uses "Name" in edit vs "Program Name" in create flows — confirm single label.
  # - Required vs optional Description on edit not specified (TC-017).
  # - Maximum field lengths not defined (assumed 255 for Name, 2000 for Description).
  # - Duplicate name rules on edit not in ACs — case sensitivity and self-rename behavior unclear.
  # - Role-based access not mentioned in ACs — only implied admin context (TC-010).
  # - Cancel vs close (X) vs Escape dismiss behaviors not defined in ACs.
  # - Optimistic vs pessimistic UI update on slow network not specified (TC-009, TC-021).
  # - Concurrent edits by two admins on the same program not covered.
  # - AI configuration fields in edit form not in ACs — pre-population and preservation rules undefined.
  # - Success feedback (toast) after save not defined in ACs (TC-029).
  # - Double-submit on Save not in ACs — confirm Save is disabled during submission (TC-018).
