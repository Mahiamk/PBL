# Frontend Test Suite Documentation

This directory contains comprehensive tests for the PBL frontend application.

## Test Structure

```
__tests__/
├── setup.js                      # Test setup and mocks
├── unit/                         # Unit tests
│   ├── utils.test.js             # Utility function tests
│   └── api.test.js               # API module tests
├── component/                    # Component tests
│   ├── AuthContext.test.jsx      # Authentication context tests
│   ├── CartContext.test.jsx      # Shopping cart context tests
│   ├── Orders.test.jsx           # Order functionality tests
│   └── Appointments.test.jsx     # Appointment booking tests
└── integration/                  # Integration tests
    └── userFlows.test.jsx        # Complete user flow tests
```

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npx vitest src/__tests__/unit/utils.test.js
```

## Test Categories

### Unit Tests

Test individual functions in isolation:

- **utils.test.js**: Class name merging (`cn`), price formatting, cart calculations, date formatting, validation helpers
- **api.test.js**: API configuration, request functions, error handling

### Component Tests

Test React contexts and component logic:

- **AuthContext.test.jsx**: Authentication state, login/logout, role-based access, localStorage persistence
- **CartContext.test.jsx**: Add/remove items, quantity updates, cart calculations, persistence
- **Orders.test.jsx**: Order creation, payment methods, status management, 3NF compliance
- **Appointments.test.jsx**: Booking creation, time slots, service providers, cancellation rules

### Integration Tests

Test complete user flows:

- **userFlows.test.jsx**: Customer shopping flow, vendor dashboard, appointment booking, admin management

## Test Configuration

### Vitest Configuration (`vite.config.js`)

```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/__tests__/setup.js',
  include: ['src/**/*.{test,spec}.{js,jsx}']
}
```

### Setup File (`setup.js`)

- Imports `@testing-library/jest-dom` matchers
- Mocks `localStorage` API
- Mocks `window.location`
- Resets mocks before each test

## Mocking Strategy

### API Mocking

```javascript
vi.mock('../../lib/api', () => ({
  login: vi.fn(),
  fetchProducts: vi.fn()
}));
```

### localStorage Mocking

```javascript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = localStorageMock;
```

## Test Coverage

Run coverage report:

```bash
npm run test:coverage
```

Coverage reports are generated in:
- `coverage/` directory (HTML report)
- Console output (text summary)

## Notes on Normalized Schema

Tests verify backward compatibility with normalized backend:

- **Orders**: Tests expect `payment_method` as string (backend converts from PAYMENT_METHOD table)
- **Appointments**: Tests expect `barber_name`, `service_name`, `booking_date` fields (backend provides via @property decorators from normalized tables)
