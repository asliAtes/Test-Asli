-- Test Data Setup for RCS Reports Testing
-- Only for UI and Database validation tests

-- Cleanup existing test data
DELETE FROM mab_operational_reports_data WHERE file_name LIKE 'TEST_%';

-- Basic test data for UI validation
INSERT INTO mab_operational_reports_data 
(file_name, sent_date, total_records, rcs_sms_sent_count, customer_id, phone_number, status)
VALUES 
-- Regular cases
('TEST_RCS_20250523_001.csv', '2025-05-23', 5, 5, 'TEST001', '2068519001', 'DELIVERED'),
('TEST_RCS_20250523_002.csv', '2025-05-23', 3, 3, 'TEST002', '2068519002', 'PENDING'),
('TEST_RCS_20250523_003.csv', '2025-05-23', 2, 2, 'TEST003', '2068519003', 'FAILED'),

-- Edge cases
('TEST_RCS_20250523_004.csv', '2025-05-23', 999, 999, 'TEST004', '2068519004', 'DELIVERED'),
('TEST_RCS_20250523_005.csv', '2025-05-23', 0, 0, 'TEST005', '2068519005', 'DELIVERED'),

-- Multiple dates for trend analysis
('TEST_RCS_20250522_001.csv', '2025-05-22', 5, 5, 'TEST006', '2068519006', 'DELIVERED'),
('TEST_RCS_20250524_001.csv', '2025-05-24', 5, 5, 'TEST007', '2068519007', 'DELIVERED');

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_rcs_test_data ON mab_operational_reports_data(file_name, sent_date); 