-- Investor Deal Portal Database Schema
-- SQLite database for oil & gas drilling opportunity (Huntington Oil & Gas II / WEM Uintah V)

-- =============================
-- DEAL & ASSET DATA TABLES
-- =============================

CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    entity_name TEXT,
    deal_type TEXT NOT NULL,
    basin TEXT,
    state TEXT,
    leasehold_acres INTEGER,
    mineral_acres INTEGER,
    surface_acres INTEGER,
    total_wells_planned INTEGER,
    capital_raise_target DECIMAL(15, 2),
    target_irr DECIMAL(5, 2),
    target_moic DECIMAL(5, 2),
    return_of_capital_years DECIMAL(4, 1),
    expected_hold_period INTEGER,
    management_fee_structure TEXT,
    management_promote DECIMAL(5, 2),
    fund_breakeven_oil_price DECIMAL(8, 2),
    status TEXT DEFAULT 'active',
    vintage_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wells (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id INTEGER NOT NULL,
    well_name TEXT NOT NULL,
    working_interest DECIMAL(6, 4),
    well_type TEXT NOT NULL,
    gross_cost DECIMAL(15, 2),
    net_cost DECIMAL(15, 2),
    spud_date DATE,
    frac_date DATE,
    online_date DATE,
    status TEXT DEFAULT 'planned',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id)
);

CREATE TABLE IF NOT EXISTS well_type_economics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id INTEGER NOT NULL,
    tier_name TEXT NOT NULL,
    location_count INTEGER,
    pct_of_inventory DECIMAL(5, 2),
    gross_well_cost DECIMAL(15, 2),
    npv_0 DECIMAL(15, 2),
    npv_5 DECIMAL(15, 2),
    npv_10 DECIMAL(15, 2),
    npv_15 DECIMAL(15, 2),
    irr DECIMAL(8, 2),
    moic DECIMAL(5, 2),
    return_of_capital_years DECIMAL(4, 1),
    oil_eur_mbbl INTEGER,
    gas_eur_mmcf INTEGER,
    water_eur_mbbl INTEGER,
    lateral_length_ft INTEGER,
    eur_per_ft DECIMAL(8, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id)
);

CREATE TABLE IF NOT EXISTS annual_financials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id INTEGER NOT NULL,
    period_year INTEGER NOT NULL,
    oil_revenue DECIMAL(15, 2),
    gas_revenue DECIMAL(15, 2),
    total_revenue DECIMAL(15, 2),
    total_operating_expenses DECIMAL(15, 2),
    operating_income DECIMAL(15, 2),
    net_income DECIMAL(15, 2),
    capex_drilling DECIMAL(15, 2),
    capex_completion DECIMAL(15, 2),
    total_capex DECIMAL(15, 2),
    avg_daily_oil_bopd DECIMAL(10, 1),
    avg_daily_gas_mcfpd DECIMAL(10, 1),
    avg_daily_total_boepd DECIMAL(10, 1),
    total_oil_production_bbl INTEGER,
    total_gas_production_mcf INTEGER,
    gross_producing_wells DECIMAL(5, 1),
    investor_distributions DECIMAL(15, 2),
    report_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id),
    UNIQUE(deal_id, period_year)
);

CREATE TABLE IF NOT EXISTS projected_returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id INTEGER NOT NULL,
    scenario TEXT NOT NULL,
    capital_invested DECIMAL(15, 2),
    capital_returned DECIMAL(15, 2),
    moic DECIMAL(5, 2),
    irr DECIMAL(5, 2),
    return_of_capital_years DECIMAL(4, 1),
    return_of_capital_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id)
);

CREATE TABLE IF NOT EXISTS price_sensitivities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id INTEGER NOT NULL,
    oil_price_per_bbl DECIMAL(8, 2),
    capital_invested DECIMAL(15, 2),
    capital_returned DECIMAL(15, 2),
    moic DECIMAL(5, 2),
    irr DECIMAL(5, 2),
    return_of_capital_years DECIMAL(4, 1),
    return_of_capital_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id)
);

