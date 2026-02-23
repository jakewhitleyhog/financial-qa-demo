/**
 * Prompt Templates for LLM Text-to-SQL and Response Generation
 * Configured for oil & gas deal data queries (Huntington Oil & Gas II / WEM Uintah V).
 */

/**
 * Generate the text-to-SQL prompt
 */
export function buildTextToSQLPrompt(userQuestion, schema, sampleData) {
  const formattedSamples = Object.entries(sampleData)
    .map(([tableName, rows]) => {
      if (rows.length === 0) return `${tableName}: (no sample data)`;
      return `${tableName}:\n${JSON.stringify(rows.slice(0, 2), null, 2)}`;
    })
    .join('\n\n');

  return `You are a data analyst for an oil & gas investment portal with access to a SQLite database containing:
- Deal/asset data (Uinta Basin drilling opportunity, acreage, well count, target returns)
- Well inventory (70 wells with names, types, working interests, costs, spud/frac/online dates, status)
- Well type economics by tier (Tier 1, Tier 2, Tier 3, Tier 3 15k, LP - with IRR, MOIC, NPV, EUR)
- Annual financials (oil/gas revenue, production volumes, operating expenses, capex, distributions)
- Projected returns (invest & hold vs exit scenarios, MOIC, IRR)
- Price sensitivities ($70/$80/$90 WTI scenarios)
- Capital allocation (drilling, completion, acquisition, infrastructure)
- Operating assumptions (LOE, severance tax, ad valorem)
- Manager track record (WEM I through WEM IV historical performance)
- Infrastructure (reWater, LLC - pipelines, water storage, throughput)
- Investor community Q&A forum (questions, replies, upvotes)
- Chat history (sessions, messages, routing metadata)

DATABASE SCHEMA (ALL TABLES):
${schema}

SAMPLE DATA FROM EACH TABLE:
${formattedSamples}

EXAMPLE QUERIES:
- "How many wells are planned?" → SELECT total_wells_planned FROM deals WHERE id = 1
- "What are the Tier 1 well economics?" → SELECT tier_name, gross_well_cost, irr, moic, return_of_capital_years, oil_eur_mbbl FROM well_type_economics WHERE deal_id = 1 AND tier_name = 'Tier 1'
- "Show me production by year" → SELECT period_year, avg_daily_oil_bopd, avg_daily_total_boepd, total_oil_production_bbl, total_revenue FROM annual_financials WHERE deal_id = 1 ORDER BY period_year
- "What is the target IRR?" → SELECT target_irr, target_moic, return_of_capital_years FROM deals WHERE id = 1
- "How many wells are currently producing?" → SELECT COUNT(*) as producing_wells FROM wells WHERE deal_id = 1 AND status = 'producing'
- "What are the price sensitivities?" → SELECT oil_price_per_bbl, moic, irr, return_of_capital_years FROM price_sensitivities WHERE deal_id = 1
- "Show me the WEM track record" → SELECT entity_name, capital_raised, capital_returned, year_raised, current_boe_d, net_acres FROM track_record ORDER BY year_raised
- "What is the capital allocation?" → SELECT category, percentage, amount FROM capital_allocation WHERE deal_id = 1
- "List the wells being drilled" → SELECT well_name, well_type, working_interest, spud_date, online_date FROM wells WHERE deal_id = 1 AND status = 'drilling'

CONSTRAINTS:
- ONLY generate SELECT queries (no INSERT, UPDATE, DELETE, DROP, ALTER)
- Use proper JOINs, WHERE clauses, and LIMIT
- Return calculations with meaningful column aliases
- You can query ANY table in the database
- For percentage calculations, multiply by 100.0 for proper float division
- Use date('now') for current date comparisons
- Default to deal_id = 1 when querying deal-specific tables

USER QUESTION: ${userQuestion}

TASK:
1. Determine which table(s) the question relates to
2. Generate a safe SQL query to answer it
3. If the question is completely unrelated to the database contents (e.g., "What's the weather?"), respond with: OUT_OF_SCOPE

Generate ONLY the SQL query with no explanation, markdown formatting, or extra text. Just the raw SQL query.`;
}

/**
 * Generate the results-to-natural-language prompt
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
- Use currency formatting for monetary values (e.g., "$220M" or "$9.75MM per well")
- Use percentages with 1-2 decimal places (e.g., "20% IRR" or "116% IRR")
- For oil & gas metrics: Bopd, Boepd, Mcfpd, EUR, MOIC, IRR, NPV, WI (working interest)
- For dates, use readable formats (e.g., "Q3 2024" or "September 2024")
- Use barrel abbreviations: bbl (barrels), Mbbl (thousand barrels), MMbbl (million barrels)
- If comparing multiple values, use bullet points or numbered lists
- If the results are empty, politely explain that no matching data was found
- Keep the response concise (2-4 sentences maximum unless listing multiple items)
- Do not mention the SQL query or technical details unless asked

Generate your natural language response:`;
}

/**
 * Generate the confidence scoring prompt
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
 * Detect if a question is out of scope
 */
export function buildScopeDetectionPrompt(userQuestion) {
  return `You are a scope detection system for an oil & gas investment data query assistant.

The database contains:
- Oil & gas deal data (Uinta Basin drilling opportunity - acreage, wells, target returns, capital raise)
- Well inventory (70 horizontal wells across Tier 1, Tier 2, Tier 3, LP types with costs and schedules)
- Well type economics (IRR, MOIC, NPV, EUR by tier)
- Annual financial projections (revenue, production, capex, opex, distributions)
- Projected returns and price sensitivity scenarios
- Capital allocation, operating cost assumptions, infrastructure details
- Manager track record (WEM I through WEM IV)
- Investor community Q&A forum (questions, replies, upvotes)
- Chat history (user conversations, messages)
- Escalation tracking (questions flagged for human review)

USER QUESTION: ${userQuestion}

TASK:
Determine if this question is related to any data in the database.

EXAMPLES OF IN-SCOPE QUESTIONS:
- "What is the target IRR?" ✓ (deal data)
- "How many wells are planned?" ✓ (wells)
- "What are the Tier 1 economics?" ✓ (well economics)
- "Show me projected production" ✓ (annual financials)
- "What is the fund breakeven price?" ✓ (deal data)
- "What is the WEM track record?" ✓ (track record)
- "How is capital allocated?" ✓ (capital allocation)
- "What are the top upvoted questions?" ✓ (forum data)

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
