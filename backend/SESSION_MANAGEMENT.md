# Session Management Implementation

## Overview

The backend now supports **dual authentication**:
- ✅ **JWT Tokens** - For stateless API requests
- ✅ **Sessions** - For server-side session tracking and server-side logout capability

Sessions are persisted in MongoDB using `connect-mongo` session store, enabling session data to persist across server restarts.

---

## How Sessions Work

### Session Creation

Sessions are automatically created when users:
1. **Sign up** (`POST /api/auth/signup`)
2. **Log in** (`POST /api/auth/login`)

Session data stored:
```javascript
req.session.userId       // User's MongoDB _id
req.session.userRole     // User's role (admin/user)
req.session.userEmail    // User's email
req.session.userName     // User's name
```

### Session Storage

- **Store**: MongoDB collection `sessions` (auto-created by connect-mongo)
- **Duration**: 7 days (configurable in `server.js`)
- **Cookie**: `connect.sid` (httpOnly, secure in production)

---

## API Endpoints

### 1. **POST /api/auth/login** - Login with Session
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@mehryaan.com",
    "password": "user123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "sessionId": "abc123def456",
  "user": {
    "id": "64f8e9c7d1b2a3c4d5e6f7g8",
    "name": "John Doe",
    "email": "user@mehryaan.com",
    "role": "user"
  }
}
```

---

### 2. **POST /api/auth/signup** - Signup with Session
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@mehryaan.com",
    "password": "password123"
  }'
```

**Response:** Same as login, includes sessionId

---

### 3. **POST /api/auth/logout** - Logout (Destroy Session)
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Cookie: connect.sid=abc123def456"
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "sessionId": "abc123def456"
}
```

---

### 4. **GET /api/auth/session** - Get Current Session Info
Requires active session or JWT token.

```bash
curl -X GET http://localhost:5000/api/auth/session \
  -H "Cookie: connect.sid=abc123def456"
```

**Response:**
```json
{
  "success": true,
  "session": {
    "sessionId": "abc123def456",
    "userId": "64f8e9c7d1b2a3c4d5e6f7g8",
    "userEmail": "user@mehryaan.com",
    "userName": "John Doe",
    "userRole": "user",
    "createdAt": "2025-01-15T10:30:00Z",
    "maxAge": 604800000
  }
}
```

---

### 5. **POST /api/auth/check-session** - Check if Session Exists
Public endpoint - no authentication required.

```bash
curl -X POST http://localhost:5000/api/auth/check-session \
  -H "Cookie: connect.sid=abc123def456"
```

**Response (with active session):**
```json
{
  "success": true,
  "hasSession": true,
  "session": {
    "userId": "64f8e9c7d1b2a3c4d5e6f7g8",
    "userEmail": "user@mehryaan.com",
    "userName": "John Doe",
    "userRole": "user"
  }
}
```

**Response (no session):**
```json
{
  "success": true,
  "hasSession": false
}
```

---

## Authentication Methods

The `protect` middleware now supports **both JWT and sessions**:

### Method 1: JWT Token (Stateless)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

### Method 2: Session Cookie (Stateful)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Cookie: connect.sid=abc123def456"
```

Both methods work seamlessly with the `protect` middleware!

---

## Configuration

### Session Settings (`server.js`)

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    touchAfter: 24 * 3600 // Lazy update - don't update session if not modified
  }),
  cookie: {
    httpOnly: true,                              // Prevent JS access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 1000 * 60 * 60 * 24 * 7              // 7 days
  }
}));
```

### Environment Variables (`.env`)

```env
SESSION_SECRET=your-session-secret-key-change-in-production
JWT_SECRET=3fa213ad9f2da9b2f641dd9fd8b127e5
MONGODB_URI=mongodb+srv://...
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## Frontend Integration

### Using Sessions with Fetch API

#### Login
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important: send cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@mehryaan.com',
    password: 'user123'
  })
});

const data = await response.json();
console.log('Session ID:', data.sessionId);
```

#### Logout
```javascript
const response = await fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST',
  credentials: 'include' // Important: send cookies
});

const data = await response.json();
console.log(data.message); // "Logged out successfully"
```

#### Check Session on App Load
```javascript
const response = await fetch('http://localhost:5000/api/auth/check-session', {
  method: 'POST',
  credentials: 'include'
});

const data = await response.json();
if (data.hasSession) {
  console.log('User is logged in:', data.session.userName);
} else {
  console.log('No active session');
}
```

#### Protected Routes
```javascript
const response = await fetch('http://localhost:5000/api/auth/me', {
  method: 'GET',
  credentials: 'include', // Session cookie will be sent
  headers: { 'Content-Type': 'application/json' }
});

