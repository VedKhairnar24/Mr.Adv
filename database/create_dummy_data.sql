-- ============================================
-- Mr.Adv - Advocate Case Management System
-- Dummy Data Insertion Script
-- ============================================
-- This script populates the database with 
-- realistic test data for development/testing
-- ============================================

USE mr_adv;

-- ============================================
-- 1. Insert Dummy Advocates (Users)
-- ============================================
-- Password is 'password123' hashed with bcrypt
-- Hash: $2b$10$YourHashedPasswordHere
-- For testing, we'll use simple hashes
-- ============================================

INSERT INTO advocates (name, email, password, phone, bar_council, enrollment_number) VALUES
('Advocate Rajesh Kumar', 'rajesh@lawfirm.com', '$2b$10$rQZ9vXJXL5K5Z5Z5Z5Z5ZeO8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8', '9876543210', 'Delhi Bar Council', 'DEL/1234/2015'),
('Advocate Priya Sharma', 'priya@legalservices.com', '$2b$10$rQZ9vXJXL5K5Z5Z5Z5Z5ZeO8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8', '9876543211', 'High Court of Delhi', 'HC/5678/2016'),
('Advocate Amit Patel', 'amit@advocates.com', '$2b$10$rQZ9vXJXL5K5Z5Z5Z5Z5ZeO8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8', '9876543212', 'Gujarat Bar Council', 'GUJ/9012/2017');

-- ============================================
-- 2. Insert Dummy Clients
-- ============================================

INSERT INTO clients (advocate_id, name, phone, email, address) VALUES
-- Clients for Advocate 1 (Rajesh Kumar)
(1, 'Ramesh Gupta', '9123456789', 'ramesh.gupta@email.com', 'A-123, Sector 15, New Delhi'),
(1, 'Sunita Devi', '9123456790', 'sunita.devi@email.com', 'B-456, Village Ramnagar, Delhi'),
(1, 'Mohammad Arif', '9123456791', 'arif@email.com', 'C-789, Jamia Nagar, New Delhi'),
(1, 'Kavita Singh', '9123456792', 'kavita.singh@email.com', 'D-012, Lajpat Nagar, Delhi'),
(1, 'Vikram Malhotra', '9123456793', 'vikram.m@email.com', 'E-345, Greater Kailash, New Delhi'),

-- Clients for Advocate 2 (Priya Sharma)
(2, 'Anjali Verma', '9234567890', 'anjali.v@email.com', 'F-678, Dwarka, New Delhi'),
(2, 'Sanjay Chopra', '9234567891', 'sanjay.chopra@email.com', 'G-901, Rohini, Delhi'),
(2, 'Meera Reddy', '9234567892', 'meera.reddy@email.com', 'H-234, Saket, New Delhi'),
(2, 'Rahul Joshi', '9234567893', 'rahul.joshi@email.com', 'I-567, Pitampura, Delhi'),

-- Clients for Advocate 3 (Amit Patel)
(3, 'Deepak Shah', '9345678901', 'deepak.shah@email.com', 'J-890, Satellite, Ahmedabad'),
(3, 'Pooja Desai', '9345678902', 'pooja.desai@email.com', 'K-123, Vastrapur, Gujarat'),
(3, 'Kirankumar Patel', '9345678903', 'kiran.patel@email.com', 'L-456, Maninagar, Ahmedabad');

-- ============================================
-- 3. Insert Dummy Cases
-- ============================================

INSERT INTO cases (advocate_id, client_id, case_number, case_type, case_status, court_name, judge_name, filing_date, description) VALUES
-- Cases for Client 1 (Ramesh Gupta)
(1, 1, 'CS/1234/2023', 'Civil Suit', 'Pending', 'District Court, Delhi', 'Justice A.K. Sharma', '2023-01-15', 'Property dispute regarding ancestral land'),
(1, 1, 'CR/5678/2023', 'Criminal', 'Active', 'Sessions Court, Delhi', 'Justice R.S. Malik', '2023-03-20', 'Defense in theft case'),

-- Cases for Client 2 (Sunita Devi)
(1, 2, 'MAT/9012/2023', 'Matrimonial', 'Active', 'Family Court, Delhi', 'Justice S. Kapoor', '2023-02-10', 'Divorce petition and custody battle'),
(1, 2, 'MAT/3456/2024', 'Matrimonial', 'Pending', 'High Court of Delhi', 'Justice M. Bhatia', '2024-01-05', 'Appeal in matrimonial dispute'),

