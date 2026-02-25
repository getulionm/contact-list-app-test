# Playwright Test Automation – Contact List Application

This project contains a small Playwright test suite validating a contact management application through both UI and API tests.

Application under test:  
https://thinking-tester-contact-list.herokuapp.com

---

## 🚀 Start Here (60 seconds)

If you are reviewing this repo for Playwright skills, start with:

1. `tests/helpers/fixtures.ts` → lazy fixture architecture and isolation strategy
2. `tests/mocks.spec.ts` → deterministic network mocking example
3. `tests/contract.spec.ts` → contract-level API validation
4. `.github/workflows/tests.yml` → CI browser matrix (Chromium/Firefox/WebKit), sharding, and artifact publishing

Quick run:

```bash
npm ci
npx playwright install
npm test
```

---

## Requirements

- Node.js 18+
- npm

---

## Getting Started

You can run the project either from the Git repository or from a ZIP archive.  
Both approaches result in the same setup and commands.

### Option A: Run from the repository

```bash
git clone https://github.com/getulionm/contact-list-app-test.git
cd <project-directory>
npm ci
npx playwright install
```

### Option B: Run from a ZIP archive
Download and extract the project archive.
Open a terminal in the extracted project folder.
Install dependencies and browsers:
```bash
npm ci
npx playwright install
```

---

## ▶️ Running Tests

### Run all tests
```bash
npm test
```

### Run specific test files
```bash
# UI tests only
npx playwright test tests/ui.spec.ts

# API tests only
npx playwright test tests/api.spec.ts
```

### View HTML test report
```bash
npx playwright show-report
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

---

## 🧪 Test Coverage

### UI Tests (`tests/ui.spec.ts`)

1. **User Registration & Authentication**
   - Register new user with valid credentials
   - Logout and login functionality
   - Session persistence validation

2. **Contact Creation - Minimal Fields**
   - Create contact with only required fields (firstName, lastName)
   - Verify contact appears in list

3. **Contact Creation - All Fields**
   - Create contact with complete information
   - Verify all data displays correctly in contact list

4. **Contact Editing**
   - Update existing contact details
   - Verify changes reflect in contact list

### API Tests (`tests/api.spec.ts`)

1. **User Authentication**
   - API registration and login
   - Token generation and validation

2. **Contact Creation via API**
   - Create contact through API endpoint
   - Retrieve and verify contact by ID

3. **Contact Deletion via API**
   - Delete contact through API
   - Verify removal confirmation

---

## 🏗️ Design Choices

### 🎯 Objective: Scalable Test Isolation

- Each test runs with its **own isolated data**
- No shared state between tests
- Automatic cleanup handled in **fixture teardown**
- Fully **parallel-safe**
- **No UI dependency for API tests**

---

### 1. Unified Lazy Fixtures Pattern

All tests use a **single `test` export**, powered by **Playwright’s lazy fixture resolution**.

Fixtures are **only created when explicitly requested by a test**, which guarantees:

- No browser launch for API-only tests
- No authentication setup unless required
- No unnecessary setup or duplicated logic
- Clear, intention-revealing test code

Fixtures are defined in:

---

### Available Fixtures

| Fixture       | Purpose |
|--------------|--------|
| `api`        | Unauthenticated API client (auto-disposed per test) |
| `session`    | Fresh user + auth token created via API (auto-cleaned) |
| `auth`       | Pre-authenticated API client using session token |
| `page`       | UI page with HTTP error logging attached |
| `authedPage` | UI page already authenticated and landed on `/contactList` |

---

### How Tests Opt In

Tests declare their needs explicitly by destructuring fixtures:

```ts
// API test (no authentication)
test("unauth api test", async ({ api }) => {});

// API test (authenticated)
test("auth api test", async ({ auth }) => {});

// UI test (logged out)
test("unauth ui test", async ({ page }) => {});

// UI test (logged in)
test("auth ui test", async ({ authedPage }) => {});
```

**Benefits**:  
- A single base.extend() instead of multiple test exports
- No duplication between API / UI / authenticated variants
- Test intent is described by fixture usage
- Easy to extend with new capabilities (e.g. adminSession, mobilePage)

---

### 2. Screen Helpers Pattern

UI interactions are organised by screen in `tests/helpers/screens/`.  
Each module exposes focused actions for a single page, keeping tests readable and stable.

**Screen Modules:**

- `home.ts` – Landing page actions (signup, login)
- `signup.ts` – User registration form
- `contactList.ts` – Contact list actions and assertions
- `addContact.ts` – Add contact form (fill + submit)
- `contactDetails.ts` – Contact details page (edit, return to list)
- `editContact.ts` – Edit contact form (verify prefilled values, submit)

**Benefits**  
> Maintainability – Selector changes are isolated to one file  
Readability – Tests read like user journeys  
Reusability – Common flows shared across tests  
Encapsulation – Selectors never leak into test files  

---

### 3. Navigation Helper
- `clickAndNavigate()` in tests/helpers/ui.ts wraps click + URL wait + DOM ready check  
Prevents race conditions where navigation starts before waits are attached  
Eliminates common UI flakiness caused by timing issues

### 4. Data Generation Strategy
- Dynamic test data using `slug()` function (random 6-character strings)
- Prevents test collisions in shared environments
- Separate factories for minimal vs full contacts (UI vs API use cases)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The project includes automated testing on every push and pull request:

1. **Build**: Creates Docker image with all dependencies
2. **Test Execution**: Runs tests in isolated container
3. **Reporting**: Uploads HTML report as artifact

### Accessing Test Reports

- Navigate to the Actions tab in GitHub
- Select the workflow run
- Download the `playwright-report` artifact
- Extract and open `index.html`

### Docker Support

Tests can run in Docker for consistent environments:
```bash
# Build image
docker build -t pw-tests .

# Run tests
docker run --rm pw-tests
```

---

## 💡 Challenges & Solutions

### 1: Application Stability
**Issue**: Public demo application occasionally slow or unavailable  
**Solution**:  
Relied on Playwright’s built-in auto-waiting and explicit assertions, added HTTP response logging for easier debugging, and handled errors gracefully in fixtures to keep failures diagnosable rather than flaky.

---

### 2: Test Data Management  
**Issue**: Hard-coded test data causes collisions in a shared environment  
**Solution**:  
Introduced small data builders that generate unique users and contacts per test, combined with automatic cleanup to prevent data accumulation between runs.

---

### 3: Authentication Flow (speed vs coverage)
**Issue**: Repeating signup/login through the UI in every test would be slow and noisy.

**Solution**: UI tests now use API-seeded authentication via fixtures (`session`, `testAuth`):
- A fresh user is created and logged in via API to get a token
- The token is injected into the browser as a `token` cookie
- The test navigates directly to `/contactList`, the apps' landing page

A single UI test remains to validate the full signup → logout → login journey end-to-end.

**Result**: Faster UI execution with no loss of authentication coverage, and a clean separation between auth validation and feature testing.


---

### 4: Test Isolation
**Issue**: Tests interfering with each other  
**Solution**:  
Custom fixtures ensure a fresh user per test with automatic teardown, eliminating shared state and keeping tests fully isolated.

---

### 5: Maintainability
**Issue**: Keeping tests readable and easy to evolve  
**Solution**:  
Separated concerns clearly (fixtures, data builders, screen helpers), used descriptive helper functions, and leveraged TypeScript for safer refactoring and better IDE support.


---

## 📚 Tools & Technologies

- **Playwright** - Modern end-to-end testing framework
- **TypeScript** - Type-safe test code
- **Docker** - Containerized test execution
- **GitHub Actions** - CI/CD automation

---