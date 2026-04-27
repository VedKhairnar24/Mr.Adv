# Advocate Intelligence Platform - Setup Guide

## Overview
This guide will help you set up the enhanced Advocate Intelligence Platform with notifications, schedulers, and AI capabilities.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL** (v8.0 or higher)
3. **Redis** (v7.x) - Required for notifications and job queue
4. **npm** or **yarn**

## Installation Steps

### 1. Install Redis

#### Windows:
- Download from: https://github.com/tporadowski/redis/releases
- Extract and run `redis-server.exe`

#### Mac:
```bash
brew install redis
brew services start redis
```

#### Linux (Ubuntu):
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

### 2. Install Dependencies

```bash
cd Mr.Adv/backend
npm install
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp ../.env.example ../.env

# Edit .env with your actual values
# Required fields:
# - DB_PASSWORD (your MySQL password)
# - JWT_SECRET (generate a secure random string)
# - OPENROUTER_API_KEY (get from https://openrouter.ai)
```

### 4. Setup Database

```bash
# Run the main schema (if starting fresh)
mysql -u root -p < database/schema.sql

# Run the enhanced migration (adds notifications, tasks, etc.)
mysql -u root -p < database/migrations/001_enhanced_schema.sql
```

### 5. Start Redis Server

Make sure Redis is running:

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG
```

### 6. Start the Backend Server

```bash
cd Mr.Adv/backend
npm start
```

You should see:
```
✅ MySQL Connected Successfully
✅ Redis connected successfully
🚀 Server running on port 5000
Initializing background schedulers...
Hearing schedulers initialized successfully
```

### 7. Start the Frontend (in another terminal)

```bash
cd Mr.Adv/frontend
npm run dev
```

## Testing the New Features

### 1. Test Notifications API

```bash
# Get all notifications
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get unread count
curl -X GET http://localhost:5000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Mark all as read
curl -X PUT http://localhost:5000/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test Hearing Scheduler

The scheduler automatically runs every hour. To manually trigger it:

```javascript
// In Node.js console or test file
const HearingScheduler = require('./src/schedulers/hearingScheduler');
HearingScheduler.runManualCheck();
```

### 3. Monitor Logs

Logs are stored in:
- `backend/logs/combined.log` - All logs
- `backend/logs/error.log` - Error logs only

## Architecture Components

### 1. Notification System
- **Repository**: `backend/src/repositories/notificationRepository.js`
- **Service**: `backend/src/services/notificationService.js`
- **Controller**: `backend/src/controllers/notificationController.js`
- **Routes**: `backend/src/routes/notificationRoutes.js`

### 2. Email Service
- **File**: `backend/src/services/emailService.js`
- Uses Nodemailer for sending emails
- Configured via SMTP settings in `.env`

### 3. Hearing Scheduler
- **File**: `backend/src/schedulers/hearingScheduler.js`
- Runs every hour to check upcoming hearings
- Sends notifications 24-48 hours before hearings
- Sends urgent reminders 2 hours before hearings

### 4. Redis Integration
- **File**: `backend/src/config/redis.js`
- Used for:
  - Real-time notification pub/sub
  - Email queue
  - Session caching (future)

### 5. Winston Logger
- **File**: `backend/src/config/logger.js`
- Structured logging with file rotation
- Console output in development

## API Endpoints

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/preferences` - Get preferences
- `PUT /api/notifications/preferences` - Update preferences

## Troubleshooting

### Redis Connection Error
```
❌ Redis connection error: connect ECONNREFUSED
```
**Solution**: Make sure Redis server is running.

### MySQL Connection Error
```
❌ Database connection failed: Access denied
```
**Solution**: Check DB_PASSWORD in `.env` file.

### Email Not Sending
```
SMTP credentials not configured. Email notifications disabled.
```
**Solution**: Add SMTP credentials to `.env` or leave disabled (in-app notifications still work).

## Next Steps

1. **Implement WebSocket** for real-time notifications
2. **Add Task Management** API endpoints
3. **Setup BullMQ** for robust job queue
4. **Add Audit Logging** middleware
5. **Implement AI Job Processing** queue

## Support

For issues or questions:
1. Check logs in `backend/logs/`
2. Verify all services are running (MySQL, Redis)
3. Review `.env` configuration
4. Check API documentation in `/docs`

---

**Version**: 2.0.0  
**Last Updated**: 2026-04-27
