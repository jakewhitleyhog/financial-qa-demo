/**
 * LLM Service - Core text-to-SQL and natural language generation
 *
 * This service handles:
 * - Text-to-SQL generation using Claude
 * - SQL execution with safety checks
 * - Natural language response formatting
 * - Scope detection (is question related to database?)
 */

import { getClaudeClient, MODEL_CONFIG } from '../config/claude.js';
import { query as dbQuery, getSchema, getSampleData } from '../config/database.js';
import { validateAndSanitize } from '../utils/sqlSanitizer.js';
import {
  buildTextToSQLPrompt,
  buildResultsToNLPrompt,
} from '../utils/promptTemplates.js';

/**
 * Build a valid history messages array for the Claude API.
 * Ensures messages alternate user/assistant starting with user and ending with assistant,
 * so the caller can safely append the current user message after.
 *
 * @param {Array<{role: string, content: string}>} conversationHistory
 * @returns {Array<{role: string, content: string}>}
 */
function buildHistoryMessages(conversationHistory) {
  const filtered = [];
  let expectedRole = 'user';
  for (const msg of conversationHistory) {
    if (msg.role === expectedRole) {
      filtered.push({ role: msg.role, content: msg.content });
      expectedRole = expectedRole === 'user' ? 'assistant' : 'user';
    }
  }
  // Ensure history ends with assistant so the new user message follows correctly
  while (filtered.length > 0 && filtered[filtered.length - 1].role !== 'assistant') {
    filtered.pop();
  }
  return filtered;
}

/**
 * Main text-to-SQL pipeline
 * Takes a user question and returns a natural language answer
 *
 * @param {string} userQuestion - The user's question
 * @param {Array<{role: string, content: string}>} [conversationHistory=[]] - Prior session messages
 * @returns {Promise<Object>} - Result object with answer, metadata, and any errors
 */
export async function processQuestion(userQuestion, conversationHistory = []) {
  try {
    // Check if API key is configured
    const client = getClaudeClient();
    if (!client) {
      return {
        success: false,
        content: "⚠️ Chat features are currently disabled. The Anthropic API key has not been configured.\n\nTo enable AI chat:\n1. Get an API key from https://console.anthropic.com/\n2. Add it to backend/.env as ANTHROPIC_API_KEY=your-key\n3. Restart the backend server\n\n💡 Tip: The Forum features work without an API key!",
        metadata: {
          error: 'API key not configured',
          needsEscalation: false
        }
      };
    }

    // Step 1: Generate SQL query (also serves as scope detection — Claude returns
    // OUT_OF_SCOPE when the question is unrelated to the database, making a
    // separate detectScope() call redundant)
    const sqlGeneration = await generateSQL(userQuestion, conversationHistory);

    if (!sqlGeneration.success) {
      // Distinguish out-of-scope from a genuine SQL generation error
      if (sqlGeneration.error === 'Question is out of scope') {
        return {
          success: false,
          content: "I apologize, but I can only answer questions related to the financial data, forum discussions, chat history, and escalation tracking in our database. Your question appears to be outside my scope. Is there anything about the company financials or forum activity I can help you with?",
          metadata: {
            isInScope: false,
            needsEscalation: true,
            escalationReason: 'Out-of-scope: Question unrelated to database contents'
          }
        };
      }
      return {
        success: false,
        content: "I encountered an error trying to formulate a database query for your question. This may require human assistance.",
        metadata: {
          error: sqlGeneration.error,
          needsEscalation: true,
          escalationReason: 'SQL generation failed'
        }
      };
    }

    // Step 2: Validate and sanitize the SQL
    const validation = validateAndSanitize(sqlGeneration.sql);
    if (!validation.isValid) {
      console.error('SQL validation failed:', validation.error);
      return {
        success: false,
        content: "I generated an unsafe query for your question. For security reasons, I cannot execute it. A human team member will review your question.",
        metadata: {
          generatedSql: sqlGeneration.sql,
          validationError: validation.error,
          needsEscalation: true,
          escalationReason: 'SQL validation failed'
        }
      };
    }

    // Step 3: Execute the SQL query
    let results;
    try {
      results = dbQuery(validation.sanitizedQuery);
    } catch (error) {
      console.error('SQL execution error:', error);
      return {
        success: false,
        content: "I encountered an error while querying the database. The query may need refinement. A human team member can help with this.",
        metadata: {
          generatedSql: validation.sanitizedQuery,
          executionError: error.message,
          needsEscalation: true,
          escalationReason: 'SQL execution failed'
        }
      };
    }

    // Step 4: Format results into natural language
    const nlResponse = await formatResults(userQuestion, validation.sanitizedQuery, results, conversationHistory);

    // Step 5: Return successful response with metadata
    return {
      success: true,
      content: nlResponse.content,
      metadata: {
        generatedSql: validation.sanitizedQuery,
        sqlResults: results,
        resultCount: results.length,
        isInScope: true,
        needsEscalation: false
      }
    };

  } catch (error) {
    console.error('LLM Service error:', error);
    return {
      success: false,
      content: "I encountered an unexpected error while processing your question. Please try again or contact support.",
      metadata: {
        error: error.message,
        needsEscalation: true,
        escalationReason: 'Unexpected error in LLM service'
      }
    };
  }
}

