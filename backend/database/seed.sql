-- Seed data for Customer Q&A Webapp Demo
-- Sample companies, financial data, forum questions, chat history, and escalations

-- ======================
-- COMPANIES
-- ======================

INSERT INTO companies (name, ticker_symbol, industry, description) VALUES
('TechFlow Inc.', 'TFLW', 'SaaS', 'Enterprise workflow automation platform for mid-market companies'),
('RetailHub Corp.', 'RTHB', 'E-commerce', 'Multi-channel retail management and inventory optimization software'),
('GreenEnergy Solutions', 'GREN', 'Renewable Energy', 'Solar and wind energy project financing and management platform');

-- ======================
-- QUARTERLY FINANCIALS (8 quarters for each company: Q1 2023 - Q4 2024)
-- ======================

-- TechFlow Inc. - Growing SaaS company
INSERT INTO quarterly_financials (company_id, year, quarter, revenue, cost_of_revenue, gross_profit, operating_expenses, operating_income, net_income, earnings_per_share, report_date) VALUES
(1, 2023, 1, 2800000, 980000, 1820000, 1680000, 140000, 112000, 0.11, '2023-03-31'),
(1, 2023, 2, 3200000, 1120000, 2080000, 1920000, 160000, 128000, 0.13, '2023-06-30'),
(1, 2023, 3, 3600000, 1260000, 2340000, 2088000, 252000, 201600, 0.20, '2023-09-30'),
(1, 2023, 4, 4100000, 1435000, 2665000, 2378500, 286500, 229200, 0.23, '2023-12-31'),
(1, 2024, 1, 4500000, 1575000, 2925000, 2565000, 360000, 288000, 0.29, '2024-03-31'),
(1, 2024, 2, 4900000, 1715000, 3185000, 2750500, 434500, 347600, 0.35, '2024-06-30'),
(1, 2024, 3, 5200000, 1820000, 3380000, 2912000, 468000, 374400, 0.37, '2024-09-30'),
(1, 2024, 4, 5800000, 2030000, 3770000, 3190000, 580000, 464000, 0.46, '2024-12-31');

-- RetailHub Corp. - Steady growth
INSERT INTO quarterly_financials (company_id, year, quarter, revenue, cost_of_revenue, gross_profit, operating_expenses, operating_income, net_income, earnings_per_share, report_date) VALUES
(2, 2023, 1, 4500000, 1800000, 2700000, 2340000, 360000, 288000, 0.29, '2023-03-31'),
(2, 2023, 2, 4800000, 1920000, 2880000, 2496000, 384000, 307200, 0.31, '2023-06-30'),
(2, 2023, 3, 5100000, 2040000, 3060000, 2652000, 408000, 326400, 0.33, '2023-09-30'),
(2, 2023, 4, 5400000, 2160000, 3240000, 2808000, 432000, 345600, 0.35, '2023-12-31'),
(2, 2024, 1, 5700000, 2280000, 3420000, 2964000, 456000, 364800, 0.36, '2024-03-31'),
(2, 2024, 2, 6000000, 2400000, 3600000, 3120000, 480000, 384000, 0.38, '2024-06-30'),
(2, 2024, 3, 6300000, 2520000, 3780000, 3276000, 504000, 403200, 0.40, '2024-09-30'),
(2, 2024, 4, 6600000, 2640000, 3960000, 3432000, 528000, 422400, 0.42, '2024-12-31');

