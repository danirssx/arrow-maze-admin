Feature: Flexible rectangular board definitions in admin level creation
  As an admin
  I want to create non-preset rectangular levels with explicit dimensions
  So that M12 boards can vary in size while staying within backend-approved limits

  Background:
    Given the admin JSON creator already validates MAZ-206 level JSON
    And the board preview already renders arrows and optional board masks

  @s1
  Scenario: Valid non-preset rectangular JSON validates and previews
    Given JSON with boardSize rows 8 and cols 10
    And all arrows are inside rows 0 through 7 and cols 0 through 9
    When the JSON is reviewed
    Then the review is valid
    And the preview renders an 8 by 10 rectangle
    And submit is enabled

  @s2
  Scenario: Legacy JSON without boardSize keeps existing behavior
    Given JSON with name, difficulty and arrows but no boardSize
    When the JSON is reviewed
    Then the MAZ-206 validation result is preserved
    And the preview still derives its frame from arrows or boardShape

  @s3
  Scenario: Oversize board dimensions are rejected locally
    Given JSON with boardSize rows 13 or cols 13
    When the JSON is reviewed
    Then an inline board-size limit error is shown
    And submit is disabled

  @s4
  Scenario: More than sixty arrows are rejected locally
    Given JSON with 61 arrows
    When the JSON is reviewed
    Then an inline arrow-count limit error is shown
    And submit is disabled

  @s5
  Scenario: Arrow cells outside the declared rectangle are rejected locally
    Given JSON with boardSize rows 4 and cols 4
    And an arrow path contains row 4 or col 4
    When the JSON is reviewed
    Then an inline bounds error is shown
    And submit is disabled

  @s6
  Scenario: The creator documents the rectangular schema
    Given the level creator screen
    When the expected JSON schema is shown
    Then it includes boardSize rows and cols
    And it states the 12 by 12 and 60 arrow limits

  @s7
  Scenario: Backend rectangular validation errors are surfaced
    Given the creator holds locally valid rectangular JSON
    And the backend rejects the create or publish request
    When submit completes
    Then the backend error message is shown
    And the UI does not show a successful creation
