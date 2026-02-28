/** Created by Pawel Malek **/

-- User settings table
CREATE TABLE IF NOT EXISTS jh_user_settings (
    uid VARCHAR(255) PRIMARY KEY,
    theme VARCHAR(10) NOT NULL DEFAULT 'light',
    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_settings_user FOREIGN KEY (uid) REFERENCES jh_users(uid) ON DELETE CASCADE
);

COMMENT ON TABLE jh_user_settings IS 'Per-user application settings (theme, language)';
