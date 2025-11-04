# Admin Panel Setup & Login/Signup

## Overview
The Mehryaan e-commerce platform now includes a dedicated **Admin Panel** with authentication. Admins can manage products, orders, and view analytics.

---

## Admin Access

### Routes
- **Admin Login Page:** `/admin/login`
- **Admin Signup Page:** `/admin/signup`
- **Admin Dashboard:** `/admin` (protected route - requires login)

### Quick Access
- Click the **⚙️ Admin** button in the header navigation
- Or navigate directly to `http://localhost:5173/admin/login`

---

## Features

### Admin Login (`/admin/login`)
- Email and password authentication
- Error handling for invalid credentials
- Remember me functionality (via localStorage)
- Link to signup page for new admins
- Test credentials display

### Admin Signup (`/admin/signup`)
- Create new admin account
- Required fields:
  - Full Name
  - Store Name
  - Email
  - Password (minimum 6 characters)
  - Confirm Password
- Password validation (must match)
- Secure account creation

### Admin Dashboard (`/admin`)
- **Protected Route:** Only authenticated admins can access
- Auto-redirects to login if not authenticated
- Welcome message with admin name
- Logout button in header
- Three main tabs:
  - **Products** - Add, edit, delete products
  - **Orders** - View and manage customer orders
  - **Analytics** - View store statistics

---

## Test Account

### Credentials
```
Email: admin@mehryaan.com
Password: admin123
```

These credentials are pre-seeded in the MongoDB database via `backend/scripts/seedDatabase.js`

---

## Authentication Flow

```
┌─────────────────────────────────────────┐
│  User visits /admin                     │
└─────────────────┬───────────────────────┘
                  │
         ┌────────▼────────┐
         │ AdminRoute      │
         │ Component       │
         └────────┬────────┘
                  │
        ┌─────────▼─────────┐
        │ Is Authenticated? │
        └─┬───────────────┬─┘
          │ NO            │ YES
          │               │
      ┌───▼──────┐    ┌───▼──────────┐
      │ Redirect │    │ Show Admin   │
      │ to Login │    │ Dashboard    │
      └──────────┘    └──────────────┘
```

---

## How It Works

### 1. User Registration (Admin Signup)
- User fills signup form with email, password, name, store name
- Form validates:
  - All fields required
  - Password minimum 6 characters
  - Passwords match
- POST request to `/auth/signup` with `role: 'admin'`
- Backend creates user in MongoDB
- JWT token returned and stored in localStorage
- User logged in automatically
- Redirects to `/admin` dashboard

### 2. User Login (Admin Login)
- User enters email and password
- POST request to `/auth/login`
- Backend validates credentials
- JWT token returned if valid
- Token stored in localStorage
- UserContext updated with user data
- Redirects to `/admin` dashboard

### 3. Protected Access (AdminRoute Component)
- Every `/admin` route wrapped with `AdminRoute` component
- Checks:
  - User is authenticated
  - User has `role === 'admin'`
- If not authenticated: Redirects to `/admin/login`
- If authenticated: Shows dashboard

### 4. Logout
- Click "🚪 Logout" button in admin header
- Confirmation dialog appears
- `authService.logout()` called:
  - Clears localStorage (token & user)
  - UserContext logout action dispatched
- Redirects to `/admin/login`

---

## File Structure

```
src/
├── pages/
│   ├── AdminLogin.jsx      # Login page component
│   ├── AdminSignup.jsx     # Signup page component
│   └── Admin.jsx           # Admin dashboard (updated with logout)
├── components/
│   └── AdminRoute.jsx      # Protected route wrapper
├── styles/
│   └── AdminAuth.css       # Admin auth page styles
└── context/
    └── UserContext.jsx     # User state & auth methods
```

### New Files Added
1. **AdminLogin.jsx** - Login page with email/password form
2. **AdminSignup.jsx** - Registration page with account creation
3. **AdminRoute.jsx** - Route protector component
4. **AdminAuth.css** - Styled login/signup pages

### Modified Files
1. **App.jsx** - Added routes for `/admin/login`, `/admin/signup`, `/admin`
2. **Admin.jsx** - Added logout button and admin user info display
3. **Header.jsx** - Updated admin link to go to `/admin/login`

