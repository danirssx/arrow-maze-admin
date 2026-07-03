Feature: AD-06 Create→validate(server)→publish a level from JSON
  As an admin
  I want to create and publish a level from JSON
  So that a valid level appears in the game, with the backend validating it

  @s1
  Scenario: A valid level is created as a draft then published
    Given valid level JSON in the creator
    When it is submitted
    Then the backend create is called, then publish, in that order

  @s2
  Scenario: A backend create rejection is shown and publish is skipped
    Given the backend rejects the create (invalid ArrowSpec / containment)
    When the level is submitted
    Then the backend error is shown and publish is not called

  @s3
  Scenario: A backend publish rejection is shown (the draft remains)
    Given the create succeeds but publish is rejected (non-solvable)
    When the level is submitted
    Then the publish error propagates after the draft was created

  @s4
  Scenario: A successful publish returns to the levels list
    Given a valid level
    When create and publish both succeed
    Then the levels list is refreshed and shown, so the level appears in the game

  @s5
  Scenario: Create posts the value to the create endpoint
    Given a level value
    When create is called
    Then it is posted to /levels and the new id is returned
