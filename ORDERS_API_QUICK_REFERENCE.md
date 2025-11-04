# 🚀 Orders in User Profile - API Quick Reference

## ⚡ Quick Commands

### 1. Create Order (Saves to Profile)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "prod_123",
        "name": "Customized Suit",
        "price": 3000,
        "quantity": 1,
        "customization": {
          "fabric": "Silk",
          "embroidery": "Gold",
          "color": "Maroon",
          "size": "M"
        }
      }
    ],
    "shippingDetails": {
      "fullName": "Ayush Sharma",
      "email": "ayush@example.com",
      "phone": "9876543210",
      "address": "123 Main St",
      "city": "Srinagar",
      "state": "Jammu & Kashmir",
      "pincode": "190001"
    },
    "orderSummary": {
      "subtotal": 3000,
      "deliveryCharges": 100,
      "total": 3100
    },
    "paymentMethod": "COD"
  }'
```

✨ **Automatically saves to user.orders array!**

---

### 2. Get User Profile with Orders (NEW!)
```bash
curl -X GET http://localhost:5000/api/auth/profile-with-orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "Ayush Sharma",
    "email": "ayush@example.com",
    "orders": [
      {
        "_id": "order_id_1",
        "items": [...],
        "orderStatus": "Delivered",
        "orderSummary": { "total": 3100 },
        "createdAt": "2024-11-02T10:30:00Z"
      }
    ],
    "totalOrders": 1,
    "totalSpent": 3100
  }
}
```

---

### 3. Get Orders List Only
```bash
curl -X GET http://localhost:5000/api/orders/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 JavaScript Fetch Examples

### Create Order
```javascript
const createOrder = async (orderData, token) => {
  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
  return response.json();
};
```

### Get Profile with Orders
```javascript
const getProfileWithOrders = async (token) => {
  const response = await fetch('http://localhost:5000/api/auth/profile-with-orders', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### React Usage
```javascript
import { useEffect, useState } from 'react';
import authService from '../services/authService';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { user } = await authService.getProfileWithOrders();
        setProfile(user);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    loadProfile();
  }, []);

  return (
    <>
      <h1>Welcome, {profile?.name}!</h1>
      <p>Total Orders: {profile?.totalOrders}</p>
      <p>Total Spent: ₹{profile?.totalSpent}</p>
      <ul>
        {profile?.orders?.map(order => (
          <li key={order._id}>
            Order #{order._id.slice(-6)} - {order.orderStatus}
          </li>
        ))}
      </ul>
    </>
  );
};
```

---

## 🔗 All Endpoints Summary

| Method | Endpoint | Purpose | Returns |
|--------|----------|---------|---------|
| **POST** | `/api/orders` | Create order (saves to profile) | New order |
| **GET** | `/api/orders/user` | Get user's orders | Orders array |
| **GET** | `/api/orders/:id` | Get single order | Order details |
| **GET** | `/api/auth/profile-with-orders` | Get profile + orders | User + orders + stats |
| **GET** | `/api/auth/me` | Get user (no orders) | User profile |
| **PUT** | `/api/auth/updateprofile` | Update profile | Updated user |

---

## 📊 Data Structures

### Order Object
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [
    {
      productId: ObjectId,
      name: String,
      price: Number,
      quantity: Number,
      customization: {
        fabric: String,
        embroidery: String,
        color: String,
        size: String
      }
    }
  ],
  shippingDetails: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  orderSummary: {
    subtotal: Number,
    deliveryCharges: Number,
    total: Number
  },
  paymentMethod: String,        // 'COD', 'UPI', 'Online'
  paymentStatus: String,        // 'Pending', 'Completed', 'Failed'
  orderStatus: String,          // 'Order Confirmed', 'Processing', etc.
  createdAt: Date,
  updatedAt: Date
}
```

### User Object (with profile-with-orders)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  role: String,
  
  // From /profile-with-orders endpoint:
  orders: [Order],              // Array of full order objects
  totalOrders: Number,          // Count of orders
  totalSpent: Number,           // Sum of all order totals
  
  createdAt: Date,
  updatedAt: Date
  
  // password: NEVER INCLUDED
}
```

---

## 🔐 Authentication

All endpoints require Bearer token in header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get token:**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response: { token: "eyJ...", user: {...} }
```

---

## ✅ Success Responses

### Order Created
```json
{
  "success": true,
  "message": "Order created successfully and saved to your profile",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "items": [...],
    "orderStatus": "Order Confirmed",
    "createdAt": "2024-11-02T10:30:00Z"
  }
}
```

