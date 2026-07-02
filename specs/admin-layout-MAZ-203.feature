Feature: AD-02 Authenticated admin layout and protected navigation
  As an authenticated admin
  I want a persistent shell with navigation, identity, and logout
  So that I can move between the dashboard sections securely

  @s1
  Scenario: The shell shows brand, admin identity, and the three sections
    Given an authenticated admin named "admin"
    When the layout renders
    Then the brand and the username "admin" are visible
    And the nav shows "Levels", "Leaderboard", and "Users"

  @s2
  Scenario: Selecting a nav section navigates to its route
    Given the layout is rendered
    When the admin selects the "Leaderboard" section
    Then the app navigates to "/leaderboard"

  @s3
  Scenario: The active section is derived from the current path
    Given the current path is "/levels/123"
    When the active section is resolved
    Then the "Levels" section is marked active by longest-path match

  @s4
  Scenario: Logout from the header ends the session
    Given the layout is rendered for an authenticated admin
    When the admin clicks logout
    Then the session sign-out is invoked

  @s5
  Scenario: Unauthenticated access to a protected section redirects to login
    Given there is no session
    When a protected route is requested
    Then the app redirects to "/login"

  @s6
  Scenario: The responsive nav can be toggled open and closed
    Given the shell view-model starts with the mobile nav closed
    When the nav is toggled
    Then the mobile nav is open
    And toggling again closes it
