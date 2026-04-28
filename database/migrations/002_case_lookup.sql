-- ============================================================================
-- Case Lookup Module - Database Migration
-- Purpose: Support for Indian public judicial data integration
-- ============================================================================

USE advocate_case_db;

-- ============================================================================
-- Table 1: case_lookup_cache
-- Purpose: Cache searched case data from Indian judicial databases (eCourts/NJDG)
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_lookup_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cnr_number VARCHAR(50) UNIQUE,
    case_number VARCHAR(100),
    case_type VARCHAR(100),
    case_status VARCHAR(100),
    court_name VARCHAR(255),
    court_district VARCHAR(100),
    court_state VARCHAR(100),
    filing_date DATE,
    registration_date DATE,
    case_category VARCHAR(100),
    acting_label VARCHAR(100),
    petitioner_name VARCHAR(255),
    respondent_name VARCHAR(255),
    advocate_name VARCHAR(255),
    judge_name VARCHAR(255),
    next_hearing_date DATE,
    last_hearing_date DATE,
    case_description TEXT,
    proceedings TEXT,
    raw_response JSON,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cnr (cnr_number),
    INDEX idx_case_number (case_number),
    INDEX idx_court (court_name),
    INDEX idx_status (case_status),
    INDEX idx_filing_date (filing_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 2: case_sync_log
-- Purpose: Track synchronization of external case data with advocate's cases
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_sync_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    advocate_id INT NOT NULL,
    case_lookup_id INT NOT NULL,
    local_case_id INT,
    sync_type ENUM('SEARCH', 'IMPORT', 'UPDATE', 'AUTO_SYNC') DEFAULT 'SEARCH',
    sync_status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'SUCCESS',
    sync_metadata JSON,
    error_message TEXT,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE,
    FOREIGN KEY (case_lookup_id) REFERENCES case_lookup_cache(id) ON DELETE CASCADE,
    FOREIGN KEY (local_case_id) REFERENCES cases(id) ON DELETE SET NULL,
    INDEX idx_advocate (advocate_id),
    INDEX idx_sync_type (sync_type),
    INDEX idx_sync_status (sync_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Update existing cases table to support external case references
-- ============================================================================

ALTER TABLE cases
ADD COLUMN cnr_number VARCHAR(50) AFTER case_number,
ADD COLUMN is_external_case BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN external_case_id INT AFTER is_external_case,
ADD COLUMN last_synced_at TIMESTAMP NULL AFTER updated_at,
ADD INDEX idx_cnr_number (cnr_number),
ADD INDEX idx_external_case (is_external_case);

-- ============================================================================
-- Stored procedure for auto-syncing case metadata
-- ============================================================================

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS SyncCaseMetadata(
    IN p_case_id INT,
    IN p_cnr_number VARCHAR(50)
)
BEGIN
    DECLARE v_external_data JSON;
    DECLARE v_status VARCHAR(100);
    DECLARE v_next_hearing DATE;
    
    -- Fetch latest data from cache
    SELECT raw_response INTO v_external_data
    FROM case_lookup_cache
    WHERE cnr_number = p_cnr_number
    ORDER BY synced_at DESC
    LIMIT 1;
    
    IF v_external_data IS NOT NULL THEN
        -- Extract fields
        SET v_status = JSON_UNQUOTE(JSON_EXTRACT(v_external_data, '$.case_status'));
        SET v_next_hearing = JSON_UNQUOTE(JSON_EXTRACT(v_external_data, '$.next_hearing_date'));
        
        -- Update local case
        UPDATE cases
        SET 
            status = COALESCE(v_status, status),
            last_synced_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_case_id;
        
        -- Log the sync
        INSERT INTO case_sync_log (advocate_id, case_lookup_id, local_case_id, sync_type, sync_status)
        SELECT 
            c.advocate_id,
            clc.id,
            p_case_id,
            'AUTO_SYNC',
            'SUCCESS'
        FROM cases c
        CROSS JOIN case_lookup_cache clc
        WHERE c.id = p_case_id AND clc.cnr_number = p_cnr_number
        ORDER BY clc.synced_at DESC
        LIMIT 1;
    END IF;
END //

DELIMITER ;

-- ============================================================================
-- Sample data for testing
-- ============================================================================

-- ============================================================================
-- End of Migration
-- ============================================================================
