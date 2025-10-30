#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Agam Test Platform Setup...\n');

let allGood = true;

// Check Node.js
try {
  const nodeVersion = process.version;
  console.log(`✅ Node.js: ${nodeVersion}`);
} catch (error) {
  console.log('❌ Node.js: Not found');
  allGood = false;
}

// Check npm
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  console.log(`✅ npm: ${npmVersion}`);
} catch (error) {
  console.log('❌ npm: Not found');
  allGood = false;
}

// Check if test directories exist
const testDirs = [
  'tests/api',
  'tests/load',
  'tests/ui',
  'tests/e2e',
];

console.log('\n📁 Checking test directories:');
for (const dir of testDirs) {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath);
    const testFiles = files.filter(f => f.endsWith('.spec.ts') || f.endsWith('.js'));
    console.log(`✅ ${dir}: ${testFiles.length} test file(s)`);
  } else {
    console.log(`❌ ${dir}: Not found`);
    allGood = false;
  }
}

// Check Jest
console.log('\n🧪 Checking test frameworks:');
try {
  execSync('npx jest --version', { encoding: 'utf-8', stdio: 'ignore' });
  console.log('✅ Jest: Installed');
} catch (error) {
  console.log('❌ Jest: Not installed');
  allGood = false;
}

// Check Playwright
try {
  execSync('npx playwright --version', { encoding: 'utf-8', stdio: 'ignore' });
  console.log('✅ Playwright: Installed');
} catch (error) {
  console.log('❌ Playwright: Not installed');
  allGood = false;
}

// Check K6 (optional)
try {
  const k6Version = execSync('k6 version', { encoding: 'utf-8', stdio: 'ignore' });
  console.log('✅ K6: Installed');
} catch (error) {
  console.log('⚠️  K6: Not installed (optional for load tests)');
  console.log('   Install from: https://k6.io/docs/getting-started/installation/');
}

// Check database connectivity
console.log('\n🗄️  Database:');
console.log('ℹ️  Ensure PostgreSQL is running via Docker:');
console.log('   docker-compose up -d');

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All core components verified!');
  console.log('\n🚀 Next steps:');
  console.log('   1. Start backend: npm run dev');
  console.log('   2. Start frontend: cd ../frontend && npm run dev');
  console.log('   3. Open http://localhost:5173');
  console.log('   4. Go to Test Runner page');
  console.log('   5. Click "Discover Tests"');
  console.log('   6. Run your first test!');
} else {
  console.log('❌ Some components are missing. Please check errors above.');
}
console.log('='.repeat(50));

