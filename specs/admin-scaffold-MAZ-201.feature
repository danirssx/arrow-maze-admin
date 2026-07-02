Feature: Arrow Maze Admin scaffold (Clean Architecture web repo)
  The new admin repo boots green with an enforced Clean Architecture skeleton, agent
  governance, and a real test-first domain slice.

  @s1
  Scenario: The repo verifies green
    Given the scaffolded repo
    When npm run verify runs
    Then lint, typecheck, test (coverage) and build all pass

  @s2
  Scenario: Layer boundaries are enforced
    Given the ESLint config
    When the import rules are inspected
    Then import/no-restricted-paths enforces the inward dependency rule
    And React/router/query/styling libraries are forbidden in domain and application

  @s3
  Scenario: The domain PageQuery slice behaves per its tests
    Given the domain PageQuery value object
    When it is created and validated
    Then it defaults, computes offset, caps the limit, and rejects invalid page/limit

  @s4
  Scenario: Agent governance is present
    Given the repo
    When governance files are inspected
    Then AGENTS.md, .agents/*, docs/*, specs/_TEMPLATE.spec.md, AI_USAGE.md, ai-log/ and the compile script exist

  @s5
  Scenario: Mutation is configured and passes on the slice
    Given the Stryker config
    When npm run mutation runs on the domain slice
    Then the mutation score meets the threshold
