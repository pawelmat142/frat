/** Created by Pawel Malek **/

-- Enable PostGIS extension for geography and geometry types
CREATE EXTENSION IF NOT EXISTS postgis;

INSERT INTO spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text)
VALUES (
    4326,
    'EPSG',
    4326,
    'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AXIS["Latitude",NORTH],AXIS["Longitude",EAST],AUTHORITY["EPSG","4326"]]',
    '+proj=longlat +datum=WGS84 +no_defs +type=crs'
)
ON CONFLICT (srid) DO NOTHING;

COMMENT ON EXTENSION postgis IS 'PostGIS extension for spatial and geographic objects';
