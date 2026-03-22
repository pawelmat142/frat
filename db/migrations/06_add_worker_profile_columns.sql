-- Migration: Add career_start_date, max_altitude, ready_to_travel, skills, images to jh_workers

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'jh_workers' AND column_name = 'career_start_date'
    ) THEN
        ALTER TABLE jh_workers ADD COLUMN career_start_date DATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'jh_workers' AND column_name = 'max_altitude'
    ) THEN
        ALTER TABLE jh_workers ADD COLUMN max_altitude INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'jh_workers' AND column_name = 'ready_to_travel'
    ) THEN
        ALTER TABLE jh_workers ADD COLUMN ready_to_travel BOOLEAN;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'jh_workers' AND column_name = 'skills'
    ) THEN
        ALTER TABLE jh_workers ADD COLUMN skills JSONB;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'jh_workers' AND column_name = 'images'
    ) THEN
        ALTER TABLE jh_workers ADD COLUMN images JSONB;
    END IF;
END $$;
