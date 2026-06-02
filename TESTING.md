# Testing Guide

This guide covers testing strategies and setup for the Wave Chat Application.

## Test Structure

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── lib/
│   │   ├── utils/
│   │   └── models/
│   ├── integration/
│   │   ├── api/
│   │   └── auth/
│   └── e2e/
└── ...
```

## Unit Testing

### Setup Jest

```bash
npm install --save-dev jest @types/jest ts-jest
```

Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.tsx',
  ],
};
```

### Example Unit Test

```typescript
// src/__tests__/unit/lib/jwt.test.ts
import { generateAccessToken, verifyAccessToken, isTokenExpired } from '@/lib/jwt';

describe('JWT utilities', () => {
  it('should generate and verify access token', () => {
    const payload = {
      userId: 'user123',
      phoneNumber: '+1234567890',
      isVerified: true,
    };

    const token = generateAccessToken(payload);
    const verified = verifyAccessToken(token);

    expect(verified).toBeDefined();
    expect(verified?.userId).toBe(payload.userId);
  });

  it('should detect expired token', () => {
    const expiredToken = '******'; // expired token
    expect(isTokenExpired(expiredToken)).toBe(true);
  });
});
```

### Example Validation Test

```typescript
// src/__tests__/unit/lib/validation.test.ts
import { registerSchema, validateRequest } from '@/lib/validation';

describe('Validation schemas', () => {
  it('should validate correct registration data', async () => {
    const data = {
      phoneNumber: '+1234567890',
      name: 'John Doe',
    };

    const result = await validateRequest(data, registerSchema);
    expect(result.phoneNumber).toBe(data.phoneNumber);
  });

  it('should reject invalid phone number', async () => {
    const data = {
      phoneNumber: '123', // too short
      name: 'John Doe',
    };

    await expect(validateRequest(data, registerSchema)).rejects.toThrow();
  });
});
```

## Integration Testing

### Example API Test

```typescript
// src/__tests__/integration/api/auth.test.ts
import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

describe('Auth API', () => {
  it('should register a new user', async () => {
    const request = new NextRequest(new URL('http://localhost/api/auth/register'), {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '+1234567890',
        name: 'John Doe',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.userId).toBeDefined();
  });

  it('should reject duplicate phone number', async () => {
    const request = new NextRequest(new URL('http://localhost/api/auth/register'), {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber: '+1234567890', // already registered
        name: 'Jane Doe',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });
});
```

## E2E Testing with Playwright

### Setup Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

Create `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example E2E Test

```typescript
// src/__tests__/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user registration flow', async ({ page }) => {
  await page.goto('/');

  // Fill registration form
  await page.fill('input[name="phoneNumber"]', '+1234567890');
  await page.fill('input[name="name"]', 'John Doe');
  await page.click('button:has-text("Register")');

  // Verify verification code page
  await expect(page).toHaveURL(/.*verify/);
  await expect(page.locator('text=Enter verification code')).toBeVisible();
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- jwt.test.ts

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automatically:
- Runs linting
- Builds the application
- Executes all tests
- Uploads coverage reports

## Test Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Best Practices

1. **Test isolation**: Each test should be independent
2. **Meaningful assertions**: Use descriptive matchers
3. **Cleanup**: Clean up after each test
4. **Mocking**: Mock external dependencies
5. **Descriptive names**: Use clear test descriptions

Example:
```typescript
describe('markMessageAsRead', () => {
  it('should add user to readBy array when marking message as read', async () => {
    // Setup
    const message = await Message.create({ /* ... */ });
    const userId = 'user123';

    // Act
    await markMessageAsRead(message._id, userId);

    // Assert
    const updatedMessage = await Message.findById(message._id);
    expect(updatedMessage.readBy).toContainEqual(
      expect.objectContaining({ userId: new ObjectId(userId) })
    );
  });
});
```

## Mocking Database

```typescript
import mongoose from 'mongoose';

// Mock MongoDB connection
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(mongoose),
}));

// Use in-memory MongoDB for tests
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
});

afterAll(async () => {
  await mongoServer.stop();
});
```

## Debugging Tests

```bash
# Run tests with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open chrome://inspect in Chrome DevTools
```

## Performance Testing

```typescript
it('should process 1000 messages in under 500ms', async () => {
  const start = performance.now();
  
  for (let i = 0; i < 1000; i++) {
    await Message.create({ /* ... */ });
  }
  
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(500);
});
```

## Continuous Testing

Enable pre-commit hooks:

```bash
npm install --save-dev husky lint-staged

npx husky install
npx husky add .husky/pre-commit "npm run lint && npm test"
```

This ensures tests pass before commits.
