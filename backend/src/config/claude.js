import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize Anthropic client
 */
let client = null;

export function getClaudeClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      console.log('⚠ ANTHROPIC_API_KEY not set - Chat features will be disabled');
      console.log('  Forum features will still work without API key');
      return null;
    }

    client = new Anthropic({
      apiKey: apiKey
    });

    console.log('✓ Claude API client initialized');
  }

  return client;
}

/**
 * Default model configuration
 */
export const MODEL_CONFIG = {
  model: 'claude-sonnet-4-6',
  max_tokens: 2048,
  temperature: 0.0 // Use 0 for deterministic SQL generation
};

/**
 * Model for confidence scoring (can use faster model)
 */
export const CONFIDENCE_MODEL_CONFIG = {
  model: 'claude-sonnet-4-6',
  max_tokens: 50,
  temperature: 0.0
};

/**
 * Model config for scope detection — max_tokens is intentionally 20
 * (Claude only needs to return IN_SCOPE or OUT_OF_SCOPE)
 */
export const SCOPE_DETECTION_MODEL_CONFIG = {
  model: 'claude-sonnet-4-6',
  max_tokens: 20,
  temperature: 0.0
};

export default {
  getClaudeClient,
  MODEL_CONFIG,
  CONFIDENCE_MODEL_CONFIG,
  SCOPE_DETECTION_MODEL_CONFIG
};
