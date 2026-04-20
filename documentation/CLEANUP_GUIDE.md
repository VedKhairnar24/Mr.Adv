# Cleanup Guide: Remove Old AI Integration Files

## Files to Delete

These test and service files are no longer needed after migrating to OpenRouter:

### Backend Services (to delete)
```bash
# Old Hugging Face service
rm backend/services/huggingfaceService.js
```

### Test Files (to delete)
```bash
# Direct HF API test
rm backend/test-hf.js

# HF integration test  
rm backend/test-hf-integration.js

# Direct endpoint test
rm backend/test-hf-direct.js

# Token validation test
rm backend/test-hf-token.js
```

## One-Command Cleanup

```bash
# Delete all old Hugging Face files
rm backend/services/huggingfaceService.js \
   backend/test-hf.js \
   backend/test-hf-integration.js \
   backend/test-hf-direct.js \
   backend/test-hf-token.js
```

## Git Cleanup (if using git)

```bash
# Remove from git tracking
git rm backend/services/huggingfaceService.js
git rm backend/test-hf.js
git rm backend/test-hf-integration.js
git rm backend/test-hf-direct.js
git rm backend/test-hf-token.js

# Commit changes
git commit -m "Remove old Hugging Face AI integration files"
```

## Verify Cleanup

After deleting files, verify the system still works:

```bash
# Start backend
cd backend
npm start

# Should show:
# ✓ MAKE_WEBHOOK_URL: ✓ Loaded
# ℹ️  Provider: OpenRouter (via Make.com webhook)
# ℹ️  Model: mistralai/mistral-7b-instruct

# Start frontend (in another terminal)
cd frontend
npm run dev

# Navigate to Dashboard → Generate Insights
# Should generate insights successfully
```

## Optional: Remove Unused Dependencies

If you're confident no other part of the app uses these packages:

```bash
cd backend

# Check what's used
npm ls openai
npm ls @huggingface/inference

# Remove if unused
npm uninstall openai @huggingface/inference

# Update lock file
npm install
```

## Checklist

- [ ] Deleted `backend/services/huggingfaceService.js`
- [ ] Deleted `backend/test-hf.js`
- [ ] Deleted `backend/test-hf-integration.js`
- [ ] Deleted `backend/test-hf-direct.js`
- [ ] Deleted `backend/test-hf-token.js`
- [ ] Verified backend starts without errors
- [ ] Verified frontend works with DashboardInsights
- [ ] Verified no references to Hugging Face in logs
- [ ] (Optional) Removed unused npm packages
- [ ] (Optional) Committed changes to git

## Note

Don't delete these files - they're still needed:
- ✅ `backend/services/openrouterService.js` (NEW - keep this!)
- ✅ `backend/services/aiService.js` (UPDATED - keep this!)
- ✅ Documentation files (OPENROUTER_SETUP.md, MIGRATION_SUMMARY.md)
- ✅ `.env` configuration files

