-- Seed data for Huntington Oil & Gas II / WEM Uintah V Investor Portal
-- Data sourced from Bridgeland Project documents and financial model

-- =============================
-- DEAL
-- =============================

INSERT INTO deals (name, entity_name, deal_type, basin, state, leasehold_acres, mineral_acres, surface_acres, total_wells_planned, capital_raise_target, target_irr, target_moic, return_of_capital_years, expected_hold_period, management_fee_structure, management_promote, fund_breakeven_oil_price, status, vintage_year) VALUES
('Huntington Oil & Gas II', 'WEM Uintah V, LLC', 'oil_gas', 'Uinta Basin', 'UT', 13800, 3170, 2422, 70, 220000000, 20.0, 3.3, 4.4, 5, 'One-time cost plus 10% as debt and equity capital is deployed. Corporate G&A shared across all WEM entities ($6MM gross, est. $1.5MM net to WEM V).', 30.0, 45.00, 'active', 2024);

-- =============================
-- WELLS (from Schedule sheet - all 70 wells)
-- =============================

INSERT INTO wells (deal_id, well_name, working_interest, well_type, gross_cost, net_cost, spud_date, frac_date, online_date, status) VALUES
(1, 'Quarter 1H', 0.502, 'Tier 1', 9750000, 4894500, '2024-09-05', '2024-11-04', '2024-12-14', 'producing'),
(1, 'Walker 7H', 0.9945, 'Tier 1', 9750000, 9696375, '2024-09-05', '2024-11-04', '2024-12-14', 'producing'),
(1, 'Morgan 1H', 0.1787, 'Tier 1', 9750000, 1742325, '2024-09-05', '2024-11-04', '2024-12-14', 'producing'),
(1, 'Shire 1H', 0.5842, 'Tier 1', 9750000, 5695950, '2024-10-25', '2024-12-13', '2025-01-14', 'producing'),
(1, 'Clydesdale 7H', 0.6279, 'Tier 2', 9750000, 6122025, '2024-10-25', '2024-12-13', '2025-01-14', 'producing'),
(1, 'Blackbuck 1H', 0.683, 'Tier 3 15k', 12500000, 8537083, '2024-11-29', '2025-02-12', '2025-04-01', 'producing'),
(1, 'Bongo 7H', 0.611, 'Tier 3 15k', 12500000, 7634956, '2024-11-29', '2025-02-12', '2025-04-01', 'producing'),
(1, 'Nilgai 1H', 1.0, 'Tier 3', 9750000, 9750000, '2024-11-29', '2025-02-12', '2025-04-01', 'producing'),
(1, 'Gemsbok 7H', 1.0, 'Tier 3', 9750000, 9750000, '2024-11-29', '2025-02-12', '2025-04-01', 'producing'),
(1, 'Appaloosa 1H', 0.9961, 'Tier 1', 9750000, 9711975, '2025-02-02', '2025-04-18', '2025-06-05', 'producing'),
(1, 'Appaloosa 2H', 0.9961, 'Tier 1', 9750000, 9711975, '2025-02-02', '2025-04-18', '2025-06-05', 'producing'),
(1, 'Appaloosa 3H', 0.9961, 'Tier 1', 9750000, 9711975, '2025-02-02', '2025-04-18', '2025-06-05', 'producing'),
(1, 'Appaloosa 4H', 0.9961, 'Tier 1', 9750000, 9711975, '2025-02-02', '2025-04-18', '2025-06-05', 'producing'),
(1, 'Arabian 1H', 0.9978, 'Tier 1', 9750000, 9728550, '2025-04-08', '2025-06-22', '2025-08-09', 'drilling'),
(1, 'Arabian 2H', 0.9978, 'Tier 1', 9750000, 9728550, '2025-04-08', '2025-06-22', '2025-08-09', 'drilling'),
(1, 'Arabian 3H', 0.9978, 'Tier 1', 9750000, 9728550, '2025-04-08', '2025-06-22', '2025-08-09', 'drilling'),
(1, 'Arabian 4H', 0.9978, 'Tier 1', 9750000, 9728550, '2025-04-08', '2025-06-22', '2025-08-09', 'drilling'),
(1, 'Walker 1H', 0.9945, 'Tier 1', 9750000, 9696375, '2025-06-12', '2025-08-26', '2025-10-13', 'planned'),
(1, 'Walker 2H', 0.9945, 'Tier 1', 9750000, 9696375, '2025-06-12', '2025-08-26', '2025-10-13', 'planned'),
(1, 'Walker 3H', 0.9945, 'Tier 1', 9750000, 9696375, '2025-06-12', '2025-08-26', '2025-10-13', 'planned'),
(1, 'Shire 2H', 0.5842, 'Tier 1', 9750000, 5695950, '2025-06-12', '2025-08-26', '2025-10-13', 'planned'),
(1, 'Shire 3H', 0.5842, 'Tier 1', 9750000, 5695950, '2025-08-16', '2025-10-30', '2025-12-17', 'planned'),
(1, 'Shire 4H', 0.5842, 'Tier 1', 9750000, 5695950, '2025-08-16', '2025-10-30', '2025-12-17', 'planned'),
(1, 'Quarter 2H', 0.502, 'Tier 1', 9750000, 4894500, '2025-08-16', '2025-10-30', '2025-12-17', 'planned'),
(1, 'Quarter 3H', 0.502, 'Tier 1', 9750000, 4894500, '2025-08-16', '2025-10-30', '2025-12-17', 'planned'),
(1, 'Quarter 4H', 0.502, 'Tier 1', 9750000, 4894500, '2025-10-20', '2025-12-19', '2026-01-28', 'planned'),
(1, 'Paint 1H', 0.9982, 'Tier 2', 9750000, 9732450, '2025-10-20', '2025-12-19', '2026-01-28', 'planned'),
(1, 'Paint 2H', 0.9982, 'Tier 2', 9750000, 9732450, '2025-10-20', '2025-12-19', '2026-01-28', 'planned'),
(1, 'Paint 3H', 0.9982, 'Tier 2', 9750000, 9732450, '2025-12-09', '2026-02-07', '2026-03-19', 'planned'),
(1, 'Paint 4H', 0.9982, 'Tier 2', 9750000, 9732450, '2025-12-09', '2026-02-07', '2026-03-19', 'planned'),
(1, 'Mustang 1H', 0.9401, 'Tier 2', 9750000, 9165975, '2025-12-09', '2026-02-07', '2026-03-19', 'planned'),
(1, 'Mustang 2H', 0.9401, 'Tier 2', 9750000, 9165975, '2026-01-28', '2026-03-29', '2026-05-08', 'planned'),
(1, 'Mustang 3H', 0.9401, 'Tier 2', 9750000, 9165975, '2026-01-28', '2026-03-29', '2026-05-08', 'planned'),
(1, 'Mustang 4H', 0.9401, 'Tier 2', 9750000, 9165975, '2026-01-28', '2026-03-29', '2026-05-08', 'planned'),
(1, 'Clydesdale 1H', 0.6279, 'Tier 2', 9750000, 6122025, '2026-03-19', '2026-05-18', '2026-06-27', 'planned'),
(1, 'Clydesdale 2H', 0.6279, 'Tier 2', 9750000, 6122025, '2026-03-19', '2026-05-18', '2026-06-27', 'planned'),
(1, 'Clydesdale 3H', 0.6279, 'Tier 2', 9750000, 6122025, '2026-03-19', '2026-05-18', '2026-06-27', 'planned'),
(1, 'Morgan 4H', 0.1787, 'Tier 1', 9750000, 1742325, '2026-05-08', '2026-07-07', '2026-08-16', 'planned'),
(1, 'Morgan 3H', 0.1787, 'Tier 1', 9750000, 1742325, '2026-05-08', '2026-07-07', '2026-08-16', 'planned'),
(1, 'Morgan 2H', 0.1787, 'Tier 1', 9750000, 1742325, '2026-05-08', '2026-07-07', '2026-08-16', 'planned'),
(1, 'Nilgai Infill-3', 1.0, 'Tier 3', 9750000, 9750000, '2026-06-27', '2026-09-10', '2026-10-28', 'planned'),
(1, 'Nilgai Infill-1', 1.0, 'Tier 3', 9750000, 9750000, '2026-06-27', '2026-09-10', '2026-10-28', 'planned'),
(1, 'Nilgai Infill-4', 1.0, 'Tier 3', 9750000, 9750000, '2026-06-27', '2026-09-10', '2026-10-28', 'planned'),
(1, 'Nilgai Infill-2', 1.0, 'Tier 3', 9750000, 9750000, '2026-06-27', '2026-09-10', '2026-10-28', 'planned'),
(1, 'Blackbuck Infill-3', 0.683, 'Tier 3 15k', 12500000, 8537083, '2026-08-31', '2026-11-14', '2027-01-01', 'planned'),
(1, 'Blackbuck Infill-4', 0.683, 'Tier 3 15k', 12500000, 8537083, '2026-08-31', '2026-11-14', '2027-01-01', 'planned'),
(1, 'Blackbuck Infill-1', 0.683, 'Tier 3 15k', 12500000, 8537083, '2026-08-31', '2026-11-14', '2027-01-01', 'planned'),
(1, 'Blackbuck Infill-2', 0.683, 'Tier 3 15k', 12500000, 8537083, '2026-08-31', '2026-11-14', '2027-01-01', 'planned'),
(1, 'Gemsbok Infill-3', 1.0, 'Tier 3', 9750000, 9750000, '2026-11-04', '2027-01-03', '2027-02-12', 'planned'),
(1, 'Gemsbok Infill-2', 1.0, 'Tier 3', 9750000, 9750000, '2026-11-04', '2027-01-03', '2027-02-12', 'planned'),
(1, 'Gemsbok Infill-1', 1.0, 'Tier 3', 9750000, 9750000, '2026-11-04', '2027-01-03', '2027-02-12', 'planned'),
(1, 'Bongo Infill-3', 0.611, 'Tier 3 15k', 12500000, 7634956, '2026-12-24', '2027-02-22', '2027-04-03', 'planned'),
(1, 'Bongo Infill-2', 0.611, 'Tier 3 15k', 12500000, 7634956, '2026-12-24', '2027-02-22', '2027-04-03', 'planned'),
(1, 'Bongo Infill-1', 0.611, 'Tier 3 15k', 12500000, 7634956, '2026-12-24', '2027-02-22', '2027-04-03', 'planned'),
(1, 'Appaloosa LP Infill-3', 0.9961, 'LP', 9500000, 9462950, '2027-02-12', '2027-04-28', '2027-06-15', 'planned'),
(1, 'Appaloosa LP Infill-2', 0.9961, 'LP', 9500000, 9462950, '2027-02-12', '2027-04-28', '2027-06-15', 'planned'),
(1, 'Appaloosa LP Infill-4', 0.9961, 'LP', 9500000, 9462950, '2027-02-12', '2027-04-28', '2027-06-15', 'planned'),
(1, 'Appaloosa LP Infill-1', 0.9961, 'LP', 9500000, 9462950, '2027-02-12', '2027-04-28', '2027-06-15', 'planned'),
(1, 'Arabian LP Infill-1', 0.9978, 'LP', 9500000, 9479100, '2027-04-18', '2027-07-02', '2027-08-19', 'planned'),
(1, 'Arabian LP Infill-2', 0.9978, 'LP', 9500000, 9479100, '2027-04-18', '2027-07-02', '2027-08-19', 'planned'),
(1, 'Arabian LP Infill-3', 0.9978, 'LP', 9500000, 9479100, '2027-04-18', '2027-07-02', '2027-08-19', 'planned'),
(1, 'Arabian LP Infill-4', 0.9978, 'LP', 9500000, 9479100, '2027-04-18', '2027-07-02', '2027-08-19', 'planned'),
(1, 'Walker LP Infill-1', 0.9945, 'LP', 9500000, 9447750, '2027-06-22', '2027-09-05', '2027-10-23', 'planned'),
(1, 'Walker LP Infill-2', 0.9945, 'LP', 9500000, 9447750, '2027-06-22', '2027-09-05', '2027-10-23', 'planned'),
(1, 'Walker LP Infill-3', 0.9945, 'LP', 9500000, 9447750, '2027-06-22', '2027-09-05', '2027-10-23', 'planned'),
(1, 'Walker LP Infill-4', 0.9945, 'LP', 9500000, 9447750, '2027-06-22', '2027-09-05', '2027-10-23', 'planned'),
(1, 'Quarter LP Infill-4', 0.502, 'LP', 9500000, 4769000, '2027-08-26', '2027-11-09', '2027-12-27', 'planned'),
(1, 'Quarter LP Infill-1', 0.502, 'LP', 9500000, 4769000, '2027-08-26', '2027-11-09', '2027-12-27', 'planned'),
(1, 'Quarter LP Infill-3', 0.502, 'LP', 9500000, 4769000, '2027-08-26', '2027-11-09', '2027-12-27', 'planned'),
(1, 'Quarter LP Infill-2', 0.502, 'LP', 9500000, 4769000, '2027-08-26', '2027-11-09', '2027-12-27', 'planned');

