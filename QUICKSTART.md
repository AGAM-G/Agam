# Quick Start Guide - AutomationHub

Get your AutomationHub test management platform up and running in minutes!

## Prerequisites Check

Before you begin, make sure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ Docker and Docker Compose installed (`docker --version`)
- ✅ npm or yarn package manager

**Don't have Docker?** See the [Alternative Setup](#alternative-setup-without-docker) section below.

## Step-by-Step Setup (Docker - Easiest Way)

### 1. One-Command Setup (2 minutes)

```bash
# Install all dependencies AND start the database
npm run setup
```

This single command will:
- ✅ Install root, backend, and frontend dependencies
- ✅ Start PostgreSQL in a Docker container
- ✅ Automatically create the database and tables
- ✅ Load sample test data (users, test files, test cases)
- ✅ Expose PostgreSQL on localhost:5432

**That's it!** The database is now running and fully configured.

### 2. Start the Application (10 seconds)

```bash
# Start both frontend and backend concurrently
npm run dev
```

This will start:
- ✅ Backend API server at `http://localhost:5000`
- ✅ Frontend development server at `http://localhost:5173`
- ✅ PostgreSQL database at `localhost:5432` (already running from step 1)

### 3. Access the Application

Open your browser and navigate to:
**http://localhost:5173**

## First Time Login

### Use Seeded Account (Recommended for Testing)

Since you used `npm run setup`, sample data is already loaded. You can use:
- **Email:** `tester@company.com`
- **Password:** `password123`

Other available accounts:
- **Admin:** `admin@company.com` / `password123`
- **Developer:** `dev@company.com` / `password123`

### Or Create a New Account

1. Click on "Don't have an account? Sign up"
2. Fill in your details:
   - Full Name: Your Name
   - Email: your.email@example.com
   - Password: your_secure_password
3. Click "Sign Up"

You'll be automatically logged in and redirected to the dashboard!

## Exploring the Application

### Dashboard
- View test metrics and statistics
- Monitor system health
- See recent test runs
- Quick access to run tests

### Test Runner
- Browse all available test cases (sample data already loaded!)
- Filter by test type (API, E2E, LOAD, UI)
- Select and run multiple tests
- View execution status

### Test Results
- View all test files and results
- Filter by status
- See detailed test information
- Export results

## Common Commands

### Application
```bash
npm run dev              # Run both frontend and backend
npm run dev:frontend     # Run only frontend
npm run dev:backend      # Run only backend
npm run build            # Build both applications
```

### Database Management (Docker)
```bash
npm run db:start         # Start PostgreSQL container
npm run db:stop          # Stop PostgreSQL container
npm run db:restart       # Restart PostgreSQL container
npm run db:logs          # View PostgreSQL logs in real-time
npm run db:reset         # Reset database (WARNING: deletes all data)
```

## Stopping the Application

1. **Stop frontend and backend:** Press `Ctrl+C` in the terminal running `npm run dev`
2. **Stop database (optional):** `npm run db:stop`

Note: The database will persist data even when stopped. Use `npm run db:start` to start it again.

## Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000` or `:::5432`

**Solution:**
1. For backend (port 5000): Change PORT in `backend/.env` and update `VITE_API_URL` in `frontend/.env`
2. For database (port 5432): Stop any local PostgreSQL service or change the port in `docker-compose.yml`

### Docker Container Won't Start

**Error:** `Error response from daemon: Conflict`

**Solution:**
```bash
# Stop and remove the existing container
docker-compose down
# Start fresh
npm run db:start
```

### Database Connection Failed

**Error:** `Connection refused` or database connection errors

**Solution:**
1. Check if Docker container is running: `docker ps`
2. View database logs: `npm run db:logs`
3. Restart database: `npm run db:restart`
4. If still failing, reset database: `npm run db:reset`

### Cannot Connect to Backend

**Error:** Frontend shows connection errors

**Solution:**
1. Check backend is running: `curl http://localhost:5000/health`
2. Verify `VITE_API_URL` in `frontend/.env` matches backend URL
3. Check backend logs for errors

### JWT Token Errors

**Error:** `Invalid or expired token`

**Solution:**
1. Clear browser localStorage (F12 → Application → Local Storage → Clear)
2. Log out and log back in
3. Verify `JWT_SECRET` is set in `backend/.env`

## Alternative Setup (Without Docker)

If you can't or don't want to use Docker:

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ installed locally
- npm or yarn

### Steps

1. **Install dependencies**
```bash
npm run install:all
```

2. **Start local PostgreSQL service**
```bash
# On macOS
brew services start postgresql

# On Windows
# Start PostgreSQL service from Services app

# On Linux
sudo systemctl start postgresql
```

3. **Create database and run schema**
```bash
createdb test_automation_hub
psql -d test_automation_hub -f backend/src/database/schema.sql
psql -d test_automation_hub -f backend/src/database/seed.sql
```

4. **Update backend/.env with your PostgreSQL password**
```env
DB_PASSWORD=your_local_postgres_password
```

5. **Start the application**
```bash
npm run dev
```

## Next Steps

### Adding Your Own Tests

1. Navigate to Test Runner page
2. Click "New Test" (when implemented) or use the API to create tests
3. Organize tests by type (API, E2E, LOAD, UI)
4. Run tests and view results
5. Monitor metrics on the dashboard

### Sample Data Included

The seeded database includes:
- 3 user accounts (admin, dev, tester)
- 6 test files across different types
- 20+ test cases ready to explore
- Sample test suites (API, E2E, UI, Load)

### Customization

- Update branding in `frontend/src/components/layout/Sidebar.tsx`
- Add custom test types in `shared/types/index.ts`
- Extend API endpoints in `backend/src/routes/`
- Customize dashboard metrics in `backend/src/controllers/testRunController.ts`

## Getting Help

- 📖 Full documentation: [CLAUDE.MD](./CLAUDE.MD)
- 📚 Project README: [README.md](./README.md)
- 🐛 Issues: Create an issue in the repository
- 💬 Questions: Refer to the codebase documentation

## Production Deployment

For production deployment:

1. **Build the applications**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   - Use strong `JWT_SECRET`
   - Update database credentials
   - Configure production `FRONTEND_URL`
   - Use a production PostgreSQL instance (not Docker)

3. **Deploy backend**
   - Host on services like Heroku, AWS, DigitalOcean
   - Ensure PostgreSQL is accessible
   - Use `npm start` to run the production build

4. **Deploy frontend**
   - Build static files are in `frontend/dist`
   - Host on Netlify, Vercel, or any static hosting
   - Set correct `VITE_API_URL` before building

---

🎉 **Congratulations!** You're now ready to use AutomationHub for your test management needs.

Happy Testing! 🚀
