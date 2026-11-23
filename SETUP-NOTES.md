# Advanced Playwright Framework — Setup Notes

> Session notes captured live while the framework is being set up.
> Every terminal command is logged in order, with its purpose and result.
> Extra points/instructions given during the session are recorded under "Key Points".

---

## 1. Session Log (terminals & commands)

| # | Command (as run) | Purpose | Result / Notes |
|---|------------------|---------|----------------|
| 1 | `npm init -y` | Initialise the npm project | Creates `package.json` — npm project is created |
| 2 | `npm install -D @playwright/test typescript @types/node` | Install Playwright, TypeScript and Node types as dev dependencies | Adds them to `package.json`; creates `package-lock.json` |
| 3 | `npx playwright install --with-deps` | Install Playwright browsers + OS dependencies | Dependencies installed |
| 3a | `npm init playwright@latest` | **Alternative:** direct single-command Playwright setup (instead of steps 1–3) | Prompts answered: TypeScript · tests dir `tests` · GitHub Actions → `true` · install browsers → `true` |
| 4 | `npm install -D dotenv` | Framework dependency: env loading | — |
| 5 | `npm install -D csv-parse` | Framework dependency: CSV parsing | — |
| 6 | `npm install -D xlsx` | Framework dependency: Excel parsing | — |
| 7 | `npm install -D winston` | Framework dependency: logging | — |
| 8 | `npm install -D @faker-js/faker` | Framework dependency: test data generation | — |
| 9 | `npm install -D jsonpath-plus` | Framework dependency: JSONPath queries | — |
| 10 | `npm install -D ajv` | Framework dependency: JSON schema validation | — |
| 11 | `npm install -D ajv-formats` | Framework dependency: format validators for Ajv | — |
| 12 | `npm install -D allure-playwright` | Framework dependency: Allure reporting | — |
| 13 | `New-Item -ItemType Directory -Force src/api, src/config, src/fixtures, src/pages, src/testdata, src/tests, src/utils, docs, rules, .github` | Create STEP 3 folder structure | All folders created. Pre-existing from earlier init: `node_modules/`, `.github/workflows/`, top-level `tests/`, `package.json`, `package-lock.json`, `playwright.config.ts`, `.gitignore`. Still missing: `.env`, `tsconfig.json` |
| 14 | `New-Item -ItemType File .gitkeep` in every empty folder (excluding `node_modules`, `.git`, `.commandcode`) | Keep empty folders in Git | `.gitkeep` added to: `docs/`, `rules/`, `src/api/`, `src/config/`, `src/fixtures/`, `src/pages/`, `src/testdata/`, `src/tests/`, `src/utils/`, and the unexpected `src/ai/`. `.github/workflows/` already has `playwright.yml`, so it was skipped. State changed externally: `.env` now exists; top-level `tests/` was removed. `tsconfig.json` still missing |

---

## 2. Key Points (given during session)

- Notes must stay in chronological order.
- Mid-session pointers from the user must be captured here, not just in the command log.
- Terminal commands must be tracked continuously.
- Two setup paths exist: the **Normal Way** (manual init) and the **Direct Playwright Setup** (single command).
- `playwright.config.ts` is "the brain of the framework".
- The framework targets multiple environments (QA / STG / PROD / DEV / API) via `.env` switching.
- `visualStep` is a custom utility built by modifying/extending Playwright's `test.step()`. It groups actions into named steps for clearer reports and readability, and takes a screenshot when each step body ends. It does not create a separate test for every action.

---

# STEP 1 — Structure of the Playwright Test

## Normal Way

1. **`npm init -y`** — starts npm and creates `package.json`. We now have an npm project.
2. **`npm install -D @playwright/test typescript @types/node`** — installs Playwright, TypeScript and Node modules; `package-lock.json` is added.
3. **`npx playwright install --with-deps`** — installs the browser dependencies.

## OR: Direct Playwright Setup (single command)

```bash
npm init playwright@latest
```

Prompt answers selected:

