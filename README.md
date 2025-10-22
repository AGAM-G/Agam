# AutomationHub - Test Management Platform

<div align="center">

![AutomationHub Logo](./assets/logo.png)

**A modern, full-stack test management and automation platform**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)

</div>

## Overview

AutomationHub is a comprehensive test management platform designed to help teams organize, execute, and analyze automated tests. Built with modern web technologies, it provides a seamless experience for managing test suites across different testing types (API, E2E, Load, UI).

## Key Features

- **Dashboard with Real-time Metrics** - Monitor test execution, success rates, and system health
- **Test Runner** - Execute individual or batch test runs with filtering capabilities
- **Test Results** - View detailed test results and execution history
- **JWT Authentication** - Secure user authentication and authorization
- **Modern UI** - Clean, responsive interface built with React and Tailwind CSS
- **Type Safety** - Full TypeScript support across frontend and backend
- **RESTful API** - Well-documented API endpoints for integration

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Lucide React for icons

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- JWT authentication
- bcryptjs for password hashing

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose (recommended)
- OR PostgreSQL 14+ (if not using Docker)

### Installation (Docker - Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd automation-hub
```

2. **One-command setup**
```bash
npm run setup
```

This will:
- Install all dependencies (frontend, backend, root)
- Start PostgreSQL in Docker
- Automatically create the database and tables
- Load sample data

3. **Start the application**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432

### Alternative: Manual PostgreSQL Installation

If you prefer not to use Docker:

1. **Install dependencies**
```bash
npm run install:all
```

2. **Setup PostgreSQL database**
```bash
createdb test_automation_hub
psql -d test_automation_hub -f backend/src/database/schema.sql
psql -d test_automation_hub -f backend/src/database/seed.sql
```

3. **Update backend/.env with your PostgreSQL password**

4. **Start the application**
```bash
npm run dev
```

## Project Structure

```
automation-hub/
├── frontend/          # React frontend application
├── backend/           # Node.js backend application
├── shared/            # Shared TypeScript types
└── package.json       # Root package with concurrent scripts
```

## Available Scripts

### Application
```bash
npm run setup            # One-command setup (install + start database)
npm run dev              # Run both frontend and backend in development mode
npm run dev:frontend     # Run only frontend
npm run dev:backend      # Run only backend
npm run build            # Build both frontend and backend
npm run install:all      # Install all dependencies
```

### Database (Docker)
```bash
npm run db:start         # Start PostgreSQL in Docker
npm run db:stop          # Stop PostgreSQL container
npm run db:restart       # Restart PostgreSQL container
npm run db:logs          # View PostgreSQL logs
npm run db:reset         # Reset database (delete all data and restart)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Test Management
- `GET /api/tests/cases` - Get all test cases
- `POST /api/tests/cases` - Create test case
- `GET /api/tests/files` - Get all test files

### Test Execution
- `GET /api/test-runs/runs` - Get all test runs
- `POST /api/test-runs/runs` - Create test run
- `GET /api/test-runs/dashboard/metrics` - Get dashboard metrics
- `GET /api/test-runs/dashboard/system-health` - Get system health

## Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Test Runner
![Test Runner](./screenshots/test-runner.png)

### Test Results
![Test Results](./screenshots/test-results.png)

## Documentation

For detailed documentation, see [CLAUDE.MD](./CLAUDE.MD)

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication
- `test_files` - Test file metadata
- `test_cases` - Individual test cases
- `test_runs` - Test execution runs
- `test_results` - Individual test results

## Security

- Passwords hashed with bcrypt
- JWT token-based authentication
- Protected API routes
- CORS configuration
- SQL injection prevention

## Future Roadmap

- [ ] Real-time test execution updates (WebSocket)
- [ ] Advanced analytics and reporting
- [ ] Test scheduling
- [ ] Email notifications
- [ ] CI/CD integration
- [ ] Team collaboration features
- [ ] Test report generation (PDF/HTML)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues, questions, or contributions, please open an issue in the repository.

---

Made with ❤️ using React, TypeScript, Node.js, and PostgreSQL
