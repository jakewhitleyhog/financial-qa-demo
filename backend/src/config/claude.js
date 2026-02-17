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
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 2048,
  temperature: 0.0 // Use 0 for deterministic SQL generation
};

/**
 * Model for confidence scoring (can use faster model)
 */
export const CONFIDENCE_MODEL_CONFIG = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 50,
  temperature: 0.0
};

export default {
  getClaudeClient,
  MODEL_CONFIG,
  CONFIDENCE_MODEL_CONFIG
};
