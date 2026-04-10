/** Created by Pawel Malek **/

-- Migration: Replace views text array on jh_workers with a denormalized unique_views_count,
-- and introduce jh_entity_interactions for full interaction history with sliding window dedup.

-- 1. New interactions table
CREATE TABLE jh_entity_interactions (
    id          SERIAL PRIMARY KEY,
    entity_type VARCHAR(50)  NOT NULL,
    entity_id   INTEGER      NOT NULL,
    event_type  VARCHAR(50)  NOT NULL,
    user_uid  TEXT         NOT NULL,
    date   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  jh_entity_interactions                IS 'Tracks user engagement events (VIEW, etc.) for various entity types';
COMMENT ON COLUMN jh_entity_interactions.entity_type    IS 'Type of entity: WORKER, OFFER';
COMMENT ON COLUMN jh_entity_interactions.entity_id      IS 'ID of the target entity';
COMMENT ON COLUMN jh_entity_interactions.event_type     IS 'Interaction type: VIEW';
COMMENT ON COLUMN jh_entity_interactions.user_uid     IS 'Firebase UID of the user who triggered the event';
COMMENT ON COLUMN jh_entity_interactions.date      IS 'Timestamp of the interaction';

-- Index for counting/listing interactions per entity
CREATE INDEX idx_ei_entity ON jh_entity_interactions (entity_type, entity_id);
-- Index for sliding window deduplication check
CREATE INDEX idx_ei_window  ON jh_entity_interactions (entity_type, entity_id, user_uid, date);

-- 2. Add denormalized counter to workers; seed from existing views array length
ALTER TABLE jh_workers
    ADD COLUMN IF NOT EXISTS unique_views_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN jh_workers.unique_views_count IS 'Denormalized count of views within sliding window periods; updated atomically on each new interaction record';

UPDATE jh_workers
SET unique_views_count = array_length(views, 1)
WHERE views IS NOT NULL AND array_length(views, 1) IS NOT NULL;

-- 3. Drop legacy views array column
ALTER TABLE jh_workers DROP COLUMN IF EXISTS views;
