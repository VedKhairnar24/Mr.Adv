# Quick Reference - Advocate Intelligence Platform

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd backend && npm install

# 2. Ensure services are running
# - MySQL: Check with `mysql -u root -p`
# - Redis: Check with `redis-cli ping` (should return PONG)

# 3. Run migration
mysql -u root -p < database/migrations/001_enhanced_schema.sql

# 4. Start server
npm start

# 5. Start frontend (in another terminal)
cd ../frontend && npm run dev
```

---

## 📡 API Quick Reference

### Notifications

```bash
# Get all notifications
GET /api/notifications

# Get unread count
GET /api/notifications/unread-count

# Mark one as read
PUT /api/notifications/:id/read

# Mark all as read
PUT /api/notifications/read-all

# Get preferences
GET /api/notifications/preferences

# Update preferences
PUT /api/notifications/preferences
Body: { "email_enabled": true, "hearing_reminder_hours": 24 }
```

---

## 🗂️ File Locations

| Component | Location |
|-----------|----------|
| Redis Config | `backend/src/config/redis.js` |
| Logger | `backend/src/config/logger.js` |
| Notification Service | `backend/src/services/notificationService.js` |
| Email Service | `backend/src/services/emailService.js` |
| Hearing Scheduler | `backend/src/schedulers/hearingScheduler.js` |
| Notification Routes | `backend/src/routes/notificationRoutes.js` |
| Logs | `backend/logs/` |
| DB Migrations | `database/migrations/` |

---

## 🔧 Common Tasks

### Create Notification Programmatically

```javascript
const NotificationService = require('./src/services/notificationService');

await NotificationService.createNotification({
  user_id: 1,
  type: 'hearing_reminder',
  title: 'Test Notification',
  message: 'This is a test',
  related_type: 'hearing',
  related_id: 123,
  priority: 'high'
});
```

### Send Email Manually

```javascript
const emailService = require('./src/services/emailService');

await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Test Email',
  html: '<p>Hello!</p>'
});
```

### Check Logs

```bash
# Tail combined logs
tail -f backend/logs/combined.log

# Tail error logs
tail -f backend/logs/error.log

# Search for specific error
grep "ERROR" backend/logs/error.log
```

---

## 🗄️ Database Quick Queries

```sql
-- View unread notifications
SELECT * FROM notifications 
WHERE user_id = 1 AND is_read = FALSE 
ORDER BY created_at DESC;

-- View notification preferences
SELECT * FROM notification_preferences WHERE user_id = 1;

-- View upcoming tasks
SELECT * FROM tasks 
WHERE assigned_to = 1 AND status = 'pending' 
ORDER BY due_date;

-- View audit logs
SELECT * FROM audit_logs 
WHERE user_id = 1 
ORDER BY created_at DESC 
LIMIT 10;

-- View AI jobs
SELECT * FROM ai_jobs 
WHERE user_id = 1 
ORDER BY created_at DESC;
```

---

## 🔑 Environment Variables

### Required
```env
PORT=5000
JWT_SECRET=your_secret
DB_PASSWORD=your_password
OPENROUTER_API_KEY=your_key
REDIS_HOST=localhost
```

### Optional
```env
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email
SMTP_PASSWORD=your_password
LOG_LEVEL=debug
ENABLE_SCHEDULERS=false
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Redis connection error | Start Redis: `redis-server` |
| MySQL connection error | Check `DB_PASSWORD` in `.env` |
| Emails not sending | Configure SMTP or ignore (in-app still works) |
| Scheduler not running | Set `ENABLE_SCHEDULERS=true` |
| Port already in use | Change `PORT` in `.env` or kill process |

---

## 📦 Package Scripts

```bash
npm start        # Start production server
npm run dev      # Start with nodemon (auto-restart)
```

---

## 🔍 Testing Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Database Test
```bash
curl http://localhost:5000/api/test-db
```

### Notifications (requires auth)
```bash
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Monitoring

### Check Redis
```bash
redis-cli
> INFO
> DBSIZE
> MONITOR
```

### Check MySQL
```sql
SHOW PROCESSLIST;
SHOW TABLES;
SELECT COUNT(*) FROM notifications;
```

### View Logs
```bash
# Real-time logs
tail -f backend/logs/combined.log

# Error logs only
tail -f backend/logs/error.log
```

---

## 🎯 Key Features

✅ **Automated Hearing Reminders** - Never miss a court date  
✅ **Email Notifications** - Configurable via SMTP  
✅ **In-App Notifications** - Real-time via Redis  
✅ **Structured Logging** - Winston with file rotation  
✅ **Task Management** - Track assignments and deadlines  
✅ **Audit Trail** - Track all operations  
✅ **AI Job Queue** - Async AI processing (ready)  

---

## 📚 Documentation

- **Setup Guide**: `ARCHITECTURE_SETUP.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Architecture Plan**: See plan file in Qoder
- **API Docs**: Check route files in `backend/src/routes/`

---

**Last Updated**: 2026-04-27  
**Version**: 2.0.0
