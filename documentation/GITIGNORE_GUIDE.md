# Git Ignore Configuration Guide

## Overview

The Mr.Adv project uses a **multi-level `.gitignore` strategy** with separate configuration files for each major component (Backend and Frontend).

---

## File Structure

```
Mr.Adv/
│
├── .gitignore                    # Root level (general rules)
│
├── backend/
│   ├── .gitignore               # Backend-specific rules
│   └── ... (other files)
│
├── frontend/
│   ├── .gitignore               # Frontend-specific rules
│   └── ... (other files)
│
└── documentation/
    └── GITIGNORE_GUIDE.md       # This file
```

---

## Why Separate .gitignore Files?

### ✅ **Benefits:**

1. **Specificity**: Each technology has unique requirements
2. **Maintainability**: Easier to update individual configurations
3. **Clarity**: Clear separation of concerns
4. **Flexibility**: Can customize per subdirectory
5. **Team Collaboration**: Different teams can manage their own ignores

---

## What Each .gitignore Does

### 1. Root `.gitignore` (c:\Users\khair\OneDrive\Documents\Mr.Adv\.gitignore)

**Purpose:** General project-level ignores

**Ignores:**
- Root-level temporary files
- OS-generated files (.DS_Store, Thumbs.db)
- IDE workspace files
- References that backend/ and frontend/ have their own rules

**Example:**
```gitignore
# Subdirectories handle their own ignores
backend/
frontend/

# Root level temporary files
*.tmp
.DS_Store
.vscode/
```

---

### 2. Backend `.gitignore` (c:\Users\khair\OneDrive\Documents\Mr.Adv\backend\.gitignore)

**Purpose:** Node.js/Express specific ignores

**Ignores:**
- `node_modules/` - NPM dependencies
- `.env` - Environment variables with secrets
- `uploads/*` - User uploaded files (except .gitkeep)
- `*.log` - Log files
- `coverage/` - Test coverage reports
- Build outputs (dist/, build/)
- IDE settings

**Key Sections:**
```gitignore
# Dependencies
node_modules/

# Environment variables (SECRETS!)
.env

# User uploads
uploads/*
!uploads/.gitkeep

# Logs
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/
```

**What TO Commit:**
✅ Source code (.js)  
✅ package.json  
✅ .env.example  
✅ Database schemas (.sql)  
✅ Documentation  

---

### 3. Frontend `.gitignore` (c:\Users\khair\OneDrive\Documents\Mr.Adv\frontend\.gitignore)

**Purpose:** React/Frontend specific ignores

**Ignores:**
- `node_modules/` - NPM/Yarn dependencies
- `.env.local` - Local environment overrides
- `build/`, `dist/` - Production builds
- `*.map` - Source map files
- `coverage/` - Test coverage
- Framework-specific files (Next.js, Gatsby, etc.)

**Key Sections:**
```gitignore
# Dependencies
node_modules/

# Environment variables
.env.local

# Build outputs
build/
dist/
*.js.map

# Framework specific
.next/          # Next.js
.cache/         # Gatsby
public/         # Gatsby

# Caches
.eslintcache
.stylelintcache
```

**What TO Commit:**
✅ Source code (.jsx, .tsx)  
✅ Public assets  
✅ package.json  
✅ .env.example  
✅ Configuration files  

---

## How Git Processes Multiple .gitignore Files

### Order of Precedence:

1. **Root .gitignore** applies to entire repository
2. **Subdirectory .gitignore** adds/overrides rules for that directory
3. **More specific rules take precedence**

### Example Flow:

```
File: backend/node_modules/express/index.js
    ↓
Root .gitignore says: "Ignore backend/"
    ↓
Backend .gitignore says: "Also ignore node_modules/"
    ↓
Result: FILE IS IGNORED ✅
```

---

## Common Scenarios

### Scenario 1: Adding a New Backend Package

**Action:** Install new npm package
```bash
cd backend
npm install axios
```

**Git Status:** Only `package.json` and `package-lock.json` show changes  
**Why:** `node_modules/` is ignored by backend/.gitignore ✅

---

