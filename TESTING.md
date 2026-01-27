# Testing Guide - AI Med Patient Portal

Comprehensive testing guide for the AI Med Patient Portal frontend application.

## Test Structure

```
ai-med-frontend-patient/
├── lib/
│   └── __tests__/          # Unit tests for utilities
│       ├── api-client.test.ts
│       ├── env-validation.test.ts
│       ├── error-handler.test.ts
│       └── pdf-utils.test.ts
├── shared/
│   ├── hooks/
│   │   └── __tests__/      # Integration tests for hooks
│   │       └── usePatientAuth.test.tsx
│   └── ui/
│       └── __tests__/       # Component unit tests
│           └── badge.test.tsx
├── components/
│   └── __tests__/          # Component tests
│       └── error-boundary.test.tsx
├── e2e/                    # End-to-end tests
│   ├── login.spec.ts
│   ├── portal.spec.ts
│   └── labs.spec.ts
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Jest setup file
└── playwright.config.ts    # Playwright configuration
```

## Running Tests

### Unit & Integration Tests (Jest)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test api-client.test.ts
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific test file
npm run test:e2e e2e/login.spec.ts
```

## Test Types

### 1. Unit Tests

Unit tests test individual functions and utilities in isolation.

**Location:** `lib/__tests__/`, `shared/ui/__tests__/`

**Examples:**
- Environment validation
- API client functions
- PDF utilities
- Error handling
- UI components

### 2. Integration Tests

Integration tests test how multiple units work together.

**Location:** `shared/hooks/__tests__/`

**Examples:**
- `usePatientAuth` hook with API client
- Component interactions with hooks

### 3. End-to-End Tests

E2E tests test the complete user workflows in a real browser.

**Location:** `e2e/`

**Examples:**
- Login flow
- Portal navigation
- Data display
- PDF export
- Print functionality

## Writing Tests

### Unit Test Example

```typescript
import { getEnvConfig } from "../env-validation";

describe("env-validation", () => {
  it("should validate API URL", () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:3001";
    const config = getEnvConfig();
    expect(config.apiBaseUrl).toBe("http://localhost:3001");
  });
});
```

### Component Test Example

```typescript
import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge", () => {
  it("should render with success variant", () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText("Success")).toHaveClass("bg-green-100");
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";

test("should login successfully", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', "demo@example.com");
  await page.fill('input[type="password"]', "demo123");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/portal/);
});
```

## Test Coverage

Current coverage targets:
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

View coverage report:
```bash
npm run test:coverage
```

Open `coverage/lcov-report/index.html` in your browser.

## Error Handling Tests

All error handling should:
- ✅ Not expose PHI in error messages
- ✅ Provide user-friendly error messages
- ✅ Log errors appropriately (development only)
- ✅ Handle network errors gracefully
- ✅ Handle timeout errors
- ✅ Handle API errors (4xx, 5xx)

## HIPAA Compliance in Tests

When writing tests:
- ✅ Use mock data (no real PHI)
- ✅ Sanitize error messages
- ✅ Don't log PHI in test output
- ✅ Use demo mode for E2E tests
- ✅ Clear sensitive data after tests

## Continuous Integration

Tests should run in CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    npm test
    npm run test:e2e
```

## Debugging Tests

### Jest Tests

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test with verbose output
npm test -- --verbose api-client.test.ts
```

### Playwright Tests

```bash
# Run in debug mode (opens Playwright Inspector)
npm run test:e2e:debug

# Run with headed browser
npx playwright test --headed

# Run with slow motion
npx playwright test --slow-mo=1000
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Test what the user sees/experiences
   - Don't test internal implementation details

2. **Keep Tests Simple**
   - One assertion per test when possible
   - Use descriptive test names

3. **Use Mocks Wisely**
   - Mock external dependencies
   - Don't over-mock (test real behavior when possible)

4. **Test Error Cases**
   - Network failures
   - Invalid input
   - Edge cases

5. **Maintain Test Data**
   - Use fixtures for consistent test data
   - Keep test data up to date with API contracts

## Troubleshooting

### Tests Failing After Code Changes

1. Clear Jest cache: `npm test -- --clearCache`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for breaking changes in dependencies

### E2E Tests Timing Out

1. Increase timeout in `playwright.config.ts`
2. Check if dev server is running
3. Verify test selectors are correct

### Coverage Not Updating

1. Ensure tests are actually running
2. Check `jest.config.js` coverage paths
3. Verify files are not excluded

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Happy Testing! 🧪**
