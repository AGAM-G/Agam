# Database Migrations

## How to Apply Migrations Safely

### Step 1: Backup Your Database First! 🛡️
```bash
# PostgreSQL backup command
pg_dump -U your_username -d test_automation_hub > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Apply the Migration
```bash
# Connect to your database
psql -U your_username -d test_automation_hub

# Run the migration
\i backend/src/database/migrations/001_add_scheduled_tests.sql
```

### Step 3: Verify the Migration
```sql
-- Check if the table was created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'scheduled_tests';

-- Check table structure
\d scheduled_tests
```

## How to Rollback (if needed)

### Option 1: Use the Rollback Script
```bash
# Connect to your database
psql -U your_username -d test_automation_hub

# Run the rollback
\i backend/src/database/migrations/001_add_scheduled_tests_rollback.sql
```

### Option 2: Restore from Backup
```bash
# Drop the database
dropdb -U your_username test_automation_hub

# Restore from backup
createdb -U your_username test_automation_hub
psql -U your_username -d test_automation_hub < your_backup_file.sql
```

## Migration Details

### 001_add_scheduled_tests.sql
- **Purpose**: Adds scheduled_tests table for test scheduling feature
- **Safe**: Yes, only adds new table, doesn't modify existing ones
- **Reversible**: Yes, see rollback script
- **Dependencies**: Requires test_cases and test_files tables to exist

## Important Notes

⚠️ **Always backup before running migrations!**
✅ **Test on a development database first**
✅ **This migration is safe - it only ADDS a new table**
✅ **Your existing data won't be affected**

