# Test Execution Flow - Complete Journey

## Overview: What Happens When You Click "Run Test"?

This document explains the **complete flow** from clicking "Run Test" in the UI to getting results written to JSON files and the database.

---

## 🎯 The Complete Flow (Step-by-Step)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USER CLICKS "RUN TEST" BUTTON                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Frontend (TestRunner.tsx)                                      │
│  ─────────────────────────────────────────────────────────────────      │
│  Function: handleRunTestFile(file)                                      │
│                                                                          │
│  1. Check if test is already running                                    │
│  2. Call API: api.executeTestFile(file.id)                             │
│  3. Add temporary "pending" status to UI                                │
│  4. Start polling for updates every 2 seconds                           │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTP POST /api/tests/files/:id/execute
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Frontend API Client (api.ts)                                   │
│  ─────────────────────────────────────────────────────────────────────  │
│  Function: executeTestFile(fileId)                                      │
│                                                                          │
│  POST http://localhost:5000/api/tests/files/[fileId]/execute           │
│  Headers: { Authorization: "Bearer <JWT_TOKEN>" }                       │
│                                                                          │
│  Returns immediately: { success: true, message: "Test started" }        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Backend Route Handler (testCaseRoutes.ts)                      │
│  ─────────────────────────────────────────────────────────────────────  │
│  Route: POST /api/tests/files/:id/execute                              │
│                                                                          │
│  Calls: executeTestFile controller                                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Controller (testCaseController.ts)                             │
│  ─────────────────────────────────────────────────────────────────────  │
│  Function: executeTestFile(req, res)                                    │
│                                                                          │
│  1. Extract file ID from request params                                 │
│  2. Start ASYNC execution (non-blocking):                               │
│     testExecutionService.executeTestFile(id)                            │
│  3. Return SUCCESS immediately (doesn't wait!)                          │
│                                                                          │
│  Response: { success: true, message: "Test execution started" }         │
│                                                                          │
│  ⚠️ Important: Test runs in BACKGROUND!                                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼ (Async/Background)
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Test Execution Service (testExecutionService.ts)               │
│  ─────────────────────────────────────────────────────────────────────  │
│  Function: executeTestFile(testFileId)                                  │
│                                                                          │
│  5a. PREPARE TEST RUN                                                   │
│      ├─ Query DB: Get test file details                                │
│      ├─ Query DB: Get all test cases for this file                     │
│      └─ Generate unique run ID: `test-run-${timestamp}`                │
│                                                                          │
│  5b. CREATE DATABASE RECORDS                                            │
│      ├─ INSERT INTO test_runs (status='pending')                       │
│      └─ INSERT INTO test_results (one per test case)                   │
│                                                                          │
│  5c. START ACTUAL EXECUTION                                             │
│      └─ Call: executeTestRun(testRunId, testCaseIds)                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Execute Test Run (testExecutionService.ts)                     │
│  ─────────────────────────────────────────────────────────────────────  │
│  Function: executeTestRun(testRunId, testCaseIds)                       │
│                                                                          │
│  6a. UPDATE STATUS TO RUNNING                                           │
│      UPDATE test_runs SET status='running', started_at=NOW()            │
│                                                                          │
│  6b. GROUP TESTS BY FILE AND TYPE                                       │
│      ├─ API tests    → executeJestTests()                              │
│      ├─ LOAD tests   → executeK6Tests()                                │
│      └─ UI/E2E tests → executePlaywrightTests()  ⭐ WE'LL FOCUS HERE   │
│                                                                          │
│  6c. FOR EACH TEST FILE (can run multiple files)                        │
│      Loop through files and execute based on type                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 7: Execute Playwright Tests (testExecutionService.ts)             │
│  ─────────────────────────────────────────────────────────────────────  │
│  Function: executePlaywrightTests(filePath, testCases)                  │
│                                                                          │
│  7a. PREPARE ISOLATED ENVIRONMENT (NEW! For concurrent tests)           │
│      ├─ Generate unique ID: `${timestamp}-${random}`                   │
│      ├─ Create temp directory: `test-results/pw-${uniqueId}`           │
│      └─ Assign random debug port: 9222 + random(1000)                  │
│                                                                          │
│  7b. BUILD PLAYWRIGHT COMMAND                                           │
│      Command: npx playwright test "tests/ui/example.spec.ts"            │
│                --reporter=json                                          │
│                                                                          │
│      Environment Variables:                                             │
│      ├─ PLAYWRIGHT_BROWSERS_PATH: temp directory (isolated)            │
│      ├─ DEBUG_PORT: unique port number                                 │
│      └─ All other process.env variables                                │
│                                                                          │
│  7c. EXECUTE COMMAND (Shell execution)                                  │
│      exec(command, { timeout: 60000, maxBuffer: 10MB })                │
│                                                                          │
│      ⏱️ This is where the actual test runs!                             │
│      ⏱️ Playwright launches browser, runs tests, generates results     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 8: Playwright Runs & Generates JSON                               │
│  ─────────────────────────────────────────────────────────────────────  │
│  ⚠️ THIS IS WHERE JSON FILE IS CREATED! ⚠️                              │
│                                                                          │
│  8a. Playwright reads config (playwright.config.ts):                    │
│      reporter: [                                                        │
│        ['json', {                                                       │
│          outputFile: 'test-results/playwright-results.json'            │
│        }]                                                               │
│      ]                                                                  │
│                                                                          │
│  8b. Playwright LAUNCHES BROWSER                                        │
│      ├─ Chrome/Chromium browser starts                                 │
│      ├─ Navigates to test URLs                                         │
│      ├─ Executes test steps (click, type, etc.)                        │
│      └─ Takes screenshots/videos on failure                            │
│                                                                          │
│  8c. Playwright COLLECTS RESULTS                                        │
│      For each test:                                                     │
│      ├─ Test name                                                      │
│      ├─ Status: passed/failed                                          │
│      ├─ Duration: milliseconds                                         │
│      ├─ Error message (if failed)                                      │
│      ├─ Stack trace (if failed)                                        │
│      └─ Screenshots/videos paths                                       │
│                                                                          │
│  8d. Playwright WRITES JSON FILE                                        │
│      File: backend/test-results/playwright-results.json                │
│                                                                          │
│      JSON Structure:                                                    │
│      {                                                                  │
│        "suites": [                                                      │
│          {                                                              │
│            "title": "Wikipedia UI Tests",                               │
│            "file": "tests/ui/wikipedia-ui.spec.ts",                    │
│            "specs": [                                                   │
│              {                                                          │
│                "title": "should search for Playwright",                │
│                "tests": [{                                              │
│                  "results": [{                                          │
│                    "status": "passed",                                 │
│                    "duration": 2341,                                   │
│                    "error": null                                       │
│                  }]                                                     │
│                }]                                                       │
│              }                                                          │
│            ]                                                            │
│          }                                                              │
│        ]                                                                │
│      }                                                                  │
│                                                                          │
│  8e. Playwright OUTPUTS TO STDOUT                                       │
│      Returns JSON string to the calling process                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼ JSON Results (in stdout)
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 9: Parse Playwright Results (testExecutionService.ts)             │
│  ─────────────────────────────────────────────────────────────────────  │
│  9a. CAPTURE OUTPUT                                                     │
│      const { stdout, stderr } = await execAsync(command)                │
│                                                                          │
│  9b. PARSE JSON                                                         │
│      const playwrightResults = JSON.parse(stdout)                       │
│                                                                          │
│  9c. EXTRACT TEST RESULTS                                               │
│      ├─ Recursively collect all specs from nested suites               │
│      ├─ Match each test case by name                                   │
│      └─ Extract: status, duration, error, stack trace                  │
│                                                                          │
│  9d. MAP TO OUR FORMAT                                                  │
│      For each test case:                                                │
│      results.push({                                                     │
│        testCaseId: testCase.id,                                         │
│        status: 'passed' | 'failed',                                    │
│        duration: milliseconds,                                          │
│        error: error message,                                            │
│        stackTrace: full stack trace                                     │
│      })                                                                 │
│                                                                          │
│  9e. CLEANUP                                                            │
│      ├─ Delete temp directory: `test-results/pw-${uniqueId}`           │
│      └─ Log: "🧹 Cleaned up temp directory"                            │
│                                                                          │
│  9f. RETURN RESULTS                                                     │
│      Return array of TestCaseResult objects                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 10: Save Results to Database (testExecutionService.ts)            │
│  ─────────────────────────────────────────────────────────────────────  │
│  Function: saveTestResults(testRunId, results, duration)                │
│                                                                          │
│  10a. UPDATE TEST_RESULTS TABLE                                         │
│       For each test case result:                                        │
│       UPDATE test_results SET                                           │
│         status = 'passed' | 'failed',                                  │
│         duration = <milliseconds>,                                      │
│         error = <error_message>,                                        │
│         stack_trace = <stack_trace>,                                    │
│         logs = <test_logs>,                                             │
│         completed_at = NOW()                                            │
│       WHERE test_run_id = <testRunId>                                   │
│         AND test_case_id = <testCaseId>                                 │
│                                                                          │
│  10b. UPDATE TEST_CASES TABLE                                           │
│       UPDATE test_cases SET                                             │
│         status = 'passed' | 'failed',                                  │
│         updated_at = NOW()                                              │
│       WHERE id = <testCaseId>                                           │
│                                                                          │
│  10c. COUNT RESULTS                                                     │
│       ├─ testsPassed = count of passed tests                           │
│       ├─ testsFailed = count of failed tests                           │
│       └─ testsPending = count of pending tests                         │
│                                                                          │
│  10d. UPDATE TEST_RUNS TABLE (Final Status)                             │
│       UPDATE test_runs SET                                              │
│         status = 'passed' | 'failed',  (failed if ANY test failed)    │
│         duration = <total_milliseconds>,                                │
│         tests_passed = <count>,                                         │
│         tests_failed = <count>,                                         │
│         tests_pending = <count>,                                        │
│         completed_at = NOW()                                            │
│       WHERE id = <testRunId>                                            │
│                                                                          │
│  ✅ TEST RUN COMPLETE IN DATABASE!                                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 11: Frontend Polling Detects Completion                           │
│  ─────────────────────────────────────────────────────────────────────  │
│  Every 2 seconds, frontend calls:                                       │
│  GET /api/test-runs/runs?limit=50                                      │
│                                                                          │
│  11a. DETECT STATUS CHANGE                                              │
│       ├─ Previous status: "running"                                    │
│       ├─ Current status: "passed" or "failed"                          │
│       └─ Trigger: "✅ Test completed" notification                     │
│                                                                          │
│  11b. UPDATE UI                                                         │
│       ├─ Remove from "active test runs"                                │
│       ├─ Update test status badge (green/red)                          │
│       ├─ Show duration                                                  │
│       └─ Clear analytics cache (refresh stats)                         │
│                                                                          │
│  11c. USER CLICKS ON TEST RUN                                           │
│       ├─ Fetch detailed results from database                          │
│       ├─ Show individual test case results                             │
│       ├─ Display error messages & stack traces                         │
│       └─ Link to screenshots/videos (if any)                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Key Points About JSON Files

### When is JSON Created?

**JSON files are created by Playwright during Step 8**, when it runs your tests. The file location is configured in `playwright.config.ts`:

```typescript
reporter: [
  ['json', { outputFile: 'test-results/playwright-results.json' }],
  ['html', { outputFolder: 'test-results/html' }]
]
```

### Where are JSON Files?

```
backend/
  test-results/
    ├── playwright-results.json        ← Main results file
    ├── pw-{uniqueId}/                 ← Temp directories (auto-deleted)
    └── html/                          ← HTML report (for manual viewing)
```

### JSON File Lifecycle

1. **Created**: When Playwright finishes running tests (Step 8)
2. **Read**: Immediately parsed by Node.js from `stdout` (Step 9)
3. **Persisted**: Data saved to PostgreSQL database (Step 10)
4. **Cleaned**: Temporary files deleted after parsing (Step 9e)

### Why JSON?

- **Structured**: Easy to parse programmatically
- **Complete**: Contains all test details (status, duration, errors, etc.)
- **Standard**: Playwright's native output format
- **Parseable**: Node.js can easily `JSON.parse()` it

---

## 🔄 Multiple Tests Running Concurrently

### Before Fix (Your Original Problem)

```
Test 1: Writes → playwright-results.json
Test 2: Writes → playwright-results.json  ❌ OVERWRITES Test 1!
Test 3: Writes → playwright-results.json  ❌ OVERWRITES Test 2!

Result: Tests fail because they're reading corrupted/incomplete JSON
```

### After Fix (Current Solution)

```
Test 1: Has unique temp dir → test-results/pw-1698765432-abc123/
        Uses unique port    → 9222 + 345
        Parses from stdout  → JSON in memory (not file)
        
Test 2: Has unique temp dir → test-results/pw-1698765433-def456/
        Uses unique port    → 9222 + 789
        Parses from stdout  → JSON in memory (not file)
        
Test 3: Has unique temp dir → test-results/pw-1698765434-ghi789/
        Uses unique port    → 9222 + 123
        Parses from stdout  → JSON in memory (not file)

Result: All tests run successfully with isolated resources! ✅
```

---

## 🗃️ Database Tables Involved

### 1. `test_files`
Stores discovered test files
```sql
id, name, path, type, suite, test_count
```

### 2. `test_cases`
Individual tests within files
```sql
id, name, type, status, test_file_id
```

### 3. `test_runs`
Each execution of tests
```sql
id, run_id, name, status, duration, tests_passed, tests_failed
```

### 4. `test_results`
Results for each test case in a run
```sql
id, test_run_id, test_case_id, status, duration, error, stack_trace
```

---

## 🚀 Performance Characteristics

| Phase | Duration | Notes |
|-------|----------|-------|
| Steps 1-4 | < 10ms | API request/response |
| Step 5-6 | < 100ms | Database setup |
| Step 7-8 | 5-30s | **Actual test execution** |
| Step 9 | < 100ms | JSON parsing |
| Step 10 | < 500ms | Database saves |
| Step 11 | 0-2s | Polling interval |

**Total Time**: Mostly depends on test complexity (Step 8)

---

## 🐛 Debugging Tips

### Check if JSON is being created:
```bash
ls -la backend/test-results/playwright-*.json
```

### Check if Playwright ran:
```bash
# Backend console logs:
🎭 Running Playwright test: tests/ui/example.spec.ts
✅ Found suites: 1
📝 Playwright tests found: ['should search for Playwright']
🧹 Cleaned up temp directory: ...
```

### Check database status:
```sql
-- See test runs
SELECT run_id, name, status, tests_passed, tests_failed, duration 
FROM test_runs 
ORDER BY started_at DESC 
LIMIT 10;

-- See individual test results
SELECT tc.name, tr.status, tr.duration, tr.error
FROM test_results tr
JOIN test_cases tc ON tr.test_case_id = tc.id
WHERE tr.test_run_id = '<test_run_id>';
```

### Check for stuck processes:
```bash
# Windows:
tasklist | findstr "chrome"
tasklist | findstr "node"

# Linux/Mac:
ps aux | grep chrome
ps aux | grep playwright
```

---

## 💡 Summary

**Question**: "When user clicks run test, the command is sent and results written to JSON file?"

**Answer**: 

1. ✅ **YES** - Command is sent (Steps 1-4)
2. ✅ **YES** - Results ARE written to JSON (Step 8)
3. ⚠️ **BUT** - Results are primarily read from `stdout` (Step 9)
4. ✅ **THEN** - Results are saved to PostgreSQL database (Step 10)
5. ✅ **FINALLY** - UI polls and displays results (Step 11)

The JSON file is an **intermediate artifact** created by Playwright. The platform reads it, parses it, saves data to the database, and then cleans up temporary files.

**The database is the source of truth**, not the JSON files!


