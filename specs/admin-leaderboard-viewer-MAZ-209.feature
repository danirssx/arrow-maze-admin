Feature: AD-08 Read-only leaderboard viewer
  As an authenticated admin
  I want to select a level and inspect its leaderboard
  So that I can review score history without mutating it

  @s1
  Scenario: The selector includes known levels and archived levels
    Given the admin opens the Leaderboard section
    When levels are loaded
    Then the selector shows known levels with their status
    And ARCHIVED levels are selectable

  @s2
  Scenario: Selecting a level with entries renders the leaderboard table
    Given a level with leaderboard entries is selected
    When GET /leaderboard/:levelId succeeds
    Then the table shows rank, username, score, time, moves and submitted date for each entry

  @s3
  Scenario: Known level with no entries shows an empty state
    Given a known level has no leaderboard entries
    When its leaderboard is requested
    Then an empty-state message is shown
    And no entry rows are rendered

  @s4
  Scenario: Archived level leaderboard remains readable
    Given an ARCHIVED level is selected
    When its leaderboard is requested
    Then the same GET /leaderboard/:levelId read path is used
    And the archived level's entries or empty state are shown

  @s5
  Scenario: Backend leaderboard errors are visible without blocking selection
    Given the backend returns an error for a selected level
    When the leaderboard request fails
    Then the backend error message is displayed
    And the level selector remains usable

  @s6
  Scenario: The leaderboard table is read-only
    Given leaderboard entries are displayed
    When the admin inspects the table
    Then no edit, delete or submit-score action is available

  @s7
  Scenario: No level selected does not request a leaderboard
    Given no level is selected yet
    When the Leaderboard section renders
    Then the admin is prompted to choose a level
    And GET /leaderboard/:levelId is not called
