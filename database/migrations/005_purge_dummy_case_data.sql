-- ============================================================================
-- Purge Dummy/Mock/Test Case Data
-- Purpose: Remove any seeded or placeholder case lookup rows and imported cases
-- ============================================================================
-- Run on existing advocate_case_db
-- ============================================================================

USE advocate_case_db;

-- 1) Purge obvious dummy cache rows
DELETE FROM case_lookup_cache
WHERE
  petitioner_name IN ('Test Petitioner', 'Test Petitioner ') OR
  respondent_name IN ('Test Respondent', 'Test Respondent ') OR
  court_name LIKE '%Test City%' OR
  court_state IN ('Test State') OR
  court_district IN ('Test District') OR
  case_description LIKE '%demonstration%' OR
  cnr_number IN ('MHAU030080742026','DLHI040090852025','BLRU050100962024');

-- 2) Purge imported external cases that were created from dummy cache values
-- (These can be re-imported later from live data.)
DELETE FROM cases
WHERE
  is_external_case = TRUE
  AND (
    cnr_number IN ('MHAU030080742026','DLHI040090852025','BLRU050100962024')
    OR case_title LIKE '%Test Petitioner%v.%Test Respondent%'
  );

-- 3) Purge public hearings attached to those dummy external cases (if any remain)
DELETE h FROM hearings h
JOIN cases c ON c.id = h.case_id
WHERE c.is_external_case = TRUE
  AND c.cnr_number IN ('MHAU030080742026','DLHI040090852025','BLRU050100962024');

SELECT 'Dummy/mock case data purge completed' as status;

