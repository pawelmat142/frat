-- Migration: Add indexes for SearchWorkersService.searchWorkers path

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

CREATE INDEX IF NOT EXISTS idx_workers_date_ranges_worker_id ON jh_workers_date_ranges (worker_id);
CREATE INDEX IF NOT EXISTS idx_workers_date_ranges_range_gist ON jh_workers_date_ranges USING GIST (date_range);
