# Git Version Control Guide

## What's Tracked by Git ✅

### Files to Commit:
- Source code (`.js`, `.jsx`, `.ts`, `.tsx`)
- Configuration files (`package.json`, `.env.example`)
- Documentation (`.md` files)
- Database schemas (`.sql` files)
- Public assets
- `.gitignore`

### Files Ignored (Not Committed) ❌:
- `node_modules/` - Dependencies (installed via npm)
- `.env` - Environment variables with secrets
- `uploads/` - User uploaded files
- Build outputs (`dist/`, `build/`)
- IDE settings (`.vscode/`, `.idea/`)
- Log files
- OS files (`.DS_Store`, `Thumbs.db`)

## Initial Git Setup

### 1. Initialize Git Repository
```bash
cd c:\Users\khair\OneDrive\Documents\Mr.Adv
git init
```

### 2. Check Status
```bash
git status
```

### 3. Add All Files
```bash
git add .
```

### 4. First Commit
```bash
git commit -m "Initial commit: Project structure and setup"
```

### 5. Create Main Branch
```bash
git branch -M main
```

## Recommended Folder Structure for Git

```
Mr.Adv/
├── .gitignore              ✅ Track
├── documentation/          ✅ Track
│   ├── project-overview.txt
│   └── step3-backend-setup.md
├── database/               ✅ Track
│   ├── schema.sql
│   ├── setup_test.sql
│   └── README.md
├── backend/                ✅ Track source, ignore dependencies
│   ├── config/             ✅ Track
│   ├── controllers/        ✅ Track
│   ├── routes/             ✅ Track
│   ├── middleware/         ✅ Track
│   ├── uploads/            ❌ Ignore contents
│   │   └── .gitkeep       ✅ Track (keeps folder in git)
│   ├── .env               ❌ Ignore (contains secrets)
│   ├── .env.example       ✅ Track (template for others)
│   ├── server.js          ✅ Track
│   ├── package.json       ✅ Track
│   └── README.md          ✅ Track
└── frontend/              (to be added)
```

## Create .env.example File

It's good practice to create an `.env.example` file as a template:

```bash
# backend/.env.example
PORT=5000
JWT_SECRET=your_jwt_secret_here
DB_PASSWORD=your_mysql_password
```

This allows other developers to know what environment variables are needed without exposing your actual credentials.

## Typical Git Workflow

### Daily Development:
```bash
# Make your changes
# Then stage them
git add .

# Commit with meaningful message
git commit -m "Add authentication API endpoints"

# Push to remote (when you have one)
git push origin main
```

### Before Starting New Feature:
```bash
# Make sure you're up to date
git pull origin main

# Create feature branch
git checkout -b feature/authentication
```

### After Completing Feature:
```bash
# Switch back to main
git checkout main

# Merge feature branch
git merge feature/authentication

# Delete feature branch
git branch -d feature/authentication
```

## Common Git Commands

### View Status
```bash
git status
```

### View History
```bash
git log --oneline
```

### See Changes
```bash
git diff
```

### Undo Changes (before staging)
```bash
git checkout -- filename.js
```

### Unstage Files (after git add)
```bash
git reset HEAD filename.js
```

## Security Best Practices

### ⚠️ NEVER Commit:
- Passwords
- API keys
- Database credentials
- JWT secrets
- Personal information

### ✅ DO Commit:
- Code
- Configuration templates
- Documentation
- Public assets

## If You Accidentally Commit Sensitive Data

1. **Change the credentials immediately**
2. **Remove from git history:**
   ```bash
   # Remove .env from all commits
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env' \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push (if already pushed):**
   ```bash
   git push origin --force --all
   ```

## GitHub/GitLab Setup (Optional)

If you want to push to a remote repository:

```bash
# Add remote repository
git remote add origin https://github.com/yourusername/mr-adv.git

# Push to remote
git push -u origin main
```

## Branch Naming Convention

Use descriptive branch names:
- `feature/login-system`
- `bugfix/database-connection`
- `docs/api-documentation`
- `refactor/auth-middleware`

## Commit Message Convention

Write clear, concise commit messages:

```
feat: add user authentication
fix: resolve database connection timeout
docs: update API documentation
refactor: simplify controller logic
test: add unit tests for auth module
chore: update dependencies
```

---

**Next Steps:**

1. Initialize git repository
2. Make your first commit
3. Continue building features!
