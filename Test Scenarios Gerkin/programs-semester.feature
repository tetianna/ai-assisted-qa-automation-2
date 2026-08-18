Feature: Add semester to program on Programs page
  Coverage gap — Programs subtitle promises semester management; POM supports it but no tests/ spec covered select program → + Semester → create.

  # Happy path

  Scenario: Admin adds a semester to a selected program
    Given I am logged in as admin
    And a program exists on the Programs page
    When I select the program and create a semester with valid dates
    Then the semester is visible for the selected program

  # Negative

  Scenario: Semester form unavailable without program selection
    Given I am logged in as admin
    And a program exists on the Programs page
    When I have not selected a program row
    Then I see the manage-semesters hint
    And the + Semester control is not available

  Scenario: Empty semester name is rejected
    Given I am logged in as admin
    And a program is selected
    When I open New Semester with dates but no name
    Then Create Semester is disabled

  Scenario: End date before start date is rejected
    Given I am logged in as admin
    And a program is selected
    When I submit a semester with end date before start date
    Then the semester is not created

  Scenario: Semester is not created when API fails
    Given I am logged in as admin
    And a program is selected
    When the semester create API returns a server error
    Then the semester is not shown for the program

  # Edge cases

  Scenario: Cancelling New Semester does not create a semester
    Given I am logged in as admin
    And a program is selected
    When I fill semester details and click Cancel
    Then the dialog closes and the semester is not shown

  Scenario: Multiple semesters can be added to one program
    Given I am logged in as admin
    And a program is selected
    When I create two semesters with different names
    Then both semester labels are visible

  Scenario: Long semester name is accepted and visible
    Given I am logged in as admin
    And a program is selected
    When I create a semester with a 255-character name
    Then the long semester name is visible