-- GreenEnergy Solutions - High growth, some volatility
INSERT INTO quarterly_financials (company_id, year, quarter, revenue, cost_of_revenue, gross_profit, operating_expenses, operating_income, net_income, earnings_per_share, report_date) VALUES
(3, 2023, 1, 3200000, 1408000, 1792000, 1664000, 128000, 102400, 0.10, '2023-03-31'),
(3, 2023, 2, 3800000, 1672000, 2128000, 1978400, 149600, 119680, 0.12, '2023-06-30'),
(3, 2023, 3, 4200000, 1848000, 2352000, 2184960, 167040, 133632, 0.13, '2023-09-30'),
(3, 2023, 4, 3900000, 1716000, 2184000, 2028720, 155280, 124224, 0.12, '2023-12-31'),
(3, 2024, 1, 4800000, 2112000, 2688000, 2496000, 192000, 153600, 0.15, '2024-03-31'),
(3, 2024, 2, 5500000, 2420000, 3080000, 2860800, 219200, 175360, 0.18, '2024-06-30'),
(3, 2024, 3, 6200000, 2728000, 3472000, 3223520, 248480, 198784, 0.20, '2024-09-30'),
(3, 2024, 4, 7000000, 3080000, 3920000, 3640000, 280000, 224000, 0.22, '2024-12-31');

-- ======================
-- EXPENSE BREAKDOWN (Last 4 quarters for each company)
-- ======================

-- TechFlow Q1-Q4 2024
INSERT INTO expense_breakdown (quarterly_financial_id, category, amount, percentage_of_revenue) VALUES
(5, 'R&D', 1170000, 26.0),
(5, 'Sales & Marketing', 900000, 20.0),
(5, 'G&A', 495000, 11.0),
(6, 'R&D', 1323000, 27.0),
(6, 'Sales & Marketing', 980000, 20.0),
(6, 'G&A', 447500, 9.1),
(7, 'R&D', 1456000, 28.0),
(7, 'Sales & Marketing', 1040000, 20.0),
(7, 'G&A', 416000, 8.0),
(8, 'R&D', 1624000, 28.0),
(8, 'Sales & Marketing', 1160000, 20.0),
(8, 'G&A', 406000, 7.0);

-- RetailHub Q1-Q4 2024
INSERT INTO expense_breakdown (quarterly_financial_id, category, amount, percentage_of_revenue) VALUES
(13, 'R&D', 1140000, 20.0),
(13, 'Sales & Marketing', 1140000, 20.0),
(13, 'G&A', 684000, 12.0),
(14, 'R&D', 1200000, 20.0),
(14, 'Sales & Marketing', 1200000, 20.0),
(14, 'G&A', 720000, 12.0),
(15, 'R&D', 1260000, 20.0),
(15, 'Sales & Marketing', 1260000, 20.0),
(15, 'G&A', 756000, 12.0),
(16, 'R&D', 1320000, 20.0),
(16, 'Sales & Marketing', 1320000, 20.0),
(16, 'G&A', 792000, 12.0);

-- GreenEnergy Q1-Q4 2024
INSERT INTO expense_breakdown (quarterly_financial_id, category, amount, percentage_of_revenue) VALUES
(21, 'R&D', 960000, 20.0),
(21, 'Sales & Marketing', 1056000, 22.0),
(21, 'G&A', 480000, 10.0),
(22, 'R&D', 1100000, 20.0),
(22, 'Sales & Marketing', 1210000, 22.0),
(22, 'G&A', 550000, 10.0),
(23, 'R&D', 1240000, 20.0),
(23, 'Sales & Marketing', 1364000, 22.0),
(23, 'G&A', 620000, 10.0),
(24, 'R&D', 1400000, 20.0),
(24, 'Sales & Marketing', 1540000, 22.0),
(24, 'G&A', 700000, 10.0);

-- ======================
-- KEY METRICS (Q4 2024 for each company)
-- ======================