-- =============================
-- WELL TYPE ECONOMICS
-- =============================

INSERT INTO well_type_economics (deal_id, tier_name, location_count, pct_of_inventory, gross_well_cost, npv_0, npv_5, npv_10, npv_15, irr, moic, return_of_capital_years, oil_eur_mbbl, gas_eur_mmcf, water_eur_mbbl, lateral_length_ft, eur_per_ft) VALUES
(1, 'Tier 1', 17, 30, 9750000, 19830000, 14440000, 11190000, 9020000, 116.0, 3.0, 1.1, 733, 631, 716, 10360, 70.75),
(1, 'Tier 2', 10, 18, 9750000, 13890000, 9770000, 7240000, 5540000, 65.0, 2.4, 1.5, 597, 626, 711, 10360, 57.63),
(1, 'Tier 3 15k', 6, 10, 12500000, 11140000, 7060000, 4580000, 2910000, 32.0, 1.9, 2.5, 597, 626, 711, 15640, 38.17),
(1, 'Tier 3', 9, 16, 9750000, 7910000, 5340000, 3620000, 2400000, 33.0, 1.8, 2.3, 458, 485, 720, 10360, 44.21),
(1, 'LP', 14, 25, 9500000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 580, 596, 777, 10360, 55.98);

-- =============================
-- ANNUAL FINANCIALS
-- =============================

