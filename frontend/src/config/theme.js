/**
 * Brand & chart color palette
 *
 * Edit hex values here to retheme the entire dashboard.
 * After changing colors, also update the matching CSS variables in
 * frontend/src/index.css (see comments next to each value).
 *
 * Run `/configure-theme` in Claude Code for guided color updates.
 */
export const PALETTE = {
  sienna:    '#8B5E3C',  // --primary:   23 40% 44%  — buttons, primary chart series
  siennaDim: '#C4956A',  // --secondary: 31 26% 85%  — secondary chart series
  cream:     '#D4B896',  // (no CSS var) — bar chart tertiary / pie highlights
  olive:     '#5C4A2A',  // --accent:    40 30% 32%  — distribution sparkline
  stone:     '#A89070',  // (no CSS var) — neutral accents
  rust:      '#C07040',  // (no CSS var) — WTI reference line, alert highlights
};

/** Color used in the WTI Price Card sparkline (mirrors PALETTE.sienna) */
export const WTI_COLOR = PALETTE.sienna;

/** Pie chart slice order */
export const PIE_COLORS = [
  PALETTE.sienna,
  PALETTE.siennaDim,
  PALETTE.olive,
  PALETTE.cream,
  PALETTE.stone,
  PALETTE.rust,
];
