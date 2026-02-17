# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- Anthropic API key

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend folder
cd financial-qa-demo/backend

# Install dependencies
npm install

# Configure API key
# Edit the .env file and add your Anthropic API key:
# ANTHROPIC_API_KEY=your_api_key_here

# Start the backend server (should run on port 3000)
npm start
```

**Expected output:**
```
✓ Database loaded from file (or created if first run)
✓ Claude API client initialized
========================================
  Customer Q&A Webapp - Backend Server
========================================
  Environment: development
  Port: 3000
  ...
  Server is ready to accept requests!
========================================
```

### 2. Frontend Setup (in a NEW terminal)

```bash
# Navigate to frontend folder
cd financial-qa-demo/frontend

# Install dependencies
npm install

# Start the frontend dev server (should run on port 5173)
npm run dev
```

**Expected output:**
```
  VITE v5.0.12  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 3. Open Browser

Navigate to: **http://localhost:5173**

## Troubleshooting

### "Failed to fetch" or "Network Error"

**Check 1: Is the backend running?**
```bash
curl http://localhost:3000/health
```
Should return:
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

**Check 2: Is the frontend running?**
- Browser should be open to http://localhost:5173
- Check browser console (F12) for errors

**Check 3: API Key configured?**
- Open `backend/.env`
- Ensure `ANTHROPIC_API_KEY` is set to your actual API key

### "ANTHROPIC_API_KEY is not set"
Edit `backend/.env` and add:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Then restart the backend server.

### Port already in use

**Backend (port 3000):**
- Change `PORT=3001` in `backend/.env`
- Update `frontend/vite.config.js` proxy target to match

**Frontend (port 5173):**
- Kill the process using port 5173, or
- Vite will automatically use the next available port

## Testing the Connection

### Test 1: Health Check
Open browser console (F12) and run:
```javascript
fetch('/api/forum/questions').then(r => r.json()).then(console.log)
```

Should return forum questions from the database.

### Test 2: Create Chat Session
Go to the Chat page (http://localhost:5173/chat) and send a message like:
```
What was TechFlow's Q3 2024 revenue?
```

Should receive a response with SQL query and confidence indicator.

### Test 3: Forum Page
Go to http://localhost:5173/forum

Should see a list of questions from the seed data.

## Quick Demo Script

1. **Home Page** - Shows feature overview
2. **Forum Page** - Browse questions, see upvotes
3. **Chat Page** - Try these queries:
   - "What was TechFlow's Q3 2024 revenue?" (Financial)
   - "What are the top 3 most upvoted questions?" (Forum Analytics)
   - "How many questions were escalated this week?" (Escalation Insights)
   - "What's the weather?" (Out of scope - triggers escalation warning)

## Development Commands

**Backend:**
```bash
npm start      # Start server
npm run dev    # Start with auto-reload (nodemon)
```

**Frontend:**
```bash
npm run dev    # Start dev server with hot reload
npm run build  # Build for production
npm run preview # Preview production build
```