INSERT INTO annual_financials (deal_id, period_year, oil_revenue, gas_revenue, total_revenue, total_operating_expenses, operating_income, net_income, capex_drilling, capex_completion, total_capex, avg_daily_oil_bopd, avg_daily_gas_mcfpd, avg_daily_total_boepd, total_oil_production_bbl, total_gas_production_mcf, gross_producing_wells, investor_distributions, report_date) VALUES
(1, 2024, 3457035, 30167, 3487201, 572471, 3395951, 2195951, 19667561, 12991550, 170259389, 222.0, 62.0, 232.3, 54016, 15083, 4.4, 0, '2024-12-31'),
(1, 2025, 168841555, 2661803, 171503358, 22870979, 152245655, 147520655, 77432774, 104074532, 199658037, 7227.8, 3646.3, 7835.5, 2638149, 1330902, 17.3, 0, '2025-12-31'),
(1, 2026, 250840798, 6422913, 257263711, 36087865, 227139489, 223494489, 67601351, 106236185, 191221290, 10738.0, 8798.5, 12204.5, 3919387, 3211456, 40.5, 0, '2026-12-31'),
(1, 2027, 279625690, 7476571, 287102261, 42898971, 252495563, 203560563, 58952602, 112188316, 188255010, 11970.3, 10241.9, 13677.3, 4369151, 3738285, 62.2, 47000000, '2027-12-31'),
(1, 2028, 192247402, 6236335, 198483737, 30875426, 172944387, -24500452, 0, 0, 0, 8229.8, 8542.9, 9653.6, 3003866, 3118167, 71.2, 188632411, '2028-12-31'),
(1, 2029, 118142163, 4262056, 122404219, 20842310, 104819421, -6782133, 0, 0, 0, 5057.5, 5838.4, 6030.5, 1845971, 2131028, 71.0, 76861088, '2029-12-31'),
(1, 2030, 89397790, 3289054, 92686844, 16983695, 78154233, -3271042, 0, 0, 0, 3827.0, 4505.6, 4577.9, 1396840, 1644527, 71.0, 55737692, '2030-12-31');

