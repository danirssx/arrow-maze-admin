Feature: AD-05 Level creator with JSON shape validation and live preview
  As an admin
  I want to paste or upload level JSON, validate its shape, and preview it
  So that I fix errors before submitting a new level

  @s1
  Scenario: Valid JSON enables preview and submit
    Given a well-formed level JSON with name, difficulty and arrows
    When it is reviewed
    Then it is valid with no errors and its value is available for preview and submit

  @s2
  Scenario: Malformed JSON reports a syntax error and blocks submit
    Given text that is not parseable JSON
    When it is reviewed
    Then the status is a syntax error and submit is disabled

  @s3
  Scenario: Missing required fields report inline errors and block submit
    Given a JSON object missing name, difficulty or arrows
    When it is reviewed
    Then each missing field is reported as an inline error and submit is disabled

  @s4
  Scenario: Invalid arrows and boardShape report shape errors
    Given arrows with a bad direction or non-integer path, or a bad boardShape
    When the draft is validated
    Then a specific error is reported for each violation

  @s5
  Scenario: Empty input is neither valid nor an error
    Given empty creator input
    When it is reviewed
    Then the status is empty, with no errors and no preview

  @s6
  Scenario: The creator shows the expected schema and previews valid JSON
    Given the creator screen
    When valid JSON is entered
    Then the expected schema is shown, the board preview renders, and submit is enabled

  @s7
  Scenario: Submitting valid JSON emits the parsed value once
    Given the creator holds valid JSON
    When submit is triggered
    Then the parsed level value is emitted to the caller
