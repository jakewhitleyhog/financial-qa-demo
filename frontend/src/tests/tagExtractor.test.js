import { describe, it, expect } from 'vitest';
import { extractTags } from '../utils/tagExtractor';

describe('extractTags', () => {
  it('returns empty array for empty string', () => {
    expect(extractTags('')).toEqual([]);
  });

  it('returns empty array for null/undefined', () => {
    expect(extractTags(null)).toEqual([]);
    expect(extractTags(undefined)).toEqual([]);
  });

  it('returns capitalized tags from a sentence', () => {
    const tags = extractTags('What is the revenue forecast this quarter');
    expect(tags).toContain('Revenue');
    expect(tags).toContain('Forecast');
    expect(tags.length).toBeLessThanOrEqual(3);
  });

  it('prioritizes financial keywords over generic words', () => {
    // "revenue" and "margin" are in FINANCIAL_KEYWORDS; "project" is not
    const tags = extractTags('What is the revenue margin for this project', 2);
    expect(tags[0]).toBe('Revenue');
    expect(tags[1]).toBe('Margin');
  });

  it('respects the maxTags limit', () => {
    const tags = extractTags('revenue growth margin analysis forecast budget valuation', 2);
    expect(tags.length).toBe(2);
  });
});