-- =============================
-- PROJECTED RETURNS
-- =============================

INSERT INTO projected_returns (deal_id, scenario, capital_invested, capital_returned, moic, irr, return_of_capital_years, return_of_capital_date) VALUES
(1, 'invest_and_hold', 220000000, 718000000, 3.3, 20.0, 4.4, '2028-11-30'),
(1, 'exit_at_year_5', 220000000, 617000000, 2.8, 28.0, 4.4, '2028-11-30');

-- =============================
-- PRICE SENSITIVITIES
-- =============================

INSERT INTO price_sensitivities (deal_id, oil_price_per_bbl, capital_invested, capital_returned, moic, irr, return_of_capital_years, return_of_capital_date) VALUES
(1, 70, 224000000, 526000000, 2.5, 14.0, 5.4, '2029-11-30'),
(1, 80, 220000000, 530000000, 3.3, 20.0, 4.4, '2028-11-30'),
(1, 90, 218000000, 532000000, 4.0, 27.0, 3.8, '2028-04-30');

-- =============================
-- CAPITAL ALLOCATION
-- =============================

INSERT INTO capital_allocation (deal_id, category, percentage, amount) VALUES
(1, 'drilling', 33, 72600000),
(1, 'completion', 49, 107800000),
(1, 'acquisition', 14, 30800000),
(1, 'infrastructure', 4, 8800000);

