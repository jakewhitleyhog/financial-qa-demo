# Customer Q&A Webapp with LLM Financial Assistant

An interactive demo webapp featuring a public Q&A forum and an AI-powered chat assistant that can query **all data** in the database using natural language.

## 🎯 Key Features

- **Public Q&A Forum**: Reddit-style forum with upvoting, threaded replies, and community discussions
- **LLM Chat Assistant**: Claude-powered chatbot that converts natural language questions into SQL queries
- **Universal Data Querying**: Ask questions about financial data, forum activity, chat history, AND escalation trends
- **Intelligent Routing**: Automatic confidence scoring, complexity detection, and escalation to human reviewers
- **Text-to-SQL Pipeline**: Secure SQL generation with comprehensive safety checks

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express
- SQLite (via sql.js)
- Anthropic Claude API (text-to-SQL generation)
- ES6 Modules

**Frontend:**
- React (to be implemented)
- Vite
- shadcn/ui (Radix UI + Tailwind CSS)

### Project Structure

```
financial-qa-demo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # SQLite configuration & helpers
│   │   │   └── claude.js            # Anthropic API client
│   │   ├── controllers/
│   │   │   ├── chatController.js    # Chat session & message handling
│   │   │   ├── forumController.js   # Forum Q&A operations
│   │   │   └── routingController.js # Escalation management
│   │   ├── services/
│   │   │   ├── llmService.js        # Text-to-SQL pipeline
│   │   │   └── routingService.js    # Confidence & complexity analysis
│   │   ├── utils/
│   │   │   ├── sqlSanitizer.js      # SQL injection prevention
│   │   │   └── promptTemplates.js   # LLM prompts
│   │   ├── routes/
│   │   │   ├── chat.js              # Chat API routes
│   │   │   ├── forum.js             # Forum API routes
│   │   │   └── routing.js           # Routing API routes
│   │   ├── middleware/
│   │   │   └── errorHandler.js      # Error handling
│   │   └── server.js                # Express app entry point
│   ├── database/
│   │   ├── schema.sql               # Database schema (all tables)
│   │   ├── seed.sql                 # Sample data
│   │   └── qa_demo.db               # SQLite database (auto-generated)
│   ├── package.json
│   └── .env                         # Environment variables
└── frontend/                        # (To be implemented)
```

## 📊 Database Schema

The database contains **four main categories** of tables, all queryable by the LLM:

### Financial Data Tables
- `companies`: Company profiles (TechFlow, RetailHub, GreenEnergy)
- `quarterly_financials`: Revenue, expenses, profits by quarter
- `expense_breakdown`: Detailed expense categories (R&D, Sales, G&A)
- `key_metrics`: Business metrics (margins, CAC, customer count)
- `financial_reports_markdown`: Optional markdown reports

### Forum Tables
- `forum_questions`: Question posts with upvotes
- `forum_replies`: Threaded replies (supports nesting)
- `forum_upvotes`: Upvote tracking by session

### Chat & Routing Tables
- `chat_sessions`: Chat session tracking
- `chat_messages`: Messages with SQL/routing metadata
- `escalated_questions`: Queue for human review

**Sample Data Includes:**
- 3 fictional companies with 8 quarters of financial data (2023-2024)
- 15 forum questions with replies and upvotes
- Sample chat history showing various query types

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone/navigate to project:**
   ```bash
   cd financial-qa-demo/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Edit the `.env` file and add your Anthropic API key:
   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

The server will:
- Initialize the database (create schema + seed data)
- Start on port 3000 (or PORT from .env)
- Display available API endpoints

### Verify Installation

```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Chat Endpoints

#### Create Chat Session
```http
POST /api/chat/sessions
Content-Type: application/json

{
  "userName": "Demo User"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": 1,
    "sessionId": "sess_...",
    "userName": "Demo User",
    "startedAt": "2024-..."
  }
}
```

#### Send Message
```http
POST /api/chat/sessions/:sessionId/message
Content-Type: application/json

{
  "message": "What was TechFlow's Q3 2024 revenue?"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": 123,
    "role": "assistant",
    "content": "TechFlow's revenue in Q3 2024 was $5.2 million...",
    "metadata": {
      "generatedSql": "SELECT revenue FROM quarterly_financials...",
      "resultCount": 1,
      "confidenceScore": 0.95,
      "complexityLevel": "simple",
      "isInScope": true,
      "needsEscalation": false
    },
    "createdAt": "2024-..."
  }
}
```

#### Get Session History
```http
GET /api/chat/sessions/:sessionId
```

#### List Sessions
```http
GET /api/chat/sessions?limit=20
```

### Forum Endpoints

#### Create Question
```http
POST /api/forum/questions
Content-Type: application/json

{
  "userName": "Sarah Chen",
  "title": "Question about revenue growth",
  "body": "What factors drove TechFlow's growth in 2024?"
}
```

#### List Questions
```http
GET /api/forum/questions?sortBy=popular&limit=20&offset=0
```