-- Cases for Client 3 (Mohammad Arif)
(1, 3, 'CR/7890/2023', 'Criminal', 'Closed', 'Sessions Court, Delhi', 'Justice V. Kumar', '2023-04-12', 'Bail application in fraud case'),
(1, 3, 'WP/2345/2023', 'Writ Petition', 'Active', 'High Court of Delhi', 'Justice A. Singh', '2023-06-18', 'Writ for service matter'),

-- Cases for Client 4 (Kavita Singh)
(1, 4, 'CS/6789/2023', 'Civil Suit', 'Pending', 'District Court, Delhi', 'Justice P. Agarwal', '2023-05-22', 'Recovery suit for unpaid dues'),
(1, 4, 'EXE/4567/2024', 'Execution', 'Active', 'District Court, Delhi', 'Justice R. Gupta', '2024-02-14', 'Execution of decree'),

-- Cases for Client 5 (Vikram Malhotra)
(1, 5, 'COM/8901/2023', 'Commercial', 'Active', 'Delhi High Court', 'Justice N. Mehta', '2023-07-30', 'Contract dispute with vendor'),
(1, 5, 'ARB/1234/2024', 'Arbitration', 'Pending', 'Arbitral Tribunal', 'Arbitrator J. Sinha', '2024-01-20', 'Arbitration proceedings for business dispute'),

-- Cases for Client 6 (Anjali Verma) - Advocate 2
(2, 6, 'MAT/5678/2023', 'Matrimonial', 'Active', 'Family Court, Delhi', 'Justice K. Dewan', '2023-03-15', 'Child custody case'),
(2, 6, 'CS/9012/2023', 'Civil Suit', 'Pending', 'District Court, Delhi', 'Justice S. Rana', '2023-08-10', 'Injunction suit'),

-- Cases for Client 7 (Sanjay Chopra) - Advocate 2
(2, 7, 'CR/3456/2023', 'Criminal', 'Active', 'Sessions Court, Delhi', 'Justice B. Chaudhary', '2023-04-25', 'Defense in assault case'),
(2, 7, 'BA/7890/2023', 'Bail Application', 'Closed', 'High Court of Delhi', 'Justice D. Verma', '2023-09-05', 'Regular bail granted'),

-- Cases for Client 8 (Meera Reddy) - Advocate 2
(2, 8, 'WP/2345/2023', 'Writ Petition', 'Pending', 'High Court of Delhi', 'Justice H. Kohli', '2023-05-18', 'Writ for property rights'),
(2, 8, 'LA/6789/2024', 'Labor Matter', 'Active', 'Labor Court, Delhi', 'Justice A. Hussain', '2024-02-28', 'Wrongful termination case'),

-- Cases for Client 9 (Rahul Joshi) - Advocate 2
(2, 9, 'CS/4567/2023', 'Civil Suit', 'Active', 'District Court, Delhi', 'Justice M. Sethi', '2023-06-12', 'Specific performance suit'),
(2, 9, 'REV/8901/2024', 'Revision', 'Pending', 'Delhi High Court', 'Justice U. Lalit', '2024-03-10', 'Revision against lower court order'),

-- Cases for Client 10 (Deepak Shah) - Advocate 3
(3, 10, 'COM/1234/2023', 'Commercial', 'Active', 'Gujarat High Court', 'Justice R. Pandya', '2023-07-05', 'Partnership dispute'),
(3, 10, 'ARB/5678/2023', 'Arbitration', 'Pending', 'Arbitral Tribunal, Ahmedabad', 'Arbitrator S. Trivedi', '2023-11-20', 'Construction contract arbitration'),

-- Cases for Client 11 (Pooja Desai) - Advocate 3
(3, 11, 'MAT/9012/2023', 'Matrimonial', 'Active', 'Family Court, Ahmedabad', 'Justice N. Shukla', '2023-08-15', 'Maintenance case'),
(3, 11, 'CS/3456/2024', 'Civil Suit', 'Pending', 'District Court, Ahmedabad', 'Justice K. Vyas', '2024-01-25', 'Property title suit'),

-- Cases for Client 12 (Kirankumar Patel) - Advocate 3
(3, 12, 'CR/7890/2023', 'Criminal', 'Active', 'Sessions Court, Ahmedabad', 'Justice T. Deshmukh', '2023-09-10', 'Cheque bounce case'),
(3, 12, 'NI/2345/2024', 'N.I. Act', 'Pending', 'Judicial Magistrate Court', 'Judge L. Nair', '2024-02-05', 'Section 138 NI Act case');

