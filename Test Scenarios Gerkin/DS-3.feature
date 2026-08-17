Feature: Program name validation and duplicate prevention
  DS-3 — System rejects invalid or duplicate program names on create and edit

  # Happy paths

  @TC-001 @AC-AcceptSpecialCharacters
  Scenario: Valid program name with special characters is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill in Description with "Programme bilingue en informatique et intelligence artificielle"
    And I click Create
    Then the modal closes
    And the program list shows "Informatique & IA - Niveau 2"

  @TC-002
  Scenario: Standard alphanumeric program name is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-003
  Scenario: Program name with hyphens and numbers is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "AI-101: Intro to Machine Learning (2026)"
    And I fill in Description with "ML fundamentals"
    And I click Create
    Then the modal closes
    And the program list shows "AI-101: Intro to Machine Learning (2026)"

  # Negative

  @TC-004 @AC-RejectWhitespaceOnly
  Scenario: Whitespace-only program name is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I enter "   " as the program name
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the form is not submitted
    And the Create button is disabled or validation prevents submission
    And no program is created

  @TC-005
  Scenario: Empty program name is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I leave the Program Name field empty
    Then the Create button is disabled
    And no program is created

  @TC-006 @AC-RejectDuplicate
  Scenario: Duplicate program name is rejected on create
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Second attempt"
    And I click Create
    Then I see an error indicating the name already exists
    And the modal remains open
    And the program list contains only one "Web Development 2026" entry

  @TC-007
  Scenario: Case-insensitive duplicate name is rejected
    Given I am logged in as admin
    And a program "CaseSensitive Test" already exists
    And I am on the program creation form
    When I fill in Program Name with "casesensitive test"
    And I fill in Description with "Case variant"
    And I click Create
    Then the form is not submitted or an error indicates the name already exists
    And the program list contains only one entry for "CaseSensitive Test"

  @TC-008
  Scenario: Duplicate name after trim is rejected
    Given I am logged in as admin
    And a program "Trim Duplicate Test" already exists
    And I am on the program creation form
    When I fill in Program Name with "  Trim Duplicate Test  "
    And I click Create
    Then the modal remains open
    And the program list contains only one "Trim Duplicate Test" entry

  @TC-009
  Scenario: Program is not created when validation API fails
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "API Fail Test"
    And the create request fails due to a server error
    Then the program list does not show "API Fail Test"
    And a user-friendly error message is displayed

  # Edge cases

  @TC-010
  Scenario: Program name at maximum length passes validation
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with a 255-character string
    And I fill in Description with "Max length test"
    And I click Create
    Then the modal closes
    And the program list shows the 255-character program name

  @TC-011
  Scenario: Program name one character over max length is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with a 256-character string
    Then the Create button is disabled or validation prevents submission
    And no program is created

  @TC-012
  Scenario: Single-character program name passes validation
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Z"
    And I fill in Description with "Single char validation"
    And I click Create
    Then the modal closes
    And the program list shows "Z"

  @TC-013
  Scenario: Unicode and emoji in program name pass validation
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "日本語 🎌 Program"
    And I fill in Description with "Unicode validation"
    And I click Create
    Then the modal closes
    And the program list shows "日本語 🎌 Program"

  @TC-014
  Scenario: Disallowed special characters are rejected with clear message
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Invalid<>Name|"Test"
    And I fill in Description with "Special char test"
    And I click Create
    Then the program is not created or a validation error lists permitted characters

  @TC-015
  Scenario: Leading and trailing whitespace is trimmed before duplicate check
    Given I am logged in as admin
    And a program "Whitespace Dup" already exists
    And I am on the program creation form
    When I fill in Program Name with "  Whitespace Dup  "
    And I click Create
    Then the program list contains only one "Whitespace Dup" entry

  @TC-016
  Scenario: Tab and newline characters in name are handled
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Tab\tName Test"
    And I fill in Description with "Tab test"
    Then the Create button is disabled or validation prevents submission
    And no invalid program is created

  @TC-017
  Scenario: Duplicate prevention on edit when renaming
    Given I am logged in as admin
    And a program "Existing Program" already exists
    And I am editing "Rename Target"
    When I change the Name to "Existing Program"
    And I click Save
    Then the modal remains open
    And validation prevents the rename
    And the program list still shows "Rename Target"

  @TC-018
  Scenario: Concurrent duplicate create by two users results in at most one program
    Given two admin users are on the program creation form simultaneously
    When both enter "Concurrent Dup" as the program name
    And both click Create at the same time
    Then the program list contains at most one "Concurrent Dup" entry

  # Ambiguities and gaps
  # - Case sensitivity rule not specified in ACs (TC-007 assumes case-insensitive).
  # - Maximum name length not defined in ACs (assumed 255 characters).
  # - Allowed vs disallowed character set not fully defined (TC-014).
  # - Whether validation applies on edit as well as create not stated in ACs (TC-017).
  # - Trim behavior before empty/duplicate checks not defined.
  # - Error message text and placement not specified.
  # - Concurrent create race handling not in ACs (TC-018).
