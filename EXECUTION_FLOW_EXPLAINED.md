# 🔍 Test Execution Flow - Complete Explanation

## 📋 **Table of Contents**
1. [Routes & What They Do](#routes--what-they-do)
2. [Complete Execution Flow](#complete-execution-flow)
3. [Where Results Come From](#where-results-come-from)
4. [Why Results Might Not Show](#why-results-might-not-show)
5. [Test Results vs History Pages](#test-results-vs-history-pages)
6. [Debugging Guide](#debugging-guide)

---

## 1️⃣ **Routes & What They Do**

### **Backend API Routes:**

#### **Test Discovery & Execution:**
```
POST /api/tests/discover
→ Scans backend/tests/ directories
→ Finds all .spec.ts and .js files
→ Registers test files and test cases in database
→ Returns: { success: true, data: { discovered: 10 } }
```

```
POST /api/tests/files/:id/execute
→ Receives test file ID
→ Gets all test cases for that file
→ Creates test_run record in database
→ Creates test_results records (one per test case)
→ Calls testExecutionService.executeTestFile()
→ Returns IMMEDIATELY: { success: true, message: 'Test execution started' }
→ Tests run in BACKGROUND (async)
```

#### **Test Runs (Results):**
```
GET /api/test-runs/runs
→ Gets list of all test runs from database
→ Returns: test runs with passed/failed counts
→ Used by: History page & Test Results page
```

```
GET /api/test-runs/runs/:id
→ Gets detailed results for ONE test run
→ Includes: All individual test case results
→ Returns: test run + array of test_results
→ Used by: Test Details Modal
```

```
POST /api/test-runs/runs/:id/stop
→ Stops a running test
→ Marks pending tests as 'skipped'
→ Updates database
```

---

## 2️⃣ **Complete Execution Flow**

### **Step-by-Step:**

```
1. USER CLICKS "RUN TESTS"
   ↓
2. FRONTEND calls: api.executeTestFile(fileId)
   POST /api/tests/files/:id/execute
   ↓
3. BACKEND CONTROLLER (testCaseController.ts)
   → Gets test file from database
   → Gets all test cases for this file
   → Creates test_run record:
      - run_id: 'test-run-1234567890'
      - name: 'Run - FileName'
      - status: 'pending'
      - total_tests: 11
   → Creates test_results records (all status='pending')
   → Starts execution ASYNC
   → Returns to frontend immediately
   ↓
4. BACKEND EXECUTION SERVICE (testExecutionService.ts)
   → Runs in BACKGROUND
   → Updates test_run status to 'running'
   → Groups tests by file type
   → Executes based on type:
   
   IF API TEST (Jest):
      → Runs: npx jest "filepath" --json
      → Parses JSON output
      → Extracts: pass/fail, duration, errors
   
   IF LOAD TEST (K6):
      → Runs: k6 run "filepath"
      → Parses summary JSON
      → Extracts: metrics, logs
   
   IF UI/E2E TEST (Playwright):
      → Runs: npx playwright test "filepath" --reporter=json
      → Parses JSON output
      → Extracts: pass/fail, duration, errors, screenshots
   ↓
5. SAVE RESULTS TO DATABASE
   → Updates test_results table:
      - status: 'passed' | 'failed' | 'skipped'
      - duration: milliseconds
      - error: error message (if failed)
      - stack_trace: full stack trace
      - logs: console output
   → Updates test_run table:
      - status: 'passed' | 'failed'
      - duration: total time
      - tests_passed: count
      - tests_failed: count
      - completed_at: timestamp
   ↓
6. FRONTEND POLLS (every 3 seconds)
   → Calls: GET /api/test-runs/runs
   → Gets updated test runs
   → Updates notification status
   → Shows results in UI
```

---

## 3️⃣ **Where Results Come From**

### **Database Tables:**

#### **test_runs:**
```sql
id              UUID PRIMARY KEY
run_id          VARCHAR (e.g., 'test-run-1234567890')
name            VARCHAR (e.g., 'Run - JSONPlaceholder')
status          VARCHAR ('pending'|'running'|'passed'|'failed')
duration        INTEGER (milliseconds)
started_at      TIMESTAMP
completed_at    TIMESTAMP
tests_passed    INTEGER ← COMES FROM COUNTING test_results
tests_failed    INTEGER ← COMES FROM COUNTING test_results
tests_pending   INTEGER ← COMES FROM COUNTING test_results
total_tests     INTEGER
user_id         UUID
```

#### **test_results:**
```sql
id              UUID PRIMARY KEY
test_run_id     UUID (links to test_runs)
test_case_id    UUID (links to test_cases)
status          VARCHAR ('pending'|'running'|'passed'|'failed'|'skipped')
duration        INTEGER (milliseconds)
error           TEXT ← ERROR MESSAGE FROM TEST FRAMEWORK
stack_trace     TEXT ← FULL STACK TRACE
screenshot      TEXT ← PLAYWRIGHT SCREENSHOT PATH
logs            TEXT ← CONSOLE OUTPUT / K6 METRICS
started_at      TIMESTAMP
completed_at    TIMESTAMP
```

### **How Results Are Captured:**

#### **For Jest (API Tests):**
```typescript
// Run command
npx jest "filepath" --json

// Parse output
const jestResults = JSON.parse(stdout);
const testResult = jestResults.testResults[0].assertionResults;

// Extract for each test:
- status: jestTest.status ('passed' | 'failed')
- duration: jestTest.duration
- error: jestTest.failureMessages.join('\n')
```

#### **For Playwright (UI/E2E Tests):**
```typescript
// Run command
npx playwright test "filepath" --reporter=json

// Parse output
const playwrightResults = JSON.parse(stdout);

// Extract for each test:
- status: result.status ('passed' | 'failed')
- duration: result.duration
- error: result.error?.message
- stackTrace: result.error?.stack
```

#### **For K6 (Load Tests):**
```typescript
// Run command
k6 run "filepath" --summary-export=k6-summary.json

// Read summary file
const summary = JSON.parse(fs.readFileSync('k6-summary.json'));

// Extract:
- status: (check for errors in logs)
- duration: total execution time
- logs: JSON.stringify(summary) ← ALL METRICS HERE
```

---

## 4️⃣ **Why Results Might Not Show**

### **🐛 Potential Issues:**

#### **Issue #1: Tests Run But Results Not Saved**
**Symptom:** Test runs shows "running" forever, never completes

**Possible Causes:**
```javascript
// A. Test framework not installed
npx jest --version  // Should work
npx playwright --version  // Should work
k6 version  // Should work (might not be installed)

// B. Test execution throws error
// Check backend logs for errors

// C. JSON parsing fails
// Test framework output format changed
```

**Solution:**
```bash
# Check backend console logs
# Look for errors like:
# - "jest: command not found"
# - "Error parsing JSON"
# - "Test execution error"
```

#### **Issue #2: Results Saved But Not Displayed**
**Symptom:** Database has results but UI doesn't show them

**Possible Causes:**
```javascript
// A. Polling not working
// Check browser console for API errors

// B. Frontend not refreshing
// Test notification might not auto-update

// C. Modal not fetching latest data
// getTestRunById might be using cached data
```

**Solution:**
```javascript
// 1. Open browser DevTools → Network tab
// 2. Look for: GET /api/test-runs/runs
// 3. Should call every 3 seconds
// 4. Check response has your test run
```

#### **Issue #3: Test Execution Never Starts**
**Symptom:** Status stays "pending", never changes to "running"

**Possible Causes:**
```javascript
// A. executeTestFile() not called
// B. testExecutionService crashes immediately
// C. Database connection issue
```

**Solution:**
```javascript
// Add console.log to testExecutionService.ts
console.log('🚀 Starting test execution:', testRunId);
console.log('📝 Test cases:', testCaseIds);

// Check if logs appear when you run tests
```

---

## 5️⃣ **Test Results vs History Pages**

### **📊 Test Results Page:**
**Purpose:** Dashboard / Overview

**Shows:**
- ✅ **Statistics**: Total passed/failed across ALL runs
- ✅ **Recent activity**: Last 10 test runs
- ✅ **Test files**: All discovered test files
- ✅ **Quick summary**: High-level metrics

**Use Cases:**
- Check overall test health
- See latest test activity
- Quick glance at system status

**Data Source:**
```javascript
// Combines multiple endpoints
const [filesRes, runsRes] = await Promise.all([
  api.getTestFiles(),      // All test files
  api.getTestRuns({ limit: 10 }),  // Last 10 runs
]);
```

---

### **📜 History Page:**
**Purpose:** Detailed test run history

**Shows:**
- ✅ **All test runs**: Complete history (not just last 10)
- ✅ **Detailed metrics**: Per-run breakdown
- ✅ **Filters**: Filter by status (passed/failed/running)
- ✅ **Clickable runs**: Open details modal
- ✅ **Success rates**: Percentage calculations
- ✅ **Timestamps**: When each run occurred

**Use Cases:**
- Review specific test run
- Compare test runs over time
- Investigate failures
- Track test execution history

**Data Source:**
```javascript
// Single endpoint with filters
const response = await api.getTestRuns({ 
  status: 'all',  // or 'passed', 'failed', 'running'
  limit: 100      // Many more results
});
```

---

### **🔍 Key Differences:**

| Feature | Test Results Page | History Page |
|---------|------------------|--------------|
| **Purpose** | Dashboard/Overview | Detailed History |
| **Test Runs** | Last 10 | Last 100+ (all) |
| **Filters** | None | By status |
| **Statistics** | Aggregated | Per-run |
| **Navigation** | View files | Click for details |
| **Best For** | Quick check | Investigation |

---

## 6️⃣ **Debugging Guide**

### **🔧 Step 1: Check If Tests Are Discovered**

```bash
# Go to Test Runner page
# Click "Discover Tests"
# Should see: "✅ Successfully discovered 10 test file(s)!"

# If no tests found:
# 1. Check backend/tests/ directories exist
# 2. Check files end with .spec.ts or .js
# 3. Check backend console logs
```

### **🔧 Step 2: Check Test Execution Starts**

```typescript
// Add to: backend/src/services/testExecutionService.ts
// Line 32 (inside executeTestRun)

async executeTestRun(testRunId: string, testCaseIds: string[]): Promise<void> {
  console.log('🚀 EXECUTION STARTED');
  console.log('   Test Run ID:', testRunId);
  console.log('   Test Cases:', testCaseIds);
  
  try {
    // ... rest of code
```

**Run a test and check backend console**
- If you DON'T see logs → execution never started
- If you DO see logs → execution is running

### **🔧 Step 3: Check Test Framework Execution**

```typescript
// Add to executeJestTests method:
console.log('📝 Running Jest:', filePath);
console.log('   Command:', jestCommand);

// Add after execution:
console.log('✅ Jest completed');
console.log('   Results:', jestResults);
```

**This will show:**
- Exact command being run
- Whether it completes
- What results it returns

### **🔧 Step 4: Check Results Are Saved**

```typescript
// Add to saveTestResults method:
console.log('💾 Saving results to database');
console.log('   Test Run ID:', testRunId);
console.log('   Results count:', results.length);
console.log('   Passed:', testsPassed);
console.log('   Failed:', testsFailed);
```

**Check backend console after test completes**

### **🔧 Step 5: Check Database**

```sql
-- Connect to your PostgreSQL database
-- Check test runs
SELECT * FROM test_runs ORDER BY created_at DESC LIMIT 5;

-- Check test results for latest run
SELECT * FROM test_results 
WHERE test_run_id = 'YOUR_TEST_RUN_ID'
ORDER BY created_at;

-- Look for:
-- - Are results saved?
-- - Do they have status (passed/failed)?
-- - Do they have error messages?
```

### **🔧 Step 6: Check Frontend Polling**

```typescript
// Open browser DevTools → Console
// Add to TestRunner.tsx pollActiveTests:

const pollActiveTests = async () => {
  console.log('🔄 Polling for active tests...');
  try {
    const response = await api.getTestRuns({ status: 'running', limit: 10 });
    console.log('   Active tests:', response.data);
    // ... rest
```

**Should see logs every 3 seconds**

---

## 🎯 **Common Issues & Solutions**

### **Issue: "Test execution started" but nothing happens**

**Solution:**
1. Check backend console logs
2. Look for error messages
3. Verify test frameworks installed:
```bash
cd backend
npx jest --version
npx playwright --version
k6 version  # Optional
```

### **Issue: Tests run but results always "pending"**

**Solution:**
- Test execution is failing silently
- Add console.logs to testExecutionService.ts
- Check what error is thrown

### **Issue: Modal shows no individual test results**

**Solution:**
- Check `test_results` table in database
- Verify results are being saved
- Check getTestRunById endpoint returns results

### **Issue: Notification never updates from "running" to "passed/failed"**

**Solution:**
- Check if `saveTestResults()` is being called
- Verify test_run status is updated in database
- Check frontend polling is working

---

## 🚀 **Quick Test**

Run this to verify everything works:

```bash
# 1. Start backend
cd backend
npm run dev

# 2. In another terminal, start frontend
cd frontend
npm run dev

# 3. Open browser: http://localhost:5173

# 4. Go to Test Runner page

# 5. Click "Discover Tests"
# Should see: "Successfully discovered X test file(s)"

# 6. Click "Run Tests" on "JSONPlaceholder API"

# 7. Watch backend console:
# Should see: 
# - "🚀 EXECUTION STARTED" (if you added logs)
# - Jest running
# - Results being saved

# 8. Watch frontend notification:
# Should change: pending → running → passed/failed

# 9. Click "View Details"
# Should show: Individual test results with pass/fail
```

---

## 📝 **Summary**

**Routes:**
- `POST /tests/files/:id/execute` → Starts test execution (returns immediately)
- `GET /test-runs/runs` → Gets list of test runs (for polling)
- `GET /test-runs/runs/:id` → Gets detailed results (for modal)

**Results Come From:**
- Jest: `--json` output → parsed → saved to `test_results`
- K6: `--summary-export` → parsed → saved to `test_results`
- Playwright: `--reporter=json` → parsed → saved to `test_results`

**Pages:**
- **Test Results**: Dashboard with last 10 runs + stats
- **History**: Complete list of all runs with filters

**Debugging:**
1. Add console.logs to backend
2. Check backend console during test execution
3. Verify database has results
4. Check frontend polling in browser DevTools

---

Need help debugging? Check backend console logs first! 🔍

