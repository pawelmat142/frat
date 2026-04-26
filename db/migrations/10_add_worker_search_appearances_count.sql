-- Migration: Add denormalized search appearances counter to workers

ALTER TABLE jh_workers
    ADD COLUMN IF NOT EXISTS search_appearances_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN jh_workers.search_appearances_count IS 'Denormalized count of how many times worker appeared in search results pages';
