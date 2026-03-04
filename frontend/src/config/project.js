/**
 * Per-project text and labels
 *
 * Edit this file when deploying for a new fund or deal.
 * Also update VITE_DEAL_NAME in frontend/.env to keep the browser
 * tab title and meta tags in sync.
 *
 * Run `/configure-project` in Claude Code for guided project setup.
 */

/** Shown in the nav bar and home page subtitle */
export const DEAL_NAME = import.meta.env.VITE_DEAL_NAME || 'Investor Portal';

/**
 * Suggested questions shown on the Home page quick-start panel.
 * These should reflect the deal's actual data so investors get useful answers.
 */
export const QUICK_START_QUESTIONS = [
  'What are the Tier 1 well economics?',
  'Show me projected production by year',
  'What is the target IRR and MOIC?',
  'What are the price sensitivities?',
];