/**
 * Generate SQL query from natural language question
 *
 * @param {string} userQuestion - The user's question
 * @param {Array<{role: string, content: string}>} [conversationHistory=[]] - Prior session messages
 * @returns {Promise<Object>} - { success: boolean, sql: string|null, error: string|null }
 */
export async function generateSQL(userQuestion, conversationHistory = []) {
  try {
    const client = getClaudeClient();

    if (!client) {
      return {
        success: false,
        sql: null,
        error: 'API key not configured'
      };
    }

    // Get database schema and sample data for context
    const schema = getSchema();
    const sampleData = getSampleData(2);

    // Build the prompt
    const prompt = buildTextToSQLPrompt(userQuestion, schema, sampleData);

    // Call Claude API, prepending prior conversation turns for follow-up context
    const response = await client.messages.create({
      ...MODEL_CONFIG,
      messages: [
        ...buildHistoryMessages(conversationHistory),
        { role: 'user', content: prompt }
      ]
    });

    const sqlQuery = response.content[0].text.trim();

    // Check if Claude returned OUT_OF_SCOPE — use strict equality to avoid
    // false-positives if a column name or string literal contains the substring
    if (sqlQuery.trim() === 'OUT_OF_SCOPE') {
      return {
        success: false,
        sql: null,
        error: 'Question is out of scope'
      };
    }

    return {
      success: true,
      sql: sqlQuery,
      error: null
    };

  } catch (error) {
    console.error('SQL generation error:', error);
    return {
      success: false,
      sql: null,
      error: error.message
    };
  }
}

/**
 * Format SQL results into natural language
 *
 * @param {string} userQuestion - The original user question
 * @param {string} sqlQuery - The SQL query that was executed
 * @param {Array} results - The query results
 * @param {Array<{role: string, content: string}>} [conversationHistory=[]] - Prior session messages
 * @returns {Promise<Object>} - { success: boolean, content: string }
 */
export async function formatResults(userQuestion, sqlQuery, results, conversationHistory = []) {
  try {
    const client = getClaudeClient();

    if (!client) {
      // Fallback: return raw results if no API key
      if (results.length === 0) {
        return {
          success: true,
          content: "No results found."
        };
      }
      return {
        success: true,
        content: `Found ${results.length} result(s): ${JSON.stringify(results, null, 2)}`
      };
    }

    // Build the prompt
    const prompt = buildResultsToNLPrompt(userQuestion, sqlQuery, results);

    // Call Claude API, prepending prior conversation turns for follow-up context
    const response = await client.messages.create({
      ...MODEL_CONFIG,
      messages: [
        ...buildHistoryMessages(conversationHistory),
        { role: 'user', content: prompt }
      ]
    });

    const naturalLanguageResponse = response.content[0].text.trim();

    return {
      success: true,
      content: naturalLanguageResponse
    };

  } catch (error) {
    console.error('Result formatting error:', error);

    // Fallback: return raw results if formatting fails
    if (results.length === 0) {
      return {
        success: true,
        content: "I couldn't find any data matching your question in the database."
      };
    }

    return {
      success: true,
      content: `I found ${results.length} result(s): ${JSON.stringify(results, null, 2)}`
    };
  }
}

/**
 * Stream SQL results formatted as natural language, emitting tokens via callback.
 *
 * @param {string} userQuestion
 * @param {string} sqlQuery
 * @param {Array} results
 * @param {Array<{role: string, content: string}>} [conversationHistory=[]]
 * @param {function(string): void} onChunk - called with each text token as it arrives
 * @returns {Promise<void>}
 */
export async function formatResultsStream(userQuestion, sqlQuery, results, conversationHistory = [], onChunk) {
  const client = getClaudeClient();

  if (!client) {
    // No API key — emit a single fallback token
    const fallback = results.length === 0
      ? "No results found."
      : `Found ${results.length} result(s): ${JSON.stringify(results, null, 2)}`;
    onChunk(fallback);
    return;
  }

  const prompt = buildResultsToNLPrompt(userQuestion, sqlQuery, results);

  const stream = client.messages.stream({
    ...MODEL_CONFIG,
    messages: [
      ...buildHistoryMessages(conversationHistory),
      { role: 'user', content: prompt }
    ]
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta?.type === 'text_delta' &&
      event.delta.text
    ) {
      onChunk(event.delta.text);
    }
  }
  // for-await drains all events including the final message_stop —
  // no need to call stream.finalMessage() separately
}

export default {
  processQuestion,
  generateSQL,
  formatResults,
  formatResultsStream,
};
