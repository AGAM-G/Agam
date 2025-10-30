# Agam - Test Automation Platform Guide

## 🎯 Overview

Agam is a comprehensive test automation platform that allows you to easily run, monitor, and track various types of tests through a beautiful UI. No more terminal commands – everything is accessible through an intuitive dashboard!

## ✨ Features

- **📊 Test Discovery**: Automatically scans and registers all tests from your backend
- **▶️ One-Click Execution**: Run tests directly from the UI with a single click
- **📈 Historical Tracking**: View test results history and trends over time
- **🎨 Beautiful UI**: Modern, dark-mode enabled interface
- **🔄 Real-time Updates**: See test execution status in real-time
- **📝 Detailed Results**: View test errors, logs, and stack traces

## 🧪 Test Types Supported

### 1. API Tests (Jest + Axios)
- **Location**: `backend/tests/api/`
- **Framework**: Jest with Axios for HTTP requests
- **Purpose**: Test REST APIs for functionality, response codes, data validation
- **Current Tests**:
  - JSONPlaceholder API (Posts, Users, Comments)
  - HTTPBin API (HTTP methods, headers, auth)
  - RestCountries API (Country data, search, filters)

### 2. Load Tests (K6)
- **Location**: `backend/tests/load/`
- **Framework**: K6 (Grafana's load testing tool)
- **Purpose**: Performance testing, stress testing, spike testing
- **Current Tests**:
  - `api-load-test.js`: Gradual load test with 10 virtual users
  - `spike-test.js`: Spike test from 5 to 50 users
  - `stress-test.js`: Extended stress test up to 40 users

### 3. UI Tests (Playwright)
- **Location**: `backend/tests/ui/`
- **Framework**: Playwright
- **Purpose**: Test UI components and interactions on web pages
- **Current Tests**:
  - Wikipedia UI tests (search, navigation, language switching)
  - Example.com UI tests (page load, links, mobile viewport)
  - HTTPBin UI tests (homepage, navigation)

### 4. E2E Tests (Playwright)
- **Location**: `backend/tests/e2e/`
- **Framework**: Playwright
- **Purpose**: Full end-to-end user flows across multiple pages
- **Current Tests**:
  - Wikipedia search flow (homepage → search → results)
  - Shopping cart flow (browse → add to cart → checkout)
  - Multi-step user journeys

## 🚀 Getting Started

### Prerequisites

1. **Node.js & npm** (already installed)
2. **PostgreSQL Database** (already configured)
3. **K6** (for load tests) - Optional, install from: https://k6.io/docs/getting-started/installation/

### Installation

All test dependencies are already installed! But if you need to reinstall:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Database Setup

Your database already has the necessary tables. Make sure your database is running:

```bash
docker-compose up -d
```

## 📖 How to Use

### Step 1: Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Step 2: Discover Tests

1. Navigate to the **Test Runner** page in the UI
2. Click the **"Discover Tests"** button
3. The system will scan the `backend/tests/` directory and register all tests

You should see tests discovered:
- ✅ API Tests: ~40+ test cases across 3 files
- ✅ Load Tests: 3 test files
- ✅ UI Tests: ~15+ test cases across 2 files
- ✅ E2E Tests: ~8+ test cases across 2 files

### Step 3: Run Tests

1. In the Test Runner page, you'll see cards for each test file
2. Each card shows:
   - **Test Suite Name** (e.g., "JSONPlaceholder API - Posts")
   - **Test Type Badge** (API, LOAD, UI, E2E)
   - **Number of Test Cases**
   - **Current Status** (pending, passed, failed)
3. Click **"Run Tests"** on any card to execute that test file
4. Tests will run in the background
5. Results appear in the **History** page

### Step 4: View Results

1. Navigate to the **History** page
2. See all test run history with:
   - Run name and timestamp
   - Duration
   - Pass/fail counts
   - Status badges
3. Click on any run to see detailed results

## 🔧 Manual Test Execution (Optional)

You can also run tests manually from the terminal:

```bash
cd backend

# Run all API tests
npm run test:api

# Run specific API test file
npx jest tests/api/jsonplaceholder.spec.ts

# Run UI tests
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run load test (requires K6 installed)
npm run test:load
# or
k6 run tests/load/api-load-test.js
```

## 📁 Project Structure

```
Agam/
├── backend/
│   ├── tests/
│   │   ├── api/              # API tests with Jest
│   │   │   ├── jsonplaceholder.spec.ts
│   │   │   ├── httpbin.spec.ts
│   │   │   └── restcountries.spec.ts
│   │   ├── load/             # Load tests with K6
│   │   │   ├── api-load-test.js
│   │   │   ├── spike-test.js
│   │   │   └── stress-test.js
│   │   ├── ui/               # UI tests with Playwright
│   │   │   ├── wikipedia-ui.spec.ts
│   │   │   └── example-site-ui.spec.ts
│   │   └── e2e/              # E2E tests with Playwright
│   │       ├── wikipedia-flow.spec.ts
│   │       └── shopping-flow.spec.ts
│   ├── src/
│   │   ├── services/
│   │   │   ├── testDiscoveryService.ts    # Scans and registers tests
│   │   │   └── testExecutionService.ts    # Executes tests and captures results
│   │   ├── controllers/
│   │   │   └── testCaseController.ts      # API endpoints
│   │   └── routes/
│   │       └── testCaseRoutes.ts          # Route definitions
│   ├── jest.config.js        # Jest configuration
│   └── playwright.config.ts  # Playwright configuration
└── frontend/
    └── src/
        ├── pages/
        │   ├── TestRunner.tsx      # Test execution UI
        │   └── History.tsx         # Results history UI
        └── lib/
            └── api.ts              # API client
```

## 🎨 UI Features

### Test Runner Page
- **Discover Tests**: Scan and register all test files
- **Filter by Type**: API, LOAD, UI, E2E
- **Search**: Find tests by name or description
- **Run Button**: Execute tests with one click
- **Status Badges**: See current test status

### History Page
- **Test Runs List**: All historical test executions
- **Metrics**: Pass/fail counts, duration, timestamps
- **Detailed Results**: Click to see individual test case results
- **Trends**: Track test reliability over time

## 🔍 Test Details

### API Tests - What They Do
- **GET requests**: Verify data retrieval
- **POST requests**: Test data creation
- **PUT/PATCH**: Test updates
- **DELETE**: Test deletion
- **Status codes**: Verify correct HTTP responses
- **Response validation**: Check data structure and content
- **Error handling**: Test error scenarios

### Load Tests - What They Measure
- **Response times**: p95, p99 percentiles
- **Throughput**: Requests per second
- **Error rates**: Failed request percentage
- **Virtual users**: Concurrent user simulation
- **Staging**: Gradual ramp-up and ramp-down

### UI Tests - What They Verify
- **Element visibility**: Check UI elements exist
- **User interactions**: Clicks, typing, navigation
- **Page loads**: Verify pages load correctly
- **Responsive design**: Test different viewports
- **No errors**: Check console for errors

### E2E Tests - What They Cover
- **Complete user flows**: Multi-step processes
- **Cross-page navigation**: Full journeys
- **Data persistence**: State across pages
- **Real-world scenarios**: Actual user behavior

## 🐛 Troubleshooting

### Tests Not Appearing?
1. Click "Discover Tests" button
2. Check console for errors
3. Verify tests exist in `backend/tests/` directories

### Tests Failing?
1. Check the History page for detailed error messages
2. Some tests require internet connection (API tests)
3. K6 tests require K6 to be installed

### K6 Not Installed?
Load tests will show an error message with installation instructions. Install from:
- **Windows**: `choco install k6` or download from k6.io
- **Mac**: `brew install k6`
- **Linux**: See k6.io/docs/getting-started/installation/

### Database Connection Issues?
Ensure Docker containers are running:
```bash
docker-compose up -d
```

## 📊 Test Metrics & Reporting

The platform automatically tracks:
- ✅ Total tests run
- ✅ Pass/fail rates
- ✅ Execution duration
- ✅ Success rate trends
- ✅ Historical comparisons
- ✅ Error logs and stack traces

All metrics are stored in PostgreSQL for historical analysis.

## 🎯 Next Steps

### Adding Your Own Tests

#### Add an API Test:
1. Create a new file in `backend/tests/api/`
2. Name it `yourtest.spec.ts`
3. Write your Jest tests
4. Click "Discover Tests" in UI

Example:
```typescript
import axios from 'axios';

describe('My API Tests', () => {
  test('should do something', async () => {
    const response = await axios.get('https://api.example.com');
    expect(response.status).toBe(200);
  });
});
```

#### Add a Load Test:
1. Create a new file in `backend/tests/load/`
2. Name it `yourtest.js`
3. Write your K6 test
4. Click "Discover Tests" in UI

#### Add a UI Test:
1. Create a new file in `backend/tests/ui/`
2. Name it `yourtest.spec.ts`
3. Write your Playwright test
4. Click "Discover Tests" in UI

## 🎉 Success!

You now have a fully functional test automation platform! 

- ✅ No more terminal commands
- ✅ Beautiful UI for test management
- ✅ Historical tracking and trends
- ✅ Real tests with real results
- ✅ Support for API, Load, UI, and E2E tests

Happy Testing! 🚀

