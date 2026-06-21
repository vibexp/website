# E2E Tests with Playwright - Website

This directory contains end-to-end tests for the VibExp.io official website using Playwright.

## Setup

Playwright is already installed as a dev dependency. To install browsers:

```bash
npx playwright install
```

## Running Tests

### Local Development (with Vite dev server)

```bash
# Run all e2e tests in headless mode
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report after running tests
npm run test:e2e:report
```

The dev server will start automatically when running tests locally (configured in `playwright.config.ts`).

### Running Specific Test Files

```bash
# Run only homepage tests
npx playwright test homepage

# Run only contact form tests
npx playwright test contact-form

# Run only mobile responsiveness tests
npx playwright test responsive

# Run only navigation tests
npx playwright test navigation

# Run only performance tests
npx playwright test performance
```

### Running Tests Against Production Build

```bash
# Build the website
npm run build

# Preview the production build
npm run preview

# In another terminal, run tests
PLAYWRIGHT_BASE_URL=http://localhost:4173 npm run test:e2e
```

## Test Structure

### Test Files

- **`homepage.spec.ts`** - Tests for homepage functionality, navigation, hero section, footer, and basic page structure
- **`contact-form.spec.ts`** - Tests for contact form validation, submission, and user interactions
- **`navigation.spec.ts`** - Tests for navigation between pages, browser back/forward buttons, consistent header/footer
- **`responsive.spec.ts`** - Tests for mobile, tablet, and desktop responsiveness across different viewport sizes
- **`performance.spec.ts`** - Tests for page load times, resource loading, console errors, and SEO meta tags

## Browser Support

Tests are configured to run on:
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)

## Test Coverage

### Homepage Tests
- Page loading and title verification
- Hero section display
- Navigation menu functionality
- Feature tab interactions
- Footer presence
- Image loading
- Links to privacy policy and terms

### Contact Form Tests
- Form field visibility
- Form validation (empty fields)
- Email format validation
- Name length validation
- Message length validation
- Character counter
- Optional phone field
- Contact information display
- Error clearing on user input
- Submit button states

### Navigation Tests
- Navigation to all feature pages
- Consistent header across pages
- Consistent footer across pages
- Return to homepage
- Browser back/forward button handling

### Responsive Design Tests
- Mobile viewport (375x667 - iPhone SE)
- Tablet viewport (768x1024 - iPad)
- Desktop viewport (1920x1080)
- No horizontal scroll on mobile
- Mobile-friendly text sizes
- Touch-friendly button sizes
- Proper layout at different screen sizes
- Window resize handling

### Performance Tests
- Page load times (< 5 seconds)
- DOM size checks
- Critical resource loading (JS/CSS bundles)
- Navigation speed (< 2 seconds)
- Console error detection
- SEO meta tags verification
- Viewport meta tag
- Core Web Vitals metrics

## Configuration

Test configuration is in `playwright.config.ts`:

- **Test directory**: `./e2e`
- **Timeout**: 15 seconds per test
- **Retries**: 2 retries on CI, 0 locally
- **Parallel execution**: Yes locally, sequential on CI
- **Screenshot**: On failure only
- **Video**: Retained on failure
- **Trace**: On first retry

## CI/CD Integration

Tests are integrated with GitHub Actions via the workflow file `.github/workflows/website-e2e-tests.yml`. The workflow:

- Triggers manually via `workflow_dispatch`
- Installs dependencies and browsers
- Starts the dev server
- Runs all E2E tests
- Uploads test results and reports as artifacts
- Supports both Chromium and Firefox browsers

## Writing New Tests

1. Create a new spec file in the `e2e/` directory with the `.spec.ts` extension
2. Import Playwright test utilities:
   ```typescript
   import { test, expect } from '@playwright/test'
   ```
3. Organize tests with `test.describe()` blocks
4. Use `test.beforeEach()` for common setup
5. Write descriptive test names
6. Use Playwright's locators and assertions:
   ```typescript
   await expect(page.locator('selector')).toBeVisible()
   ```

### Best Practices

- ✅ Use semantic selectors (`getByRole`, `getByLabel`, `getByText`)
- ✅ Wait for elements naturally (Playwright auto-waits)
- ✅ Use descriptive test names that explain what is being tested
- ✅ Group related tests with `test.describe()`
- ✅ Test critical user journeys
- ✅ Verify both happy paths and error states
- ✅ Keep tests independent and isolated
- ✅ Use `test.beforeEach()` to reduce duplication
- ✅ Avoid hard-coded waits (`page.waitForTimeout()`) when possible
- ❌ Don't test implementation details
- ❌ Don't make tests dependent on each other
- ❌ Don't use brittle selectors (like CSS classes that might change)

## Environment Variables

- `PLAYWRIGHT_BASE_URL`: Base URL for the application (default: http://localhost:5173)
- `CI`: Set automatically in CI environment for retry and parallelization configuration

## Troubleshooting

### Tests fail with "Element not found"
- Ensure the dev server is running (`npm run dev`)
- Check if selectors have changed in the UI
- Use `test:e2e:headed` to see what's happening in the browser

### Tests fail with timeout errors
- Increase timeout in `playwright.config.ts` if needed
- Check network speed and server startup time
- Verify the application is loading correctly

### Flaky tests
- Add appropriate `waitFor` calls if needed
- Use Playwright's built-in auto-waiting features
- Check for race conditions in async operations
- Review test for environmental dependencies

### Screenshot and video artifacts
- After test failure, check `test-results/` directory
- Screenshots and videos are saved automatically on failure
- Use these to debug what went wrong visually

## Debugging

### Debug Mode
```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector where you can:
- Step through tests line by line
- Inspect the page at any point
- View locators and selectors
- See console logs and network activity

### UI Mode
```bash
npm run test:e2e:ui
```

This opens Playwright's UI mode where you can:
- See all tests in a visual interface
- Run tests individually or in groups
- Watch tests run in real-time
- Time-travel through test execution
- Inspect DOM and network

### View Test Reports
```bash
npm run test:e2e:report
```

Opens the HTML report showing:
- Test results and status
- Screenshots and videos of failures
- Detailed test traces
- Performance metrics

## Maintenance

- **Update tests** when UI changes significantly
- **Add new tests** for new features or pages
- **Review flaky tests** and fix or remove them
- **Keep dependencies updated** (Playwright, browsers)
- **Monitor test execution time** and optimize slow tests

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Writing Tests Guide](https://playwright.dev/docs/writing-tests)
