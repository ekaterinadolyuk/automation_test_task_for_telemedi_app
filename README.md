# Telemedi — Playwright automation tests

End-to-end tests for the Telemedi patient panel
([testyautomatyczne.telemedi.com/pl](https://testyautomatyczne.telemedi.com/pl)), written in
**Playwright + TypeScript**.

## Prerequisites

- Node.js 18+
- A `.env` file in the project root:

  ```
  TM_BASE_URL=https://testyautomatyczne.telemedi.com

  TM_EMAIL=<test account email>
  TM_PASSWORD=<test account password>

  TM_PATIENT_NAME=<patient name shown in the app>
  TM_PATIENT_PESEL=<masked PESEL shown in the app>
  TM_PATIENT_BIRTH_DATE=<date of birth shown in the app>
  ```

## Project setup

```bash
npm install
```

## Run the tests

```bash
npm test
```

## Projects

Defined in [`playwright.config.ts`](playwright.config.ts):

| Project | Description |
| ------- | ----------- |
| `login` | Logs in through the UI and saves the session to `playwright/.auth/user.json`. |
| `home`  | Declares `dependencies: ['login']` and reuses that session. Opens the homepage as a logged-in patient. |
| `prescription` | Books a prescription consultation up to the handover to the payment operator, then cancels the reservation. |

New feature projects should copy the `home` entry, keeping the same `dependencies` and `storageState`.

## Commands

| Command | Description |
| ------- | ----------- |
| `npm test` | Run every project |
| `npm run test:home` | Run only the `home` project |
| `npm run test:prescription` | Run only the `prescription` project |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | Type-check without running tests |

## Project structure

```
├── playwright.config.ts     # projects, dependencies, shared settings
├── src
│   ├── config/env.ts        # base URL, credentials, storage-state path
│   ├── data/constants.ts    # medicine and doctor test data
│   └── pages                # page objects
└── tests
    ├── auth/login.setup.ts                  # the `login` project
    ├── home/home.spec.ts                    # the `home` project
    └── prescription/e_dolyuk_test.spec.ts   # the `prescription` project
```
