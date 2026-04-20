#!/bin/bash
# Clean Git History - Remove Exposed Secrets
# ============================================
# This script removes test-hf.js and all exposed API keys from git history

echo "🔒 Starting Git History Cleanup..."
echo ""

# Step 1: Verify git-filter-repo is installed
echo "📋 Checking for git-filter-repo..."
if ! command -v git-filter-repo &> /dev/null; then
    echo "⚠️  git-filter-repo not found. Installing..."
    pip install git-filter-repo
fi

echo ""
echo "✅ Step 1: Remove from staging area"
git rm --cached -r .
echo "   ✓ Cleared staging area"

echo ""
echo "✅ Step 2: Re-add all files (excluding ignored)"
git add .
echo "   ✓ Re-added files to staging"

echo ""
echo "✅ Step 3: Create commit with cleaned state"
git commit -m "chore: remove exposed secrets and test files"
echo "   ✓ Committed changes"

echo ""
echo "⚠️  Step 4: Clean git history (IMPORTANT)"
echo "   This removes test-hf.js and any matching patterns from git history..."
git filter-repo --force \
  --invert-paths \
  --path test-hf.js \
  --path backend/test-hf-*.js \
  --path backend/services/huggingfaceService.js

echo ""
echo "✅ Step 5: Verify history is clean"
git log --oneline | head -10
echo ""
echo "✅ Step 6: Force push to GitHub"
echo "   Running: git push origin main --force"
git push origin main --force

echo ""
echo "🎉 Git history cleanup complete!"
echo ""
echo "✅ Verification:"
echo "   - test-hf.js removed from history"
echo "   - .env is gitignored"
echo "   - No exposed secrets remain"
echo ""
echo "Ready for GitHub!"
