/** Created by Pawel Malek **/

-- Create dictionaries table with new structure
CREATE TABLE jh_dictionaries (
    dictionary_id BIGSERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    version INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    columns JSONB NOT NULL DEFAULT '[]'::jsonb,
    groups JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE jh_dictionaries IS 'Master table for dictionary definitions';
COMMENT ON COLUMN jh_dictionaries.dictionary_id IS 'Primary key for dictionary';
COMMENT ON COLUMN jh_dictionaries.code IS 'Unique code of the dictionary (e.g., LANGUAGES, CERTIFICATIONS)';
COMMENT ON COLUMN jh_dictionaries.description IS 'Description of the dictionary purpose';
COMMENT ON COLUMN jh_dictionaries.version IS 'Version number for dictionary data';
COMMENT ON COLUMN jh_dictionaries.status IS 'Dictionary status (ACTIVE, INACTIVE)';
COMMENT ON COLUMN jh_dictionaries.elements IS 'JSON array containing dictionary elements';
COMMENT ON COLUMN jh_dictionaries.columns IS 'JSON array containing dictionary column definitions';
COMMENT ON COLUMN jh_dictionaries.groups IS 'JSON array containing dictionary groups';
COMMENT ON COLUMN jh_dictionaries.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN jh_dictionaries.updated_at IS 'Record last update timestamp';

-- Create indexes for better performance
CREATE INDEX idx_dictionaries_code ON jh_dictionaries (code);
CREATE INDEX idx_dictionaries_status ON jh_dictionaries (status);
CREATE INDEX idx_dictionaries_elements ON jh_dictionaries USING GIN (elements);
CREATE INDEX idx_dictionaries_columns ON jh_dictionaries USING GIN (columns);
CREATE INDEX idx_dictionaries_groups ON jh_dictionaries USING GIN (groups);
