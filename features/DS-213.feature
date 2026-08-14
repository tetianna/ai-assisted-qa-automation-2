Feature: User should be able to add user in Settings TK
  DS-213 — Admin can add a new user from the Settings page

  # Happy paths

  @TC-001 @AC-AddUserInSettings
  Scenario: Admin navigates to Settings and opens add-user form
    Given I am logged in as admin
    When I navigate to the Settings page
    Then I see the Settings page with a Users section
    When I click the control to add a new user
    Then I see a form to add a new user

  @TC-002 @AC-AddUserInSettings
  Scenario: Admin successfully adds a new user with required fields
    Given I am logged in as admin
    And I am on the Settings page Users section
    When I add a new user with email "qa.newuser@example.com" and name "QA New User"
    Then the new user "QA New User" appears in the users list
    And I see a success confirmation

  @TC-003
  Scenario: Newly added user appears without manual page refresh
    Given I am logged in as admin
    And I am on the Settings page Users section
    When I add a new user with email "qa.refresh@example.com" and name "QA Refresh User"
    Then the users list shows "QA Refresh User" immediately

  # Negative

  @TC-004
  Scenario: Add user form rejects submission with empty email
    Given I am logged in as admin
    And I am on the Settings page with the add-user form open
    When I submit the add-user form without an email
    Then the user is not created
    And I see a validation message for the email field

  @TC-005
  Scenario: Add user form rejects duplicate email
    Given I am logged in as admin
    And a user with email "existing.user@example.com" already exists
    When I attempt to add another user with email "existing.user@example.com"
    Then the user is not created
    And I see an error indicating the email is already in use

  @TC-006
  Scenario: Non-admin cannot access add-user functionality
    Given I am logged in as a non-admin user
    When I navigate to the Settings page
    Then I do not see the add-user control
    Or I am denied access to user management

  # Edge cases

  @TC-007
  Scenario: Add user with special characters in display name
    Given I am logged in as admin
    And I am on the Settings page Users section
    When I add a new user with email "qa.special@example.com" and name "O'Brien-Smith (QA)"
    Then the new user "O'Brien-Smith (QA)" appears in the users list

  @TC-008
  Scenario: Add user with maximum-length email
    Given I am logged in as admin
    And I am on the Settings page Users section
    When I add a new user with a 254-character valid email address
    Then the user is created successfully

  @TC-009
  Scenario: Cancel add-user form discards input
    Given I am logged in as admin
    And I am on the Settings page with the add-user form open
    When I enter user details and cancel the form
    Then no new user is created
    And the add-user form is closed

  # Ambiguities and gaps
  # - Ticket only states "User should be able to add user in Settings TK" with no formal AC list.
  # - Required fields for add-user (email only vs email+name+role) are unspecified.
  # - Expected role/permission defaults for a newly added user are not defined.
  # - Whether invite email is sent vs immediate account creation is unclear.
  # - Delete/deactivate user cleanup path for test data is not documented.
