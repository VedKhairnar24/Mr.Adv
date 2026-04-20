# Quick Reference: OpenRouter AI System

## System Architecture

```
Frontend: DashboardInsights.jsx
  ↓
fetch(VITE_MAKE_WEBHOOK_URL, {
  method: "POST",
  body: { text: "document content" }
})
  ↓
Make.com Webhook (Backend Processing)
  1. Receives { text: "..." }
  2. Calls OpenRouter API
  3. Extracts response.choices[0].message.content
  4. Returns { insight: "..." }
  ↓
Frontend: Display insight with "OpenRouter AI" provider
```

---

## Key Files

### Backend

**`backend/services/openrouterService.js`**
- Handles Make webhook communication
- Sends text to webhook
- Returns structured response

**`backend/services/aiService.js`**
- `generateInsight()` - Main entry point
- `generateRealDocumentInsights()` - For document analysis
- `analyzeDocumentOnly()` - Alias for document analysis
- All throw errors on API failure (no fallback)

**`backend/controllers/`**
- `aiController.js` - Case AI analysis endpoint
- `insightsController.js` - Dashboard insights endpoint
- Both now use new error format (HTTP 503)

### Frontend

**`frontend/src/components/DashboardInsights.jsx`**
- Calls Make webhook directly via `fetch()`
- Reads `VITE_MAKE_WEBHOOK_URL` from env
- Shows "OpenRouter AI" provider
- No fallback or mock modes

---

## Configuration

### Backend `.env`
```bash
MAKE_WEBHOOK_URL=https://hook.make.com/YOUR_WEBHOOK_ID
```

### Frontend `.env`
```bash
VITE_MAKE_WEBHOOK_URL=https://hook.make.com/YOUR_WEBHOOK_ID
```

Both must have the same webhook URL.

---

## API Endpoints (Backend)

### Generate Case Insights
```
POST /api/ai/generate/:caseId
Body:
{
  "notesText": "case notes...",
  "mainPoints": ["point 1", "point 2"],
  "documentIds": [1, 2, 3],
  "includeCaseNotes": true
}
Response (success):
{
  "message": "AI insights generated successfully",
  "id": 123,
  "content": "1. Case Summary...",
  "model_used": "openrouter",
  "api_status": "success",
  "analysis_type": "real_document_insights"
}
Response (error):
{
  "message": "Insights temporarily unavailable. Please retry.",
  "error": "..."
}
```

### Generate Dashboard Insights
```
POST /insights/generate
Body:
{
  "dashboardData": { /* stats */ },
  "insightType": "summary|analysis|recommendations|all",
  "customQuery": "optional focus area"
}
Response (success):
{
  "success": true,
  "data": {
    "provider": "openrouter",
    "status": "success",
    "insight": "insights...",
    "generatedAt": "2026-04-20T..."
  }
}
Response (error):
{
  "success": false,
  "error": "Insights temporarily unavailable",
  "message": "Insights temporarily unavailable. Please retry."
}
```

---

## Frontend API Call

**DashboardInsights.jsx:**
```javascript
const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;

const response = await fetch(webhookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: prompt })
});

const data = await response.json();
// Expected: { insight: "AI response" }
```

---

## Make.com Webhook Setup (30 seconds)

1. **Add Webhook** - Trigger module (POST)
2. **Add HTTP Module**:
   - URL: `https://openrouter.ai/api/v1/chat/completions`
   - Headers: `Authorization: Bearer OPENROUTER_KEY`
   - Body: OpenRouter request format
3. **Add JSON Module** - Extract: `2.body.choices[0].message.content`
4. **Add Webhook Response** - Return: `{ insight: "{{result}}" }`
5. **Get Webhook URL** - Copy and use in `.env`

---

## Error Handling

### What Users See
```
"Insights temporarily unavailable. Please retry."
```

### No Generic Messages
- ❌ Never: "Please try again later, system will attempt to use available providers"
- ❌ Never: "Fallback mode active"
- ❌ Never: "Mock response"

### Development Mode
In development, backend logs show actual error:
```
MAKE_WEBHOOK_URL not configured
401 Unauthorized from OpenRouter
Timeout calling webhook
```

---

## How to Handle API Failures

### If OpenRouter fails
- Don't retry automatically
- Show: "Insights temporarily unavailable"
- User retries manually

### If Make webhook fails  
- Check Make.com scenario is active
- Verify OpenRouter API key
- Check Make.com logs

### If frontend can't reach webhook
- Verify VITE_MAKE_WEBHOOK_URL is correct
- Check CORS (Make.com should allow all)
- Check webhook URL format

---

## Testing

### Test Webhook
```bash
curl -X POST https://hook.make.com/YOUR_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{"text":"Analyze this legal case briefly"}'
```

Expected response:
```json
{"insight":"1. Case Summary\n2. Key Insights\n..."}
```

### Test Backend
```bash
# Should show:
npm start
# ✓ MAKE_WEBHOOK_URL: ✓ Loaded
# ℹ️  Provider: OpenRouter (via Make.com webhook)
```

### Test Frontend
```bash
npm run dev
# Navigate to Dashboard
# Click "Generate Insights"
# Toast: "✅ Insights generated successfully via OpenRouter"
```

---

## Switching Models

To use different OpenRouter model:

1. Edit Make.com HTTP module
2. Change `"model"` field to desired model
3. Keep message format the same

Available models:
- `mistralai/mistral-7b-instruct` (current)
- `meta-llama/llama-2-70b`
- `openai/gpt-4`
- More: https://openrouter.ai/models

---

## Performance Notes

- **Latency**: ~2-5 seconds (webhook + model inference)
- **Timeout**: 30 seconds (Make.com default)
- **Max Input**: 2000 characters (configured in aiService.js)
- **Rate Limits**: No limits on Make.com free tier

---

## Security

✅ API keys stored in backend `.env` only
✅ Frontend never sees OpenRouter API key
✅ Make webhook handles key securely
✅ All communication over HTTPS
✅ No sensitive data exposed in errors

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `VITE_MAKE_WEBHOOK_URL not configured` | Set in `frontend/.env` |
| `404 Not Found` | Verify webhook URL in `.env` |
| `401 Unauthorized` | Check OpenRouter API key in Make.com |
| `Empty response` | Verify JSON extraction path in Make.com |
| `Timeout` | Check Make.com webhook is active |
| No "OpenRouter AI" badge | Check frontend is reloaded after env change |

---

## Related Files

- Setup Guide: `documentation/OPENROUTER_SETUP.md`
- Migration Summary: `documentation/MIGRATION_SUMMARY.md`
- Cleanup Guide: `documentation/CLEANUP_GUIDE.md`

