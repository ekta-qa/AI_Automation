# SauceDemo Playwright Suite

This repository contains a Playwright UI automation suite for `https://www.saucedemo.com`.

## Project structure

- `package.json` — project dependencies and test script
- `playwright.config.ts` — Playwright configuration
- `tsconfig.json` — TypeScript settings
- `tests/sauce-demo.spec.ts` — UI test suite covering login, product selection, and checkout flows

## Install dependencies

```bash
npm install
```

## Run tests

```bash
npx playwright test
```

To run only the Chromium project:

```bash
npx playwright test --project=chromium
```

## Test coverage

The suite contains exactly 6 tests:

1. Login Flow
   - Happy path: valid login redirects to `/inventory.html`
   - Negative check: locked out user sees a lockout error
2. Product Search & Selection Flow
   - Happy path: add "Sauce Labs Backpack" to cart and verify badge count
   - Edge check: sort items Low to High and verify first item is "Sauce Labs Onesie"
3. Checkout Flow
   - Happy path: complete checkout and verify thank you message
   - Negative check: missing first name shows required error

## Notes

- Uses Playwright auto-waiting and modern locator APIs.
- No hardcoded pauses are used.
