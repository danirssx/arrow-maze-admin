Feature: Admin authentication (login, ADMIN gate, refresh-on-401, logout)
  Only administrators can enter the admin dashboard. Sessions refresh on 401 and can be
  logged out.

  @s1
  Scenario: A valid admin signs in
    Given valid ADMIN credentials
    When the admin submits the login form
    Then the session is persisted
    And the app becomes authenticated

  @s2
  Scenario: A valid non-admin is rejected
    Given valid USER credentials
    When the user submits the login form
    Then no session is persisted
    And a "not an administrator" message is shown

  @s3
  Scenario: An expired access token is refreshed and the request retried
    Given a signed-in admin and an authed request that returns 401
    When the HTTP client handles the 401
    Then it refreshes the access token and retries the request once
    And if the refresh fails it invalidates the session

  @s4
  Scenario: Logout clears the local session
    Given a signed-in admin
    When they log out
    Then the local tokens are cleared

  @s5
  Scenario: Protected routes require an admin session
    Given no persisted ADMIN session
    When a protected route loads
    Then the app redirects to the login route
