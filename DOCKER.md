# Docker Setup Guide - AutomationHub

This guide explains how to use Docker with AutomationHub for the easiest database setup.

## Why Use Docker?

- ✅ **No PostgreSQL installation required** - Everything runs in a container
- ✅ **Automatic database initialization** - Schema and seed data loaded automatically
- ✅ **Consistent environment** - Works the same on Windows, macOS, and Linux
- ✅ **Easy cleanup** - Remove everything with one command
- ✅ **Data persistence** - Your data is saved even when container stops

## Docker Compose Configuration

The `docker-compose.yml` file sets up:
- PostgreSQL 16 (Alpine Linux for smaller size)
- Database name: `test_automation_hub`
- Username: `postgres`
- Password: `postgres`
- Port: `5432`
- Automatic schema and seed data loading

## Available Commands

### Setup and Start

```bash
# One-command setup (install dependencies + start database)
npm run setup

# Or start database only
npm run db:start
```

### Stop and Restart

```bash
# Stop PostgreSQL container (data persists)
npm run db:stop

# Restart PostgreSQL container
npm run db:restart
```

### Monitoring

```bash
# View PostgreSQL logs in real-time
npm run db:logs

# Check if container is running
docker ps
```

### Reset Database

```bash
# WARNING: This deletes ALL data and recreates the database
npm run db:reset
```

This command:
1. Stops the PostgreSQL container
2. Removes the container and volumes (deletes all data)
3. Starts a fresh container
4. Automatically runs schema.sql and seed.sql

## Docker Compose File Explained

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine  # PostgreSQL 16 on Alpine Linux
    container_name: automationhub-postgres
    restart: unless-stopped  # Auto-restart unless manually stopped
    environment:
      POSTGRES_DB: test_automation_hub
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"  # Expose PostgreSQL on localhost:5432
    volumes:
      # Data persistence
      - postgres_data:/var/lib/postgresql/data
      # Auto-run on container creation
      - ./backend/src/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./backend/src/database/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:  # Named volume for data persistence
```

## How Initialization Works

When the PostgreSQL container starts for the first time:
1. PostgreSQL initializes the database
2. Files in `/docker-entrypoint-initdb.d/` are executed in alphabetical order
3. `01-schema.sql` creates tables, indexes, and triggers
4. `02-seed.sql` inserts sample data
5. Database is ready to use!

**Note:** Initialization scripts only run on first start. If the database already exists, they won't run again.

## Accessing PostgreSQL

### From Your Application

The backend is already configured to connect:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=test_automation_hub
DB_USER=postgres
DB_PASSWORD=postgres
```

### From Command Line

```bash
# Using psql (if installed)
psql -h localhost -p 5432 -U postgres -d test_automation_hub

# Using Docker exec
docker exec -it automationhub-postgres psql -U postgres -d test_automation_hub
```

### Using Database GUI Tools

Connect with tools like pgAdmin, DBeaver, or TablePlus:
- **Host:** localhost
- **Port:** 5432
- **Database:** test_automation_hub
- **Username:** postgres
- **Password:** postgres

## Data Persistence

### Where is Data Stored?

Data is stored in a Docker named volume called `postgres_data`. This volume persists even when:
- You stop the container (`npm run db:stop`)
- You restart your computer
- You stop Docker

### Backing Up Data

```bash
# Export database to SQL file
docker exec -t automationhub-postgres pg_dump -U postgres test_automation_hub > backup.sql

# Restore from backup
docker exec -i automationhub-postgres psql -U postgres -d test_automation_hub < backup.sql
```

### Deleting Data

```bash
# Remove container and all data
npm run db:reset

# Or manually
docker-compose down -v
```

## Troubleshooting

### Port 5432 Already in Use

**Problem:** You have local PostgreSQL running

**Solution:**
```bash
# Option 1: Stop local PostgreSQL
# On macOS
brew services stop postgresql

# On Windows
# Stop PostgreSQL service from Services app

# On Linux
sudo systemctl stop postgresql

# Option 2: Change Docker port in docker-compose.yml
ports:
  - "5433:5432"  # Use port 5433 instead

# Then update backend/.env
DB_PORT=5433
```

### Container Won't Start

**Problem:** Conflicting container name or network issues

**Solution:**
```bash
# View all containers
docker ps -a

# Remove old container
docker rm automationhub-postgres

# Start fresh
npm run db:start
```

### Can't Connect to Database

**Problem:** Container running but connection fails

**Solution:**
```bash
# Check container status
docker ps

# Check container logs
npm run db:logs

# Check if PostgreSQL is ready
docker exec automationhub-postgres pg_isready -U postgres

# Restart container
npm run db:restart
```

### Initialization Scripts Didn't Run

**Problem:** Tables or seed data missing

**Solution:**

The initialization scripts only run on first start. To re-run them:

```bash
# Option 1: Reset database (deletes all data)
npm run db:reset

# Option 2: Manually run scripts
docker exec -i automationhub-postgres psql -U postgres -d test_automation_hub < backend/src/database/schema.sql
docker exec -i automationhub-postgres psql -U postgres -d test_automation_hub < backend/src/database/seed.sql
```

### Docker Not Installed

**Problem:** `docker: command not found`

**Solution:**

Install Docker Desktop:
- **Windows/Mac:** https://www.docker.com/products/docker-desktop/
- **Linux:** https://docs.docker.com/engine/install/

After installation, start Docker Desktop and verify:
```bash
docker --version
docker-compose --version
```

## Performance Tips

### For Development

The default configuration is optimized for development. If you need better performance:

```yaml
# Add to docker-compose.yml under environment:
environment:
  POSTGRES_DB: test_automation_hub
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  # Performance tuning
  POSTGRES_SHARED_BUFFERS: 256MB
  POSTGRES_EFFECTIVE_CACHE_SIZE: 1GB
```

### For Production

Don't use Docker Compose for production! Use:
- Managed PostgreSQL services (AWS RDS, Google Cloud SQL, Azure Database)
- Self-managed PostgreSQL with proper backups
- Docker Swarm or Kubernetes for orchestration

## Uninstalling

To completely remove AutomationHub PostgreSQL:

```bash
# Stop and remove container
docker-compose down -v

# Remove Docker image (optional)
docker rmi postgres:16-alpine

# Remove project files
cd ..
rm -rf automation-hub
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

Need help? Check [QUICKSTART.md](./QUICKSTART.md) or [README.md](./README.md)
