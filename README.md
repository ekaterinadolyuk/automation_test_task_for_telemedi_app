# Telemedi — Playwright automation tests

End-to-end tests for the Telemedi patient panel
([testyautomatyczne.telemedi.com/pl](https://testyautomatyczne.telemedi.com/pl)), written in
**Playwright + TypeScript**.

## Requirements

- Node.js 18 or newer (developed on Node 24)
- Git

## Run the tests with one command

Credentials are **not** stored in this repository, so pass them to the command below.
Replace `<email>` and `<password>` with the test-account credentials.

**Git Bash / macOS / Linux**

```bash
git clone https://github.com/ekaterinadolyuk/automation_test_task_for_telemedi_app.git && cd automation_test_task_for_telemedi_app && npm install && TM_EMAIL='<email>' TM_PASSWORD='<password>' npm test
```

**Windows PowerShell**

```powershell
git clone https://github.com/ekaterinadolyuk/automation_test_task_for_telemedi_app.git; cd automation_test_task_for_telemedi_app; npm install; $env:TM_EMAIL='<email>'; $env:TM_PASSWORD='<password>'; npm test
```

`npm install` also downloads the Chromium browser automatically, so there is no extra setup step.

### Repeat runs

To avoid retyping the credentials, copy `.env.example` to `.env` and fill it in once — the file is
git-ignored:

```bash
cp .env.example .env   # then edit TM_EMAIL and TM_PASSWORD
npm test
```

## How the projects fit together

The suite is split into two Playwright projects, wired together in [`playwright.config.ts`](playwright.config.ts):

| Project | What it does |
| ------- | ------------ |
| `login` | Logs in through the UI and saves the authenticated session to `playwright/.auth/user.json`. |
| `home`  | Declares `dependencies: ['login']` and reuses that session, so its tests start already logged in. |

Because `home` depends on `login`, running any test triggers the login first — a single time per run,
not once per test. Adding a new feature project is a matter of copying the `home` entry and keeping
the same `dependencies` and `storageState`.

## Useful commands

| Command | Description |
| ------- | ----------- |
| `npm test` | Run every project (`login`, then `home`) |
| `npm run test:home` | Run only the `home` project (still logs in first) |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:ui` | Open the Playwright UI mode |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | Type-check without running tests |

## Project structure

```
├── playwright.config.ts     # projects, dependencies, shared settings
├── src
│   ├── config/env.ts        # base URL, credentials, storage-state path
│   └── pages                # page objects (LoginPage, HomePage)
└── tests
    ├── auth/login.setup.ts  # the `login` project
    └── home/home.spec.ts    # the `home` project
```
