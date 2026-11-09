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

### Why there is no `tsconfig.json`

- `npm init playwright@latest` does **not** generate a `tsconfig.json` — it only creates `playwright.config.ts`, `tests/`, `package.json`, `.gitignore` and the GitHub workflow.
- Playwright transpiles TypeScript internally, so tests run without a tsconfig.
- `package.json` also has no `typescript` devDependency (the "Normal Way" step 2 would have added it), so there is no `tsc` to consume a tsconfig.
- A tsconfig is only needed for editor/type-checking support, strict settings, and path aliases (e.g. `@pages/*`). Adding one requires `npm i -D typescript` as well.

### Actual repo state vs documented steps

- `playwright.config.ts` is still the **default scaffold**: `testDir: './tests'` (folder no longer exists), 3 browsers (chromium/firefox/webkit), dotenv import commented out. The STEP 5/6 custom version has not been applied yet.
- `package.json` shows `@playwright/test`, `@types/node` and the STEP 2 libraries — but no `typescript`.

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
