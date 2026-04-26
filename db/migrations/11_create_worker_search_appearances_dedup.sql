-- Migration: Add table for worker search appearance deduplication by search session

CREATE TABLE IF NOT EXISTS jh_worker_search_appearances (
    search_session_id VARCHAR(128) NOT NULL,
    worker_id BIGINT NOT NULL REFERENCES jh_workers(worker_id) ON DELETE CASCADE,
    first_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (search_session_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_worker_search_appearances_first_seen_at
    ON jh_worker_search_appearances (first_seen_at);
