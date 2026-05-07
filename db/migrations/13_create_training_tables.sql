-- Migration: Create training provider profiles, trainings, and training sessions tables

-- Training provider company profiles
CREATE TABLE IF NOT EXISTS jh_training_providers (
    provider_id        SERIAL PRIMARY KEY,
    uid                VARCHAR NOT NULL UNIQUE REFERENCES jh_users(uid) ON DELETE CASCADE,
    company_name       VARCHAR NOT NULL,
    description        TEXT,
    website            VARCHAR,
    contact_email      VARCHAR,
    phone_number       JSONB,
    logo_ref           JSONB,
    location_country   VARCHAR NOT NULL,
    display_address    VARCHAR,
    point              GEOGRAPHY(Point, 4326),
    status             VARCHAR NOT NULL DEFAULT 'ACTIVE',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Training courses (each training is tied to a certificate)
CREATE TABLE IF NOT EXISTS jh_trainings (
    training_id              SERIAL PRIMARY KEY,
    provider_id              INT NOT NULL REFERENCES jh_training_providers(provider_id) ON DELETE CASCADE,
    uid                      VARCHAR NOT NULL REFERENCES jh_users(uid) ON DELETE CASCADE,
    title                    VARCHAR NOT NULL,
    description              TEXT,
    certificate_code         VARCHAR NOT NULL,
    languages                TEXT[],
    location_country         VARCHAR NOT NULL,
    display_address          VARCHAR,
    point                    GEOGRAPHY(Point, 4326),
    price                    NUMERIC(10, 2),
    currency                 VARCHAR,
    is_recurring             BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_interval_days  INT,
    max_participants         INT,
    contact_email            VARCHAR,
    contact_website          VARCHAR,
    status                   VARCHAR NOT NULL DEFAULT 'DRAFT',
    unique_views_count       INT NOT NULL DEFAULT 0,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual training dates / occurrences
CREATE TABLE IF NOT EXISTS jh_training_sessions (
    session_id        SERIAL PRIMARY KEY,
    training_id       INT NOT NULL REFERENCES jh_trainings(training_id) ON DELETE CASCADE,
    start_date        TIMESTAMPTZ NOT NULL,
    end_date          TIMESTAMPTZ,
    location_country  VARCHAR,
    display_address   VARCHAR,
    point             GEOGRAPHY(Point, 4326),
    max_participants  INT,
    bookings_count    INT NOT NULL DEFAULT 0,
    status            VARCHAR NOT NULL DEFAULT 'SCHEDULED',
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_trainings_status ON jh_trainings (status) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_trainings_certificate_code ON jh_trainings (certificate_code) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_trainings_location_country ON jh_trainings (location_country) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_trainings_point_gist ON jh_trainings USING GIST (point)
    WHERE status = 'ACTIVE' AND point IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trainings_languages_gin ON jh_trainings USING GIN (languages)
    WHERE status = 'ACTIVE' AND languages IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trainings_provider_id ON jh_trainings (provider_id);
CREATE INDEX IF NOT EXISTS idx_trainings_uid ON jh_trainings (uid);

CREATE INDEX IF NOT EXISTS idx_training_sessions_training_id ON jh_training_sessions (training_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_start_date ON jh_training_sessions (start_date ASC)
    WHERE status = 'SCHEDULED';
CREATE INDEX IF NOT EXISTS idx_training_sessions_point_gist ON jh_training_sessions USING GIST (point)
    WHERE status = 'SCHEDULED' AND point IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_training_providers_uid ON jh_training_providers (uid);
CREATE INDEX IF NOT EXISTS idx_training_providers_point_gist ON jh_training_providers USING GIST (point)
    WHERE status = 'ACTIVE' AND point IS NOT NULL;
