# Configure Project

Update per-deployment text and labels for a new fund or deal.

**Arguments:** $ARGUMENTS

## What to do

1. **Read** these files first to understand the current state:
   - `frontend/src/config/project.js`
   - `frontend/.env`
   - `backend/.env`

2. **Interpret the arguments:**
   - If the user passed a deal/fund name (e.g. `"Blackstone Energy Fund III"`), use it as the new `DEAL_NAME`.
   - If the user passed key=value pairs or JSON, apply them to the relevant fields.
   - If no arguments were passed, ask the user for:
     - Fund/deal name (displayed in nav, home page subtitle)
     - 4 quick-start questions relevant to their deal (shown on home page)

3. **Update `frontend/src/config/project.js`:**
   - Set `DEAL_NAME` fallback string (the part after `||`) to the new deal name
   - Replace `QUICK_START_QUESTIONS` array with the new questions — they should be specific to the deal data, not generic

4. **Update `frontend/.env`:**
   - Set `VITE_DEAL_NAME=<new deal name>`

5. **Update `backend/.env`:**
   - Set `DEAL_NAME=<new deal name>`

6. **Confirm** what changed with a brief summary.

## Files to edit
- `frontend/src/config/project.js` — DEAL_NAME fallback + QUICK_START_QUESTIONS
- `frontend/.env` — VITE_DEAL_NAME env var
- `backend/.env` — DEAL_NAME env var (used in logs/prompts)

## Notes
- The `.env` files are gitignored — changes here are local only and won't be committed
- Quick-start questions should match what's actually in the database (e.g. reference real tier names, basin, deal structure). Bad generic questions make the feature feel broken.
- If the deal is not oil & gas (e.g. real estate, private equity), also update `backend/src/utils/promptTemplates.js` — the LLM prompts reference "oil & gas" and "Uinta Basin" which will produce wrong context for a different domain.