CREATE TABLE IF NOT EXISTS capital_allocation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    percentage DECIMAL(5, 2),
    amount DECIMAL(15, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id)
);

CREATE TABLE IF NOT EXISTS operating_assumptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    unit TEXT,
    cost_basis TEXT,
    vertical_cost TEXT,
    horizontal_cost TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id)
);

CREATE TABLE IF NOT EXISTS track_record (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_name TEXT NOT NULL,
    capital_raised DECIMAL(15, 2),
    capital_returned DECIMAL(15, 2),
    year_raised INTEGER,
    current_boe_d INTEGER,
    net_acres INTEGER,
    strategy TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS infrastructure (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id INTEGER NOT NULL,
    asset_name TEXT NOT NULL,
    ownership_pct DECIMAL(5, 2),
    description TEXT,
    fresh_water_storage_bbl INTEGER,
    produced_water_storage_bbl INTEGER,
    daily_water_throughput_bbl INTEGER,
    daily_gas_throughput_mmcf INTEGER,
    current_pipeline_miles DECIMAL(5, 1),
    planned_pipeline_miles DECIMAL(5, 1),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id)
);

-- =============================
-- INVESTOR & AUTH TABLES
-- =============================

CREATE TABLE IF NOT EXISTS authorized_investors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'investor',
    deal_id INTEGER,
    investment_amount DECIMAL(15, 2),
    ownership_percentage DECIMAL(5, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id)
);

CREATE TABLE IF NOT EXISTS auth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investor_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investor_id) REFERENCES authorized_investors(id)
);

-- =============================
-- FORUM Q&A TABLES
-- =============================

CREATE TABLE IF NOT EXISTS forum_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investor_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    is_answered BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investor_id) REFERENCES authorized_investors(id)
);

CREATE TABLE IF NOT EXISTS forum_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    parent_reply_id INTEGER,
    investor_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    body TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    is_accepted_answer BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES forum_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE,
    FOREIGN KEY (investor_id) REFERENCES authorized_investors(id)
);

CREATE TABLE IF NOT EXISTS forum_upvotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    investor_id INTEGER NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('question', 'reply')),
    target_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(investor_id, target_type, target_id),
    FOREIGN KEY (investor_id) REFERENCES authorized_investors(id)
);

-- =============================
-- CHAT & ROUTING TABLES
-- =============================

CREATE TABLE IF NOT EXISTS chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    investor_id INTEGER NOT NULL,
    user_name TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investor_id) REFERENCES authorized_investors(id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    generated_sql TEXT,
    sql_results TEXT,
    confidence_score DECIMAL(3, 2),
    complexity_level TEXT CHECK (complexity_level IN ('simple', 'moderate', 'complex')),
    is_in_scope BOOLEAN DEFAULT 1,
    needs_escalation BOOLEAN DEFAULT 0,
    escalation_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id)
);

CREATE TABLE IF NOT EXISTS escalated_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL CHECK (source_type IN ('chat', 'forum')),
    source_id INTEGER NOT NULL,
    session_id TEXT,
    investor_id INTEGER,
    user_name TEXT,
    question_text TEXT NOT NULL,
    escalation_reason TEXT NOT NULL,
    confidence_score DECIMAL(3, 2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    assigned_to TEXT,
    resolution_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (investor_id) REFERENCES authorized_investors(id)
);

-- =============================
-- INDEXES
-- =============================

CREATE INDEX IF NOT EXISTS idx_wells_deal ON wells(deal_id, well_type);
CREATE INDEX IF NOT EXISTS idx_annual_financials_deal ON annual_financials(deal_id, period_year);
CREATE INDEX IF NOT EXISTS idx_well_type_economics_deal ON well_type_economics(deal_id, tier_name);
CREATE INDEX IF NOT EXISTS idx_forum_questions_created ON forum_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_questions_upvotes ON forum_questions(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_question ON forum_replies(question_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_escalated_questions_status ON escalated_questions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_authorized_investors_email ON authorized_investors(email);
