# Session Management - Visual Guide

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                        │
│  - Login form                                                    │
│  - Protected pages                                               │
│  - Logout button                                                 │
│  ⚠️ Use: credentials: 'include' in all fetch calls               │
└────────────────────┬────────────────────────────────────────────┘
                     │
        HTTP(S) with Cookies & JWT
                     │
        ┌────────────┴────────────┐
        ↓                         ↓
   JWT Token            Session Cookie (connect.sid)
   (Authorization)      (Auto-sent by browser)
        │                         │
┌────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Middleware Stack                                        │   │
│  │ 1. cors()                                               │   │
│  │ 2. express.json()                                       │   │
│  │ 3. session() ← MongoStore connected                     │   │
│  │ 4. req.db injection                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Auth Routes (/api/auth)                                 │   │
│  │ ├─ POST /login → Create session + JWT                  │   │
│  │ ├─ POST /signup → Create session + JWT                 │   │
│  │ ├─ POST /logout → Destroy session                      │   │
│  │ ├─ GET /session → Get session info                     │   │
│  │ ├─ POST /check-session → Check if active              │   │
│  │ └─ GET /me → Get user (JWT or session)                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Middleware: protect()                                   │   │
│  │ Checks: JWT → Falls back → Session                     │   │
│  │ Sets: req.user = { id, role }                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Protected Routes (/api/products, /api/orders)          │   │
│  │ Access: req.db collections + req.user context          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │                            │
   Session Data              Collections Data
   (sessions collection)      (products, users,
                              orders collections)
        │                            │
        └────────────────────────────┘
                     ↓
        ┌────────────────────────────┐
        │   MongoDB (mehryaan DB)    │
        └────────────────────────────┘
```

---

## 🔄 Complete Request/Response Cycle

### Scenario 1: Login with Session Creation

```
┌─────────────┐
│   BROWSER   │
└──────┬──────┘
       │ 1. POST /api/auth/login
       │    Body: { email, password }
       │
       ↓
┌──────────────────────────┐
│    EXPRESS SERVER        │
│ 1. Validate credentials  │
│ 2. Find user in DB       │
│ 3. Verify bcrypt pwd     │
└──────┬───────────────────┘
       │ 4. Create session:
       │    req.session.userId = "64f8..."
       │    req.session.userRole = "user"
       │
       ↓
┌──────────────────────────┐
│   MONGODB (Sessions)     │
│ Insert: {                │
│   _id: "abc123...",      │
│   session: {             │
│     userId: "64f8...",   │
│     userRole: "user"     │
│   },                     │
│   expires: 2025-01-22    │
│ }                        │
└──────┬───────────────────┘
       │ 5. Return response:
       │    Set-Cookie: connect.sid=abc123...
       │    {
       │      success: true,
       │      token: "eyJhbGc...",
       │      sessionId: "abc123...",
       │      user: { id, name, email, role }
       │    }
       │
       ↓
┌─────────────┐
│   BROWSER   │
│ • Store JWT │
│ • Store     │
│   session   │
│   cookie    │
└─────────────┘
```

---

### Scenario 2: Protected Route with Session

```
┌─────────────┐
│   BROWSER   │
│             │
│ GET /me     │
│ Cookie:     │
│ connect.sid │
│             │
└──────┬──────┘
       │
       ↓
┌────────────────────────────┐
│   EXPRESS MIDDLEWARE       │
│ protect():                 │
│ 1. Check Authorization     │
│    header → NO JWT         │
│ 2. Check session           │
│    if (req.session.userId) │
│ 3. Set req.user = {        │
│      id: userId,           │
│      role: userRole        │
│    }                        │
└──────┬─────────────────────┘
       │
       ↓
┌────────────────────────────┐
│  Route Handler (/me)       │
│ 1. Use req.user.id         │
│ 2. Query MongoDB (users)   │
│ 3. Return user data        │
└────────────────────────────┘
```

---

### Scenario 3: Logout with Session Destruction

```
┌─────────────┐
│   BROWSER   │
│             │
│ POST        │
│ /logout     │
│ Cookie:     │
│ connect.sid │
│             │
└──────┬──────┘
       │
       ↓
┌────────────────────────────────┐
│   EXPRESS /logout ROUTE        │
│ req.session.destroy((err) => {  │
│   // Session removed from DB    │
│ })                              │
│ res.clearCookie('connect.sid')  │
└──────┬─────────────────────────┘
       │
       ↓
┌────────────────────────────┐
│    MONGODB                 │
│ DELETE from sessions       │
│ WHERE _id = "abc123..."    │
└────────────────────────────┘
       │
       ↓
