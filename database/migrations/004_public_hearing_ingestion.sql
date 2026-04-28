USE advocate_case_db;

ALTER TABLE hearings
ADD COLUMN source ENUM('manual','public') DEFAULT 'manual' AFTER status,
ADD COLUMN external_source VARCHAR(50) NULL AFTER source,
ADD COLUMN external_hearing_key VARCHAR(128) NULL AFTER external_source,
ADD COLUMN external_payload JSON NULL AFTER external_hearing_key,
ADD COLUMN last_synced_at TIMESTAMP NULL AFTER external_payload,
ADD COLUMN imported_at TIMESTAMP NULL AFTER last_synced_at;

CREATE UNIQUE INDEX uq_hearings_public_key
ON hearings(case_id, external_hearing_key);

CREATE INDEX idx_hearings_source_date
ON hearings(source, hearing_date);

SELECT 'Public hearing ingestion migration applied' as status;