-- Drop plaintext query column from consulted_scans (hash-only storage).
-- Run against existing PostgreSQL deployments before deploying the updated backend.
--
--   psql "$DATABASE_URL" -f backend/scripts/drop_consulted_query_column.sql
--
-- For asyncpg URLs, use psql with a standard postgresql:// connection string.

ALTER TABLE consulted_scans DROP COLUMN IF EXISTS query;
