# Telemedi — Playwright automation tests

[![Playwright tests](https://github.com/ekaterinadolyuk/automation_test_task_for_telemedi_app/actions/workflows/playwright.yml/badge.svg)](https://github.com/ekaterinadolyuk/automation_test_task_for_telemedi_app/actions/workflows/playwright.yml)

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
| `user-profile` | Checks that personal data in the profile is read-only. |
| `remote-consultation` | Covers an open defect in the remote consultation channel hints. **Expected to fail** — see below. |

New feature projects should copy the `home` entry, keeping the same `dependencies` and `storageState`.

### Known failing test

`tests/remote-consultation/e_dolyuk_channel_hint_known_bug.spec.ts` documents an open defect: selecting
**Czat** or **Wideo** shows the hint `Wymagane zalogowanie na konto pacjenta.` — a prompt to log in,
shown to a patient who is already logged in — instead of explaining the channel, and both channels
share that one string.

The test is marked `test.fail()` and tagged `@known-bug`, so **Playwright expects it to fail**. It is
reported as `x` in the run output and the suite still finishes green:

```
x  [remote-consultation] › @known-bug every channel explains itself ...
2 passed
```

When the hints are fixed the test will start passing, Playwright will report *"expected to fail but
passed"* and turn the run red — that is the signal to delete the `test.fail()` annotation. To run
everything except this test: `npx playwright test --grep-invert @known-bug`.

## Commands

| Command | Description |
| ------- | ----------- |
| `npm test` | Run every project |
| `npm run test:home` | Run only the `home` project |
| `npm run test:prescription` | Run only the `prescription` project |
| `npm run test:user-profile` | Run only the `user-profile` project |
| `npm run test:remote-consultation` | Run only the `remote-consultation` project (expected to fail) |
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
    ├── prescription/e_dolyuk_test.spec.ts   # the `prescription` project
    ├── user-profile/e_dolyuk_user_profile_test.spec.ts
    └── remote-consultation/e_dolyuk_channel_hint_known_bug.spec.ts   # known bug, expected to fail
```
