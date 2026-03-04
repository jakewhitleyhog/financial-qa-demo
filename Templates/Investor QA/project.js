/**
 * Per-project text and labels
 *
 * Copy this file to frontend/src/config/project.js for a new deployment.
 * Edit the values below, then update VITE_DEAL_NAME in frontend/.env and
 * DEAL_NAME in backend/.env to match.
 *
 * Run `/configure-project` in Claude Code for guided project setup.
 */

/** Shown in the nav bar and home page subtitle */
export const DEAL_NAME = import.meta.env.VITE_DEAL_NAME || 'Investor Portal';

/**
 * Suggested questions shown on the Home page quick-start panel.
 * These should be specific to the deal's actual data so investors
 * get meaningful answers — replace with questions relevant to your fund.
 */
export const QUICK_START_QUESTIONS = [
  'What are the Tier 1 well economics?',
  'Show me projected production by year',
  'What is the target IRR and MOIC?',
  'What are the price sensitivities?',
];
