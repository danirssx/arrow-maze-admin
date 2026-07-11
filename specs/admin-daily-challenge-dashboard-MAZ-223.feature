Feature: Admin Daily Challenge dashboard and iteration controls
  As an admin
  I want to inspect and manually iterate the Daily Challenge from the admin dashboard
  So that I can manage the current daily puzzle without seeing provider secrets

  Background:
    Given MAZ-218 exposes GET /daily-challenge
    And MAZ-224 defines the manual iteration operation contract
    And the admin dashboard uses MVVM and Clean Architecture boundaries

  @s1
  Scenario: Render the current Daily Challenge visually
    Given the backend returns a current Daily Challenge
    When an admin opens the Daily Challenge section
    Then the page displays a board preview
    And the page displays the challenge date, target difficulty, source and validation metadata

  @s2
  Scenario: Distinguish Gemini and fallback source metadata
    Given the current challenge source is fallback
    When the Daily Challenge metadata renders
    Then the page displays fallback source
    And the page displays fallbackUsed true

  @s3
  Scenario: Show UTC generation and expiry metadata
    Given the current challenge includes generatedAt and expiresAt
    When the Daily Challenge metadata renders
    Then the page displays the generated UTC timestamp
    And the page displays the expiry UTC timestamp

  @s4
  Scenario: Start manual iteration and render ordered live log events
    Given the current challenge is visible
    And the backend accepts a manual iteration operation
    When the admin clicks Iterate
    Then the page displays ordered operation log events
    And the operation status is visible

  @s5
  Scenario: Refresh the displayed challenge after successful replacement
    Given the current challenge is visible
    And a manual iteration operation succeeds with a replacement challenge
    When the operation reaches SUCCEEDED
    Then the page refreshes the current Daily Challenge
    And the replacement board metadata is displayed

  @s6
  Scenario: Disable duplicate iteration while an operation is running
    Given a manual iteration operation is RUNNING
    When the admin views the Daily Challenge action
    Then the Iterate action is disabled

  @s7
  Scenario: Show activity unavailable state without blocking the preview
    Given no backend gameplay analytics endpoint exists
    When the Daily Challenge section renders
    Then the page shows an activity unavailable state
    And the current challenge preview remains visible

  @s8
  Scenario: Recover from load or iteration backend errors
    Given the backend returns an error while loading or iterating
    When the Daily Challenge section renders
    Then the page shows a recoverable error state
    And the page does not crash

  @s9
  Scenario: Consume backend contracts through the HTTP adapter
    Given the admin Daily Challenge API adapter is used
    When current challenge, iteration start and operation polling are requested
    Then the adapter calls the approved backend endpoints
    And operation ids are URL encoded

  @s10
  Scenario: Expose the Daily Challenge section in admin navigation
    Given MAZ-223 is implemented
    When the admin shell and router render
    Then the Daily Challenge nav entry is visible
    And selecting it marks the section active
