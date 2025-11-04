# User Orders Storage in Profile - Implementation Guide

## Overview
Order details are now automatically stored in each user's profile when they place an order. This enables users to:
- View their complete order history
- Track order status
- Access order details from their dashboard
- See total spent and order count

---

## Database Changes

### 1. User Model Enhancement
The `User` schema now includes:

```javascript
{
  // ... existing fields ...
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ]
}
```

**Benefits:**
- Direct reference to all orders in user profile
- Easy to fetch user's order history
- Supports future wishlist functionality

---

## API Endpoints

### 1. Create Order (Updated)
**Endpoint:** `POST /api/orders`

**What's New:**
- Order is automatically added to user's `orders` array
- User's `updatedAt` timestamp is refreshed

**Request Body:**
```json
{
  "items": [...],
  "shippingDetails": {...},
  "orderSummary": {...},
  "paymentMethod": "COD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully and saved to your profile",
  "order": {
    "_id": "order_id",
    "userId": "user_id",
    "items": [...],
    "orderStatus": "Order Confirmed",
    "createdAt": "2024-11-02T..."
  }
}
```

---

### 2. Get User Profile with Orders (NEW)
**Endpoint:** `GET /api/auth/profile-with-orders`

**Authentication:** Required (JWT Token)

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": "123 Main St",
    "city": "Srinagar",
    "state": "Jammu & Kashmir",
    "pincode": "190001",
    "role": "user",
    "orders": [
      {
        "_id": "order_1",
        "items": [...],
        "orderStatus": "Delivered",
        "paymentStatus": "Completed",
        "orderSummary": {
          "total": 5000
        },
        "createdAt": "2024-11-01T..."
      },
      {
        "_id": "order_2",
        "items": [...],
        "orderStatus": "In Transit",
        "paymentStatus": "Completed",
        "orderSummary": {
          "total": 3000
        },
        "createdAt": "2024-10-28T..."
      }
    ],
    "totalOrders": 2,
    "totalSpent": 8000,
    "createdAt": "2024-09-15T...",
    "updatedAt": "2024-11-02T..."
  }
}
```

---

### 3. Get User Orders (Existing)
**Endpoint:** `GET /api/orders/user`

**Returns:** Only orders (without full user profile)

```json
{
  "success": true,
  "count": 2,
  "orders": [...]
}
```

---

## Frontend Integration

### Service Function to Fetch User Profile with Orders

Add to `src/services/authService.js`:

```javascript
// Get user profile with all orders
getProfileWithOrders: async () => {
  const response = await apiClient.get('/auth/profile-with-orders');
  return response.data.user;
}
```

### Usage in Dashboard Component

```javascript
import { useEffect, useState } from 'react';
import authService from '../services/authService';

export const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await authService.getProfileWithOrders();
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {userProfile.name}!</h1>
      
      <div className="profile-stats">
        <p>📦 Total Orders: {userProfile.totalOrders}</p>
        <p>💰 Total Spent: ₹{userProfile.totalSpent}</p>
      </div>

      <h2>Order History</h2>
      <div className="orders-list">
        {userProfile.orders.map(order => (
          <div key={order._id} className="order-card">
            <h3>Order #{order._id.slice(-6)}</h3>
            <p>Status: {order.orderStatus}</p>
            <p>Amount: ₹{order.orderSummary.total}</p>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Database Queries

### Check User's Orders Directly

Using MongoDB client or Compass:

```javascript
// Find user with all their orders
db.users.aggregate([
  { $match: { email: "user@example.com" } },
  { 
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "userId",
      as: "orders"
    }
  }
])

// Get user's order count
db.users.findOne({ email: "user@example.com" }, { orders: 1 })

// Get all orders for a user
db.orders.find({ userId: ObjectId("user_id") }).sort({ createdAt: -1 })
```

---

## Order Status Tracking

Users can see their orders with these statuses:

| Status | Meaning |
|--------|---------|
| Order Confirmed | Order placed successfully |
| Processing | Order being prepared |
| In Transit | Order dispatched |
| Delivered | Order reached customer |
| Cancelled | Order was cancelled |

---

## Order Flow with Profile Storage

```
1. User Places Order
   ↓
2. Order saved to 'orders' collection
   ↓
3. Order ID added to user's orders array
   ↓
4. User can view profile with /profile-with-orders
   ↓
5. Dashboard displays order history with stats
```

---

## Future Enhancements

1. **Wishlist Management**
   - Add/remove products from wishlist
   - View wishlist items

2. **Order Notifications**
   - Send email when order status changes
   - Push notifications for delivery updates

3. **Repeat Orders**
   - One-click reorder from order history
   - Save favorite products

4. **Analytics**
   - User spending trends
   - Most ordered products
   - Average order value per user

5. **Order Export**
   - Download invoice as PDF
   - Export order history as CSV

---

## Testing the Feature

### Test Case 1: Create Order and Verify Storage

```bash
# 1. Login to get token
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password" }

# 2. Create an order
POST /api/orders
Headers: { "Authorization": "Bearer token" }
Body: { items, shippingDetails, orderSummary, paymentMethod }

# 3. Verify order in user profile
GET /api/auth/profile-with-orders
Headers: { "Authorization": "Bearer token" }

# Response should include the new order in the orders array
```

### Test Case 2: Multiple Orders

```bash
# Create multiple orders
POST /api/orders (repeat 3 times with different items)

# Fetch profile
GET /api/auth/profile-with-orders

# Verify:
# - totalOrders = 3
# - totalSpent = sum of all order totals
# - orders array contains all 3 orders sorted by date
```

---

## Troubleshooting

**Issue:** Orders not showing in profile
- **Solution:** Ensure order creation returned success and order ID exists

**Issue:** totalSpent shows incorrect value
- **Solution:** Check that all orders have valid `orderSummary.total` values

**Issue:** Orders not sorted by date
- **Solution:** Verify MongoDB has `.sort({ createdAt: -1 })` in query

---

## API Summary Table

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /api/orders | Create order (saves to profile) | ✅ |
| GET | /api/auth/me | Get user (no orders) | ✅ |
| GET | /api/auth/profile-with-orders | Get user with orders | ✅ |
| GET | /api/orders/user | Get orders list only | ✅ |
| GET | /api/orders/:id | Get single order | ✅ |
| GET | /api/orders | Get all orders (Admin) | ✅ Admin |

---

**Last Updated:** November 2024
**Status:** ✅ Production Ready