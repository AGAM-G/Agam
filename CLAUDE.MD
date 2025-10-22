# AutomationHub - Test Management Platform

A comprehensive test management and automation platform built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Project Overview

AutomationHub is a full-stack web application designed to manage, execute, and analyze automated tests. It provides a modern interface for test engineers to organize test suites, run tests, view results, and monitor system health.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **date-fns** - Date formatting utilities

### Backend
- **Node.js** with TypeScript
- **Express** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **pg** - PostgreSQL client

### Architecture
- **Monorepo structure** with separate frontend and backend
- **Shared TypeScript types** between frontend and backend
- **RESTful API** design
- **JWT-based authentication**

## Project Structure

```
automation-hub/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   └── layout/      # Layout components (Sidebar, Header)
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TestRunner.tsx
│   │   │   ├── TestResults.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── History.tsx
│   │   │   ├── Monitoring.tsx
│   │   │   ├── Team.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Login.tsx
│   │   ├── lib/             # Utilities and helpers
│   │   │   ├── api.ts       # API client with JWT handling
│   │   │   └── utils.ts     # Helper functions
│   │   ├── App.tsx          # Main app component with routing
│   │   ├── main.tsx         # Application entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   ├── .env                 # Environment variables
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   └── database.ts  # PostgreSQL connection
│   │   ├── controllers/     # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── testCaseController.ts
│   │   │   └── testRunController.ts
│   │   ├── middleware/      # Express middleware
│   │   │   └── auth.ts      # JWT authentication middleware
│   │   ├── routes/          # API routes
│   │   │   ├── authRoutes.ts
│   │   │   ├── testCaseRoutes.ts
│   │   │   └── testRunRoutes.ts
│   │   ├── database/        # Database schemas
│   │   │   └── schema.sql   # PostgreSQL schema
│   │   └── index.ts         # Server entry point
│   ├── .env                 # Environment variables
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
│
├── shared/                  # Shared code between frontend and backend
│   └── types/
│       └── index.ts         # TypeScript type definitions
│
├── package.json             # Root package.json with concurrent scripts
├── CLAUDE.MD                # This documentation file
└── README.md                # Project README

```

## Features

### Implemented Features

1. **Authentication System**
   - User registration and login
   - JWT-based authentication
   - Protected routes
   - Persistent login sessions

2. **Dashboard**
   - Real-time metrics (Total Tests, Success Rate, Failed Tests, Avg Duration)
   - Recent test runs display
   - System health monitoring
   - Server status check
   - Quick action buttons

3. **Test Runner**
   - View all available test cases
   - Filter tests by type (API, E2E, LOAD, UI)
   - Search tests by name or description
   - Select multiple tests to run
   - Execute test runs
   - Real-time test execution status

4. **Test Results**
   - View all test files and results
   - Filter by status (Passed, Failed, Pending)
   - Test run statistics
   - Detailed test file information
   - Export functionality

5. **Navigation & Layout**
   - Responsive sidebar navigation
   - Header with search and actions
   - Protected and public routes
   - Clean, modern UI design

### Placeholder Pages
- Analytics
- History
- Monitoring
- Team
- Settings

## Database Schema

### Tables

**users**
- id (UUID, Primary Key)
- email (VARCHAR, Unique)
- password_hash (VARCHAR)
- name (VARCHAR)
- role (VARCHAR: 'admin', 'dev', 'tester')
- created_at, updated_at (TIMESTAMP)

**test_files**
- id (UUID, Primary Key)
- name, path (VARCHAR, TEXT)
- type (VARCHAR: 'API', 'E2E', 'LOAD', 'UI')
- suite (VARCHAR)
- status (VARCHAR: 'pending', 'running', 'passed', 'failed', 'skipped')
- modified_at, created_at, updated_at (TIMESTAMP)

**test_cases**
- id (UUID, Primary Key)
- test_file_id (UUID, Foreign Key)
- name, description (VARCHAR, TEXT)
- type, file_path, suite (VARCHAR, TEXT, VARCHAR)
- status (VARCHAR)
- active (BOOLEAN)
- modified_at, created_at, updated_at (TIMESTAMP)