```
√ Do you want to use TypeScript or JavaScript? · TypeScript
√ Where to put your end-to-end tests? · tests
√ Add a GitHub Actions workflow? (Y/n) · true
√ Install Playwright browsers (can be done manually via 'npx playwright install')? (Y/n) · true
```

---

# STEP 2 — Install Framework Dependencies

```bash
npm install -D dotenv
npm install -D csv-parse
npm install -D xlsx
npm install -D winston
npm install -D @faker-js/faker
npm install -D jsonpath-plus
npm install -D ajv
npm install -D ajv-formats
npm install -D allure-playwright
```

---

# STEP 3 — Create Folder Structure

```
AdvancePlaywrightFramework
├── src/
│   ├── api/                 → API clients
│   ├── config/              → Environment configuration
│   ├── fixtures/            → Custom Playwright fixtures
│   ├── pages/               → Page Object Model
│   ├── testdata/            → Test data
│   ├── tests/               → Test cases
│   └── utils/               → Reusable utilities
├── docs/
├── rules/
├── .github/
├── .env
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

---

# STEP 4 — Create `playwright.config.ts`

This is **the brain of the framework**. It controls:

- where tests live
- timeout
- browser
- retries
- reports
- screenshots
- videos
- traces
- environment
- API project

---

# STEP 5 — Create `.env`

```env
TTA_ENV=qa
BASE_URL=https://app.thetestingacademy.com
QA_BASE_URL=https://app.thetestingacademy.com
STG_BASE_URL=https://stage.thetestingacademy.com
PROD_BASE_URL=https://app.thetestingacademy.com
DEV_BASE_URL=http://localhost:3000
API_BASE_URL=https://restful-booker.herokuapp.com
LOG_LEVEL=info
TEST_ENV=QA
TEST_AUTHOR=Pramod
USERNAME=admin
PASSWORD=ADMIN123
```

The `.env` file keeps environment-specific configuration (such as base URLs and log levels) and credentials outside the test code. This makes it easier to run the same framework against different websites or environments by changing configuration values instead of editing tests. The config loads `.env` with `dotenv` before resolving the base URL.

Keep these details in mind:

- `BASE_URL`, when set, takes precedence over `TTA_ENV` and the per-environment URL values. To switch using `TTA_ENV`, leave `BASE_URL` unset.
- dotenv values must be plain text. Write URLs as `BASE_URL=https://example.com`, not Markdown link syntax such as `[https://example.com](https://example.com/)`.
- Keep credentials and other secrets out of source control. The current `.gitignore` does not exclude `.env`; ignore it before committing and use a sanitized `.env.example` to document required variable names.

---

# STEP 6 — Add Environment Switching

```ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

function resolveBaseURL(): string {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  const env = (process.env.TTA_ENV || 'qa').toLowerCase();
  switch (env) {
    case 'api':
      return process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com';
    case 'dev':
    case 'local':
      return process.env.DEV_BASE_URL || 'http://localhost:3000';
    case 'stg':
    case 'stage':
    case 'staging':
      return process.env.STG_BASE_URL || 'https://stage.thetestingacademy.com';
    case 'prod':
    case 'production':
      return process.env.PROD_BASE_URL || 'https://app.thetestingacademy.com';
    case 'qa':
    default:
      return process.env.QA_BASE_URL || 'https://app.thetestingacademy.com';
  }
}

export default defineConfig({
  testDir: './src/tests',

  timeout: 60_000,

  expect: {
    timeout: 10_000
  },

  fullyParallel: true,

  retries: process.env.CI ? 2 : 0,

  reporter: [
    ['html'],
    ['list']
  ],

  use: {
    baseURL: resolveBaseURL(),
    screenshot: 'only-on-failure',
    video: 'on',
    trace: 'on-first-retry'
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
});
```

---

# Playwright E2E Skill Reference