INSERT INTO key_metrics (quarterly_financial_id, metric_name, metric_value, unit) VALUES
-- TechFlow Q4 2024
(8, 'gross_margin', 65.0, 'percentage'),
(8, 'operating_margin', 10.0, 'percentage'),
(8, 'customer_count', 3450, 'count'),
(8, 'customer_acquisition_cost', 1200, 'dollars'),
(8, 'monthly_recurring_revenue', 1900000, 'dollars'),
-- RetailHub Q4 2024
(16, 'gross_margin', 60.0, 'percentage'),
(16, 'operating_margin', 8.0, 'percentage'),
(16, 'customer_count', 4200, 'count'),
(16, 'customer_acquisition_cost', 950, 'dollars'),
(16, 'monthly_recurring_revenue', 2150000, 'dollars'),
-- GreenEnergy Q4 2024
(24, 'gross_margin', 56.0, 'percentage'),
(24, 'operating_margin', 4.0, 'percentage'),
(24, 'customer_count', 2100, 'count'),
(24, 'customer_acquisition_cost', 1800, 'dollars'),
(24, 'monthly_recurring_revenue', 2300000, 'dollars');

-- ======================
-- FORUM QUESTIONS (15 sample questions)
-- ======================

INSERT INTO forum_questions (user_name, title, body, upvotes, is_answered, created_at) VALUES
('Sarah Chen', 'What drove TechFlow''s revenue growth in Q3 2024?', 'I noticed TechFlow had significant revenue growth in Q3. What were the main factors behind this? Was it new customer acquisition or expansion from existing customers?', 12, 1, datetime('now', '-45 days')),
('Mike Johnson', 'How do the companies compare on R&D spending?', 'I''m curious about how much each company is investing in R&D as a percentage of revenue. Which company is most R&D intensive?', 8, 1, datetime('now', '-38 days')),
('Emily Rodriguez', 'RetailHub vs GreenEnergy - which has better margins?', 'Looking at profitability, which company has stronger margins? I''m trying to understand the unit economics better.', 15, 1, datetime('now', '-32 days')),
('David Kim', 'Concern about GreenEnergy''s Q4 2023 dip', 'I see GreenEnergy''s revenue dipped in Q4 2023 after steady growth. Should we be worried about this volatility?', 6, 1, datetime('now', '-28 days')),
('Rachel Thompson', 'Customer acquisition costs trending up or down?', 'Are customer acquisition costs improving over time for these companies? What''s the trend?', 10, 0, datetime('now', '-22 days')),
('James Wilson', 'Best company for long-term growth?', 'If you had to pick one of these three companies for long-term investment, which would it be and why?', 18, 1, datetime('now', '-18 days')),
('Lisa Anderson', 'Understanding TechFlow''s business model', 'Can someone explain TechFlow''s revenue model? Is it subscription-based or usage-based?', 4, 1, datetime('now', '-15 days')),
('Tom Martinez', 'Sales & Marketing efficiency comparison', 'Which company gets the best return on their Sales & Marketing spend? Looking at CAC and revenue growth together.', 7, 0, datetime('now', '-12 days')),
('Jennifer Lee', 'Why is GreenEnergy''s gross margin lower?', 'GreenEnergy has a lower gross margin than the other two companies. Is this typical for the renewable energy software space?', 9, 1, datetime('now', '-10 days')),
('Chris Brown', 'Quarter-over-quarter vs year-over-year growth', 'What''s the YoY revenue growth rate for each company in Q4 2024?', 5, 0, datetime('now', '-8 days')),
('Amanda White', 'Operating leverage - who''s winning?', 'Which company shows the best operating leverage? I want to see who''s scaling efficiently.', 11, 1, datetime('now', '-6 days')),
('Kevin Davis', 'Impact of economic conditions on these companies', 'How do you think the current economic environment affects each of these companies differently?', 3, 0, datetime('now', '-5 days')),
('Michelle Taylor', 'Total addressable market size comparison', 'Does anyone have insights on the TAM for each company''s market? Which has the largest opportunity?', 14, 1, datetime('now', '-4 days')),
('Robert Garcia', 'Profitability timeline for each company', 'When did each company first become profitable? Is TechFlow the only consistently profitable one?', 8, 1, datetime('now', '-2 days')),
('Nicole Clark', 'G&A expenses as % of revenue trending', 'I''m looking at how efficiently each company manages G&A expenses. What''s the trend over the last year?', 6, 0, datetime('now', '-1 day'));

