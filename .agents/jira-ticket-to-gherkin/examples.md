# Example: DS-1 — Create New Academic Program

Derived from Jira ticket DS-1. The ticket supplied three acceptance-criteria
scenarios; this feature file adds negative and edge cases per the skill workflow.

```gherkin
Feature: Create new academic program
  DS-1 — Admin creates academic programs from the Programs page

  # Happy paths

  @TC-001 @AC-NavigateToForm
  Scenario: Admin sees program creation form with required fields
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the program creation form with fields: Program Name, Description

  @TC-002 @AC-SuccessfulCreate
  Scenario: Valid program name and description are saved and shown in the list
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-003 @AC-EmptyNameValidation
  Scenario: Empty Program Name prevents form submission
    Given I am on the program creation form
    When I leave the Program Name field empty
    Then the Create button is disabled

  @TC-004
  Scenario: Program is created when Description is left empty
    Given I am on the program creation form
    When I fill in Program Name with "Data Science Fundamentals"
    And I leave the Description field empty
    And I click Create
    Then the modal closes
    And the program list shows "Data Science Fundamentals"

  @TC-005
  Scenario: Cancel closes form without creating a program
    Given I am on the program creation form
    When I fill in Program Name with "Cybersecurity Bootcamp 2026"
    And I fill in Description with "Introductory cybersecurity program"
    And I click Cancel
    Then the modal closes
    And the program list does not show "Cybersecurity Bootcamp 2026"

  # Negative

  @TC-007
  Scenario: Whitespace-only program name is rejected
    Given I am on the program creation form
    When I fill in Program Name with "   "
    And I fill in Description with "Full-stack web development program"
    Then the Create button is disabled
    And no program is created

  @TC-008
  Scenario: Duplicate program name is rejected
    Given a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Duplicate attempt description"
    And I click Create
    Then the modal remains open
    And an error message indicates the program name already exists
    And the program list contains only one "Web Development 2026" entry

  @TC-009
  Scenario: Non-admin cannot create programs
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then I do not see the "+ New Program" button
    And I cannot open the program creation form

  # Edge cases

  @TC-012
  Scenario: Maximum length program name is accepted
    Given I am on the program creation form
    When I fill in Program Name with a 255-character string
    And I fill in Description with "Boundary length validation program"
    And I click Create
    Then the modal closes
    And the program list shows the 255-character program name

  @TC-014
  Scenario: Special characters in program name are preserved
    Given I am on the program creation form
    When I fill in Program Name with "AI & ML: Phase-1 (2026)"
    And I fill in Description with "Covers neural networks and NLP"
    And I click Create
    Then the modal closes
    And the program list shows "AI & ML: Phase-1 (2026)"

  @TC-019
  Scenario: Double submit prevention
    Given I am on the program creation form
    When I fill in Program Name with "DevOps Engineering 2026"
    And I fill in Description with "CI/CD and infrastructure automation"
    And I double-click the Create button
    Then the modal closes
    And the program list shows exactly one "DevOps Engineering 2026" entry

  # Ambiguities and gaps
  # - Description required or optional? ACs imply it is filled but do not state mandatory.
  # - Maximum field lengths not specified (assumed 255 for name, 2000 for description).
  # - Duplicate names not addressed; assumed blocked with case-sensitivity unknown.
  # - Whitespace trim/reject rules not defined.
  # - Modal dismiss via Escape or click-outside not specified.
  # - Role-based access only mentions admin; other roles undefined.
  # - Error message text and placement not specified for validation failures.
```