Use the [The Testing Academy Playwright E2E skill](https://qaskills.sh/skills/thetestingacademy/playwright-e2e?utm_source=chatgpt.com) as a reference when creating or extending this E2E framework.

---

# STEP 7 — Create Page Object Model

Flow reference: `https://app.thetestingacademy.com/playwright/ttacart/checkout-complete`

Pages to create:

1. `LoginPage`
2. `InventoryPage`
3. `CartPage`
4. `CheckOne` (checkout step one)
5. `CheckTwo` (checkout step two)
6. `OrderConfirmation`

---

# Playwright Fixtures

## What fixtures are

Fixtures are Playwright's reusable setup-and-teardown mechanism. A test requests the fixtures it needs by naming them in its callback parameters; Playwright creates them before the test and disposes of them afterward according to their scope. This avoids repeating setup code in every test. Hooks such as `beforeEach` and `afterEach` are still useful, but fixtures package setup, the resource it creates, and cleanup into a reusable dependency.

## Built-in fixtures

| Fixture | What it provides | Scope |
|---|---|---|
| `page` | A page in a fresh browser context | Test |
| `context` | Browser context, including cookies and storage | Test |
| `browser` | Browser instance shared by tests in a worker | Worker |
| `browserName` | Current browser name, such as `chromium` | Worker |
| `request` | API request context | Test |

Example using built-in fixtures:

```ts
import { test } from '@playwright/test';

test('inspect browser and make an API request', async ({ page, context, browser, browserName, request }) => {
  console.log('Browser:', browserName);
  console.log('Browser connected:', browser.isConnected());
  console.log('Page URL:', page.url());

  const response = await request.get('https://jsonplaceholder.typicode.com/posts/1');
  console.log('API status:', response.status());

  const cookies = await context.cookies();
  console.log('Cookies:', cookies.length);
});
```

A test can request only the fixtures it uses. For example, a page-object test can ask for `{ page }`, then construct `LoginPage`, `InventoryPage`, or other page objects using that page.

## Custom fixtures

Custom fixtures extend Playwright's `test` object with project-specific resources such as page objects or a page that has already completed a common login flow. They are usually defined in a shared file such as `src/fixtures/test-base.ts`, then imported from that file by tests that need them.

```ts
import { test } from '../fixtures/test-base';

test('add an item to the cart', async ({ loginPage }) => {
  // loginPage is prepared by the custom fixture
  await loginPage.addToCart();
});
```

The fixture setup can create the page object, navigate to the login page, authenticate, and prepare the next page object. The test then focuses on its own assertions and actions instead of repeating this arrangement. Fixture names and exposed page-object methods must match the actual project implementation.

A logged-in fixture does not normally mean tests share one logged-in browser session. With the default test-scoped `page` and `context`, Playwright gives each test an isolated context; the fixture performs the login setup for each test that requests it. This improves reuse and readability, but login setup itself still runs for each test unless a different state-sharing design is deliberately configured.

## Fixtures for multi-step checkout

A fixture for the final order-confirmation page can be useful even though it is the last page in the user journey. Its purpose is to provide a ready-to-use test starting point, not necessarily to represent a page that precedes another page. To prepare it, the fixture can perform the prerequisite steps: login, inventory, cart, checkout details, and order submission. The test receives the final page object (or another deliberately exposed workflow object) with that flow completed and can verify the confirmation state.

Keep fixture setup focused on genuinely common setup. If a test needs to verify the intermediate checkout steps themselves, inject an earlier page object or compose a fixture that stops at the relevant step rather than hiding the behavior the test is meant to validate.

---

## Decisions & Configuration

- **Setup path used:** Normal Way (manual `npm init` + installs).
- **Test location:** `src/tests` (per `testDir`).
- **Default environment:** `qa` via `TTA_ENV`.
- **Base URL resolution order:** explicit `BASE_URL` → `TTA_ENV` switch → per-env fallback.
- **API URL fallback:** for `TTA_ENV=api`, use `API_BASE_URL` from the environment (or `.env` when loaded); if it is missing or empty, fall back to the hardcoded `https://restful-booker.herokuapp.com` URL.
- **Reporters:** `html` + `list`.
- **Capture policy:** screenshot on failure, video always on, trace on first retry.
- **Retries:** 2 only when `CI` is set.
- **Parallelism:** `fullyParallel: true`, `timeout` 60s, `expect` timeout 10s.
- **Browser:** `chromium` (Desktop Chrome) only, for now.

---

## Notes & Clarifications

### TypeScript path aliases and relative imports

The project configures aliases in `tsconfig.json` under `compilerOptions.paths`:

```json
"module": "NodeNext",
"moduleResolution": "NodeNext",
"paths": {
  "@/*": ["./src/*"],
  "@utils/*": ["./src/utils/*"]
}
```

- `@/*` maps imports starting with `@/` to the `src/` directory. For example, `@/utils/UtilElementLocator` points to `src/utils/UtilElementLocator.ts`.
- `@utils/*` is a narrower alias for utilities. For example, `@utils/UtilElementLocator` resolves to the same file.
- Relative imports such as `../utils/UtilElementLocator` continue to work. Aliases are optional shortcuts; adding them does not disable relative paths, so both styles can coexist.
- `paths` helps TypeScript and editor tooling resolve import names; it does not rewrite import strings in emitted JavaScript. If an alias works in the editor but fails when tests run, the test/runtime tool must also support the configured aliases or be configured separately.
- After changing `tsconfig.json`, restart the editor's TypeScript server if diagnostics do not refresh.

`npm init playwright@latest` does not generate a `tsconfig.json` in every setup. Adding aliases later is a one-time project configuration, not a per-file or per-import setup step.

### Actual repo state vs documented steps

- `playwright.config.ts` is still the **default scaffold**: `testDir: './tests'` (folder no longer exists), 3 browsers (chromium/firefox/webkit), dotenv import commented out. The STEP 5/6 custom version has not been applied yet.
- `package.json` includes `typescript` as a dev dependency, so `tsc` can use the project's `tsconfig.json`.

### Flexible locator type and logger scope

A locator utility can accept both selector strings and Playwright `Locator` objects. This lets callers use CSS/XPath selectors or Playwright locator methods such as `page.getByTestId()` and `page.getByRole()`.

```ts
export type Flex = string | Locator;
```

`Flex` is a TypeScript union type: a value of this type can be either a string or a `Locator`. For example, a string might be `'[data-qa="x"]'`, while a Playwright locator might be `page.getByTestId('username')`. A utility can use this type to support either locator style.

`UtilElementLocator` accepts a `scope` string in its constructor, defaulting to `'UtilElementLocator'`. It passes that value to `createLogger(scope)`, which returns a Winston child logger tagged with the scope. Logs from the utility therefore identify their source. Callers can provide a different scope, such as `'LoginPage'` or `'InventoryPage'`, so their log entries carry that label instead.

---

# API Testing with Playwright

```ts
import {test, expect} from '@playwright/test';
import { request } from 'node:http';

// Ping Request.
// Ping request help you to test if the server is up.
// Basically communication btw Client - Server to check if all well.

// HTTP Get -> https://restful-booker.herokuapp.com/ping

// Notes: https://app.thetestingacademy.com/playwright/learn/playwright-api/

test('Ping request - GET', async({ request }) => {

    const responseData = request.get('/ping');
    // in this repo baseURL will be fetched from "playwright.config.json" file
    // under function resolveBaseUrl() -> switch(env) -> case 'API': return process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com'

    // Before running any kindof api test case, run the below command
    // export TTA_ENV=api npx playwright test e2e.spec.ts

    // you can to export the api, you have to tell him that you are running a API Test Case,
    // The command will change

    // In this way the Advantage is: You do not have to type the baseURL.
    // Base URL Will automatically come from the playwright.config.json configuration
    // So you just have to add end point 


});
```

```ts
import{test,expect} from '@playwright/test';
import {request} from 'node:http';
import { Logger } from '@/utils/logger';

test('TC#01 @p0 - POST : Verify  that create bookinng is working fine', async({request}) => {

    // To Make a POST Request we have certain things to understand

    // What is the URL that we are using => https://restful-booker.herokuapp.com/booking
    // What is the HTTP Method that we are using: POST
    // Request PAYLOAD/ request body -> simple json file or js object
    // Headers need to set -> content-type json
    // Authentication? for POST we don't have authentication here
    // 

});
```

## API Notes

### API Helper — `src/utils/ApiHelper.ts`

`ApiHelper` is a reusable Playwright HTTP client for test cases. It accepts either a `Page` or `APIRequestContext`, defines request options such as headers, body data, query parameters, and timeout, and supports GET, POST, PUT, PATCH, and DELETE. Its helper methods centralize request setup and response handling so API tests avoid repeating boilerplate.

#### `ApiContext`

```ts
export type ApiContext = Page | APIRequestContext;
```

`ApiContext` can hold both a Playwright `Page` and an `APIRequestContext`.

- Use `Page` when the API helper is used from a UI test case.
- Use `APIRequestContext` when the API helper is used from an API test case.
- The `|` is a TypeScript union (an "OR" condition). It means `ApiContext` may be either of these two types, not both at the same time.

This makes the API helper flexible: the caller can provide whichever context is appropriate for the test.

### New Context — `03_newContext_api.spec.ts`

Use a separate API request context when a test needs to target a different API, such as GoREST, without changing the shared Playwright configuration or the existing Restful Booker tests. The new context has its own `baseURL`, headers, and timeout settings.

```ts
import { expect, request, test } from '@playwright/test';

test('use an isolated context for GoREST', async () => {
  const ctx = await request.newContext({
    baseURL: 'https://gorest.in',
    extraHTTPHeaders: { 'X-Trace-Id': 'demo-123' },
    timeout: 15_000,
  });

  const response = await ctx.get('/public/v2/users');
  expect(response.ok()).toBeTruthy();

  await ctx.dispose();
});
```

The context can target `https://gorest.in/public/v2/users` while the rest of the suite continues using its configured API. Dispose of the context when the test is done to release its resources.

### PUT — Update an existing booking

A PUT request to update a Restful Booker booking requires both an auth token and a booking ID. Create the token with the Auth POST endpoint and create the booking with the Booking POST endpoint first; attempting the PUT without authentication is forbidden.

```ts
test.describe('Restful Booker booking API', () => {
    
    // If you want to make PUT request,
    // You need to make sure that you create a token - Post Auth -> will five you token
    // For that Post request first
    // Then you have to Create a Booking -> Post Booking - it will give you a booking ID
    // By using this token and booking Id only we can make a PUT Request
    // You can not make a PUT Request directly, If you try it'll give you a forbidden

    test('TC#2 @p0 - PUT : Verify that update the existing booking is working fine.', async({ request }) => {

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        const payload = {
            firstname: 'Pramod',
            lastname: 'Dutta',
            totalprice: 111,
            depositpaid: true,
            bookingdates: {
                checkin: '2018-01-01',
                checkout: '2019-01-01',
            },
            additionalneeds: 'Breakfast',
        };

        let token ='';
        let bookingId = 0;

        await test.step('Step 1 - Create Auth token', async() => {

        });

        await test.step('Step 2 - Create Booking to Update', async() => {

        });

        await test.step('Step 3 - Update Booking', async() => {

        });
        
    });
});
```

---

## Open Items / Follow-ups

- Create `tsconfig.json` (and install `typescript`) if type-checking/aliases are wanted.
- Apply the STEP 6 config (custom `testDir: './src/tests'`, env switching, reporters, chromium only) over the default scaffold.
- Decide whether Allure reporter replaces/joins the html + list reporters.
- Add API project (mentioned under config responsibilities) when API tests begin.

---

## Session Status

**Closed** — user called "stop".

- Documentation covers STEP 1 through STEP 7 plus the alternative direct setup.
- Commands logged: 1–14 (14 = `.gitkeep` creation).
- Folder structure created and all empty folders kept in Git via `.gitkeep`.
- `src/utils/CustomReporter.ts` exists in the workspace (added outside this session).
- Remaining gaps: `tsconfig.json` not present.
