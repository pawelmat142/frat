-- Migration: Sync avatar_ref from jh_users to jh_workers
-- One-way sync: User -> Worker
-- User entity is the single source of truth for avatar

-- Function to sync avatar_ref from users to workers
CREATE OR REPLACE FUNCTION sync_avatar_ref_to_worker()
RETURNS TRIGGER AS $$
BEGIN
    -- Only sync if avatar_ref actually changed
    IF (TG_OP = 'INSERT') OR (OLD.avatar_ref IS DISTINCT FROM NEW.avatar_ref) THEN
        UPDATE jh_workers
        SET avatar_ref = NEW.avatar_ref
        WHERE uid = NEW.uid;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if exists
DROP TRIGGER IF EXISTS trigger_sync_avatar_to_employee ON jh_users;
DROP TRIGGER IF EXISTS trigger_sync_avatar_to_worker ON jh_users;

-- Trigger on jh_users table
CREATE TRIGGER trigger_sync_avatar_to_worker
AFTER INSERT OR UPDATE OF avatar_ref ON jh_users
FOR EACH ROW
EXECUTE FUNCTION sync_avatar_ref_to_worker();

-- Initial sync: Copy existing avatar_ref from users to workers
UPDATE jh_workers w
SET avatar_ref = u.avatar_ref
FROM jh_users u
WHERE w.uid = u.uid
AND u.avatar_ref IS NOT NULL;
