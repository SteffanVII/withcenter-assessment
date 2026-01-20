

\set ON_ERROR_STOP on
BEGIN;

CREATE EXTENSION IF NOT EXISTS plpgsql;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

\i public.sql
\i user.sql

COMMIT;