-- ============================================
-- 4. Insert Dummy Hearings
-- ============================================

INSERT INTO hearings (case_id, hearing_date, hearing_time, court_hall, judge_name, notes, status) VALUES
-- Hearings for Case 1 (CS/1234/2023)
(1, '2023-02-15', '10:30:00', 'Court No. 5, District Court', 'Justice A.K. Sharma', 'First hearing, issues framed', 'Completed'),
(1, '2023-04-20', '11:00:00', 'Court No. 5, District Court', 'Justice A.K. Sharma', 'Evidence submission by plaintiff', 'Completed'),
(1, '2023-06-15', '10:30:00', 'Court No. 5, District Court', 'Justice A.K. Sharma', 'Cross-examination of witness', 'Completed'),
(1, '2024-04-10', '10:30:00', 'Court No. 5, District Court', 'Justice A.K. Sharma', 'Next hearing for arguments', 'Scheduled'),

-- Hearings for Case 2 (CR/5678/2023)
(2, '2023-04-10', '14:00:00', 'Court No. 12, Sessions Court', 'Justice R.S. Malik', 'Bail hearing listed', 'Completed'),
(2, '2023-05-25', '14:00:00', 'Court No. 12, Sessions Court', 'Justice R.S. Malik', 'Prosecution evidence perused', 'Completed'),
(2, '2024-04-15', '14:00:00', 'Court No. 12, Sessions Court', 'Justice R.S. Malik', 'Final arguments scheduled', 'Scheduled'),

-- Hearings for Case 3 (MAT/9012/2023)
(3, '2023-03-20', '09:30:00', 'Family Court Complex', 'Justice S. Kapoor', 'Mediation session ordered', 'Completed'),
(3, '2023-05-15', '09:30:00', 'Family Court Complex', 'Justice S. Kapoor', 'Interim maintenance hearing', 'Completed'),
(3, '2023-07-10', '09:30:00', 'Family Court Complex', 'Justice S. Kapoor', 'Evidence of parties recorded', 'Completed'),
(3, '2024-04-18', '09:30:00', 'Family Court Complex', 'Justice S. Kapoor', 'Final hearing', 'Scheduled'),

-- Hearings for Case 4 (MAT/3456/2024)
(4, '2024-02-15', '11:00:00', 'High Court of Delhi', 'Justice M. Bhatia', 'Admission hearing', 'Completed'),
(4, '2024-04-22', '11:00:00', 'High Court of Delhi', 'Justice M. Bhatia', 'Notice issued to respondent', 'Scheduled'),

-- Hearings for Case 5 (CR/7890/2023)
(5, '2023-05-01', '14:30:00', 'Court No. 8, Sessions Court', 'Justice V. Kumar', 'Bail granted', 'Completed'),
(5, '2023-08-20', '14:30:00', 'Court No. 8, Sessions Court', 'Justice V. Kumar', 'Case disposed off', 'Completed'),

-- Hearings for Case 6 (WP/2345/2023)
(6, '2023-07-10', '10:00:00', 'High Court of Delhi', 'Justice A. Singh', 'Admitted, notice issued', 'Completed'),
(6, '2023-09-25', '10:00:00', 'High Court of Delhi', 'Justice A. Singh', 'Counter affidavit filed', 'Completed'),
(6, '2024-04-25', '10:00:00', 'High Court of Delhi', 'Justice A. Singh', 'Final hearing listed', 'Scheduled'),

-- Hearings for Case 7 (CS/6789/2023)
(7, '2023-06-15', '10:30:00', 'Court No. 3, District Court', 'Justice P. Agarwal', 'Summons issued', 'Completed'),
(7, '2023-09-10', '10:30:00', 'Court No. 3, District Court', 'Justice P. Agarwal', 'Written statement filed', 'Completed'),
(7, '2024-04-12', '10:30:00', 'Court No. 3, District Court', 'Justice P. Agarwal', 'Plaintiff evidence', 'Scheduled'),

-- Hearings for Case 8 (EXE/4567/2024)
(8, '2024-03-05', '10:30:00', 'Court No. 3, District Court', 'Justice R. Gupta', 'Filing of execution petition', 'Completed'),
(8, '2024-04-20', '10:30:00', 'Court No. 3, District Court', 'Justice R. Gupta', 'Show cause notice issued', 'Scheduled'),