Query params:
- `sortBy`: `recent` | `popular` | `unanswered`
- `limit`: Number of questions (default: 20)
- `offset`: Pagination offset (default: 0)

#### Get Question with Replies
```http
GET /api/forum/questions/:id
```

#### Add Reply
```http
POST /api/forum/questions/:id/reply
Content-Type: application/json

{
  "userName": "Mike Johnson",
  "body": "Great question! Based on the data...",
  "parentReplyId": null  // or reply ID for threading
}
```

#### Upvote Question
```http
POST /api/forum/questions/:id/upvote
Content-Type: application/json

{
  "sessionId": "user_session_123"
}
```

#### Remove Upvote
```http
DELETE /api/forum/questions/:id/upvote
Content-Type: application/json

{
  "sessionId": "user_session_123"
}
```

#### Upvote Reply
```http
POST /api/forum/replies/:id/upvote
Content-Type: application/json

{
  "sessionId": "user_session_123"
}
```

### Routing/Escalation Endpoints

#### Manually Escalate Question
```http
POST /api/routing/escalate
Content-Type: application/json

{
  "sourceType": "chat",
  "sourceId": 123,
  "sessionId": "sess_...",
  "userName": "Demo User",
  "questionText": "What's the weather today?",
  "reason": "Out of scope question"
}
```

#### List Escalated Questions
```http
GET /api/routing/escalated?status=pending&limit=50
```

Query params:
- `status`: `pending` | `in_progress` | `resolved` (optional, omit for all)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

#### Get Escalated Question
```http
GET /api/routing/escalated/:id
```

#### Update Escalation Status
```http
PATCH /api/routing/escalated/:id
Content-Type: application/json

{
  "status": "resolved",
  "assignedTo": "John Doe",
  "resolutionNotes": "Answered via email"
}
```

#### Get Escalation Analytics
```http
GET /api/routing/analytics
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "total": 45,
    "byStatus": {
      "pending": 12,
      "in_progress": 8,
      "resolved": 25
    },
    "bySource": {
      "chat": 35,
      "forum": 10
    },
    "recentCount": 7,
    "averageConfidence": 0.42,
    "topReasons": [
      { "reason": "Out-of-scope", "count": 15 },
      { "reason": "Low confidence", "count": 12 }
    ]
  }
}
```

## 🤖 How Text-to-SQL Works

### Pipeline Flow

1. **User asks question** → "What was TechFlow's Q3 2024 revenue?"

2. **Scope detection** → Is question related to database contents?

3. **SQL generation** → Claude generates:
   ```sql
   SELECT revenue FROM quarterly_financials qf
   JOIN companies c ON qf.company_id = c.id
   WHERE c.ticker_symbol = 'TFLW'
   AND year = 2024 AND quarter = 3
   ```

4. **Security validation** → SQL sanitizer checks:
   - ✅ Only SELECT queries allowed
   - ✅ No dangerous keywords (DROP, DELETE, INSERT, etc.)
   - ✅ No SQL injection attempts
   - ✅ Query has LIMIT clause

5. **Execute query** → Run against SQLite database

6. **Format results** → Claude converts to natural language:
   > "TechFlow's revenue in Q3 2024 was $5.2 million, representing a 6.1% increase from Q2 2024..."

7. **Routing analysis** → Assess confidence, complexity, escalation needs

### Example Queries

**Financial Data:**
- "What was TechFlow's revenue in Q3 2024?"
- "Which company has the highest gross margin?"
- "Show me revenue trends for all companies"

**Forum Analytics:**
- "What are the top 5 most upvoted questions?"
- "How many questions were posted this week?"
- "Which topics get the most discussion?"

**Escalation Insights:**
- "How many questions were escalated in the last 7 days?"
- "What's the average confidence score for chat responses?"
- "Show me pending escalations"

**Cross-Table Analytics:**
- "What financial topics generate the most forum questions?"
- "Which companies have both high revenue and high forum engagement?"

## 🛡️ Security Features

### SQL Injection Prevention

**Whitelist Approach:**
- Only `SELECT` queries allowed
- Blacklist dangerous keywords (DROP, DELETE, INSERT, UPDATE, ALTER, etc.)
- No multi-statement queries (prevents `;` injection)
- No SQL comments (`--`, `/*`)

**Query Sanitization:**
- Automatic `LIMIT` clause addition (max 100 rows)
- Parameterized queries for user input
- Query timeout safeguards

### API Security

- **Rate Limiting**: 10 requests/minute for chat endpoints
- **CORS**: Restricted to frontend URL only
- **Environment Variables**: API keys never exposed to client
- **Error Handling**: Sensitive stack traces hidden in production

## 🎯 Intelligent Routing System

### Confidence Scoring

**Multi-factor assessment:**
- **LLM Self-Assessment (70%)**: Claude rates its own confidence
- **Heuristic Signals (30%)**:
  - Has results? (empty = lower confidence)
  - Query complexity (more JOINs = lower confidence)
  - Question clarity (vague = lower confidence)

