# Playwright Test Automation – Contact List Application

Playwright showcase for a contact management app with focused UI + API coverage.

Application under test: https://thinking-tester-contact-list.herokuapp.com

## What this repo demonstrates

- **Scalable fixture architecture** with lazy setup and per-test isolation.
- **Deterministic UI tests** using network interception/mocking.
- **API contract + auth boundary checks** to catch backend regressions early.

## Start Here (2-minute review path)

If you're evaluating this repo quickly, read these files in order:

1. `tests/helpers/fixtures.ts`
2. `tests/mocks.spec.ts`
3. `tests/contract.spec.ts`
4. `.github/workflows/tests.yml`

## Quick Run

```bash
npm ci
npx playwright install
npm test
```

Useful focused runs:

```bash
npx playwright test --grep "@ui"
npx playwright test --grep "@api"
npx playwright show-report
```

## Capability Matrix

| File | Demonstrates | Why it matters |
|---|---|---|
| `tests/helpers/fixtures.ts` | Lazy fixtures: `api`, `session`, `auth`, `authedPage` | Fast, isolated, parallel-safe execution |
| `tests/mocks.spec.ts` | `route.fulfill` + payload assertion for `/contacts` | Deterministic UI behavior without backend dependency |
| `tests/contract.spec.ts` | Contract assertions + auth boundary checks | Early detection of API shape/auth regressions |
| `.github/workflows/tests.yml` | CI on push/PR/manual + artifacts + report deploy | Easy verification and reviewer-friendly evidence |

## Test Strategy (high level)

- Single `test` export extended with reusable fixtures.
- Tests opt into only what they need by fixture destructuring.
- Most UI tests use API-seeded auth for speed; one flow validates full UI auth journey.
- Data is generated per test and cleaned up in teardown.

## Key Engineering Decisions

### 1) Auth speed vs coverage
Most UI tests skip repetitive signup/login by authenticating via API fixture and injecting token cookie. One dedicated UI test still validates signup → logout → login end-to-end.

### 2) Test isolation
Each test gets fresh data (user/session), with cleanup in teardown to avoid shared-state pollution.

### 3) Deterministic confidence (mocks + contract)
UI mocking test proves rendering against known payloads; contract test validates field shape and protected endpoint boundaries.

## CI

GitHub Actions workflow supports:

- Automatic runs on **push** and **pull_request**
- Manual suite selection via **workflow_dispatch**: `all | ui | api`
- Artifact publishing (`playwright-report`, `test-results`) and report deploy
