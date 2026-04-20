# OpenRouter Integration via Make.com Webhook

## Overview
This system has been migrated to use **OpenRouter API** exclusively for AI-powered legal case insights. The frontend and backend communicate with OpenRouter through a **Make.com webhook**, which handles the API routing and transformation.

---

## ✅ What Was Removed

- ❌ Gemini API integration
- ❌ OpenAI API integration  
- ❌ Hugging Face API integration
- ❌ All fallback AI modes
- ❌ Hardcoded API keys
- ❌ Multiple provider support

---

## 🔧 Setup Instructions

### Step 1: Get OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai)
2. Sign up or login
3. Navigate to **API Keys** section
4. Create a new API key
5. Copy the key and save it securely

### Step 2: Create Make.com Webhook

1. Go to [Make.com](https://make.com)
2. Create a new scenario
3. Add a **Webhook** trigger module:
   - Choose "Custom webhook"
   - Set up to accept POST requests
   - Note the webhook URL
4. Add an **HTTP** module:
   - Method: `POST`
   - URL: `https://openrouter.ai/api/v1/chat/completions`
   - Headers:
     ```
     Authorization: Bearer YOUR_OPENROUTER_API_KEY
     Content-Type: application/json
     HTTP-Referer: http://localhost
     ```
   - Body (JSON):
     ```json
     {
       "model": "mistralai/mistral-7b-instruct",
       "messages": [
         {
           "role": "user",
           "content": "You are a senior legal analyst.\n\nAnalyze the following case document strictly based on its content.\n\nRules:\n- Do NOT generate assumptions\n- If data is missing, say 'Not mentioned'\n- Give clear, real insights\n\nOutput:\n1. Case Summary (3-5 lines)\n2. Key Insights (bullet points)\n3. Timeline (if present)\n4. Risks / Observations\n5. Missing Information\n\nDocument:\n{{1.text}}"
         }
       ]
     }
     ```
5. Add **JSON** module to extract response:
   - Path: `2.body.choices[0].message.content`
   - Output variable: Store as response
6. Add **Webhook Response** module:
   - Return:
     ```json
     {
       "insight": "{{4.result}}"
     }
     ```

### Step 3: Update Configuration Files

**Backend (.env):**
```bash
MAKE_WEBHOOK_URL=https://hook.make.com/YOUR_WEBHOOK_ID
# Replace YOUR_WEBHOOK_ID with your actual Make.com webhook ID from Step 2
```

**Frontend (.env):**
```bash
VITE_MAKE_WEBHOOK_URL=https://hook.make.com/YOUR_WEBHOOK_ID
# Must match the backend webhook URL
```

### Step 4: Test the Integration

**Backend Test:**
```bash
cd backend
npm start
# Check logs for: "✓ MAKE_WEBHOOK_URL: ✓ Loaded"
```

**Frontend Test:**
```bash
cd frontend
npm run dev
# Navigate to Dashboard
# Click "Generate Insights"
# Verify: Should show "OpenRouter AI" provider
```

---

## 📋 API Flow

```
Frontend (DashboardInsights.jsx)
  ↓ POST { text: "document content" }
  ↓
Make.com Webhook
  ↓ Extract text from request
  ↓
OpenRouter API (mistralai/mistral-7b-instruct)
  ↓ Generate legal analysis
  ↓
Make.com JSON Extraction
  ↓ Extract: choices[0].message.content
  ↓
Make.com Webhook Response
  ↓ Return { insight: "AI response" }
  ↓
Frontend
  ↓ Display insight with "OpenRouter AI" provider
```

---

## 🚨 Error Handling

**If API fails:**
- User sees: "Insights temporarily unavailable. Please retry."
- No generic fallback responses
- Clean error messages only

**Common Issues:**

| Issue | Solution |
|-------|----------|
| 404 Webhook error | Verify Make.com webhook URL is correct and scenario is active |
| 401 Unauthorized | Check OpenRouter API key in Make.com module |
| Empty response | Ensure Make.com JSON extraction path is correct: `2.body.choices[0].message.content` |
| Timeout | Increase HTTP module timeout in Make.com (default 30s) |

---

## 📊 Response Format

**Frontend expects:**
```json
{
  "insight": "1. Case Summary\n2. Key Insights\n3. Timeline..."
}
```

**OpenRouter sends:**
```json
{
  "choices": [
    {
      "message": {
        "content": "1. Case Summary\n2. Key Insights\n3. Timeline..."
      }
    }
  ]
}
```

**Make.com transforms** from OpenRouter format → Frontend format

---

## 🔐 Security Notes

- ✅ API keys stored in backend .env only
- ✅ Frontend only sends document text
- ✅ No sensitive data exposed
- ✅ Make.com handles API key securely
- ✅ All communication via HTTPS

---

## 📝 Files Modified

### Backend
- `backend/services/openrouterService.js` - New wrapper for Make webhook
- `backend/services/aiService.js` - Migrated to OpenRouter
- `backend/controllers/aiController.js` - Updated error handling
- `backend/controllers/insightsController.js` - Updated error handling
- `.env` - Updated with MAKE_WEBHOOK_URL

### Frontend
- `frontend/src/components/DashboardInsights.jsx` - Direct webhook calls
- `frontend/.env` - New file with VITE_MAKE_WEBHOOK_URL

### Files Deleted
- ❌ `backend/services/huggingfaceService.js`
- ❌ `backend/test-hf.js`
- ❌ `backend/test-hf-integration.js`
- ❌ `backend/test-hf-direct.js`
- ❌ `backend/test-hf-token.js`

---

## 🎯 Key Features

✅ **Real Legal Insights** - OpenRouter Mistral 7B provides accurate case analysis
✅ **No Fallback Mode** - Clean error messages, no generic responses
✅ **Structured Output** - Consistent format for case analysis
✅ **No External Dependencies** - Make.com handles all API routing
✅ **Secure** - Keys stored server-side only
✅ **Scalable** - Easy to switch OpenRouter models

---

## 🔄 Switching Models

To use a different OpenRouter model:

1. Edit Make.com HTTP module
2. Change `"model"` field to desired model (e.g., `"meta-llama/llama-2-70b"`)
3. Test with sample input
4. Verify output format matches expectations

Available models: https://openrouter.ai/models

---

## 📞 Support

For issues:
1. Check Make.com scenario logs
2. Verify webhook URL is active
3. Test OpenRouter API key directly
4. Review backend logs: `backend/node_modules/.bin/pm2 logs`