**Confidence Levels:**
- 🟢 **High** (0.9-1.0): Very confident, accurate results
- 🟡 **Moderate** (0.7-0.89): Some ambiguity or edge cases
- 🔴 **Low** (0.0-0.69): Needs human review

### Complexity Detection

**Scoring factors:**
- Multi-table JOINs (+2 per JOIN)
- Subqueries (+3 each)
- Aggregations/GROUP BY (+1)
- Comparative analysis keywords (+2)

**Complexity Levels:**
- **Simple** (≤2): Straightforward single-table queries
- **Moderate** (3-5): Some joins or aggregations
- **Complex** (≥6): Multi-step reasoning, multiple JOINs

### Escalation Logic

**Automatic escalation when:**
- ❌ Out of scope (unrelated to database)
- ❌ Low confidence (<0.6)
- ❌ Complex query + moderate confidence (<0.8)
- ❌ Processing error occurred
- ❌ User manually requested escalation

## 📝 Code Documentation

### Key Files

**Backend Core:**
- [database.js](backend/src/config/database.js) - SQLite configuration and query helpers
- [llmService.js](backend/src/services/llmService.js) - Text-to-SQL pipeline orchestration
- [routingService.js](backend/src/services/routingService.js) - Confidence scoring and escalation logic
- [sqlSanitizer.js](backend/src/utils/sqlSanitizer.js) - **Critical security layer** for SQL validation
- [promptTemplates.js](backend/src/utils/promptTemplates.js) - LLM prompt engineering

**API Controllers:**
- [chatController.js](backend/src/controllers/chatController.js) - Chat session and messaging
- [forumController.js](backend/src/controllers/forumController.js) - Forum Q&A operations
- [routingController.js](backend/src/controllers/routingController.js) - Escalation management

**Database:**
- [schema.sql](backend/database/schema.sql) - Complete database schema (all tables)
- [seed.sql](backend/database/seed.sql) - Sample data (companies, forum posts, chat history)

### Code Comments

All files include comprehensive inline documentation:
- Function docstrings with parameter descriptions
- Complex logic explanations
- Security considerations
- Error handling notes

## 🎬 Demo Script

### Preparation

1. Start the backend server
2. Ensure database is seeded
3. Have Anthropic API key configured

### Demo Flow

**1. Health Check**
```bash
curl http://localhost:3000/health
```

**2. Forum Demo**

List questions:
```bash
curl http://localhost:3000/api/forum/questions?sortBy=popular
```

Create a question:
```bash
curl -X POST http://localhost:3000/api/forum/questions \
  -H "Content-Type: application/json" \
  -d '{"userName":"Demo User","title":"Revenue comparison","body":"How do the companies compare?"}'
```

**3. Chat Demo - Financial Query**

Create session:
```bash
curl -X POST http://localhost:3000/api/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{"userName":"Demo User"}'
```

Ask about revenue (simple query, high confidence):
```bash
curl -X POST http://localhost:3000/api/chat/sessions/sess_.../message \
  -H "Content-Type: application/json" \
  -d '{"message":"What was TechFlow'\''s Q3 2024 revenue?"}'
```

**4. Chat Demo - Forum Analytics** (🎯 Unique Feature!)

Ask about forum data:
```bash
curl -X POST http://localhost:3000/api/chat/sessions/sess_.../message \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the top 3 most upvoted questions?"}'
```

**5. Chat Demo - Out of Scope**

Trigger escalation:
```bash
curl -X POST http://localhost:3000/api/chat/sessions/sess_.../message \
  -H "Content-Type: application/json" \
  -d '{"message":"What'\''s the weather today?"}'
```

**6. Escalation Analytics**
```bash
curl http://localhost:3000/api/routing/analytics
```

## 🐛 Troubleshooting

### Common Issues

**"ANTHROPIC_API_KEY is not set"**
- Edit `.env` file and add your API key
- Restart the server

**"Database not initialized"**
- Delete `backend/database/qa_demo.db`
- Restart server (will auto-regenerate)

**"Port 3000 already in use"**
- Change `PORT` in `.env`
- Or kill process using port 3000

**Rate limit errors**
- Wait 1 minute between requests
- Adjust `RATE_LIMIT_*` settings in `.env`

## 🚧 Next Steps

**Frontend Development:**
- Set up React + Vite project
- Install shadcn/ui components
- Build chat interface with confidence indicators
- Build forum UI with upvoting
- Implement routing indicators and escalation banners

**Testing:**
- End-to-end tests for all API endpoints
- Security testing (SQL injection attempts)
- Load testing (rate limits, concurrent requests)

**Enhancements:**
- User authentication
- Real-time updates (WebSockets)
- Advanced analytics dashboard
- Email notifications for escalations
- Multi-turn conversation context

## 📄 License

ISC

## 🙏 Acknowledgments

- Built with Claude 3.5 Sonnet (Anthropic)
- Uses shadcn/ui for modern UI components
- Inspired by Reddit's upvoting system

---

**Built for demo purposes** - Showcase text-to-SQL capabilities with intelligent routing