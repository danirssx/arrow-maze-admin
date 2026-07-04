Feature: AD-10 Visual level editor with a figure picker
  As an admin
  I want to paint arrows on a grid and pick a board figure
  So that I author a level visually and publish it like a Phase-1 JSON level

  @s1
  Scenario: The figure catalog provides mask cells
    Given the board figure catalog
    When a figure is looked up by id
    Then its mask cells are returned (and an unknown id yields nothing)

  @s2
  Scenario: Painting appends only valid cells
    Given a selected figure mask and a partial arrow path
    When a cell is considered for appending
    Then it is allowed only when inside the mask, not already in the path, and adjacent to the last cell

  @s3
  Scenario: The editor reports containment and ArrowSpec violations
    Given an editor model whose arrow leaves the mask or points into its own body
    When the model is validated
    Then a specific error is reported for each violation

  @s4
  Scenario: A missing figure, name, difficulty or arrows are reported
    Given an incomplete editor model
    When it is validated
    Then the missing pieces are reported and it is not exportable

  @s5
  Scenario: A valid model exports the Phase-1 JSON
    Given a valid editor model with a figure and arrows
    When it is exported
    Then it produces the same JSON shape as Phase 1 (name/difficulty/arrows/boardShape)

  @s6
  Scenario: The review validates then exports
    Given an editor model
    When it is reviewed
    Then invalid models yield errors and no value, and valid models yield the exported value

  @s7
  Scenario: The editor screen paints, previews and publishes
    Given the visual editor screen
    When the admin selects a figure, paints an arrow, and it becomes valid
    Then the board preview renders and publishing sends the exported JSON via the AD-06 flow