-- Hearings for Case 9 (COM/8901/2023)
(9, '2023-08-25', '11:00:00', 'High Court of Delhi', 'Justice N. Mehta', 'Preliminary hearing', 'Completed'),
(9, '2023-10-30', '11:00:00', 'High Court of Delhi', 'Justice N. Mehta', 'Documents exchanged', 'Completed'),
(9, '2024-04-28', '11:00:00', 'High Court of Delhi', 'Justice N. Mehta', 'Arguments on merits', 'Scheduled'),

-- Hearings for Case 10 (ARB/1234/2024)
(10, '2024-02-10', '10:00:00', 'Arbitral Tribunal', 'Arbitrator J. Sinha', 'First procedural hearing', 'Completed'),
(10, '2024-03-20', '10:00:00', 'Arbitral Tribunal', 'Arbitrator J. Sinha', 'Statement of claim filed', 'Completed'),
(10, '2024-05-05', '10:00:00', 'Arbitral Tribunal', 'Arbitrator J. Sinha', 'Reply statement due', 'Scheduled'),

-- Additional hearings for more cases
(11, '2023-04-20', '09:30:00', 'Family Court, Delhi', 'Justice K. Dewan', 'Interim custody order', 'Completed'),
(11, '2024-04-16', '09:30:00', 'Family Court, Delhi', 'Justice K. Dewan', 'Final custody hearing', 'Scheduled'),

(12, '2023-09-15', '10:30:00', 'District Court, Delhi', 'Justice S. Rana', 'Injunction granted temporarily', 'Completed'),
(12, '2024-04-30', '10:30:00', 'District Court, Delhi', 'Justice S. Rana', 'Further hearing', 'Scheduled'),

(13, '2023-05-30', '14:00:00', 'Sessions Court, Delhi', 'Justice B. Chaudhary', 'Charge framed', 'Completed'),
(13, '2024-04-17', '14:00:00', 'Sessions Court, Delhi', 'Justice B. Chaudhary', 'Prosecution witnesses', 'Scheduled'),

(14, '2023-10-05', '11:00:00', 'High Court of Delhi', 'Justice D. Verma', 'Bail allowed', 'Completed'),

(15, '2023-06-20', '10:00:00', 'High Court of Delhi', 'Justice H. Kohli', 'Admission hearing', 'Completed'),
(15, '2024-04-24', '10:00:00', 'High Court of Delhi', 'Justice H. Kohli', 'Final disposal', 'Scheduled'),

(16, '2024-03-15', '14:30:00', 'Labor Court, Delhi', 'Justice A. Hussain', 'Preliminary evidence', 'Completed'),
(16, '2024-05-10', '14:30:00', 'Labor Court, Delhi', 'Justice A. Hussain', 'Employer evidence', 'Scheduled'),

(17, '2023-07-20', '10:30:00', 'District Court, Delhi', 'Justice M. Sethi', 'Issues framed', 'Completed'),
(17, '2024-04-19', '10:30:00', 'District Court, Delhi', 'Justice M. Sethi', 'Plaintiff testimony', 'Scheduled'),

(18, '2024-04-05', '11:00:00', 'High Court of Delhi', 'Justice U. Lalit', 'Admission matter', 'Completed'),
(18, '2024-05-15', '11:00:00', 'High Court of Delhi', 'Justice U. Lalit', 'Regular hearing', 'Scheduled');

-- ============================================
-- 5. Insert Dummy Documents
-- ============================================

INSERT INTO documents (case_id, document_name, file_path, file_type, file_size, uploaded_at) VALUES
-- Documents for Case 1
(1, 'Property_Deed_1990.pdf', 'uploads/documents/1739564823456_property_deed.pdf', 'application/pdf', 524288, '2023-01-20 10:30:00'),
(1, 'Land_Records.pdf', 'uploads/documents/1739564823457_land_records.pdf', 'application/pdf', 1048576, '2023-02-10 11:15:00'),
(1, 'Mutation_Documents.pdf', 'uploads/documents/1739564823458_mutation.pdf', 'application/pdf', 786432, '2023-03-15 14:20:00'),

-- Documents for Case 2
(2, 'FIR_Copy.pdf', 'uploads/documents/1739564823459_fir.pdf', 'application/pdf', 204800, '2023-03-25 09:00:00'),
(2, 'Bail_Application.pdf', 'uploads/documents/1739564823460_bail_app.pdf', 'application/pdf', 307200, '2023-04-05 10:30:00'),
(2, 'Witness_Statements.pdf', 'uploads/documents/1739564823461_witness.pdf', 'application/pdf', 614400, '2023-05-20 15:45:00'),

