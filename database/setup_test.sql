-- ============================================================================
-- Quick Setup Script for MySQL Workbench
-- ============================================================================
-- Run this script to quickly set up the database
-- ============================================================================

-- Step 1: Create and use database
DROP DATABASE IF EXISTS advocate_case_db;
CREATE DATABASE advocate_case_db;
USE advocate_case_db;

-- Step 2: Create all tables
SOURCE C:/Users/khair/OneDrive/Documents/Mr.Adv/database/schema.sql;

-- Step 3: Verify setup
SHOW TABLES;

-- Step 4: Check record counts
SELECT 'advocates' as table_name, COUNT(*) as count FROM advocates
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'cases', COUNT(*) FROM cases
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'evidence', COUNT(*) FROM evidence
UNION ALL
SELECT 'hearings', COUNT(*) FROM hearings
UNION ALL
SELECT 'notes', COUNT(*) FROM notes;

-- ============================================================================
-- Test Queries
-- ============================================================================

-- Test 1: View all advocates
SELECT * FROM advocates;

-- Test 2: View all clients
SELECT * FROM clients;

-- Test 3: View all cases with details
SELECT 
    cs.id,
    cs.case_title,
    cs.case_number,
    cs.court_name,
    cs.case_type,
    cs.status,
    cl.name as client_name,
    cl.phone as client_phone,
    a.name as advocate_name
FROM cases cs
JOIN clients cl ON cs.client_id = cl.id
JOIN advocates a ON cs.advocate_id = a.id;

-- Test 4: View upcoming hearings
SELECT 
    h.hearing_date,
    h.hearing_time,
    h.court_hall,
    h.judge_name,
    cs.case_title,
    cs.case_number,
    cl.name as client_name
FROM hearings h
JOIN cases cs ON h.case_id = cs.id
JOIN clients cl ON cs.client_id = cl.id
WHERE h.hearing_date >= CURDATE()
ORDER BY h.hearing_date ASC;

-- Test 5: View case complete details
SELECT 
    cs.case_title,
    cs.case_number,
    cs.status,
    cl.name as client_name,
    a.name as advocate_name,
    COUNT(DISTINCT d.id) as total_documents,
    COUNT(DISTINCT e.id) as total_evidence,
    COUNT(DISTINCT h.id) as total_hearings,
    COUNT(DISTINCT n.id) as total_notes
FROM cases cs
JOIN clients cl ON cs.client_id = cl.id
JOIN advocates a ON cs.advocate_id = a.id
LEFT JOIN documents d ON cs.id = d.case_id
LEFT JOIN evidence e ON cs.id = e.case_id
LEFT JOIN hearings h ON cs.id = h.case_id
LEFT JOIN notes n ON cs.id = n.case_id
WHERE cs.id = 1
GROUP BY cs.id;

-- ============================================================================
-- End of Setup Verification
-- ============================================================================
