-- ============================================================================
-- Advocate Case Management System - Database Schema
-- ============================================================================
-- Database: advocate_case_db
-- Description: Complete MySQL database schema for managing advocate cases,
--              clients, documents, evidence, hearings, and notes.
-- ============================================================================

-- Drop database if exists (for clean setup)
DROP DATABASE IF EXISTS advocate_case_db;

-- Create database
CREATE DATABASE advocate_case_db;

-- Use the database
USE advocate_case_db;

-- ============================================================================
-- Table 1: advocates
-- Purpose: Store advocate account information and login credentials
-- ============================================================================

CREATE TABLE advocates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 2: clients
-- Purpose: Store client information and contact details
-- ============================================================================

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    advocate_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 3: cases
-- Purpose: Store case details and information
-- ============================================================================

CREATE TABLE cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    advocate_id INT NOT NULL,
    case_title VARCHAR(255) NOT NULL,
    case_number VARCHAR(100),
    court_name VARCHAR(150),
    case_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    filing_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 4: documents
-- Purpose: Store legal documents and case files
-- ============================================================================

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 5: evidence
-- Purpose: Store case evidence (images, videos, audio, files)
-- ============================================================================

CREATE TABLE evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 6: hearings
-- Purpose: Store court hearing dates and schedules
-- ============================================================================

CREATE TABLE hearings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    hearing_date DATE NOT NULL,
    hearing_time TIME,
    court_name VARCHAR(255),
    court_hall VARCHAR(50),
    judge_name VARCHAR(100),
    stage VARCHAR(255),
    notes TEXT,
    next_hearing_date DATE,
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: courts
-- Purpose: Store court information for advocate
-- ============================================================================

CREATE TABLE courts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    advocate_id INT NOT NULL,
    court_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 7: notes
-- Purpose: Store advocate's private case notes
-- ============================================================================

CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 8: case_notes
-- Purpose: Store advocate's organized case notes (meetings, research, strategy)
-- ============================================================================

CREATE TABLE case_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT,
    advocate_id INT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'General',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (advocate_id) REFERENCES advocates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table 9: ai_notes
-- Purpose: Store AI-generated legal analysis and insights
-- ============================================================================

CREATE TABLE ai_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    note_type VARCHAR(50) NOT NULL DEFAULT 'full_analysis',
    content LONGTEXT NOT NULL,
    model_used VARCHAR(100),
    tokens_used INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Sample Data for Testing
-- ============================================================================

-- Insert test advocate
INSERT INTO advocates (name, email, password, phone) VALUES
('Test Advocate', 'test@law.com', '$2b$10$YourHashedPasswordHere', '9999999999'),
('John Smith', 'john.smith@law.com', '$2b$10$YourHashedPasswordHere', '9876543210');

-- Insert test clients
INSERT INTO clients (advocate_id, name, phone, email, address) VALUES
(1, 'Rajesh Kumar', '9123456789', 'rajesh@email.com', '123 Main Street, Mumbai'),
(1, 'Priya Sharma', '9234567890', 'priya@email.com', '456 Park Avenue, Delhi'),
(2, 'Amit Patel', '9345678901', 'amit@email.com', '789 Garden Road, Ahmedabad');

-- Insert test cases
INSERT INTO cases (client_id, advocate_id, case_title, case_number, court_name, case_type, status, filing_date) VALUES
(1, 1, 'Civil Dispute - Property Matter', 'CS-2026-001', 'District Court Mumbai', 'Civil', 'Active', '2026-01-15'),
(1, 1, 'Criminal Defense Case', 'CR-2026-002', 'Sessions Court Mumbai', 'Criminal', 'Active', '2026-02-01'),
(2, 1, 'Family Court Matter', 'FC-2026-003', 'Family Court Delhi', 'Family', 'Pending', '2026-02-10'),
(3, 2, 'Corporate Legal Case', 'CL-2026-004', 'High Court Ahmedabad', 'Corporate', 'Active', '2026-01-20');

-- Insert test documents
INSERT INTO documents (case_id, document_name, file_path, file_type, file_size) VALUES
(1, 'Petition Document', '/uploads/documents/case1_petition.pdf', 'PDF', 245000),
(1, 'Affidavit', '/uploads/documents/case1_affidavit.pdf', 'PDF', 180000),
(2, 'FIR Copy', '/uploads/documents/case2_fir.pdf', 'PDF', 150000),
(3, 'Marriage Certificate', '/uploads/documents/case3_certificate.pdf', 'PDF', 120000);

