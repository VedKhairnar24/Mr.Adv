# ⚖️ Mr. Adv — AI-Powered Advocate Case Management System

![Version](https://img.shields.io/badge/version-1.0-blue)
![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-green)

A modern full-stack web application to help advocates manage **clients, cases, hearings, documents, and notes** — powered with **AI-based case analysis**.

---

## 🚀 Overview

**Mr. Adv** is a smart legal case management platform designed to simplify daily legal operations.

It centralizes all legal data and enhances decision-making using AI.

---

# ❗ Problem Statement

Advocates often face the following problems:

- Managing multiple case files manually  
- Losing track of hearing dates  
- Unorganized documents and notes  
- Difficulty in quick case understanding  
- Time-consuming legal analysis  
- Lack of centralized system  

---

# 💡 Solution

**Mr. Adv solves these problems by:**

- 📁 Centralizing all case data in one system  
- 📅 Managing hearings with reminders  
- 📂 Organizing documents per case  
- 📝 Structuring notes for clarity  
- 🤖 Using AI to generate:
  - Case summaries  
  - Key insights  
  - Legal suggestions  

<img width="1870" height="910" alt="image" src="https://github.com/user-attachments/assets/c0333692-8c28-4f5f-8a83-8f43f6acc33a" />

---

## ✨ Features

### 📁 Case Management
- Create and manage cases
- Track status and updates
- View case timeline

<img width="1845" height="958" alt="image" src="https://github.com/user-attachments/assets/6969ea65-9572-4c86-97af-46a10067172c" />

### 👤 Client Management
- Store client details
- Link multiple cases
- Quick access to client history

<img width="1828" height="959" alt="image" src="https://github.com/user-attachments/assets/a3734d03-89f8-477f-a6b6-0e2fed0d139d" />

### 📅 Hearings System
- Add hearing dates
- Track upcoming hearings
- Store hearing notes



### 📂 Document Management
- Upload documents
- View and delete files
- Case-wise organization

### 📝 Notes System
- Manual note creation
- Categorized note types
- Linked with cases

### 🤖 AI Case Analyzer
- Case summary
- Key facts
- Legal issues
- Relevant laws
- Strategy suggestions

---

## 🧠 AI Capabilities

- Legal summarization  
- Fact extraction  
- Case understanding  
- Strategy guidance  

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js

### Database
- MySQL

### AI Integration
- Hugging Face Inference API
- Document-based analysis with smart fallback extraction

---

## 🤖 AI System Setup

### Hugging Face Configuration

1. **Get API Token:**
   - Create account at https://huggingface.co
   - Generate API token from https://huggingface.co/settings/tokens
   - Token must have "Inference" API access

2. **Update Backend Configuration:**
   ```bash
   cd backend
   # Edit .env file:
   HUGGINGFACE_API_KEY=your_token_here
   ```

3. **Verify Integration:**
   ```bash
   node test-hf-integration.js  # Test API connection
   ```

### AI Features

- **Document Analysis:** Upload documents and AI generates structured insights
- **Smart Extraction:** If API fails, falls back to intelligent regex-based extraction
- **Output Format:** 
  - **DETAILED INSIGHTS:** Bullet points with specific facts from document
  - **ANALYTICAL SUMMARY:** Professional paragraph with strategic considerations

### Troubleshooting AI Issues

**Problem:** Getting 404 errors on Hugging Face API
- **Solution:** Verify token is valid and has Inference API permissions

**Problem:** Generic responses instead of real analysis  
- **Solution:** Ensure documents are uploaded and contain legal content

**Problem:** API timeouts
- **Solution:** Check backend logs, verify internet connection, increase timeout in backend/services/huggingfaceService.js

**Alternative: Use Ollama Locally** (no external API needed)
- Install: https://ollama.ai
- Run model: `ollama run mistral`
- Then configure backend to use `http://localhost:11434`

---

## 📂 Project Structure