---

## Styling

### AdminAuth.css Features
- **Gradient backgrounds** matching brand colors (Maroon, Gold)
- **Split layout** - Form on left, branding on right (desktop)
- **Responsive design** - Mobile-friendly
- **Smooth animations** - Slide-in effects on page load
- **Interactive elements** - Hover effects on buttons and links
- **Error messaging** - Clear error display with styling
- **Feature cards** - Highlight admin panel features

### Colors Used
- Primary: `var(--maroon)` (#800000)
- Secondary: `var(--gold)` (#FFD700)
- Accent: `#a00000` (Dark Maroon)
- Text: #666 (Gray), White

---

## Security Notes

⚠️ **Important for Production:**

1. **JWT Tokens:**
   - Stored in localStorage (consider moving to secure HttpOnly cookies)
   - Tokens include expiration time
   - Always sent in Authorization header for API requests

2. **Password Security:**
   - Minimum 6 characters enforced on frontend
   - Backend should enforce stronger requirements (8+, special chars)
   - Implement password hashing (bcrypt) on backend

3. **Role-Based Access:**
   - Frontend checks `user.role === 'admin'`
   - Backend must also verify role before allowing operations
   - Never trust frontend validation alone

4. **Environment Variables:**
   - API endpoints configured in `src/services/api.js`
   - JWT secret stored in backend `.env` file

---

## Testing the Admin Features

### Step 1: Start Backend
```bash
cd backend
npm install
node scripts/seedDatabase.js
npm start
```

### Step 2: Start Frontend
```bash
npm run dev
```

### Step 3: Test Login
1. Go to `http://localhost:5173/admin/login`
2. Enter test credentials:
   - Email: `admin@mehryaan.com`
   - Password: `admin123`
3. Click Login
4. Should redirect to `/admin` dashboard

### Step 4: Test Signup
1. Go to `http://localhost:5173/admin/signup`
2. Fill in form with:
   - Name: Your Name
   - Store Name: My Store
   - Email: newemail@example.com
   - Password: password123
3. Click "Create Account"
4. Should create account and redirect to dashboard

### Step 5: Test Logout
1. Click "🚪 Logout" button in admin header
2. Confirm logout in dialog
3. Should redirect to login page

### Step 6: Test Protected Route
1. After logout, try accessing `/admin` directly
2. Should automatically redirect to `/admin/login`

---

## Troubleshooting

### Issue: Login fails with "No matching version found for jsonwebtoken"
**Solution:** Already fixed. Run `npm install` in backend with correct jsonwebtoken version.

### Issue: "connect ECONNREFUSED" error when logging in
**Solution:** Backend server not running. Make sure to start backend with `npm start` in the backend directory.

### Issue: Always redirected to login even after signing up
**Solution:** 
- Check browser console for errors
- Verify localStorage has token and user data
- Check if user.role is set to 'admin' (not 'user')

### Issue: Logout button doesn't work
**Solution:**
- Clear browser cache/localStorage
- Check if UserContext logout method is properly implemented
- Ensure API endpoint for logout is working

---

## API Integration

The admin authentication integrates with backend endpoints:

```
POST /auth/signup
  - Body: { name, email, password, role: 'admin', storeName }
  - Response: { token, user: { id, name, email, role } }

POST /auth/login
  - Body: { email, password }
  - Response: { token, user: { id, name, email, role } }

POST /auth/logout
  - Headers: { Authorization: 'Bearer <token>' }
  - Response: { message: 'Logged out successfully' }
```

---

## Next Steps

1. **Add more admin features:**
   - User management
   - Email notifications
   - Advanced analytics

2. **Enhance security:**
   - Implement 2FA (Two-Factor Authentication)
   - Add admin activity logs
   - Session timeout after inactivity

3. **Improve UI:**
   - Add dashboard widgets
   - Implement data export (CSV/PDF)
   - Add profile settings page

4. **Scale features:**
   - Add multiple admin roles
   - Implement permission-based access
   - Add audit trail

---

*Last Updated: 2025*
*Admin Panel v1.0*