-- ======================
-- FORUM REPLIES (Sample replies to top questions)
-- ======================

INSERT INTO forum_replies (question_id, parent_reply_id, user_name, body, upvotes, is_accepted_answer, created_at) VALUES
-- Replies to Q1 (TechFlow growth)
(1, NULL, 'Alex Morgan', 'Great question! Looking at the data, TechFlow grew from $4.9M in Q2 to $5.2M in Q3, which is about 6% QoQ growth. The R&D investment increased to 28% of revenue, suggesting they''re building new features that could drive expansion revenue.', 5, 1, datetime('now', '-44 days')),
(1, NULL, 'Jordan Smith', 'Also worth noting their customer count grew to 3,450 by Q4, which represents strong new customer acquisition.', 3, 0, datetime('now', '-43 days')),
-- Replies to Q2 (R&D spending)
(2, NULL, 'Patricia Evans', 'From the latest quarter (Q4 2024):\n- TechFlow: 28% of revenue on R&D\n- RetailHub: 20% on R&D\n- GreenEnergy: 20% on R&D\n\nTechFlow is clearly the most R&D intensive, which makes sense for an enterprise SaaS platform.', 6, 1, datetime('now', '-37 days')),
-- Replies to Q3 (Margins comparison)
(3, NULL, 'Marcus Johnson', 'RetailHub has the edge:\n- RetailHub gross margin: 60%, operating margin: 8%\n- GreenEnergy gross margin: 56%, operating margin: 4%\n\nRetailHub shows better unit economics overall.', 8, 1, datetime('now', '-31 days')),
(3, 1, 'Emily Rodriguez', 'Thanks Marcus! So RetailHub is more efficient even though both are in software?', 2, 0, datetime('now', '-30 days')),
(3, 2, 'Marcus Johnson', 'Exactly! RetailHub''s e-commerce focus likely has lower infrastructure costs compared to GreenEnergy''s energy project financing platform.', 4, 0, datetime('now', '-30 days')),
-- Replies to Q4 (GreenEnergy dip)
(4, NULL, 'Stephanie Wong', 'Q4 2023 dip from $4.2M to $3.9M could be seasonal. Renewable energy projects often have Q4 slowdowns. But they bounced back strong in 2024, hitting $7M in Q4 2024. I wouldn''t worry too much.', 4, 1, datetime('now', '-27 days')),
-- Replies to Q6 (Long-term growth)
(6, NULL, 'Andrew Miller', 'I''d go with TechFlow. Here''s why:\n1. Highest revenue growth trajectory\n2. Strong gross margins (65%)\n3. Heavy R&D investment positioning for future\n4. Reaching profitability scale\n\nThey''re executing well.', 12, 1, datetime('now', '-17 days')),
(6, 1, 'Samantha Cruz', 'Counterpoint: GreenEnergy has 75% YoY growth vs TechFlow''s 41%. Higher risk but higher potential return.', 6, 0, datetime('now', '-16 days'));

-- ======================
-- FORUM UPVOTES (Sample upvote tracking)
-- ======================

INSERT INTO forum_upvotes (user_session_id, target_type, target_id, created_at) VALUES
('session_001', 'question', 1, datetime('now', '-44 days')),
('session_002', 'question', 1, datetime('now', '-43 days')),
('session_003', 'question', 3, datetime('now', '-40 days')),
('session_004', 'reply', 1, datetime('now', '-44 days')),
('session_005', 'reply', 3, datetime('now', '-36 days')),
('session_006', 'question', 6, datetime('now', '-17 days')),
('session_007', 'reply', 7, datetime('now', '-16 days'));

-- ======================
-- CHAT SESSIONS (Sample chat sessions)
-- ======================