┌────────────────────────────┐
│    RESPONSE                │
│ {                          │
│   success: true,           │
│   message: "Logged out"    │
│ }                          │
│ Clear-Cookie:              │
│ connect.sid=               │
│ (empty/deleted)            │
└────────────────────────────┘
       │
       ↓
┌─────────────┐
│   BROWSER   │
│ Cookie     │
│ deleted ✓  │
└─────────────┘
```

---

## 🗂️ File Changes Summary

```
backend/
├── server.js                    ✏️ MODIFIED
│   ├─ Added: import session
│   ├─ Added: import MongoStore
│   ├─ Added: session() middleware
│   └─ Configuration: MongoDB store
│
├── middleware/
│   └─ auth.js                   ✏️ MODIFIED
│       ├─ Updated: protect() middleware
│       │   • Check JWT first
│       │   • Fall back to session
│       └─ Added: isSessionActive()
│
├── routes/
│   └─ auth.js                   ✏️ MODIFIED
│       ├─ login: create session
│       ├─ signup: create session
│       ├─ Added: POST /logout
│       ├─ Added: GET /session
│       └─ Added: POST /check-session
│
├── .env                         ✏️ MODIFIED
│   └─ Added: SESSION_SECRET
│
├── SESSION_MANAGEMENT.md        ✨ NEW
│   └─ Complete documentation
│
├── SESSIONS_QUICK_START.md      ✨ NEW
│   └─ Quick reference
│
├── SESSIONS_VISUAL_GUIDE.md     ✨ NEW (this file)
│   └─ Visual explanations
│
└── test-sessions.js             ✨ NEW
    └─ Automated testing
```

---

## 🔐 Security Implementation

```
┌─────────────────────────────────────────────┐
│          SECURITY LAYERS                    │
├─────────────────────────────────────────────┤
│                                             │
│ 1. HttpOnly Cookies ✅                      │
│    └─ Prevents XSS JavaScript access       │
│                                             │
│ 2. Secure Flag ✅                           │
│    └─ HTTPS only in production              │
│                                             │
│ 3. Session Secret ✅                        │
│    └─ Signed & encrypted in .env            │
│                                             │
│ 4. MongoDB Persistence ✅                   │
│    └─ Sessions stored server-side           │
│                                             │
│ 5. Auto-Expiry ✅                           │
│    └─ 7-day TTL, auto-delete expired        │
│                                             │
│ 6. Bcrypt Passwords ✅                      │
│    └─ 10 salt rounds                        │
│                                             │
│ 7. CORS Credentials ✅                      │
│    └─ credentials: 'include' required       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📊 Session Lifecycle

```
Create ────────→ Active ────────→ Expire/Destroy
   │               │                   │
   │               │                   │
   ↓               ↓                   ↓
Login/Signup    Using app          Logout/Timeout
   │               │                   │
   │               │                   │
Save to DB    Update lastSeen      Delete from DB
(expires 7d)  (every 24h)          (destroy)
   │               │                   │
   └───────────────┴───────────────────┘
        User can continue using app
        until session expires
```

---

## 🧪 Testing Flow

```
┌─ Start Server (npm start)
│
├─ Test 1: No Session ──→ POST /check-session ──→ hasSession: false ✓
│
├─ Test 2: Login ──→ POST /login ──→ sessionId + token ✓
│
├─ Test 3: Session Active ──→ POST /check-session ──→ hasSession: true ✓
│
├─ Test 4: Get Session ──→ GET /session ──→ session details ✓
│
├─ Test 5: Protected Route ──→ GET /me ──→ user data ✓
│
├─ Test 6: Logout ──→ POST /logout ──→ session destroyed ✓
│
├─ Test 7: Verify Destroyed ──→ POST /check-session ──→ hasSession: false ✓
│
├─ Test 8: Signup ──→ POST /signup ──→ new session + token ✓
│
└─ Test 9: New Session ──→ POST /check-session ──→ hasSession: true ✓

All tests passing = Sessions fully functional! 🎉
```

---

## 🎨 Frontend Authentication Flow

```javascript
// 1. Check if user logged in (on app load)
useEffect(() => {
  fetch('/check-session', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data.hasSession) {
        setUser(data.session);
        // Show protected content
      } else {
        // Show login form
      }
    });
}, []);

// 2. Login
async function handleLogin(email, password) {
  const res = await fetch('/login', {
    method: 'POST',
    credentials: 'include',  // ⚠️ Important!
    body: JSON.stringify({ email, password })
  });
  
  if (res.ok) {
    const data = await res.json();
    setUser(data.user);
    // Browser automatically stores session cookie
  }
}

// 3. Access protected content
async function getProtectedData() {
  const res = await fetch('/api/protected', {
    credentials: 'include'  // ⚠️ Important!
  });
  
  return res.json();
  // Session cookie automatically included
}

// 4. Logout
async function handleLogout() {
  const res = await fetch('/logout', {
    method: 'POST',
    credentials: 'include'  // ⚠️ Important!
  });
  
  if (res.ok) {
    setUser(null);
    // Session destroyed on server
    // Cookie automatically deleted by browser
  }
}
```

