-- ============================================================================
-- Hearing Tracking Engine - Database Migration
-- Purpose: Persistent next-hearing state, schedule-change detection, reminders
-- ============================================================================
-- Run on existing advocate_case_db
-- ============================================================================

USE advocate_case_db;

-- --------------------------------------------------------------------------
-- Table: case_hearing_state
-- Stores derived "next hearing" snapshot per case for fast dashboards and
-- daily monitoring. This is derived data and can be rebuilt anytime.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS case_hearing_state (
    case_id INT PRIMARY KEY,
    advocate_id INT NOT NULL,
    next_hearing_id INT NULL,
    next_hearing_date DATE NULL,
    next_hearing_time TIME NULL,
    has_hearing_tomorrow BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE,
    INDEX idx_advocate_next (advocate_id, next_hearing_date),
    INDEX idx_tomorrow (advocate_id, has_hearing_tomorrow)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
-- Table: hearing_schedule_state
-- Stores last-seen schedule fingerprint for each hearing to detect changes.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hearing_schedule_state (
    hearing_id INT PRIMARY KEY,
    advocate_id INT NOT NULL,
    case_id INT NOT NULL,
    schedule_hash CHAR(64) NOT NULL,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_changed_at TIMESTAMP NULL,
    change_count INT DEFAULT 0,
    FOREIGN KEY (hearing_id) REFERENCES hearings(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE,
    INDEX idx_advocate_changed (advocate_id, last_changed_at),
    INDEX idx_case (case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Hearing tracking engine migration applied' as status;

