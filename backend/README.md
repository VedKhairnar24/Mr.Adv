# Backend API - Node.js + Express

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit the `.env` file with your MySQL credentials:
```env
PORT=5000
JWT_SECRET=supersecretkey123_advocate_system_2026
DB_PASSWORD=your_mysql_password  # Add this if your MySQL requires password
```

### 3. Database Setup
Make sure you've already created the database by running:
```sql
-- From: ../database/schema.sql
```

### 4. Run the Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

### 5. Test the Server

Once the server is running, test these endpoints in your browser or Postman:

- **Home**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **Database Test**: http://localhost:5000/api/test-db

## Expected Output

When the server starts successfully, you should see:
```
✅ MySQL Connected Successfully

🚀 Server running on port 5000
📍 Local: http://localhost:5000
📍 Health: http://localhost:5000/api/health
📍 DB Test: http://localhost:5000/api/test-db

Press Ctrl+C to stop the server
```

## API Endpoints Created

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/api/health` | API health check |
| GET | `/api/test-db` | Test database connection |

## Folder Structure

```
backend/
│
├── config/
│   └── db.js              # Database connection configuration
│
├── controllers/           # Business logic (to be added)
│
├── routes/               # API routes (to be added)
│
├── middleware/           # Custom middleware (to be added)
│
├── uploads/             # File upload directory
│
├── .env                 # Environment variables
│
├── server.js            # Main server file
│
└── package.json         # Project dependencies
```

## Next Steps

After confirming the server runs correctly, we'll add:

1. ✅ Authentication routes (login, register)
2. ✅ Client management routes
3. ✅ Case management routes
4. ✅ Document upload routes
5. ✅ Evidence management routes
6. ✅ Hearing management routes
7. ✅ Notes management routes

## Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify database `advocate_case_db` exists
- Check MySQL username and password in `.env`

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using port 5000

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and reinstall
