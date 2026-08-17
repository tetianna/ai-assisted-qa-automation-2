Feature: Dashboard displaying the right components
  DS-119 — As an admin user, I want to see the correct dashboard

  # Happy paths

  @TC-001 @AC-DashboardBlocks
  Scenario: Navigate to the Dashboard
    Given I am logged in as admin
    When I navigate to the Dashboard page
    Then I see the Dashboard with the right blocks: Programs, Calendar, Validation, AI Assist

  @TC-002 @AC-ProgramsNavigation
  Scenario: Successfully navigate to Program Page
    Given I am on Dashboard
    When I click on Programs card
    Then I navigate to the Programs page

  @TC-003 @AC-CalendarNavigation
  Scenario: Successfully navigate to Calendar Page
    Given I am on Dashboard
    When I click on Calendar card
    Then I navigate to the Calendar page

  @TC-004 @AC-ValidationNavigation
  Scenario: Successfully navigate to Validation Page
    Given I am on Dashboard
    When I click on Validation card
    Then I navigate to the Validation page

  @TC-005 @AC-AIAssistNavigation
  Scenario: Successfully navigate to AI Assist Page
    Given I am on Dashboard
    When I click on AI Assist card
    Then I navigate to the AI Assist page

  # Negative

  @TC-006
  Scenario: Dashboard block cards are not duplicated in the main content area
    Given I am on Dashboard
    Then each dashboard block appears exactly once: Programs, Calendar, Validation, AI Assist

  # Edge cases

  @TC-007
  Scenario: Dashboard remains visible after returning from Programs page
    Given I am on Dashboard
    When I click on Programs card
    And I navigate back to Dashboard via the navigation bar
    Then I see the Dashboard with the right blocks: Programs, Calendar, Validation, AI Assist

  # Ambiguities and gaps
  # - Jira AC uses Dashboardx typo — interpreted as Dashboard.
  # - AI Assist route documented in backlog as /cli; confirm heading text on target page.
  # - Linked bugs DS-120 (Calendar/Validation/AI Assist navigation) and DS-121 (keyboard focus) may cause failures until fixed.
