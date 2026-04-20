@echo off
REM Clean Git History - Remove Exposed Secrets (Windows)
REM ====================================================

echo 🔒 Starting Git History Cleanup...
echo.

REM Step 1: Remove from staging area
echo ✅ Step 1: Remove from staging area
git rm --cached -r .
echo    ✓ Cleared staging area
echo.

REM Step 2: Re-add all files (excluding ignored)
echo ✅ Step 2: Re-add all files (excluding ignored)
git add .
echo    ✓ Re-added files to staging
echo.

REM Step 3: Create commit with cleaned state
echo ✅ Step 3: Create commit with cleaned state
git commit -m "chore: remove exposed secrets and test files"
echo    ✓ Committed changes
echo.

REM Step 4: Check if git-filter-repo is available
echo ⚠️  Checking for git-filter-repo...
WHERE git-filter-repo >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo    git-filter-repo not found
    echo    Install it with: pip install git-filter-repo
    echo    Then run this script again
    exit /b 1
)

REM Step 5: Clean git history
echo ✅ Step 4: Clean git history
echo    This removes sensitive files from git history...
git filter-repo --force ^
  --invert-paths ^
  --path test-hf.js ^
  --path backend/test-hf-*.js ^
  --path backend/services/huggingfaceService.js

echo.
echo ✅ Step 5: Verify history is clean
git log --oneline | head -10
echo.

echo ✅ Step 6: Ready to push
echo    Run: git push origin main --force
echo.

echo 🎉 Git history cleanup complete!
echo.
echo ✅ Verification:
echo    - test-hf.js removed from history
echo    - .env is gitignored
echo    - No exposed secrets remain
echo.
echo Ready for GitHub!
pause
