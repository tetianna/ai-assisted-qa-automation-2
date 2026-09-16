Feature: Calendar program and semester selection gating
  Coverage gap — the Calendar page has only navigation coverage (DS-119 TC-003); the
  program -> semester cascade that unlocks the whole scheduling surface is untested,
  so a regression in the gating would hide every calendar view behind an empty state.

  Background:
    Given an admin is signed in via the setup storageState
    And the admin has a program with one semester running 2026-09-01 to 2026-12-15

  # Happy path

  Scenario: Selecting a program and semester loads the calendar grid in Week view
    Given the admin is on the Calendar page
    When the admin selects the tracked program in the Program dropdown
    And the admin selects the tracked semester in the Semester dropdown
    Then the calendar grid is visible
    And the "Week" view button is pressed
    And the "+ New Session" button is visible
    And the session summary reads "0 sessions scheduled • 2026-09-01 to 2026-12-15"

  Scenario: Switching to Month view updates the pressed view and the period heading
    Given the admin has loaded the calendar for the tracked program and semester
    When the admin clicks the "Month" view button
    Then the "Month" view button is pressed
    And the "Week" view button is not pressed
    And the period heading reads "September 2026"
    And the "Next Month" button is visible

  # Edge case

  Scenario: Semester dropdown stays disabled until a program is chosen
    Given the admin is on the Calendar page with no program selected
    Then the Semester dropdown is disabled
    And the empty state reads "Select a program and semester to view the calendar"
    When the admin selects the tracked program in the Program dropdown
    Then the Semester dropdown is enabled
    And the empty state reads "Choose a semester from the dropdown to load its sessions"

  # Ambiguities and gaps
  # - Observed during exploration: selecting a semester fires
  #   GET /api/semesters/<uuid>/publish which returns HTTP 500 every time.
  #   The UI still renders the grid, so this is logged as a possible app bug for
  #   human review rather than asserted here. Not filed as a Jira bug (needs approval).
  # - "Today" is disabled in Month view but enabled in Week view for a semester that
  #   starts in the future. Product intent unconfirmed, so it is left unasserted.
  # - Deferred uncovered flows (later runs): "+ New Session" creation and
  #   drag-and-drop rescheduling, "Publish" semester action, the validation panel,
  #   and the Scheduler / Export pages which have no POM or coverage at all.
