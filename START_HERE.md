# 🚀 Quick Start Guide

## Start the Application

### Option 1: Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: PowerShell Background (Windows)

```powershell
# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Start frontend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

## First Time Setup

1. **Ensure Database is Running:**
   ```bash
   docker-compose up -d
   ```

2. **Open Browser:**
   - Go to: http://localhost:5173
   - Login with your credentials

3. **Discover Tests:**
   - Navigate to "Test Runner" page
   - Click the blue "**Discover Tests**" button
   - Wait for success message (should find ~10 test files)

4. **Run Your First Test:**
   - Find a test card (e.g., "JSONPlaceholder API - Posts")
   - Click the "**Run Tests**" button
   - Check "History" page for results!

## Test Files Location

All tests are in: `backend/tests/`
- `api/` - API tests (Jest)
- `load/` - Load tests (K6)
- `ui/` - UI tests (Playwright)
- `e2e/` - E2E tests (Playwright)

## What You Can Do

✅ **Discover Tests** - Scan and register all test files
✅ **Run Tests** - Execute any test with one click
✅ **View History** - See all past test runs
✅ **Filter Tests** - By type (API, LOAD, UI, E2E)
✅ **Search Tests** - Find specific tests
✅ **Track Results** - Historical trends and metrics

## Expected Results After Discovery

- **API Tests**: ~3 files with ~40 test cases
- **Load Tests**: 3 files (load, spike, stress)
- **UI Tests**: 2 files with ~15 test cases
- **E2E Tests**: 2 files with ~8 test cases

**Total: ~70 test cases ready to run!**

## Troubleshooting

### Tests not appearing?
- Click "Discover Tests" button
- Check backend terminal for errors
- Ensure backend is running on port 5000

### Can't run tests?
- Check if you're logged in
- Verify database is running
- Check backend logs

### Need Help?
- See `TESTING_GUIDE.md` for detailed documentation
- See `TEST_PLATFORM_SUMMARY.md` for technical details

---

**That's it! You're ready to test!** 🎉

