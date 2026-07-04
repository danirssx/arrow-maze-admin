Feature: AD-11 Build + hosting of the admin SPA
  As the team
  I want a production build and static-host configuration
  So that the admin can be deployed, point at the prod API, and route correctly

  @s1
  Scenario: The production build emits static assets
    Given the admin repo
    When "npm run build" runs
    Then a dist/ folder of static assets is produced

  @s2
  Scenario: Static hosts serve index.html for client-side routes (SPA fallback)
    Given the committed host configuration
    When a deep link like /levels is requested
    Then the host is configured to return index.html with status 200

  @s3
  Scenario: The production API base URL is documented as a build-time variable
    Given the environment docs
    When a deployer prepares a build
    Then VITE_API_BASE_URL is documented as a host build env var inlined by Vite

  @s4
  Scenario: The deployed admin origin is added to the backend CORS
    Given the deploy runbook
    When the admin is deployed to an origin
    Then the runbook requires adding that origin to the backend CORS_ORIGIN (BE-04)
