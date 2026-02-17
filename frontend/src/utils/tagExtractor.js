/**
 * Tag Extractor Utility
 * Extracts relevant keywords from question titles as tags
 */

const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'about', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further',
  'then', 'once', 'here', 'there', 'all', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'my', 'our', 'your'
]);

const FINANCIAL_KEYWORDS = new Set([
  'revenue', 'profit', 'earnings', 'growth', 'margin', 'expenses', 'costs',
  'sales', 'income', 'financial', 'quarter', 'quarterly', 'annual', 'year',
  'company', 'business', 'market', 'stock', 'performance', 'metrics',
  'analysis', 'forecast', 'budget', 'valuation', 'roi', 'ebitda', 'cash',
  'debt', 'equity', 'assets', 'liabilities', 'balance', 'sheet', 'report'
]);

export function extractTags(title, maxTags = 3) {
  if (!title) return [];

  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !COMMON_WORDS.has(word));

  // Prioritize financial keywords
  const financialTags = words.filter(word => FINANCIAL_KEYWORDS.has(word));
  const otherTags = words.filter(word => !FINANCIAL_KEYWORDS.has(word));

  const tags = [...new Set([...financialTags, ...otherTags])].slice(0, maxTags);

  return tags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1));
}

export default extractTags;
