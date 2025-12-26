-- Migration: Sync avatar_ref from jh_users to jh_employee_profiles
-- One-way sync: User -> EmployeeProfile

-- Add avatar_ref column to jh_employee_profiles if not exists
ALTER TABLE jh_employee_profiles 
ADD COLUMN IF NOT EXISTS avatar_ref JSONB;

-- Function to sync avatar_ref from users to employee_profiles
CREATE OR REPLACE FUNCTION sync_avatar_ref_to_employee_profile()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE jh_employee_profiles
    SET avatar_ref = NEW.avatar_ref
    WHERE uid = NEW.uid;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_sync_avatar_to_employee ON jh_users;

-- Trigger on jh_users table
CREATE TRIGGER trigger_sync_avatar_to_employee
AFTER INSERT OR UPDATE OF avatar_ref ON jh_users
FOR EACH ROW
EXECUTE FUNCTION sync_avatar_ref_to_employee_profile();

-- Initial sync: Copy existing avatar_ref from users to employee_profiles
UPDATE jh_employee_profiles ep
SET avatar_ref = u.avatar_ref
FROM jh_users u
WHERE ep.uid = u.uid
AND u.avatar_ref IS NOT NULL;
