// ��� DEBUG VERSION - Add console.logs to track execution
// Copy the content from testExecutionService.ts and add these console.logs:

/*

STEP 1: Add to executeTestRun (line 32):
--------------------------------------------
async executeTestRun(testRunId: string, testCaseIds: string[]): Promise<void> {
  console.log('\n🚀 ===== TEST EXECUTION STARTED =====');
  console.log('📋 Test Run ID:', testRunId);
  console.log('📝 Test Case IDs:', testCaseIds);
  console.log('⏰ Start Time:', new Date().toISOString());
  
  try {


STEP 2: Add after updating status to 'running' (line 36):
--------------------------------------------
await pool.query(
  `UPDATE test_runs SET status = 'running', started_at = CURRENT_TIMESTAMP WHERE id = $1`,
  [testRunId]
);
console.log('✅ Status updated to RUNNING in database');


STEP 3: Add after getting test cases (line 48):
--------------------------------------------
const testCases = testCasesResult.rows;
console.log('📁 Test Cases Retrieved:', testCases.length);
console.log('   Files:', testCases.map(tc => tc.file_path));


STEP 4: Add in execution loop (line 58):
--------------------------------------------
for (const [filePath, cases] of Object.entries(testsByFile)) {
  const testType = cases[0].type;
  console.log(`\n🧪 Executing ${testType} tests from: ${filePath}`);
  console.log(`   Test cases in this file: ${cases.length}`);
  
  let results: TestCaseResult[] = [];


STEP 5: Add in executeJestTests (line 110):
--------------------------------------------
private async executeJestTests(filePath: string, testCases: any[]): Promise<TestCaseResult[]> {
  console.log('\n📝 === RUNNING JEST TESTS ===');
  console.log('   File:', filePath);
  console.log('   Test cases:', testCases.map(tc => tc.name));
  
  const results: TestCaseResult[] = [];
  
  try {
    const jestCommand = `npx jest "${filePath}" --json --testLocationInResults`;
    console.log('   Command:', jestCommand);
    console.log('   Running...');
    
    const { stdout, stderr } = await execAsync(jestCommand, {
      cwd: path.join(__dirname, '../..'),
      timeout: 30000,
    });
    
    console.log('✅ Jest execution completed');
    console.log('   Output length:', stdout.length);


STEP 6: Add after parsing Jest results (line 124):
--------------------------------------------
const jestResults = JSON.parse(stdout);
console.log('📊 Jest Results Parsed:');
console.log('   Success:', jestResults.success);
console.log('   Tests:', jestResults.numTotalTests);
console.log('   Passed:', jestResults.numPassedTests);
console.log('   Failed:', jestResults.numFailedTests);


STEP 7: Add in executePlaywrightTests:
--------------------------------------------
private async executePlaywrightTests(filePath: string, testCases: any[]): Promise<TestCaseResult[]> {
  console.log('\n🎭 === RUNNING PLAYWRIGHT TESTS ===');
  console.log('   File:', filePath);
  console.log('   Test cases:', testCases.map(tc => tc.name));
  
  const results: TestCaseResult[] = [];
  
  try {
    const playwrightCommand = `npx playwright test "${filePath}" --reporter=json`;
    console.log('   Command:', playwrightCommand);
    console.log('   Running...');
    
    const { stdout, stderr } = await execAsync(playwrightCommand, {
      cwd: path.join(__dirname, '../..'),
      timeout: 60000,
    });
    
    console.log('✅ Playwright execution completed');


STEP 8: Add in executeK6Tests:
--------------------------------------------
private async executeK6Tests(filePath: string, testCases: any[]): Promise<TestCaseResult[]> {
  console.log('\n⚡ === RUNNING K6 TESTS ===');
  console.log('   File:', filePath);
  console.log('   Test cases:', testCases.map(tc => tc.name));
  
  const results: TestCaseResult[] = [];
  
  try {
    // Check if k6 is installed
    try {
      await execAsync('k6 version');
      console.log('✅ K6 is installed');
    } catch {
      console.log('❌ K6 NOT INSTALLED');
      // ... rest


STEP 9: Add in saveTestResults (line 373):
--------------------------------------------
private async saveTestResults(testRunId: string, results: TestCaseResult[], totalDuration: number): Promise<void> {
  console.log('\n💾 === SAVING RESULTS TO DATABASE ===');
  console.log('   Test Run ID:', testRunId);
  console.log('   Total Results:', results.length);
  
  let testsPassed = 0;
  let testsFailed = 0;
  let testsPending = 0;

  // Save each test result
  for (const result of results) {
    console.log(`   📝 Saving: ${result.status} - Duration: ${result.duration}ms`);
    
    await pool.query(
      `UPDATE test_results
       SET status = $1, duration = $2, error = $3, stack_trace = $4, logs = $5, completed_at = CURRENT_TIMESTAMP
       WHERE test_run_id = $6 AND test_case_id = $7`,
      [
        result.status,
        result.duration,
        result.error || null,
        result.stackTrace || null,
        result.logs || null,
        testRunId,
        result.testCaseId,
      ]
    );


STEP 10: Add at the end of saveTestResults:
--------------------------------------------
  // Update test run with final results
  const finalStatus = testsFailed > 0 ? 'failed' : 'passed';
  
  console.log('\n📊 === FINAL SUMMARY ===');
  console.log('   Status:', finalStatus);
  console.log('   Duration:', totalDuration, 'ms');
  console.log('   Passed:', testsPassed);
  console.log('   Failed:', testsFailed);
  console.log('   Pending:', testsPending);
  console.log('✅ === TEST EXECUTION COMPLETED ===\n');
  
  await pool.query(
    `UPDATE test_runs
     SET status = $1, duration = $2, tests_passed = $3, tests_failed = $4, tests_pending = $5, completed_at = CURRENT_TIMESTAMP
     WHERE id = $6`,
    [finalStatus, totalDuration, testsPassed, testsFailed, testsPending, testRunId]
  );
}


STEP 11: Add error handling:
--------------------------------------------
} catch (error) {
  console.error('\n❌ === TEST EXECUTION ERROR ===');
  console.error('   Error:', error);
  console.error('   Stack:', error.stack);
  
  // Update test run as failed
  await pool.query(
    `UPDATE test_runs SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [testRunId]
  );
}

*/

// TO USE THIS DEBUG VERSION:
// 1. Copy ALL the code from testExecutionService.ts
// 2. Add the console.log statements shown above
// 3. Replace the original file temporarily
// 4. Run your tests
// 5. Watch the backend console for detailed logs
// 6. This will show you EXACTLY where execution stops or fails

export {};