const data = await response.json();
if (data.success) {
  console.log('User:', data.user);
}
```

---

## Session Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                 │
│  (Browser with Cookies)                                       │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ 1. POST /login
                     │    (email, password)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                       SERVER                                  │
│  1. Verify password                                            │
│  2. Create session object                                      │
│  3. Save to req.session (MongoDB)                              │
│  4. Set-Cookie: connect.sid                                    │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ 2. Response + Cookie
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                 │
│  Browser stores connect.sid cookie                             │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ 3. GET /api/auth/me
                     │    (with connect.sid cookie)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                       SERVER                                  │
│  1. Read connect.sid from request                              │
│  2. Find session in MongoDB                                    │
│  3. Populate req.session from store                            │
│  4. Process request with user context                          │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ 4. Response (user data)
                     ↓
```

---

## MongoDB Sessions Collection

Sessions are stored in `sessions` collection in MongoDB:

```javascript
{
  "_id": "abc123def456",
  "session": {
    "userId": "64f8e9c7d1b2a3c4d5e6f7g8",
    "userRole": "user",
    "userEmail": "user@mehryaan.com",
    "userName": "John Doe",
    "cookie": {
      "originalMaxAge": 604800000,
      "expires": "2025-01-22T10:30:00Z",
      "_expires": "2025-01-22T10:30:00Z",
      "httpOnly": true,
      "path": "/"
    }
  },
  "expires": ISODate("2025-01-22T10:30:00Z")
}
```

---

## Security Best Practices

### ✅ Implemented

1. **HttpOnly Cookies** - Prevents XSS attacks from accessing session cookies
2. **Secure Cookies in Production** - HTTPS only
3. **Session Secret** - Signed with secret key in `.env`
4. **MongoDB Persistence** - Sessions survive server restarts
5. **Session Timeout** - Auto-expire after 7 days
6. **Lazy Session Update** - Reduces database writes

### 🔐 Additional Recommendations

1. **Change SESSION_SECRET** in production
   ```env
   SESSION_SECRET=generate-a-long-random-string
   ```

2. **Use HTTPS** in production
   ```env
   NODE_ENV=production
   ```

3. **Monitor Session Collection**
   ```bash
   db.sessions.find().count() # Check session count
   db.sessions.deleteMany({ "expires": { $lt: new Date() } }) # Clean expired
   ```

4. **Add Session Rate Limiting**
   ```javascript
   // Consider using express-rate-limit
   import rateLimit from 'express-rate-limit';
   ```

5. **Implement Refresh Token** (Optional)
   - Shorter session expiry
   - Token refresh mechanism

---

## Testing

### Test Login & Session
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"user@mehryaan.com","password":"user123"}'

# 2. Check session (uses cookies.txt)
curl -X POST http://localhost:5000/api/auth/check-session \
  -b cookies.txt

# 3. Get current user
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt

# 4. Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt

# 5. Verify session is destroyed
curl -X POST http://localhost:5000/api/auth/check-session \
  -b cookies.txt
```

---

## Troubleshooting

### Session not persisting?
- Check MongoDB connection in `.env`
- Verify `sessions` collection exists in MongoDB
- Check `NODE_ENV` setting

### Cookies not being set?
- Ensure `credentials: 'include'` in frontend fetch
- Check CORS `credentials: true` in server
- Verify `httpOnly` and `secure` settings

### Session expires too quickly?
- Increase `maxAge` in `server.js` cookie config
- Check `touchAfter` setting (lazy update interval)

### "No active session" error?
- User needs to login first
- Cookie might be expired
- Check browser cookie settings

---

## Session vs JWT

| Feature | JWT | Session |
|---------|-----|---------|
| State | Stateless | Stateful |
| Storage | Client (token) | Server (MongoDB) |
| Logout | Not possible | Immediate |
| Scalability | Better | Needs shared storage |
| Security | Token in storage | Cookie secure |
| Use Case | Mobile APIs | Web apps |

**Best Practice:** Use both!
- JWT for stateless API calls
- Sessions for web apps with logout needs

---

## Next Steps

1. ✅ Implement session refresh tokens (optional)
2. ✅ Add session activity tracking
3. ✅ Implement "remember me" functionality
4. ✅ Add multi-device session management
5. ✅ Implement session security audit logs

---

*Last Updated: January 2025*
*Mehryaan Backend - Session Management*