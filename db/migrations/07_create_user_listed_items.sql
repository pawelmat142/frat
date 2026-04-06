CREATE TABLE IF NOT EXISTS jh_user_listed_items (
    id          SERIAL PRIMARY KEY,
    uid         VARCHAR(128) NOT NULL,
    reference   VARCHAR(255) NOT NULL,
    reference_type VARCHAR(20) NOT NULL,
    listed_type VARCHAR(20) NOT NULL,
    data        JSONB DEFAULT NULL,
    listed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_listed_items_user
        FOREIGN KEY (uid) REFERENCES jh_users(uid) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_listed_items_uid ON jh_user_listed_items (uid);
