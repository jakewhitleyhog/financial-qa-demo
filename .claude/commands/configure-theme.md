# Configure Theme

Update the project's color scheme across the dashboard and all charts.

**Arguments:** $ARGUMENTS

## What to do

1. **Read** `frontend/src/config/theme.js` and `frontend/src/index.css` so you know the current values before making any changes.

2. **Interpret the arguments:**
   - If the user passed a single hex color (e.g. `#1A4B8C`), treat it as the new `primary` brand color and derive the rest of the palette automatically using darker/lighter/muted variants:
     - `sienna` → the exact hex passed (primary brand color)
     - `siennaDim` → 25% lighter version of primary
     - `cream` → 50% lighter version of primary (near-pastel)
     - `olive` → 25% darker version of primary (deep accent)
     - `stone` → desaturated mid-tone of primary
     - `rust` → slightly warmer, more saturated version for alerts/highlights
   - If the user passed named colors or a JSON object, use those directly.
   - If no arguments were passed, ask the user: "What's your brand's primary hex color?"

3. **Update `frontend/src/config/theme.js`:**
   - Replace the hex values in the `PALETTE` object
   - Update the HSL comments next to each color to match the new values
   - Keep `WTI_COLOR` pointing to `PALETTE.sienna`

4. **Update `frontend/src/index.css`:**
   - Convert the new `sienna` hex to HSL and update `--primary` and `--ring`
   - Convert the new `cream` hex to HSL and update `--secondary` and `--border`
   - Convert the new `olive` hex to HSL and update `--accent`
   - Derive and update `--muted` (very light tint of primary, near-white)
   - Update the comment on line 3 to describe the new palette name

5. **Confirm** what changed by summarizing: old primary → new primary, and list all updated values.

## Files to edit
- `frontend/src/config/theme.js` — hex palette
- `frontend/src/index.css` — CSS variables (HSL equivalents)

## Notes
- Do NOT touch any component JSX files — they all import from theme.js already
- HSL conversion: `hsl(H S% L%)` format, space-separated (no commas), no `hsl()` wrapper in the CSS var value
- When in doubt about derived colors, err toward readability — dark text should always be legible on card backgrounds
