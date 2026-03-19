-- Migration: Add last_seen_at column to jh_users table

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'jh_users' AND column_name = 'last_seen_at'
    ) THEN
        ALTER TABLE jh_users ADD COLUMN last_seen_at TIMESTAMP;
    END IF;
END $$;
