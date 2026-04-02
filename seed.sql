-- ========================================
-- Seed Financial Records ONLY
-- ========================================

-- Delete existing records before seeding (optional, but good for clean starts)
DELETE FROM financial_records;

-- ========================================
-- PREVIOUS MONTH DATA (March 2026)
-- Baseline metrics
-- ========================================

INSERT INTO financial_records (user_id, amount, type, category, description, date) VALUES
-- March Income
(1, 450000.00, 'income', 'Sales / Revenue', 'Monthly product sales revenue', '2026-03-05'),
(1, 15000.00, 'income', 'Investments / Returns', 'Stock dividends', '2026-03-12'),
(1, 2000.00, 'income', 'Other Income', 'Tax refund', '2026-03-20'),

-- March Expenses
(1, 120000.00, 'expense', 'Operations', 'Rent and Utilities', '2026-03-01'),
(1, 80000.00, 'expense', 'Payroll / Staff', 'Part-time staff salaries', '2026-03-28'),
(1, 40000.00, 'expense', 'Travel / Marketing', 'March Ad campaign', '2026-03-15');


-- ========================================
-- CURRENT MONTH DATA (April 2026)
-- Testing current metrics and Anomaly detection
-- ========================================

INSERT INTO financial_records (user_id, amount, type, category, description, date) VALUES
-- April Income (Projected similar to March)
(1, 465000.00, 'income', 'Sales / Revenue', 'April product sales revenue', '2026-04-01'),
(1, 12000.00, 'income', 'Investments / Returns', 'Interest income', '2026-04-02'),

-- April Expenses (Operations - Normal)
(1, 125000.00, 'expense', 'Operations', 'Rent and office supplies', '2026-04-01'),

-- April Expenses (Payroll - Normal)
(1, 82000.00, 'expense', 'Payroll / Staff', 'Salaries and bonuses', '2026-04-02'),

-- April Expenses (Travel / Marketing - ANOMALY SPIKE)
-- Last Month was 40,000. This is 120,000 (>150% change) to trigger the anomaly detector.
(1, 120000.00, 'expense', 'Travel / Marketing', 'Aggressive Summer Campaign Spike', '2026-04-01'),

-- Additional diverse records for charts
(1, 5000.00, 'income', 'Other Income', 'Consultation fee', '2026-04-02'),
(1, 1500.00, 'expense', 'Operations', 'Internet and Cloud services', '2026-04-02');


-- ========================================
-- BASICS FOR TRENDS (February 2026)
-- To enable 3-month rolling averages or trend lines
-- ========================================

INSERT INTO financial_records (user_id, amount, type, category, description, date) VALUES
(1, 400000.00, 'income', 'Sales / Revenue', 'Feb product sales', '2026-02-15'),
(1, 110000.00, 'expense', 'Operations', 'Feb Rent', '2026-02-01'),
(1, 75000.00, 'expense', 'Payroll / Staff', 'Feb Salaries', '2026-02-28');
