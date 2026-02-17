-- Customer Q&A Webapp Database Schema
-- SQLite database with tables for financial data, forum Q&A, chat, and routing

-- ======================
-- FINANCIAL DATA TABLES
-- ======================

CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ticker_symbol TEXT UNIQUE NOT NULL,
    industry TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quarterly_financials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    revenue DECIMAL(15, 2) NOT NULL,
    cost_of_revenue DECIMAL(15, 2) NOT NULL,
    gross_profit DECIMAL(15, 2) NOT NULL,
    operating_expenses DECIMAL(15, 2) NOT NULL,
    operating_income DECIMAL(15, 2) NOT NULL,
    net_income DECIMAL(15, 2) NOT NULL,
    earnings_per_share DECIMAL(10, 4),
    report_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    UNIQUE(company_id, year, quarter)
);

CREATE TABLE IF NOT EXISTS expense_breakdown (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quarterly_financial_id INTEGER NOT NULL,
    category TEXT NOT NULL, -- 'R&D', 'Sales & Marketing', 'G&A', etc.
    amount DECIMAL(15, 2) NOT NULL,
    percentage_of_revenue DECIMAL(5, 2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quarterly_financial_id) REFERENCES quarterly_financials(id)
);

CREATE TABLE IF NOT EXISTS key_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quarterly_financial_id INTEGER NOT NULL,
    metric_name TEXT NOT NULL, -- 'gross_margin', 'operating_margin', 'customer_count', etc.
    metric_value DECIMAL(15, 4) NOT NULL,
    unit TEXT, -- 'percentage', 'count', 'dollars', etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quarterly_financial_id) REFERENCES quarterly_financials(id)
);

CREATE TABLE IF NOT EXISTS financial_reports_markdown (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quarterly_financial_id INTEGER NOT NULL,
    markdown_content TEXT NOT NULL,
    report_type TEXT DEFAULT 'quarterly', -- 'quarterly', 'annual', 'earnings_call'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quarterly_financial_id) REFERENCES quarterly_financials(id)
);

-- ======================
-- FORUM Q&A TABLES
-- ======================

CREATE TABLE IF NOT EXISTS forum_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL, -- Simplified; no auth for MVP
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    is_answered BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    parent_reply_id INTEGER, -- NULL for top-level replies, allows threading
    user_name TEXT NOT NULL,
    body TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    is_accepted_answer BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES forum_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forum_upvotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_session_id TEXT NOT NULL, -- Track by session to prevent multiple upvotes
    target_type TEXT NOT NULL CHECK (target_type IN ('question', 'reply')),
    target_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_session_id, target_type, target_id)
);

-- ======================
-- CHAT & ROUTING TABLES
-- ======================

CREATE TABLE IF NOT EXISTS chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_name TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,

    -- Text-to-SQL metadata
    generated_sql TEXT, -- Store the SQL query generated (for assistant messages)
    sql_results TEXT, -- Store raw SQL results (JSON)

    -- Routing/confidence metadata
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
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
    source_id INTEGER NOT NULL, -- chat_message.id or forum_question.id
    session_id TEXT, -- NULL for forum questions
    user_name TEXT,
    question_text TEXT NOT NULL,
    escalation_reason TEXT NOT NULL,
    confidence_score DECIMAL(3, 2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    assigned_to TEXT,
    resolution_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME
);

-- ======================
-- INDEXES FOR PERFORMANCE
-- ======================

CREATE INDEX IF NOT EXISTS idx_quarterly_financials_company ON quarterly_financials(company_id, year, quarter);
CREATE INDEX IF NOT EXISTS idx_forum_questions_created ON forum_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_questions_upvotes ON forum_questions(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_question ON forum_replies(question_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_escalated_questions_status ON escalated_questions(status, created_at);