-- =============================
-- OPERATING ASSUMPTIONS
-- =============================

INSERT INTO operating_assumptions (deal_id, category, unit, cost_basis, vertical_cost, horizontal_cost) VALUES
(1, 'Fixed LOE 1', '$/month/well', 'WI', '$2,500', '$15,000'),
(1, 'Fixed LOE 2', '$/month/well', 'WI', '$0', '$7,500'),
(1, 'Variable Oil', '$/bbl', 'WI', '$2.00', '$2.00'),
(1, 'Variable Gas', '$/mcf', 'WI', '$0.35', '$0.35'),
(1, 'Variable Water', '$/bbl', 'WI', '$1.50', '$1.50'),
(1, 'Ad Valorem Tax', '% Revenue', 'NRI', '1%', '1%'),
(1, 'Severance Tax', '% Revenue', 'NRI', '6%', '6%');

-- =============================
-- TRACK RECORD
-- =============================

INSERT INTO track_record (entity_name, capital_raised, capital_returned, year_raised, current_boe_d, net_acres, strategy) VALUES
('WEM I', 78000000, 77000000, 2018, 2300, 5400, 'Non-Operated & Operated'),
('WEM II', 166000000, 230000000, 2020, 2700, 4000, 'Operated'),
('WEM III', 174000000, 106000000, 2022, 2500, 4600, 'Non-Operated & Joint Venture'),
('WEM IV', 220000000, 36000000, 2023, 6000, 13800, 'Joint Venture');

-- =============================
-- INFRASTRUCTURE
-- =============================

INSERT INTO infrastructure (deal_id, asset_name, ownership_pct, description, fresh_water_storage_bbl, produced_water_storage_bbl, daily_water_throughput_bbl, daily_gas_throughput_mmcf, current_pipeline_miles, planned_pipeline_miles) VALUES
(1, 'reWater, LLC', 55.0, 'For-profit infrastructure entity serving WEM assets and 3rd party operators. Revenue sources include water/gas transport fees, disposal fees, and frac water fees.', 1200000, 2775541, 40000, 22, 7.0, 15.5);

-- =============================
-- AUTHORIZED INVESTORS
-- =============================

INSERT INTO authorized_investors (email, name, role, deal_id, investment_amount, ownership_percentage) VALUES
('jake@example.com', 'Jake Whitley', 'admin', 1, 2000000, 0.91),
('sarah.chen@example.com', 'Sarah Chen', 'investor', 1, 1000000, 0.45),
('michael.ross@example.com', 'Michael Ross', 'investor', 1, 5000000, 2.27),
('emily.davis@example.com', 'Emily Davis', 'investor', 1, 2500000, 1.14),
('david.park@example.com', 'David Park', 'investor', 1, 10000000, 4.55),
('lisa.johnson@example.com', 'Lisa Johnson', 'investor', 1, 1500000, 0.68);

-- =============================
-- FORUM QUESTIONS
-- =============================

