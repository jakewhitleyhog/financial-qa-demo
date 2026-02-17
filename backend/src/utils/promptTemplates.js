/**
 * Prompt Templates for LLM Text-to-SQL and Response Generation
 *
 * These templates are critical for generating accurate SQL queries
 * and natural language responses.
 */

/**
 * Generate the text-to-SQL prompt
 * @param {string} userQuestion - The user's question
 * @param {string} schema - Full database schema
 * @param {Object} sampleData - Sample rows from each table
 * @returns {string} - The formatted prompt
 */
export function buildTextToSQLPrompt(userQuestion, schema, sampleData) {
  // Format sample data for readability
  const formattedSamples = Object.entries(sampleData)
    .map(([tableName, rows]) => {
      if (rows.length === 0) return `${tableName}: (no sample data)`;
      return `${tableName}:\n${JSON.stringify(rows.slice(0, 2), null, 2)}`;
    })
    .join('\n\n');

  return `You are a data analyst with access to a SQLite database containing:
- Financial data (companies, quarterly financials, expenses, metrics)
- Forum/community Q&A (questions, replies, upvotes)
- Chat history (sessions, messages, routing metadata)
- Escalation tracking (questions needing human review)

DATABASE SCHEMA (ALL TABLES):
${schema}

SAMPLE DATA FROM EACH TABLE:
${formattedSamples}

EXAMPLE QUERIES:
- "What was TechFlow's Q3 2024 revenue?" → SELECT revenue, year, quarter FROM quarterly_financials qf JOIN companies c ON qf.company_id = c.id WHERE c.ticker_symbol = 'TFLW' AND year = 2024 AND quarter = 3
- "What are the top 5 most upvoted forum questions?" → SELECT title, upvotes FROM forum_questions ORDER BY upvotes DESC LIMIT 5
- "How many questions were escalated this week?" → SELECT COUNT(*) as count FROM escalated_questions WHERE created_at > date('now', '-7 days')
- "Which company has the highest gross margin?" → SELECT c.name, ((qf.gross_profit * 100.0) / qf.revenue) as gross_margin_pct FROM quarterly_financials qf JOIN companies c ON qf.company_id = c.id WHERE qf.year = 2024 AND qf.quarter = 4 ORDER BY gross_margin_pct DESC LIMIT 1

CONSTRAINTS:
- ONLY generate SELECT queries (no INSERT, UPDATE, DELETE, DROP, ALTER)
- Use proper JOINs, WHERE clauses, and LIMIT
- Return calculations with meaningful column aliases
- You can query ANY table in the database
- For percentage calculations, multiply by 100.0 for proper float division
- Use date('now') for current date comparisons

USER QUESTION: ${userQuestion}

TASK:
1. Determine which table(s) the question relates to
2. Generate a safe SQL query to answer it
3. If the question is completely unrelated to the database contents (e.g., "What's the weather?"), respond with: OUT_OF_SCOPE

Generate ONLY the SQL query with no explanation, markdown formatting, or extra text. Just the raw SQL query.`;
}

/**
 * Generate the results-to-natural-language prompt
 * @param {string} userQuestion - The original user question
 * @param {string} sqlQuery - The SQL query that was executed
 * @param {Array} results - The query results
 * @returns {string} - The formatted prompt
 */
export function buildResultsToNLPrompt(userQuestion, sqlQuery, results) {
  return `You generated this SQL query:
${sqlQuery}

The query returned these results:
${JSON.stringify(results, null, 2)}

The user's original question was: ${userQuestion}

TASK:
Provide a clear, concise answer to the user's question based on these results.

FORMATTING GUIDELINES:
- Use currency formatting for monetary values (e.g., "$5.2M" or "$5,200,000")
- Use percentages with 1-2 decimal places (e.g., "25.5%" or "65%")
- For dates, use readable formats (e.g., "Q3 2024" or "September 2024")
- If comparing multiple values, use bullet points or numbered lists
- If the results are empty, politely explain that no matching data was found
- Keep the response concise (2-4 sentences maximum unless listing multiple items)
- Do not mention the SQL query or technical details unless asked

Generate your natural language response:`;
}

/**
 * Generate the confidence scoring prompt
 * @param {string} userQuestion - The user's question
 * @param {string} sqlQuery - The generated SQL query
 * @param {Array} results - The query results
 * @returns {string} - The formatted prompt
 */
export function buildConfidencePrompt(userQuestion, sqlQuery, results) {
  return `You are evaluating the quality of a text-to-SQL system's response.

USER QUESTION: ${userQuestion}

GENERATED SQL: ${sqlQuery}

RESULTS: ${JSON.stringify(results)}

TASK:
Rate your confidence that this SQL query correctly and completely answers the user's question.

CONSIDERATIONS:
- Does the query target the right tables and columns?
- Are the results meaningful and complete?
- Could the question be ambiguous or require clarification?
- Are there edge cases or nuances the query might miss?
- Does the result set appear to answer what was asked?

CONFIDENCE SCALE:
- 0.9-1.0: Very confident - clear question with accurate, complete results
- 0.7-0.89: Confident - minor ambiguity or potential edge cases
- 0.5-0.69: Moderate confidence - some uncertainty in interpretation
- 0.0-0.49: Low confidence - likely needs human review

Respond with ONLY a single number between 0.0 and 1.0 representing your confidence score.
Do not include any explanation, just the number.

Confidence score:`;
}

/**
 * Detect if a question is out of scope (unrelated to database)
 * @param {string} userQuestion - The user's question
 * @returns {string} - The formatted prompt
 */
export function buildScopeDetectionPrompt(userQuestion) {
  return `You are a scope detection system for a database query assistant.

The database contains:
- Financial data (company revenues, expenses, profits, metrics)
- Forum Q&A discussions (questions, replies, upvotes)
- Chat history (user conversations, messages)
- Escalation tracking (questions flagged for human review)

USER QUESTION: ${userQuestion}

TASK:
Determine if this question is related to any data in the database.

EXAMPLES OF IN-SCOPE QUESTIONS:
- "What was TechFlow's revenue?" ✓ (financial data)
- "What are the top upvoted questions?" ✓ (forum data)
- "How many chats were escalated?" ✓ (escalation data)
- "Show me recent forum discussions about expenses" ✓ (forum + financial topic)

EXAMPLES OF OUT-OF-SCOPE QUESTIONS:
- "What's the weather today?" ✗ (unrelated to database)
- "How do I bake a cake?" ✗ (unrelated to database)
- "Who won the game yesterday?" ✗ (unrelated to database)

Respond with ONLY one of these two words:
- IN_SCOPE (if the question relates to database contents)
- OUT_OF_SCOPE (if the question is unrelated to database contents)

Your response:`;
}

export default {
  buildTextToSQLPrompt,
  buildResultsToNLPrompt,
  buildConfidencePrompt,
  buildScopeDetectionPrompt
};
