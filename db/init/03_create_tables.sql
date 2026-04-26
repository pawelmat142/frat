/** Created by Pawel Malek **/

-- =============================================
-- Init script: Create all application tables
-- Runs on first DB container start (fresh install)
-- =============================================

-- jh_users
CREATE TABLE IF NOT EXISTS jh_users (
    user_id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(255) NOT NULL UNIQUE,
    version INTEGER DEFAULT 1,
    status VARCHAR(255) DEFAULT 'ACTIVE',
    roles TEXT[] DEFAULT ARRAY[]::TEXT[],
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telegram_channel_id VARCHAR(255) UNIQUE,
    telegram_username VARCHAR(255) DEFAULT NULL,
    verified BOOLEAN DEFAULT FALSE,
    provider VARCHAR(255) NOT NULL,
    photo_url VARCHAR(255),
    avatar_ref JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_uid ON jh_users (uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON jh_users (email);


-- jh_user_settings
CREATE TABLE IF NOT EXISTS jh_user_settings (
    uid VARCHAR(255) PRIMARY KEY REFERENCES jh_users(uid),
    theme VARCHAR(10) DEFAULT 'LIGHT',
    language_code VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- jh_workers
CREATE TABLE IF NOT EXISTS jh_workers (
    worker_id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number JSONB NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    communication_languages TEXT[] NOT NULL,
    avatar_ref JSONB,
    bio TEXT,
    location_option VARCHAR(255) NOT NULL,
    location_countries TEXT[],
    point GEOGRAPHY(Point, 4326),
    full_address TEXT,
    geocoded_position JSONB,
    availability_option VARCHAR(255) NOT NULL,
    ranges_option VARCHAR(255),
    start_date DATE,
    categories TEXT[] NOT NULL,
    certificates TEXT[] NOT NULL,
    career_start_date DATE,
    max_altitude INTEGER,
    ready_to_travel BOOLEAN,
    skills JSONB,
    images JSONB,
    views TEXT[] DEFAULT '{}',
    jobs TEXT[] DEFAULT '{}',
    likes TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_workers_uid ON jh_workers (uid);
CREATE INDEX IF NOT EXISTS idx_workers_active_status ON jh_workers (status) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_workers_active_location_option ON jh_workers (location_option) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_workers_active_point_gist ON jh_workers USING GIST (point)
    WHERE status = 'ACTIVE' AND location_option = 'POSITION' AND point IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workers_active_location_countries_gin ON jh_workers USING GIN (location_countries)
    WHERE status = 'ACTIVE' AND location_countries IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workers_active_communication_languages_gin ON jh_workers USING GIN (communication_languages)
    WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_workers_active_certificates_gin ON jh_workers USING GIN (certificates)
    WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_workers_active_categories_gin ON jh_workers USING GIN (categories)
    WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_workers_active_availability_ranges_start ON jh_workers (availability_option, ranges_option, start_date)
    WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_workers_active_created_at ON jh_workers (created_at DESC)
    WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_workers_active_unique_views_count ON jh_workers (unique_views_count DESC)
    WHERE status = 'ACTIVE';


-- jh_workers_date_ranges
CREATE TABLE IF NOT EXISTS jh_workers_date_ranges (
    id BIGSERIAL PRIMARY KEY,
    worker_id BIGINT REFERENCES jh_workers(worker_id) ON DELETE CASCADE,
    date_range DATERANGE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workers_date_ranges_worker_id ON jh_workers_date_ranges (worker_id);
CREATE INDEX IF NOT EXISTS idx_workers_date_ranges_range_gist ON jh_workers_date_ranges USING GIST (date_range);


-- jh_certificates
CREATE TABLE IF NOT EXISTS jh_certificates (
    certificate_id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    validity_date DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_certificates_uid ON jh_certificates (uid);


-- jh_offers
CREATE TABLE IF NOT EXISTS jh_offers (
    offer_id BIGSERIAL PRIMARY KEY,
    uid VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    languages_required TEXT[],
    phone_number JSONB NOT NULL,
    location_country VARCHAR(255) NOT NULL,
    point GEOGRAPHY(Point, 4326),
    display_address VARCHAR(255),
    display_name VARCHAR(255) NOT NULL,
    salary INTEGER NOT NULL,
    currency VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    open_slots INTEGER DEFAULT 0,
    applied_slots INTEGER DEFAULT 0,
    accepted_slots INTEGER DEFAULT 0,
    views TEXT[] DEFAULT '{}',
    likes TEXT[] DEFAULT '{}',
    shares TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_offers_uid ON jh_offers (uid);


-- jh_translations
CREATE TABLE IF NOT EXISTS jh_translations (
    translation_id BIGSERIAL PRIMARY KEY,
    lang_code VARCHAR(255) NOT NULL UNIQUE,
    version INTEGER DEFAULT 1,
    data JSONB NOT NULL DEFAULT '{}'::JSONB
);


-- jh_notifications
CREATE TABLE IF NOT EXISTS jh_notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    recipient_uid VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(255) NOT NULL,
    message_params JSONB,
    icon VARCHAR(255) NOT NULL,
    avatar_ref JSONB,
    requester_uid VARCHAR(255),
    requester_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON jh_notifications (recipient_uid);


-- jh_chats
CREATE TABLE IF NOT EXISTS jh_chats (
    chat_id BIGSERIAL PRIMARY KEY,
    type VARCHAR(255) DEFAULT 'DIRECT',
    blocked_by_uid VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latest_message_content TEXT
);


-- jh_chat_members
CREATE TABLE IF NOT EXISTS jh_chat_members (
    chat_id BIGINT NOT NULL REFERENCES jh_chats(chat_id) ON DELETE CASCADE,
    uid VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'LEFT',
    PRIMARY KEY (chat_id, uid)
);

CREATE INDEX IF NOT EXISTS idx_chat_members_uid ON jh_chat_members (uid);


-- jh_chat_messages
CREATE TABLE IF NOT EXISTS jh_chat_messages (
    message_id BIGSERIAL PRIMARY KEY,
    type VARCHAR(255) DEFAULT 'TEXT',
    chat_id BIGINT NOT NULL REFERENCES jh_chats(chat_id) ON DELETE CASCADE,
    sender_uid VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat ON jh_chat_messages (chat_id);


-- jh_friendships
CREATE TABLE IF NOT EXISTS jh_friendships (
    friendship_id BIGSERIAL PRIMARY KEY,
    requester_uid VARCHAR(255) NOT NULL,
    addressee_uid VARCHAR(255) NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    addressee_name VARCHAR(255) NOT NULL,
    status VARCHAR(255) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (requester_uid, addressee_uid)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON jh_friendships (requester_uid);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON jh_friendships (addressee_uid);


-- jh_feedback
CREATE TABLE IF NOT EXISTS jh_feedback (
    feedback_id BIGSERIAL PRIMARY KEY,
    status VARCHAR(255) NOT NULL,
    uid VARCHAR(255),
    message TEXT NOT NULL,
    "contactEmail" VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1
);