### Scenario 2: Creating .env File

**Action:** Create backend/.env with database password

**Git Status:** File doesn't appear in `git status`  
**Why:** `.env` is ignored by backend/.gitignore ✅

**Solution:** Create `.env.example` template instead (this gets committed)

---

### Scenario 3: Building Frontend App

**Action:** Run production build
```bash
cd frontend
npm run build
```

**Git Status:** `build/` folder is ignored  
**Why:** Build outputs ignored by frontend/.gitignore ✅

---

### Scenario 4: Uploading Files

**Action:** User uploads document to backend/uploads/

**Git Status:** Files are ignored, but folder structure preserved  
**Why:** `uploads/*` ignored, but `uploads/.gitkeep` committed ✅

---

## Best Practices

### ✅ DO:

1. **Commit .env.example files**
   ```bash
   # backend/.env.example ✅
   PORT=5000
   JWT_SECRET=your_secret_here
   DB_PASSWORD=your_password_here
   ```

2. **Use .gitkeep for empty directories**
   ```bash
   touch backend/uploads/.gitkeep
   git add backend/uploads/.gitkeep
   ```

3. **Be specific in ignore patterns**
   ```gitignore
   # Better to be specific
   backend/node_modules/
   
   # Rather than too broad
   **/node_modules/
   ```

4. **Document why something is ignored**
   ```gitignore
   # Environment variables contain secrets
   .env
   ```

---

### ❌ DON'T:

1. **Don't commit .env files with real passwords**
   ```bash
   git add backend/.env  # ❌ WRONG!
   ```

2. **Don't ignore everything broadly**
   ```gitignore
   *  # ❌ Too aggressive!
   ```

3. **Don't commit build outputs**
   ```bash
   git add frontend/build/  # ❌ WRONG!
   ```

4. **Don't commit node_modules**
   ```bash
   git add node_modules/  # ❌ VERY WRONG!
   ```

---

## Troubleshooting

### Issue 1: File Still Shows in Git Status

**Problem:** You added a rule but file still appears

**Solution:**
```bash
# Check if file was already tracked
git rm --cached path/to/file

# Then it will be ignored
```

---

### Issue 2: Accidentally Committed Sensitive Data

**Problem:** .env file with passwords was committed

**Immediate Actions:**
1. **Change all passwords immediately**
2. Remove from git history:
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch backend/.env' \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```
3. Add to .gitignore (already done ✅)

---

### Issue 3: Need to Track a File That's Being Ignored

**Problem:** File matches ignore pattern but you want to track it

**Solution:** Force add
```bash
git add -f path/to/file
```

---

## Verification Checklist

Run these commands to verify your .gitignore is working:

```bash
# See what would be committed
git status

# See all ignored files
git ls-files -o -i --exclude-standard

# Verify specific file is ignored
git check-ignore -v path/to/file
```

---

## Quick Reference

### Backend Ignores:
- ✅ node_modules/
- ✅ .env
- ✅ uploads/*
- ✅ *.log
- ✅ coverage/

### Frontend Ignores:
- ✅ node_modules/
- ✅ .env.local
- ✅ build/, dist/
- ✅ *.map
- ✅ coverage/

### Root Ignores:
- ✅ .vscode/
- ✅ .DS_Store
- ✅ tmp/, temp/
- ✅ References to subdirs

---

## Summary

| Level | File | Purpose | Key Ignores |
|-------|------|---------|-------------|
| Root | `.gitignore` | Project-wide | OS files, IDE settings |
| Backend | `backend/.gitignore` | Node.js API | node_modules, .env, uploads |
| Frontend | `frontend/.gitignore` | React App | node_modules, build, .env.local |

---

## Additional Resources

- [GitHub .gitignore Templates](https://github.com/github/gitignore)
- [Git Documentation - Ignoring Files](https://git-scm.com/docs/gitignore)
- [Atlassian Git Ignore Tutorial](https://www.atlassian.com/git/tutorials/saving-changes/gitignore)

---

**Last Updated:** March 7, 2026  
**Project:** Mr.Adv - Advocate Case Management System