INSERT INTO chat_sessions (session_id, user_name, started_at, last_activity) VALUES
('sess_demo_001', 'Demo User', datetime('now', '-5 days'), datetime('now', '-5 days')),
('sess_demo_002', 'Demo User', datetime('now', '-3 days'), datetime('now', '-3 days')),
('sess_demo_003', 'Sarah Chen', datetime('now', '-1 day'), datetime('now', '-1 day'));

-- ======================
-- CHAT MESSAGES (Sample chat history)
-- ======================

INSERT INTO chat_messages (session_id, role, content, generated_sql, sql_results, confidence_score, complexity_level, is_in_scope, needs_escalation, created_at) VALUES
-- Session 1: Simple financial query
('sess_demo_001', 'user', 'What was TechFlow''s revenue in Q3 2024?', NULL, NULL, NULL, NULL, 1, 0, datetime('now', '-5 days', '+1 minute')),
('sess_demo_001', 'assistant', 'TechFlow''s revenue in Q3 2024 was $5.2 million, representing a 6.1% increase from Q2 2024 ($4.9M) and a 44.4% increase year-over-year from Q3 2023 ($3.6M).', 'SELECT revenue, year, quarter FROM quarterly_financials qf JOIN companies c ON qf.company_id = c.id WHERE c.ticker_symbol = ''TFLW'' AND year = 2024 AND quarter = 3', '[{"revenue":5200000,"year":2024,"quarter":3}]', 0.95, 'simple', 1, 0, datetime('now', '-5 days', '+2 minutes')),
-- Session 2: Forum analytics query
('sess_demo_002', 'user', 'What are the top 3 most upvoted questions?', NULL, NULL, NULL, NULL, 1, 0, datetime('now', '-3 days', '+1 minute')),
('sess_demo_002', 'assistant', 'The top 3 most upvoted questions are:\n1. "Best company for long-term growth?" - 18 upvotes\n2. "RetailHub vs GreenEnergy - which has better margins?" - 15 upvotes\n3. "Total addressable market size comparison" - 14 upvotes', 'SELECT title, upvotes FROM forum_questions ORDER BY upvotes DESC LIMIT 3', '[{"title":"Best company for long-term growth?","upvotes":18},{"title":"RetailHub vs GreenEnergy - which has better margins?","upvotes":15},{"title":"Total addressable market size comparison","upvotes":14}]', 0.92, 'simple', 1, 0, datetime('now', '-3 days', '+2 minutes')),
-- Session 3: Out of scope query
('sess_demo_003', 'user', 'What''s the weather like today?', NULL, NULL, NULL, NULL, 0, 1, datetime('now', '-1 day', '+1 minute')),
('sess_demo_003', 'assistant', 'I apologize, but I can only answer questions related to the financial data, forum discussions, chat history, and escalation tracking in our database. Weather information is outside my scope. Is there anything about the company financials or forum activity I can help you with?', NULL, NULL, 0.15, 'simple', 0, 1, datetime('now', '-1 day', '+2 minutes'));

-- ======================
-- ESCALATED QUESTIONS (Sample escalations)
-- ======================

INSERT INTO escalated_questions (source_type, source_id, session_id, user_name, question_text, escalation_reason, confidence_score, status, created_at) VALUES
('chat', 6, 'sess_demo_003', 'Sarah Chen', 'What''s the weather like today?', 'Out-of-scope: Question unrelated to database contents', 0.15, 'pending', datetime('now', '-1 day', '+3 minutes')),
('forum', 12, NULL, 'Kevin Davis', 'Impact of economic conditions on these companies', 'Complex analysis requiring expert judgment', NULL, 'pending', datetime('now', '-5 days')),
('chat', 999, 'sess_old_001', 'Test User', 'How do I calculate IRR for these investments?', 'Low confidence: Complex financial calculation outside data scope', 0.35, 'resolved', datetime('now', '-10 days'));
