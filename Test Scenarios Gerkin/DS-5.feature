Feature: Program list filtering and display
  DS-5 — Admin sees all programs in a clear list for quick find and manage

  # Happy paths

  @TC-001 @AC-DisplayProgramList
  Scenario: Program list displays name and description for each program
    Given I am logged in as admin
    And a program "Web Development 2026" exists with Description "Full-stack web development program"
    When I navigate to the Programs page
    Then I see a list showing each program's name and description
    And the list shows "Web Development 2026"
    And the list shows description "Full-stack web development program"

  @TC-002 @AC-EmptyState
  Scenario: Empty state shown when no programs exist
    Given I am logged in as admin
    And no programs exist
    When I navigate to the Programs page
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

  @TC-003
  Scenario: List updates after creating a new program
    Given I am logged in as admin
    And I am on the Programs page
    When I create a program "Mobile App Development" with Description "iOS and Android development"
    Then the program list shows "Mobile App Development"
    And the program list shows description "iOS and Android development"
    And the update is visible without manually refreshing the page

  @TC-004
  Scenario: List reflects edits immediately
    Given I am logged in as admin
    And a program "Edit Display Test" exists
    When I edit the program name to "Edit Display Test Updated"
    And I save the changes
    Then the program list shows "Edit Display Test Updated"
    And the program list does not show "Edit Display Test"

  @TC-005
  Scenario: List reflects deletion immediately
    Given I am logged in as admin
    And a program "Delete Display Test" exists
    When I delete "Delete Display Test" with confirmation
    Then the program list does not show "Delete Display Test"
    And the update is visible without manually refreshing the page

  @TC-006
  Scenario: Programs with empty description display appropriately
    Given I am logged in as admin
    And a program "No Description Program" exists with no description
    When I navigate to the Programs page
    Then the program list shows "No Description Program"
    And the empty description is handled with an appropriate empty state or blank display

  # Negative

  @TC-007
  Scenario: List does not show programs user is unauthorized to view
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then I only see programs I am authorized to view
    And admin-only programs are not visible

  @TC-008
  Scenario: API failure shows error state instead of misleading empty list
    Given I am logged in as admin
    And the programs list request fails due to a server error
    When I navigate to the Programs page
    Then an error message is displayed
    And the page does not falsely show the empty-state message

  @TC-009
  Scenario: Partial data does not break list rendering
    Given I am logged in as admin
    And programs exist in the system
    When I navigate to the Programs page
    Then the program list table or grid is visible
    And column headers including Program are visible
    And existing programs are rendered without layout breakage

  @TC-010
  Scenario: XSS in stored description is not executed in list
    Given I am logged in as admin
    And a program "XSS List Test" exists with Description "<img src=x onerror=alert('xss')>"
    When I navigate to the Programs page
    Then the program list shows "XSS List Test"
    And no script alert is executed
    And the description is displayed as plain text or safely escaped

  # Edge cases

  @TC-011
  Scenario: Long program name displays with truncation or wrap
    Given I am logged in as admin
    And a program with a 255-character name exists
    When I navigate to the Programs page
    Then the program list shows the long program name with truncation or wrap per UI design

  @TC-012
  Scenario: Long description displays with truncation or expand
    Given I am logged in as admin
    And a program "Long Desc Display" exists with a 500-character description
    When I navigate to the Programs page
    Then the program list shows "Long Desc Display"
    And the long description is truncated or expandable per UI design

  @TC-013
  Scenario: Special characters in name and description render correctly
    Given I am logged in as admin
    And a program "Informatique & IA - Niveau 2" exists with Description "Programme bilingue — niveau avancé"
    When I navigate to the Programs page
    Then the program list shows "Informatique & IA - Niveau 2"
    And the program list shows description "Programme bilingue — niveau avancé"

  @TC-014
  Scenario: Large number of programs renders performantly
    Given I am logged in as admin
    And many programs exist in the system
    When I navigate to the Programs page
    Then the program list loads within a reasonable timeout
    And all visible programs are rendered

  @TC-015
  Scenario: Single program list displays correctly
    Given I am logged in as admin
    And only one program "Single Program Display" exists
    When I navigate to the Programs page
    Then the program list shows "Single Program Display"
    And column headers are visible

  @TC-016
  Scenario: Emoji in program name and description display correctly
    Given I am logged in as admin
    And a program "Data Science 🚀 2026" exists with Description "Learn ML with fun 🎯"
    When I navigate to the Programs page
    Then the program list shows "Data Science 🚀 2026"
    And the program list shows description containing "🎯"

  @TC-017
  Scenario: List sort order is consistent
    Given I am logged in as admin
    And programs "AAA Sort Test" and "ZZZ Sort Test" exist
    When I navigate to the Programs page
    Then programs appear in a consistent sort order
    And the order does not change unexpectedly between page loads

  @TC-018
  Scenario: Empty state CTA navigates to create flow
    Given I am logged in as admin
    And no programs exist
    When I navigate to the Programs page
    And I click the prompt to create the first program
    Then the program creation form opens

  @TC-019
  Scenario: List filtering by search narrows visible programs
    Given I am logged in as admin
    And a search filter is available on the Programs page
    And a program "Search Filter Test" exists
    When I enter "Search Filter Test" in the search filter
    Then the program list shows "Search Filter Test"
    And programs that do not match the search are hidden

  # Ambiguities and gaps
  # - Ticket title mentions "filtering" but ACs only cover display and empty state; search/filter rules undefined (TC-019).
  # - Empty state cannot be guaranteed in shared test environments (TC-002, TC-018).
  # - Which columns beyond name and description should appear not specified.
  # - Sort order not defined in ACs (TC-017).
  # - Pagination or virtual scroll for large lists not specified (TC-014).
  # - Role-based visibility rules not in ACs (TC-007).
  # - Behavior when description is null vs empty string not defined (TC-006).
  # - Whether list auto-refreshes on external changes not specified.
