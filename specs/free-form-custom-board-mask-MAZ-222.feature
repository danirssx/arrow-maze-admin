Feature: Free-form custom board mask painter in the admin visual editor
  As an admin
  I want to paint a custom board shape in the visual editor instead of only picking a preset figure
  So that I can author irregular boards while reusing the existing CELL_MASK create/publish contract

  Background:
    Given the visual editor already paints arrows and previews a board mask
    And the export already emits boardShape as a CELL_MASK of cells
    And the editor exposes a board authoring mode with PRESET and CUSTOM

  @s1
  Scenario: Empty custom mask is invalid
    Given the editor is in CUSTOM mode
    And no board cells are toggled on
    When the level is reviewed
    Then an inline "select at least one board cell" error is shown
    And publish is disabled

  @s2
  Scenario: Toggling cells on builds the board and previews the custom shape
    Given the editor is in CUSTOM mode
    When the author toggles a set of grid cells on
    Then those cells become the board mask
    And those cells are paintable for arrows
    And the preview renders the custom shape from those cells

  @s3
  Scenario: Toggling a cell off flags an arrow that used it
    Given the editor is in CUSTOM mode with a mask and one arrow inside it
    When the author toggles off a cell that the arrow uses
    Then the cell leaves the board mask
    And the arrow is flagged as outside the board
    And publish is disabled

  @s4
  Scenario: A disconnected custom mask is allowed
    Given the editor is in CUSTOM mode
    And the mask contains two groups of cells with no orthogonal connection between them
    And all arrows are valid and inside the mask
    When the level is reviewed
    Then the review is valid
    And publish is enabled

  @s5
  Scenario: A valid custom mask exports as a CELL_MASK of exactly the painted cells
    Given the editor is in CUSTOM mode with a connected non-empty mask
    And all arrows are valid and inside the mask
    When the level is exported
    Then the payload boardShape type is CELL_MASK
    And the payload boardShape cells equal exactly the painted cells

  @s6
  Scenario: Selecting a preset seeds the editable custom mask
    Given the editor is in CUSTOM mode
    When the author selects a preset figure
    Then the mask is seeded with that figure's cells
    And the author can still toggle individual cells on or off

  @s7
  Scenario: A valid custom level publishes through the existing flow
    Given the editor holds a valid custom mask with valid arrows
    When the author publishes
    Then the exported payload is created and published through the existing create and publish path
    And the backend remains authoritative

  @s8
  Scenario: Backend rejection of a locally valid custom payload is surfaced
    Given the editor holds a locally valid custom payload
    And the backend rejects the create or publish request
    When submit completes
    Then the backend error message is shown
    And no successful creation is shown
