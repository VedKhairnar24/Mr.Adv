-- ============================================================================
-- Advocate Intelligence Platform - Enhanced Database Schema
-- Migration: Add notifications, tasks, audit logs, and AI jobs
-- ============================================================================
-- Run this migration on existing advocate_case_db to add new features
-- ============================================================================

USE advocate_case_db;

-- ============================================================================
-- Table 1: notifications
-- Purpose: Store user notifications (hearing reminders, deadlines, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('hearing_reminder', 'deadline_approaching', 'document_uploaded', 'case_assigned', 'ai_analysis_complete', 'system_alert') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_type VARCHAR(50), -- 'case', 'hearing', 'document', etc.
    related_id INT, -- ID of related entity
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    delivery_status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES advocates(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 2: notification_preferences
-- Purpose: Store user notification preferences
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    hearing_reminder_hours INT DEFAULT 24, -- Hours before hearing
    deadline_reminder_days INT DEFAULT 3, -- Days before deadline
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES advocates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 3: tasks
-- Purpose: Store tasks and reminders for advocates
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assigned_to INT NOT NULL,
    created_by INT NOT NULL,
    case_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    due_date TIMESTAMP NULL,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_time TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES advocates(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES advocates(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
    INDEX idx_assigned (assigned_to, status),
    INDEX idx_due_date (due_date),
    INDEX idx_case (case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 4: audit_logs
-- Purpose: Track all critical operations for security and compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'case', 'document', 'hearing', etc.
    entity_id INT NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 5: ai_jobs
-- Purpose: Track AI processing jobs asynchronously
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    case_id INT NULL,
    job_type ENUM('case_analysis', 'document_summary', 'precedent_search', 'draft_generation') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    input_data JSON NOT NULL,
    output_data JSON,
    model_used VARCHAR(100),
    tokens_used INT,
    error_message TEXT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES advocates(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Add is_active column to advocates table (if not exists)
-- ============================================================================

-- NOTE: MySQL 8 does not support "ADD COLUMN IF NOT EXISTS" in all builds.
-- Make this migration idempotent with information_schema checks + dynamic SQL.

-- Add advocates.is_active if missing
SET @col_is_active :=
  (SELECT COUNT(*)
   FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'advocates'
     AND column_name = 'is_active');

SET @sql_is_active := IF(
  @col_is_active = 0,
  'ALTER TABLE advocates ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER password',
  'SELECT 1'
);
PREPARE stmt FROM @sql_is_active;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add advocates.last_login_at if missing (after is_active)
SET @col_last_login :=
  (SELECT COUNT(*)
   FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'advocates'
     AND column_name = 'last_login_at');

SET @sql_last_login := IF(
  @col_last_login = 0,
  'ALTER TABLE advocates ADD COLUMN last_login_at TIMESTAMP NULL AFTER is_active',
  'SELECT 1'
);
PREPARE stmt FROM @sql_last_login;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
-- ============================================================================
-- Sample Data for Testing
-- ============================================================================

-- Insert default notification preferences for existing advocates
INSERT IGNORE INTO notification_preferences (user_id, email_enabled, push_enabled, hearing_reminder_hours, deadline_reminder_days)
SELECT id, TRUE, TRUE, 24, 3
FROM advocates
WHERE id NOT IN (SELECT user_id FROM notification_preferences);

-- ============================================================================
-- Useful Queries for Testing
-- ============================================================================

-- View unread notifications for a user
SELECT * FROM notifications 
WHERE user_id = 1 AND is_read = FALSE 
ORDER BY created_at DESC;

-- View upcoming tasks
SELECT t.*, c.case_title
FROM tasks t
LEFT JOIN cases c ON t.case_id = c.id
WHERE t.assigned_to = 1 
  AND t.status IN ('pending', 'in_progress')
  AND t.due_date >= NOW()
ORDER BY t.due_date;

-- View audit logs for a specific case
SELECT al.*, a.name as user_name
FROM audit_logs al
JOIN advocates a ON al.user_id = a.id
WHERE al.entity_type = 'case' AND al.entity_id = 1
ORDER BY al.created_at DESC;

-- View AI job status
SELECT * FROM ai_jobs
WHERE user_id = 1
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- Migration Complete
-- ============================================================================

SELECT 'Migration completed successfully!' as status;