### Profile Fetched
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Ayush Sharma",
    "email": "ayush@example.com",
    "orders": [...],
    "totalOrders": 5,
    "totalSpent": 15000
  }
}
```

---

## ❌ Error Responses

### Unauthorized
```json
{
  "success": false,
  "message": "No valid token provided"
}
```

### Order Not Found
```json
{
  "success": false,
  "message": "Order not found"
}
```

### User Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 🧪 Test Scripts

### Create Test Order
```javascript
// test-create-order.js
const token = 'YOUR_JWT_TOKEN';

const orderData = {
  items: [{
    productId: '507f191e810c19729de860ea',
    name: 'Customized Suit',
    price: 3000,
    quantity: 1,
    customization: { fabric: 'Silk', color: 'Maroon', size: 'M' }
  }],
  shippingDetails: {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '9876543210',
    address: '123 Test St',
    city: 'Srinagar',
    state: 'Jammu & Kashmir',
    pincode: '190001'
  },
  orderSummary: { subtotal: 3000, deliveryCharges: 100, total: 3100 },
  paymentMethod: 'COD'
};

fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(orderData)
})
.then(r => r.json())
.then(data => console.log('Order created:', data))
.catch(err => console.error('Error:', err));
```

### Verify Order in Profile
```javascript
// test-verify-order.js
const token = 'YOUR_JWT_TOKEN';

fetch('http://localhost:5000/api/auth/profile-with-orders', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('User:', data.user.name);
  console.log('Total Orders:', data.user.totalOrders);
  console.log('Total Spent:', data.user.totalSpent);
  console.log('Orders:', data.user.orders);
})
.catch(err => console.error('Error:', err));
```

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Orders not saving | Backend not restarted | Restart Node server |
| 404 on new endpoint | Route not defined | Check auth.js has route |
| 401 Unauthorized | Invalid/expired token | Get new token from login |
| Null totalSpent | Missing orderSummary.total | Ensure order has total field |
| Empty orders array | User has no orders | Place an order first |

---

## 📈 Performance Tips

1. **Cache profile data** - Don't fetch on every component render
```javascript
const [profile, setProfile] = useState(null);
useEffect(() => {
  // Only fetch once on mount
  loadProfile();
}, []); // Empty dependency array
```

2. **Paginate orders** - For users with many orders
```javascript
// Fetch orders in batches
GET /api/orders/user?page=1&limit=10
```

3. **Sort by date** - Orders come pre-sorted (newest first)

---

## 🔄 Workflow Example

```
1. User Login
   POST /api/auth/login
   ↓ Get token
   
2. User Places Order
   POST /api/orders
   ↓ Order saved to orders collection
   ↓ Order ID added to user.orders array
   
3. User Views Dashboard
   GET /api/auth/profile-with-orders
   ↓ Returns user + all orders + stats
   
4. Dashboard Displays
   - User name
   - Total orders count
   - Total spending
   - Order history table
   - Individual order details modal
```

---

## 💾 Database Queries

### MongoDB - Check User's Orders
```javascript
// Get user with orders
db.users.findOne({ email: "user@example.com" }, { orders: 1 })

// Get user's order count
db.users.aggregate([
  { $match: { email: "user@example.com" } },
  { $project: { orderCount: { $size: "$orders" } } }
])

// Get user with full order details
db.users.aggregate([
  { $match: { email: "user@example.com" } },
  {
    $lookup: {
      from: "orders",
      localField: "orders",
      foreignField: "_id",
      as: "orderDetails"
    }
  }
])
```

---

## 🎓 Learn More

- Full documentation: `USER_ORDERS_STORAGE.md`
- Visual guide: `ORDER_STORAGE_QUICK_GUIDE.md`
- Component example: `DASHBOARD_EXAMPLE.md`
- Complete summary: `ORDERS_IN_PROFILE_COMPLETE.md`

---

**Quick Reference Version:** 1.0
**Last Updated:** November 2024
**Status:** ✅ Production Ready

---

## 🎯 One-Minute Summary

✅ **What Changed:** Orders now stored in user profile  
✅ **When:** Automatically on order creation  
✅ **How:** Order ID added to user.orders array  
✅ **Access:** New `/api/auth/profile-with-orders` endpoint  
✅ **Frontend:** Use `authService.getProfileWithOrders()`  
✅ **Response:** User + all orders + stats (totalOrders, totalSpent)  

**Ready to use!** 🚀