-- Documents for Case 3
(3, 'Marriage_Certificate.pdf', 'uploads/documents/1739564823462_marriage_cert.pdf', 'application/pdf', 153600, '2023-02-15 11:00:00'),
(3, 'Petition_Draft.pdf', 'uploads/documents/1739564823463_petition.pdf', 'application/pdf', 409600, '2023-02-18 12:30:00'),
(3, 'Financial_Records.pdf', 'uploads/documents/1739564823464_financials.pdf', 'application/pdf', 921600, '2023-04-10 16:00:00'),

-- Documents for Case 4
(4, 'Appeal_Memo.pdf', 'uploads/documents/1739564823465_appeal.pdf', 'application/pdf', 512000, '2024-01-10 10:00:00'),
(4, 'Lower_Court_Order.pdf', 'uploads/documents/1739564823466_order.pdf', 'application/pdf', 256000, '2024-01-12 11:30:00'),

-- Documents for Case 5
(5, 'Bail_Order.pdf', 'uploads/documents/1739564823467_bail_order.pdf', 'application/pdf', 204800, '2023-05-01 14:45:00'),
(5, 'Surety_Documents.pdf', 'uploads/documents/1739564823468_surety.pdf', 'application/pdf', 358400, '2023-05-02 10:00:00'),

-- Documents for Case 6
(6, 'Service_Records.pdf', 'uploads/documents/1739564823469_service.pdf', 'application/pdf', 716800, '2023-06-20 11:00:00'),
(6, 'Departmental_Enquiry.pdf', 'uploads/documents/1739564823470_enquiry.pdf', 'application/pdf', 870400, '2023-07-05 15:30:00'),
(6, 'Writ_Petition.pdf', 'uploads/documents/1739564823471_writ.pdf', 'application/pdf', 460800, '2023-06-18 09:30:00'),

-- Documents for Case 7
(7, 'Agreement_Copy.pdf', 'uploads/documents/1739564823472_agreement.pdf', 'application/pdf', 614400, '2023-05-25 10:30:00'),
(7, 'Invoice_Records.pdf', 'uploads/documents/1739564823473_invoices.pdf', 'application/pdf', 1228800, '2023-06-01 14:00:00'),
(7, 'Legal_Notice.pdf', 'uploads/documents/1739564823474_notice.pdf', 'application/pdf', 256000, '2023-05-22 11:45:00'),

-- Documents for Case 8
(8, 'Decree_Copy.pdf', 'uploads/documents/1739564823475_decree.pdf', 'application/pdf', 409600, '2024-02-15 10:00:00'),
(8, 'Execution_Petition.pdf', 'uploads/documents/1739564823476_execution.pdf', 'application/pdf', 563200, '2024-02-14 11:30:00'),

-- Documents for Case 9
(9, 'Contract_Agreement.pdf', 'uploads/documents/1739564823477_contract.pdf', 'application/pdf', 819200, '2023-07-30 12:00:00'),
(9, 'Correspondence_Emails.pdf', 'uploads/documents/1739564823478_emails.pdf', 'application/pdf', 1024000, '2023-08-15 16:30:00'),
(9, 'Payment_Records.pdf', 'uploads/documents/1739564823479_payments.pdf', 'application/pdf', 716800, '2023-08-20 10:15:00'),

-- Documents for Case 10
(10, 'Arbitration_Agreement.pdf', 'uploads/documents/1739564823480_arb_agreement.pdf', 'application/pdf', 512000, '2024-01-20 11:00:00'),
(10, 'Statement_of_Claim.pdf', 'uploads/documents/1739564823481_claim.pdf', 'application/pdf', 921600, '2024-03-20 14:30:00'),

