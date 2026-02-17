import { clsx } from 'clsx';

/**
 * Utility function to merge class names
 * Used throughout the app for conditional styling
 */
export function cn(...inputs) {
  return clsx(inputs);
}