INSERT INTO forum_questions (investor_id, user_name, title, body, upvotes, is_answered, created_at) VALUES
(1, 'Jake Whitley', 'What is the drilling timeline for the first pad?', 'I see the first wells are planned for Q3 2024. Can we get more details on the spud-to-production timeline and which wells are being drilled first?', 8, 1, '2024-08-15 10:30:00'),
(2, 'Sarah Chen', 'How does WEM V acreage compare to WEM IV results?', 'The teaser mentions WEM V is expected to exceed WEM IV results. What is the basis for this expectation?', 5, 1, '2024-08-20 14:20:00'),
(3, 'Michael Ross', 'What are the Tier 1 vs Tier 2 well economics?', 'Can someone explain the difference in expected returns between Tier 1 and Tier 2 locations? The IRR spread seems significant.', 6, 0, '2024-09-10 09:15:00'),
(4, 'Emily Davis', 'What happens if oil drops to $60/bbl?', 'The price sensitivities show $70 and $80 scenarios. Has anyone modeled a more bearish case below $70? The fund breakeven is listed at $45 WTI.', 4, 0, '2024-09-18 11:45:00'),
(5, 'David Park', 'Explain the reWater infrastructure investment', 'WEM V owns 55% of reWater, LLC. How significant is the revenue contribution from this infrastructure asset?', 3, 0, '2024-10-05 16:00:00'),
(1, 'Jake Whitley', 'What is the expected peak production rate?', 'Looking at the development plan, when does the program reach peak daily production and what is the projected rate?', 7, 1, '2024-10-10 08:30:00'),
(6, 'Lisa Johnson', 'When should we expect first distributions?', 'The model shows cashflow recycling in years 1-3. When does actual cash start flowing back to investors?', 2, 0, '2024-10-15 13:00:00'),
(2, 'Sarah Chen', 'How does the management promote work?', 'Can someone clarify the 30% management promote structure? Is it a standard waterfall or does it apply differently?', 5, 0, '2024-10-20 10:00:00');

-- =============================
-- FORUM REPLIES
-- =============================

INSERT INTO forum_replies (question_id, parent_reply_id, investor_id, user_name, body, upvotes, is_accepted_answer, created_at) VALUES
(1, NULL, 3, 'Michael Ross', 'From the schedule, the first 3 wells (Quarter 1H, Walker 7H, Morgan 1H) spud in September 2024 with frac in November and online by December. The second pad (Shire 1H, Clydesdale 7H) follows about 7 weeks later.', 4, 0, '2024-08-16 08:00:00'),
(1, 1, 1, 'Jake Whitley', 'Thanks Michael. So roughly 3-4 months from spud to first production. That cadence looks consistent across the program.', 2, 0, '2024-08-16 09:30:00'),
(2, NULL, 4, 'Emily Davis', 'The presentation notes that WEM V is expected to be higher pressure with more benches available for exploitation. The GMBU field results from WEM IV showed 21 wells with 6-month cumulative of 150 MBO, which is very strong.', 3, 1, '2024-08-21 10:00:00'),
(2, 3, 2, 'Sarah Chen', 'Great context, thanks Emily. The Betts pad completion tests also show that larger fracs dramatically improve recovery.', 1, 0, '2024-08-21 11:00:00'),
(6, NULL, 5, 'David Park', 'You can ask the AI assistant about production forecasts. Based on the model, peak production hits around 14,000+ Boepd in mid-2027 with all 70+ wells online.', 3, 0, '2024-10-10 09:00:00'),
(6, 5, 1, 'Jake Whitley', 'Good call. The AI pulled up the data - avg daily production peaks in 2027 at about 13,677 Boepd.', 2, 0, '2024-10-10 09:30:00');

-- =============================
-- FORUM UPVOTES
-- =============================

INSERT INTO forum_upvotes (investor_id, target_type, target_id) VALUES
(2, 'question', 1), (3, 'question', 1), (4, 'question', 1), (5, 'question', 1), (6, 'question', 1),
(1, 'question', 2), (3, 'question', 2), (4, 'question', 2), (5, 'question', 2),
(1, 'question', 3), (2, 'question', 3), (4, 'question', 3), (5, 'question', 3), (6, 'question', 3),
(1, 'question', 4), (2, 'question', 4), (5, 'question', 4),
(1, 'question', 5), (2, 'question', 5), (3, 'question', 5),
(2, 'question', 6), (3, 'question', 6), (4, 'question', 6), (5, 'question', 6), (6, 'question', 6),
(1, 'question', 7), (3, 'question', 7),
(1, 'question', 8), (3, 'question', 8), (4, 'question', 8), (5, 'question', 8);