**test_runs**
- id (UUID, Primary Key)
- run_id (VARCHAR, Unique)
- name (VARCHAR)
- status (VARCHAR)
- duration (INTEGER)
- started_at, completed_at (TIMESTAMP)
- tests_passed, tests_failed, tests_pending, total_tests (INTEGER)
- user_id (UUID, Foreign Key)
- created_at (TIMESTAMP)

**test_results**
- id (UUID, Primary Key)
- test_run_id, test_case_id (UUID, Foreign Keys)
- status (VARCHAR)
- duration (INTEGER)
- error, stack_trace, screenshot, logs (TEXT)
- started_at, completed_at (TIMESTAMP)
- created_at (TIMESTAMP)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Test Cases
- `GET /api/tests/cases` - Get all test cases (protected)
- `GET /api/tests/cases/:id` - Get test case by ID (protected)
- `POST /api/tests/cases` - Create test case (protected)
- `PUT /api/tests/cases/:id` - Update test case (protected)
- `DELETE /api/tests/cases/:id` - Delete test case (protected)
- `GET /api/tests/files` - Get all test files (protected)

### Test Runs
- `GET /api/test-runs/runs` - Get all test runs (protected)
- `GET /api/test-runs/runs/:id` - Get test run by ID (protected)
- `POST /api/test-runs/runs` - Create test run (protected)
- `PUT /api/test-runs/runs/:id` - Update test run (protected)
- `GET /api/test-runs/dashboard/metrics` - Get dashboard metrics (protected)
- `GET /api/test-runs/dashboard/system-health` - Get system health (protected)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Database Setup

1. Install PostgreSQL
2. Create a new database:
```bash
createdb test_automation_hub
```

3. Run the schema to create tables:
```bash
psql -d test_automation_hub -f backend/src/database/schema.sql
```

### Installation

1. Clone the repository
2. Install all dependencies:
```bash
npm run install:all
```

This will install dependencies for root, backend, and frontend.

### Configuration

1. **Backend Configuration** - Update `backend/.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=test_automation_hub
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

2. **Frontend Configuration** - Update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

#### Development Mode (Both Frontend and Backend)
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

#### Run Individually

Backend only:
```bash
npm run dev:backend
```

Frontend only:
```bash
npm run dev:frontend
```

#### Production Build
```bash
npm run build
npm start
```

## Development Workflow

### Adding New Features

1. **Add types** in `shared/types/index.ts`
2. **Create backend API** in `backend/src/controllers/` and `backend/src/routes/`
3. **Add API client methods** in `frontend/src/lib/api.ts`
4. **Create UI components** in `frontend/src/components/` or `frontend/src/pages/`
5. **Add routes** in `frontend/src/App.tsx`

### Code Organization

- **Separation of Concerns**: Each component/controller has a single responsibility
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Modularity**: Reusable components and utilities
- **API Client**: Centralized API calls with JWT token management
- **Protected Routes**: Authentication checks on sensitive pages

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API endpoints
- Token expiration handling
- CORS configuration
- SQL injection prevention (parameterized queries)

## Future Enhancements

1. **Real-time Updates**
   - WebSocket integration for live test execution updates
   - Real-time dashboard metrics

2. **Analytics**
   - Test execution trends
   - Success rate over time
   - Performance analytics

3. **Advanced Features**
   - Test scheduling
   - Email notifications
   - Integration with CI/CD pipelines
   - Test report generation (PDF/HTML)
   - Screenshot capture for failed tests

4. **Team Collaboration**
   - Team management
   - Role-based access control
   - Test assignment
   - Comments and annotations

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l`

### Port Already in Use
- Change PORT in `backend/.env`
- Update VITE_API_URL in `frontend/.env`

### JWT Token Errors
- Clear localStorage in browser
- Check JWT_SECRET is set in backend `.env`

## Contributing

When adding new features:
1. Maintain TypeScript types in shared folder
2. Follow existing code structure
3. Add proper error handling
4. Update documentation

## License

ISC

## Support

For issues or questions, please refer to the codebase documentation or create an issue in the repository.
