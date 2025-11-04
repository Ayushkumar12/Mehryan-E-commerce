# Session Management - Quick Start Guide

## 📦 What Was Added

✅ **express-session** - Session middleware for Express  
✅ **connect-mongo** - MongoDB session store  
✅ **Session endpoints** - Login/logout/check session  
✅ **Dual auth** - JWT + Sessions working together  

---

## 🚀 Quick Start

### 1. Dependencies Already Installed
```bash
cd backend
npm install express-session connect-mongo
```

### 2. Start Backend
```bash
npm start
# or for development with auto-reload
npm run dev
```

### 3. Seed Database (if not done yet)
```bash
node scripts/seedDatabase.js
```

---

## 🧪 Quick Test (Choose One)

### Option A: Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"user@mehryaan.com","password":"user123"}'
```

**Check Session:**
```bash
curl -X POST http://localhost:5000/api/auth/check-session \
  -b cookies.txt
```

**Logout:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

### Option B: Using Test Script
```bash
npm install node-fetch
node test-sessions.js
```

---

## 📋 API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | - | Login & create session |
| `/api/auth/signup` | POST | - | Signup & create session |
| `/api/auth/logout` | POST | Session | Logout & destroy session |
| `/api/auth/session` | GET | JWT/Session | Get current session info |
| `/api/auth/check-session` | POST | - | Check if session exists |
| `/api/auth/me` | GET | JWT/Session | Get logged-in user |

---

## 🔑 Session Details

- **Storage**: MongoDB `sessions` collection
- **Duration**: 7 days (configurable)
- **Cookie**: `connect.sid` (httpOnly, secure in production)
- **Secret**: Set in `.env` as `SESSION_SECRET`

---

## 💻 Frontend Integration

### With Fetch API
```javascript
// Login
const res = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  credentials: 'include',  // 🔑 Important!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@mehryaan.com',
    password: 'user123'
  })
});

// Check session
const res = await fetch('http://localhost:5000/api/auth/check-session', {
  method: 'POST',
  credentials: 'include'  // 🔑 Important!
});

// Logout
const res = await fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST',
  credentials: 'include'  // 🔑 Important!
});
```

### With Axios
```javascript
// Configure axios to send cookies
import axios from 'axios';
axios.defaults.withCredentials = true;

// Now all requests will include session cookies
```

---

## 🔒 Authentication Methods (Both Work!)

### Method 1: JWT Token (Stateless)
```javascript
headers: {
  'Authorization': 'Bearer eyJhbGc...'
}
```

### Method 2: Session Cookie (Stateful)
```javascript
// Browser handles automatically if credentials: 'include'
```

---

## 📝 Configuration

### `.env` File
```env
SESSION_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret
MONGODB_URI=your-mongodb-uri
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Session Config (`server.js`)
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    touchAfter: 24 * 3600 // Only update if changed
  }),
  cookie: {
    httpOnly: true,  // Prevent JS access
    secure: process.env.NODE_ENV === 'production',  // HTTPS only
    maxAge: 1000 * 60 * 60 * 24 * 7  // 7 days
  }
}));
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Sessions not saving | Check MongoDB connection & `sessions` collection |
| Cookies not being set | Use `credentials: 'include'` in fetch |
| "No active session" error | User needs to login first |
| Sessions expire quickly | Increase `maxAge` in cookie config |
| CORS errors | Verify `credentials: true` in CORS config |

---

## ✅ Test Checklist

- [x] Backend starts without errors
- [x] MongoDB sessions collection created
- [x] Login creates session
- [x] Session persists across requests
- [x] Logout destroys session
- [x] Both JWT and session auth work
- [x] Frontend can send credentials

---

## 📚 Full Documentation

See **SESSION_MANAGEMENT.md** for:
- Detailed session flow diagrams
- MongoDB sessions collection structure
- Security best practices
- Advanced testing examples
- Troubleshooting guide

---

## 🎯 What Happens on Login

```
1. User sends credentials
   ↓
2. Server verifies password
   ↓
3. Server creates session object
   ↓
4. Session saved to MongoDB
   ↓
5. Set-Cookie header sent to browser
   ↓
6. Browser stores connect.sid cookie
   ↓
7. Future requests include cookie automatically
```

---

## 🎯 What Happens on Logout

```
1. Browser sends logout request + session cookie
   ↓
2. Server finds session in MongoDB
   ↓
3. Server deletes session from MongoDB
   ↓
4. Clear-Cookie header sent to browser
   ↓
5. Browser deletes session cookie
   ↓
6. Future requests have no session
```

---

## Next Steps

1. ✅ Test sessions with provided test script
2. ✅ Integrate session login in React frontend
3. ✅ Add "Remember Me" functionality (optional)
4. ✅ Implement session timeout warnings (optional)
5. ✅ Add multi-device session management (optional)

---

**Created:** January 2025  
**Backend:** Mehryaan E-Commerce Platform