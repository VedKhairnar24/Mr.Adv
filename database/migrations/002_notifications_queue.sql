-- ============================================================================
-- Advocate Intelligence Platform - Notifications Queue + Push Subscriptions
-- Migration: Add delivery jobs + web push subscriptions + document upload trigger
-- ============================================================================
-- Run this migration on existing advocate_case_db AFTER 001_enhanced_schema.sql
-- ============================================================================

USE advocate_case_db;

-- ---------------------------------------------------------------------------
-- Table: notification_push_subscriptions
-- Purpose: Store Web Push subscriptions per user/device
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notification_push_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    endpoint VARCHAR(1024) NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    user_agent VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_seen_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES advocates(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_endpoint (user_id, endpoint),
    INDEX idx_user_active (user_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Table: notification_jobs
-- Purpose: Delivery queue for push/email (and future channels)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notification_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    channel ENUM('push', 'email') NOT NULL,
    status ENUM('queued', 'processing', 'sent', 'failed', 'cancelled') DEFAULT 'queued',
    run_at TIMESTAMP NOT NULL,
    priority INT NOT NULL DEFAULT 50, -- higher is more important
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    last_error TEXT,
    locked_at TIMESTAMP NULL,
    locked_by VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES advocates(id) ON DELETE CASCADE,
    INDEX idx_due (status, run_at, priority),
    INDEX idx_notification (notification_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Trigger: documents insert -> document_uploaded notification ("order uploaded")
-- Purpose: Generate in-app notification when a document/order is uploaded
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_documents_after_insert_notify;

DELIMITER $$
CREATE TRIGGER trg_documents_after_insert_notify
AFTER INSERT ON documents
FOR EACH ROW
BEGIN
  DECLARE v_user_id INT;
  DECLARE v_case_title VARCHAR(255);

  SELECT c.advocate_id, c.case_title
    INTO v_user_id, v_case_title
  FROM cases c
  WHERE c.id = NEW.case_id
  LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO notifications
      (user_id, type, title, message, related_type, related_id, is_read, priority, delivery_status)
    VALUES
      (
        v_user_id,
        'document_uploaded',
        CONCAT('Order uploaded: ', v_case_title),
        CONCAT('A new document was uploaded: ', NEW.document_name),
        'document',
        NEW.id,
        FALSE,
        'high',
        'pending'
      );
  END IF;
END$$
DELIMITER ;

SELECT 'Migration 002 completed successfully!' as status;