-- More documents for other cases
(11, 'Custody_Affidavit.pdf', 'uploads/documents/1739564823482_custody.pdf', 'application/pdf', 307200, '2023-03-20 10:00:00'),
(12, 'Injunction_Order.pdf', 'uploads/documents/1739564823483_injunction.pdf', 'application/pdf', 256000, '2023-09-15 11:30:00'),
(13, 'Medical_Report.pdf', 'uploads/documents/1739564823484_medical.pdf', 'application/pdf', 460800, '2023-05-30 15:00:00'),
(14, 'Bail_Bond.pdf', 'uploads/documents/1739564823485_bond.pdf', 'application/pdf', 204800, '2023-10-05 12:00:00'),
(15, 'Property_Documents.pdf', 'uploads/documents/1739564823486_property.pdf', 'application/pdf', 1536000, '2023-06-20 10:30:00'),
(16, 'Employment_Contract.pdf', 'uploads/documents/1739564823487_employment.pdf', 'application/pdf', 614400, '2024-03-15 15:00:00'),
(17, 'Sale_Deed.pdf', 'uploads/documents/1739564823488_sale_deed.pdf', 'application/pdf', 870400, '2023-07-20 11:00:00'),
(18, 'Impugned_Order.pdf', 'uploads/documents/1739564823489_impugned.pdf', 'application/pdf', 358400, '2024-04-05 12:30:00');

-- ============================================
-- 6. Insert Dummy Notes
-- ============================================

INSERT INTO notes (case_id, note_text, created_at) VALUES
(1, 'Client mentioned that the opposing party is trying to sell the disputed property. Need to file urgent injunction.', '2023-02-20 16:00:00'),
(1, 'Received original land records from client. Keep safely in case file.', '2023-03-10 11:30:00'),
(1, 'Next hearing important - prepare cross-examination of opposite party witness.', '2023-06-10 17:00:00'),

(2, 'Client granted bail. Ensure he follows all bail conditions.', '2023-05-01 15:00:00'),
(2, 'Prosecution witness turned hostile - good sign for defense.', '2023-08-20 16:30:00'),

(3, 'Client interested in settlement. Explore mediation option.', '2023-03-25 12:00:00'),
(3, 'Interim maintenance of Rs. 50,000 per month awarded.', '2023-05-15 13:00:00'),

(4, 'High Court admitted the appeal. Good progress.', '2024-02-15 12:30:00'),

(5, 'Bail granted within 2 days. Client very satisfied.', '2023-05-01 15:30:00'),

(6, 'Department failed to produce service records. Strong case for writ.', '2023-07-10 11:00:00'),

(7, 'Defendant not responding to legal notices. File suit immediately.', '2023-05-20 10:00:00'),
(7, 'Calculate total dues with interest till date for recovery claim.', '2023-06-05 16:00:00'),

(8, 'Decree holder waiting for 2 years. Push for early hearing.', '2024-03-05 11:30:00'),

(9, 'Vendor willing to negotiate. Explore ADR options.', '2023-09-01 14:00:00'),

(10, 'Complex arbitration matter. Engage senior counsel for assistance.', '2024-02-10 11:30:00'),

(11, 'Client wants custody at any cost. Emotional matter - handle carefully.', '2023-04-20 10:30:00'),

(12, 'Urgent injunction needed to prevent property sale.', '2023-09-10 15:00:00'),

(13, 'Important criminal case. Prepare thorough defense strategy.', '2023-05-25 17:00:00'),

(14, 'Straightforward bail matter. Should be granted easily.', '2023-10-01 10:00:00'),

(15, 'Property dispute involving large area. High stakes case.', '2023-06-15 16:30:00'),

(16, 'Clear case of wrongful termination. Good chances of success.', '2024-03-10 14:00:00'),

(17, 'Specific performance suit - ensure client ready with payment.', '2023-07-15 11:30:00'),

(18, 'Revision maintainable. File within limitation period.', '2024-04-01 10:30:00');

-- ============================================
-- Verification Queries
-- ============================================

-- Show summary of inserted data
SELECT 
    'Advocates' AS Table_Name, 
    COUNT(*) AS Record_Count 
FROM advocates
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Cases', COUNT(*) FROM cases
UNION ALL
SELECT 'Hearings', COUNT(*) FROM hearings
UNION ALL
SELECT 'Documents', COUNT(*) FROM documents
UNION ALL
SELECT 'Notes', COUNT(*) FROM notes;

-- Show cases by status
SELECT 
    case_status,
    COUNT(*) as count
FROM cases
GROUP BY case_status;

-- Show upcoming hearings
SELECT 
    c.case_number,
    c.case_type,
    h.hearing_date,
    h.hearing_time,
    h.court_hall,
    h.judge_name,
    h.status
FROM hearings h
JOIN cases c ON h.case_id = c.id
WHERE h.hearing_date >= CURDATE()
ORDER BY h.hearing_date, h.hearing_time
LIMIT 10;

-- ============================================
-- End of Dummy Data Script
-- ============================================