---

## 🔗 API Endpoint Tree

```
/api/auth/
├── POST /login
│   ├─ Request: { email, password }
│   ├─ Response: { token, sessionId, user }
│   └─ Action: Create session + JWT
│
├── POST /signup
│   ├─ Request: { name, email, password }
│   ├─ Response: { token, sessionId, user }
│   └─ Action: Create user + session + JWT
│
├── POST /logout
│   ├─ Auth: Session or JWT
│   ├─ Response: { success, message }
│   └─ Action: Destroy session
│
├── GET /session
│   ├─ Auth: Session or JWT
│   ├─ Response: { session info }
│   └─ Action: Return current session
│
├── POST /check-session
│   ├─ Auth: None required
│   ├─ Response: { hasSession, session? }
│   └─ Action: Check if active
│
├── GET /me
│   ├─ Auth: Session or JWT
│   ├─ Response: { user data }
│   └─ Action: Get current user
│
└── PUT /updateprofile
    ├─ Auth: Session or JWT
    ├─ Response: { updated user }
    └─ Action: Update profile
```

---

## 📈 Session Storage in MongoDB

```
Database: mehryaan
│
├── sessions (NEW - created by connect-mongo)
│   ├─ _id: ObjectId
│   ├─ session: {
│   │   userId: String
│   │   userRole: String
│   │   userEmail: String
│   │   userName: String
│   │   cookie: {...}
│   │ }
│   └─ expires: Date (TTL index - auto-delete)
│
├── users (existing)
│   ├─ _id, name, email, password...
│   └─ ...
│
├── products (existing)
│   └─ ...
│
└── orders (existing)
    └─ ...
```

---

## ⚙️ Configuration Locations

```
Session Configuration Flow:

backend/.env
├─ SESSION_SECRET
└─ JWT_SECRET
│
↓
backend/server.js
├─ session() middleware config
├─ MongoStore setup
├─ Cookie options
└─ maxAge (7 days)
│
↓
backend/middleware/auth.js
├─ JWT verification
├─ Session check
└─ protect() logic
│
↓
backend/routes/auth.js
├─ Session creation (login/signup)
├─ Session destruction (logout)
└─ Session endpoints
```

---

## 🎯 Decision Tree: When to Use

```
                  ┌─ Authentication Needed ─┐
                  │                         │
            Is it a...?               Use Session-Based
                  │                   + JWT for flexibility
                  ├─ Web App      ✓   (Cookie + Token)
                  │
                  ├─ Mobile App   ✓   JWT only
                  │
                  ├─ SPA/React    ✓   Session + JWT
                  │
                  └─ API Only     ✓   JWT only
```

---

## 📞 Quick Reference Card

```
LOGIN
─────────────────────────────────────
POST /api/auth/login
Headers: Content-Type: application/json
Body: { email, password }
Response: { token, sessionId, user }
Cookie: Set automatically ✓

PROTECTED REQUEST
─────────────────────────────────────
GET /api/protected
Headers: Cookie: connect.sid=...
  (or Authorization: Bearer token...)
Response: { protected data }

LOGOUT
─────────────────────────────────────
POST /api/auth/logout
Cookie: connect.sid=...
Response: { success: true }
Cookie: Deleted ✓

CHECK SESSION
─────────────────────────────────────
POST /api/auth/check-session
Cookie: connect.sid=... (optional)
Response: { hasSession, session? }

⚠️ IMPORTANT
─────────────────────────────────────
• Use credentials: 'include' in fetch
• Set CORS credentials: true in server
• Change SESSION_SECRET in production
• Monitor sessions collection size
```

---

## 🚀 Getting Started Checklist

- [ ] Run `npm install express-session connect-mongo` ✓ (already done)
- [ ] Start backend: `npm start`
- [ ] Seed database: `node scripts/seedDatabase.js`
- [ ] Test with cURL or `node test-sessions.js`
- [ ] Update frontend with `credentials: 'include'`
- [ ] Test login → session created
- [ ] Test protected route → works
- [ ] Test logout → session destroyed
- [ ] Change SESSION_SECRET in production
- [ ] Deploy! 🎉

---

**Status:** ✅ Sessions fully implemented and documented  
**Backend:** Ready for frontend integration  
**Documentation:** Complete with examples and diagrams