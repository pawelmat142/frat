/** Created by Pawel Malek **/

-- Enable PostGIS extension for geography and geometry types
CREATE EXTENSION IF NOT EXISTS postgis;

COMMENT ON EXTENSION postgis IS 'PostGIS extension for spatial and geographic objects';
