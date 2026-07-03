Feature: AD-07 Archive and recreate a level while preserving scores
  As an authenticated admin
  I want archiving a published level to be clearly presented as a soft archive
  So that I can replace the level without losing its score history

  @s1
  Scenario: Archive copy explains preservation before archiving
    Given a PUBLISHED level in the admin table
    When the row renders
    Then the archive action communicates that the level will leave the game catalog
    And the action communicates that leaderboard and score history remain readable

  @s2
  Scenario: Successful archive exposes the replacement path
    Given a PUBLISHED level is archived successfully
    When the admin levels list refreshes
    Then the workflow offers a direct action to create a replacement level

  @s3
  Scenario: Archived levels remain visible in the all-levels admin table
    Given the admin is viewing all levels
    When an archived level is returned by the admin levels endpoint
    Then the level is shown with status "ARCHIVED"
    And archive is not offered again

  @s4
  Scenario: Published filter mirrors the public game catalog after archive
    Given the admin is viewing the "PUBLISHED" status filter
    When a level is archived successfully
    Then the archived level is no longer shown in that filtered table
    And the UI explains that archived levels are no longer offered in the game

  @s5
  Scenario: Backend archive errors do not imply replacement success
    Given archiving a level fails with a backend error
    When the admin archives the level
    Then the backend error message is displayed
    And no replacement or success message is shown

  @s6
  Scenario: Replacement reuses the existing create and publish flow
    Given a level was archived successfully
    When the admin chooses to create a replacement
    Then navigation goes to the existing "/levels/new" creator route
