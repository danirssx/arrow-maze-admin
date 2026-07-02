Feature: AD-03 Admin levels list with status and row actions
  As an authenticated admin
  I want a table of every level with per-row publish/archive actions
  So that I can manage the level catalog and its lifecycle

  @s1
  Scenario: The table lists every level regardless of status
    Given the admin levels endpoint returns DRAFT, PUBLISHED and ARCHIVED levels
    When the levels list loads
    Then all of them are shown with name, difficulty, status, arrow count and created date

  @s2
  Scenario: Filtering by status queries the backend with that status
    Given the levels list is loaded
    When the admin selects the "PUBLISHED" status filter
    Then only published levels are requested and shown

  @s3
  Scenario: Row actions follow the status lifecycle
    Given a DRAFT level and a PUBLISHED level and an ARCHIVED level
    When the rows render
    Then publish is offered only for the DRAFT level
    And archive is offered only for the PUBLISHED level

  @s4
  Scenario: Publishing a draft moves it to published and refreshes the list
    Given a DRAFT level in the table
    When the admin publishes it
    Then the publish endpoint is called and the list is refreshed

  @s5
  Scenario: Archiving a published level moves it to archived and refreshes the list
    Given a PUBLISHED level in the table
    When the admin archives it
    Then the archive endpoint is called and the list is refreshed

  @s6
  Scenario: A backend error is shown clearly
    Given publishing a level fails with a business rule violation
    When the admin publishes it
    Then the backend error message is displayed

  @s7
  Scenario: Viewing a level reveals its details inline
    Given a level in the table
    When the admin views it
    Then its details (arrows, attempts, id) are revealed inline