-- Insert test evidence
INSERT INTO evidence (case_id, evidence_type, description, file_path, file_name) VALUES
(1, 'Document', 'Property deed scan', '/uploads/evidence/case1_deed.jpg', 'property_deed.jpg'),
(1, 'Image', 'Site photograph', '/uploads/evidence/case1_photo.jpg', 'site_photo.jpg'),
(2, 'Video', 'CCTV footage', '/uploads/evidence/case2_cctv.mp4', 'cctv_footage.mp4'),
(3, 'Audio', 'Phone recording', '/uploads/evidence/case3_audio.mp3', 'phone_recording.mp3');

-- Insert test hearings
INSERT INTO hearings (case_id, hearing_date, court_hall, judge_name, hearing_time, notes, status) VALUES
(1, '2026-03-15', 'Court Hall A', 'Justice R.K. Desai', '10:00:00', 'First hearing - preliminary arguments', 'Scheduled'),
(1, '2026-04-10', 'Court Hall A', 'Justice R.K. Desai', '10:00:00', 'Second hearing - evidence submission', 'Scheduled'),
(2, '2026-03-20', 'Court Hall B', 'Justice S.M. Khan', '14:00:00', 'Bail hearing', 'Scheduled'),
(3, '2026-03-25', 'Family Court Room 2', 'Justice P. Singh', '11:00:00', 'Counseling session', 'Scheduled');

-- Insert test notes
INSERT INTO notes (case_id, note_text) VALUES
(1, 'Client is very cooperative. All documents submitted on time.'),
(1, 'Need to prepare strong arguments for property ownership proof.'),
(2, 'Witness testimony needs to be recorded before next hearing.'),
(3, 'Both parties willing for mutual settlement. Mediation possible.');

-- Insert test case_notes
INSERT INTO case_notes (case_id, advocate_id, note_type, title, content, author) VALUES
(1, 1, 'Client Meeting', 'Meeting with client regarding property dispute', 'Client explained boundary issue with neighbor. Land documents from 2019 show clear ownership. Need to collect survey records from municipal office.', 'Advocate'),
(1, 1, 'Legal Research', 'Property law precedents research', 'Reviewed Transfer of Property Act, 1882 Section 54. Found relevant case law: Kumar v. State (2021) supporting our position on boundary disputes.', 'Advocate'),
(2, 1, 'Court Observation', 'Initial bail hearing observations', 'Judge seemed receptive to bail arguments. Prosecution requested more time for investigation. Next hearing set for evidence review.', 'Advocate'),
(2, 1, 'Strategy Note', 'Defense strategy for criminal case', 'Focus on establishing alibi through CCTV footage. Prepare witnesses for cross-examination. Key weakness in prosecution: timeline inconsistency.', 'Advocate'),
(3, 1, 'Client Meeting', 'Family court mediation discussion', 'Both parties open to mediation. Client prefers amicable settlement. Discussed custody arrangements and financial terms.', 'Advocate'),
(1, 1, 'Task', 'Follow-up tasks for property case', 'Collect survey records from municipal office. Prepare written arguments for next hearing. Schedule meeting with property valuer.', 'Advocate');

-- ============================================================================
-- Useful Queries for Testing
-- ============================================================================

-- View all advocates
SELECT * FROM advocates;

-- View all clients with their advocate names
SELECT c.*, a.name as advocate_name 
FROM clients c 
JOIN advocates a ON c.advocate_id = a.id;

-- View all cases with client and advocate details
SELECT cs.*, cl.name as client_name, a.name as advocate_name
FROM cases cs
JOIN clients cl ON cs.client_id = cl.id
JOIN advocates a ON cs.advocate_id = a.id;

-- View case documents
SELECT d.*, cs.case_title
FROM documents d
JOIN cases cs ON d.case_id = cs.id;

-- View upcoming hearings
SELECT h.*, cs.case_title, cl.name as client_name
FROM hearings h
JOIN cases cs ON h.case_id = cs.id
JOIN clients cl ON cs.client_id = cl.id
WHERE h.hearing_date >= CURDATE()
ORDER BY h.hearing_date;

-- View case summary
SELECT 
    cs.case_title,
    cs.case_number,
    cl.name as client_name,
    a.name as advocate_name,
    cs.status,
    COUNT(DISTINCT d.id) as documents_count,
    COUNT(DISTINCT e.id) as evidence_count,
    COUNT(DISTINCT h.id) as hearings_count,
    COUNT(DISTINCT n.id) as notes_count
FROM cases cs
JOIN clients cl ON cs.client_id = cl.id
JOIN advocates a ON cs.advocate_id = a.id
LEFT JOIN documents d ON cs.id = d.case_id
LEFT JOIN evidence e ON cs.id = e.case_id
LEFT JOIN hearings h ON cs.id = h.case_id
LEFT JOIN notes n ON cs.id = n.case_id
GROUP BY cs.id;

-- ============================================================================
-- End of Schema
-- ============================================================================
