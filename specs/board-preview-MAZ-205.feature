Feature: AD-04 Read-only web board preview
  As an admin
  I want to preview a level's board from its JSON
  So that I can see the arrows and mask before publishing or while authoring

  @s1
  Scenario: A valid level definition is parsed
    Given a JSON object with arrows and a boardShape
    When it is parsed
    Then a board definition with the arrows and mask cells is produced

  @s2
  Scenario: Invalid JSON degrades to no definition
    Given a JSON value that is not a valid level definition
    When it is parsed
    Then no board definition is produced (null), without throwing

  @s3
  Scenario: Geometry places board cells and arrow paths on the grid
    Given a parsed definition and a cell size
    When the geometry is built
    Then each mask cell becomes a positioned rect and each arrow becomes a polyline of cell centers

  @s4
  Scenario: The arrow head points in the arrow's direction
    Given an arrow with a direction
    When the geometry is built
    Then a head triangle is placed at the head cell pointing in that direction

  @s5
  Scenario: Arrow colours are resolved safely
    Given an arrow colour
    When it is resolved
    Then a valid CSS colour is used, falling back to a default for unsafe input

  @s6
  Scenario: The preview renders the board as SVG
    Given a valid level JSON
    When the preview renders
    Then an SVG with the mask rects and arrow paths is shown

  @s7
  Scenario: The preview degrades without crashing on invalid JSON
    Given an invalid level JSON
    When the preview renders
    Then a fallback message is shown instead of a board
