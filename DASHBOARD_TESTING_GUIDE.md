# 🧪 Dashboard Integration Testing Guide

## Quick Test (5 Minutes)

### Step 1: Start Backend
```bash
cd d:\new projects\Mehryaan\backend
npm start
```
Expected: Server running on `http://localhost:5000`

### Step 2: Start Frontend
```bash
cd d:\new projects\Mehryaan
npm run dev
```
Expected: App running on `http://localhost:5173`

### Step 3: Navigate to Login
- Open browser to `http://localhost:5173`
- Click "Login" button
- Or use test credentials:
  - Email: `demo@mehryaan.com`
  - Password: `demo123`

### Step 4: Create Account (if needed)
- Click "Signup" link
- Fill in form:
  - Name: `Test User`
  - Email: `test@example.com`
  - Password: `test123456`
- Click "Sign Up"
- Should redirect to home page (logged in)

### Step 5: Place a Test Order
- Go to "Products" page
- Click on a product
- Click "Add to Cart"
- Go to "Cart"
- Fill shipping details:
  - Name: `Test User`
  - Address: `123 Test Street`
  - City: `Delhi`
  - State: `Delhi`
  - Pincode: `110001`
  - Phone: `9876543210`
- Click "Place Order"
- Should see success message

### Step 6: View Dashboard
- Click "Dashboard" in navigation
- Should see:
  - ✅ Welcome message with your name
  - ✅ Profile card with email, phone
  - ✅ 4 statistics cards:
    - Total Orders: 1
    - Total Spent: ₹[amount]
    - In Transit: 1
    - Delivered: 0
  - ✅ Order history table with your order
  - ✅ Order status badge

### Step 7: View Order Details
- Click on the order in the table
- Modal should show:
  - ✅ Order ID
  - ✅ Items list with quantities
  - ✅ Shipping address
  - ✅ Order summary (subtotal, delivery, total)
  - ✅ Order status
  - ✅ Timestamps
  - ✅ Action buttons
- Click ✕ to close modal

### Step 8: Test Multiple Orders
Repeat Step 5-6 to add more orders and verify:
- Total orders count increases
- Total spent updates
- All orders appear in list
- Statistics update correctly

---

## Detailed Testing Scenarios

### Scenario A: Fresh User (No Orders)
1. Create new account
2. Navigate to Dashboard
3. Should show:
   - ✅ All stats: 0
   - ✅ Empty state message: "📭 No orders yet..."
   - ✅ No order cards

### Scenario B: User with Orders
1. Create account
2. Place 3 different orders
3. Navigate to Dashboard
4. Should show:
   - ✅ Stats: Total Orders = 3
   - ✅ All 3 orders in table
   - ✅ Correct amounts
   - ✅ Different statuses

### Scenario C: Order Details
1. Place an order with custom items
2. Open Dashboard
3. Click on order
4. Modal should show:
   - ✅ Each item with correct price
   - ✅ Quantity correct
   - ✅ Total calculation correct
   - ✅ Shipping address matches

### Scenario D: Error Handling
1. Close backend while on Dashboard
2. Refresh page
3. Should show:
   - ✅ Error message: "Unable to load your profile..."
   - ✅ "Retry" button appears
   - ✅ Click retry (backend needs to be running)

### Scenario E: Logout & Relogin
1. View Dashboard (logged in)
2. Click Logout
3. Login again
4. Navigate to Dashboard
5. Should see:
   - ✅ Same orders
   - ✅ Same statistics
   - ✅ Data persists

---

## Expected Data Flow

### API Calls:
1. **Login**: `POST /api/auth/login` → Returns token + user data
2. **Dashboard**: `GET /api/auth/profile-with-orders` → Returns user + orders + stats

### Backend Logic:
```
GET /api/auth/profile-with-orders
│
├─ Verify JWT token
├─ Get user by ID from token
├─ Get all orders for that user
├─ Calculate totalOrders & totalSpent
└─ Return complete profile
```

### Frontend Flow:
```
useEffect (on mount)
│
├─ Check if user is authenticated
├─ Call fetchUserProfile()
│
├─ fetchUserProfile()
│   ├─ Set loading = true
│   ├─ Call authService.getProfileWithOrders()
│   ├─ Set profile data
│   ├─ Set error = ''
│   └─ Set loading = false
│
└─ Render component with profile data
```

---

## Common Issues & Solutions

### Issue: "Please login to view dashboard"
**Solution:** You're not authenticated
- Sign up or login first
- Verify JWT token in localStorage

### Issue: "Unable to load your profile"
**Solution:** Backend not running
```bash
cd backend
npm start
```

### Issue: Empty orders list
**Solution:** No orders exist yet
- Go to Products page
- Add items to cart
- Complete checkout
- Return to Dashboard

### Issue: Statistics show 0
**Solution:** Same as above - need to place orders first

### Issue: Modal not opening
**Solution:** Click directly on the order card
- Not just on the text
- Try clicking the whole row
- Should see pointer cursor on hover

### Issue: Orders from other users showing
**Solution:** This shouldn't happen - indicates auth issue
- Check JWT token validity
- Verify userId in token matches orders

---

## Verify All Components

### Checklist:
- [ ] Login/Signup working
- [ ] Dashboard loads after login
- [ ] Profile header shows correct name/email
- [ ] Statistics cards display
- [ ] Order table appears (if orders exist)
- [ ] Clicking order opens modal
- [ ] Modal shows correct data
- [ ] Closing modal works (✕ button)
- [ ] Logout still works
- [ ] Relogin shows same data

---

## Browser Console Checks

Open DevTools (F12) → Console tab:

### Should NOT show errors:
```javascript
// Good:
GET http://localhost:5000/api/auth/profile-with-orders

// Bad:
GET http://localhost:5000/api/auth/profile-with-orders 401
GET http://localhost:5000/api/auth/profile-with-orders 500
```

### Should see in Network tab:
- `/auth/profile-with-orders` → Status 200 ✅
- Response includes: `success: true`, `user: {...}`, `orders: [...]`

---

## Quick Verification Commands

### Test Backend API directly (with token):
```bash
# Get token first from login response
# Then:
curl -X GET http://localhost:5000/api/auth/profile-with-orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Check if backend is running:
```bash
curl http://localhost:5000/api/auth/session
```

### Check if frontend is running:
```bash
curl http://localhost:5173
```

---

## Performance Notes

- First Dashboard load: ~500-1000ms (API call)
- Subsequent visits: ~100-200ms (cached if on same page)
- With 10+ orders: Still fast (MongoDB efficient query)
- Modal opens: Instant (data already loaded)

---

## Success Indicators ✅

When everything works:
1. ✅ Dashboard loads in <2 seconds
2. ✅ Stats display correct numbers
3. ✅ Orders list complete and accurate
4. ✅ Modal shows all details
5. ✅ No console errors
6. ✅ Data persists after refresh
7. ✅ Works after logout/login

---

## Final Verification

```javascript
// In browser console:
// Should return user data with orders
const userOrders = await authService.getProfileWithOrders();
console.log(userOrders.user.orders.length); // Should show order count
console.log(userOrders.user.totalSpent); // Should show total amount
```

---

## Ready to Test! 🚀

Everything is connected and ready. Just follow the steps above and you should see your orders in the Dashboard!

**If you encounter any issues, check the console for error messages.**
