Feature: AD-09 Read-only users viewer
  As an authenticated admin
  I want to inspect platform users in a paginated table
  So that I can review accounts without mutating them or exposing password hashes

  @s1
  Scenario: Users table renders the backend user fields
    Given the admin opens the Users section
    When GET /admin/users succeeds with users
    Then the table shows username, email, role, status and created date for each row

  @s2
  Scenario: Password hashes are never exposed
    Given the backend response contains user records
    When the UI maps and renders the users
    Then no passwordHash field is mapped
    And no passwordHash value is visible

  @s3
  Scenario: Changing page requests the next page and updates metadata
    Given the Users section is showing page 1 with limit 20
    When the admin moves to page 2
    Then GET /admin/users is requested with page 2 and limit 20
    And the returned pagination metadata is rendered

  @s4
  Scenario: Empty users response shows an empty state
    Given GET /admin/users succeeds with no users
    When the Users section renders
    Then an empty-state message is shown
    And no blank rows or mutation actions are rendered

  @s5
  Scenario: Backend users errors are visible and recoverable
    Given the backend returns an error for the users request
    When the request fails
    Then the backend error message is displayed
    And the admin can retry or navigate without the view crashing

  @s6
  Scenario: The users table is read-only
    Given user rows are displayed
    When the admin inspects the Users section
    Then no edit, suspend, delete, role-change or password-reset action is available

  @s7
  Scenario: Pagination controls reflect first and last page metadata
    Given pagination metadata indicates the first or last available page
    When the pagination controls render
    Then previous and next controls are disabled according to that metadata
