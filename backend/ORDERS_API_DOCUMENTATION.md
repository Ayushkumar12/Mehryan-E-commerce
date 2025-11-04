# 📦 Mehryaan Orders API - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Request & Response Examples](#request--response-examples)
4. [Error Handling](#error-handling)
5. [Frontend Integration](#frontend-integration)
6. [Use Cases](#use-cases)

---

## Overview

The Orders API provides complete order management functionality for the Mehryaan e-commerce platform. It supports:

- ✅ Creating orders
- ✅ Retrieving orders (user & admin)
- ✅ Updating order status
- ✅ Cancelling orders
- ✅ Order statistics & analytics
- ✅ Advanced filtering & search
- ✅ Bulk operations

### Collections Used
- **orders** - Main orders collection
- **users** - Referenced for user information
- **products** - Referenced for product information

---

## API Endpoints

### 1. Create Order
```
POST /api/orders
Authorization: Required (JWT or Session)
Access: Private (Authenticated Users)
```

**Purpose:** Create a new order

**Request Body:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "name": "Embroidered Suit",
      "price": 5999,
      "quantity": 1,
      "customization": {
        "fabric": "Cotton",
        "embroidery": "Gold",
        "color": "Maroon",
        "size": "XL",
        "referenceImage": "url_to_image",
        "specialInstructions": "Rush delivery"
      }
    }
  ],
  "shippingDetails": {
    "fullName": "Ayush Kumar",
    "email": "ayush@example.com",
    "phone": "9876543210",
    "address": "123 Main St, Apartment 4B",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001"
  },
  "orderSummary": {
    "subtotal": 5999,
    "deliveryCharges": 0,
    "total": 5999
  },
  "paymentMethod": "Online"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439001",
    "items": [...],
    "shippingDetails": {...},
    "orderSummary": {...},
    "paymentMethod": "Online",
    "paymentStatus": "Pending",
    "orderStatus": "Order Confirmed",
    "notes": "",
    "createdAt": "2025-01-20T10:30:00Z",
    "updatedAt": "2025-01-20T10:30:00Z"
  }
}
```

---

### 2. Get User Orders
```
GET /api/orders/user
Authorization: Required
Access: Private (User can see own orders)
```

**Purpose:** Retrieve all orders for the logged-in user

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439001",
      "items": [...],
      "shippingDetails": {...},
      "orderStatus": "Delivered",
      "paymentStatus": "Completed",
      "createdAt": "2025-01-20T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Single Order
```
GET /api/orders/:id
Authorization: Required
Access: Private (User can access own orders, Admin can access all)
```

**Purpose:** Retrieve detailed information about a specific order

**URL Parameters:**
- `id` (string, required) - Order ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439001",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "name": "Embroidered Suit",
        "price": 5999,
        "quantity": 1,
        "customization": {
          "fabric": "Cotton",
          "embroidery": "Gold",
          "color": "Maroon",
          "size": "XL"
        }
      }
    ],
    "shippingDetails": {...},
    "orderSummary": {
      "subtotal": 5999,
      "deliveryCharges": 0,
      "total": 5999
    },
    "paymentMethod": "Online",
    "paymentStatus": "Completed",
    "orderStatus": "Delivered",
    "notes": "Order delivered on 2025-01-22",
    "createdAt": "2025-01-20T10:30:00Z",
    "updatedAt": "2025-01-22T15:45:00Z"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Not authorized to access this order"
}
```

---

### 4. Get All Orders (Admin)
```
GET /api/orders
Authorization: Required (JWT or Session)
Access: Private/Admin (Admin only)
```

**Purpose:** Retrieve all orders in the system (Admin dashboard)

**Success Response (200):**
```json
{
  "success": true,
  "count": 45,
  "orders": [
    {...},
    {...}
  ]
}
```

---

### 5. Update Order Status (Admin)
```
PUT /api/orders/:id
Authorization: Required
Access: Private/Admin (Admin only)
```

**Purpose:** Update order status or payment status

**Request Body:**
```json
{
  "orderStatus": "In Transit",
  "paymentStatus": "Completed",
  "notes": "Dispatched with tracking number ABC123"
}
```

**Valid Order Statuses:**
- `Order Confirmed`
- `Processing`
- `In Transit`
- `Delivered`
- `Cancelled`

**Valid Payment Statuses:**
- `Pending`
- `Completed`
- `Failed`
- `Refund Pending`

**Success Response (200):**
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "orderStatus": "In Transit",
    "paymentStatus": "Completed",
    "notes": "Dispatched with tracking number ABC123",
    "updatedAt": "2025-01-20T12:00:00Z"
  }
}
```

---

### 6. Cancel Order
```
POST /api/orders/:id/cancel
Authorization: Required
Access: Private (User can cancel own orders, Admin can cancel any)
```

**Purpose:** Cancel an order (only if not delivered or already cancelled)

**Request Body:** Empty or `{}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "orderStatus": "Cancelled",
    "paymentStatus": "Refund Pending",
    "updatedAt": "2025-01-20T12:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot cancel order with status: Delivered"
}
```

**Cancellation Logic:**
- User can only cancel their own orders (Admin bypass)
- Cannot cancel if already delivered or cancelled
- For online payments: sets paymentStatus to "Refund Pending"
- For COD: keeps paymentStatus as "Pending"

---

### 7. Delete Order (Admin)
```
DELETE /api/orders/:id
Authorization: Required
Access: Private/Admin (Admin only)
```

**Purpose:** Permanently delete an order from the database

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

---

### 8. Order Statistics (Admin)
```
GET /api/orders/statistics/dashboard
Authorization: Required
Access: Private/Admin (Admin only)
```

**Purpose:** Get comprehensive order statistics for admin dashboard

**Success Response (200):**
```json
{
  "success": true,
  "statistics": {
    "totalOrders": 45,
    "totalRevenue": 269955,
    "averageOrderValue": 5999.00,
    "statusBreakdown": {
      "confirmed": 10,
      "processing": 8,
      "inTransit": 15,
      "delivered": 11,
      "cancelled": 1
    },
    "paymentBreakdown": {
      "pending": 5,
      "completed": 39,
      "failed": 1
    },
    "paymentMethodBreakdown": {
      "online": 20,
      "cod": 15,
      "upi": 10
    }
  }
}
```

---

### 9. Filter Orders by Date (Admin)
```
GET /api/orders/filter/date?startDate=2025-01-01&endDate=2025-01-31
Authorization: Required
Access: Private/Admin (Admin only)
```

**Purpose:** Get orders within a specific date range

**Query Parameters:**
- `startDate` (string, required) - Start date (YYYY-MM-DD format)
- `endDate` (string, required) - End date (YYYY-MM-DD format)

**Success Response (200):**
```json
{
  "success": true,
  "count": 15,
  "totalRevenue": 89985,
  "dateRange": {
    "from": "2025-01-01",
    "to": "2025-01-31"
  },
  "orders": [...]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```

---

### 10. Search Orders by Customer (Admin)
```
GET /api/orders/search/customer?query=ayush
Authorization: Required
Access: Private/Admin (Admin only)
```

**Purpose:** Search orders by customer name, email, or phone

**Query Parameters:**
- `query` (string, required) - Search query (name, email, or phone)

**Search Matches:**
- Customer full name (case-insensitive)
- Customer email (case-insensitive)
- Customer phone number

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "searchQuery": "ayush",
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "shippingDetails": {
        "fullName": "Ayush Kumar",
        "email": "ayush@example.com",
        "phone": "9876543210"
      }
    }
  ]
}
```

---

### 11. Bulk Update Order Status (Admin)
```
PUT /api/orders/bulk/status
Authorization: Required
Access: Private/Admin (Admin only)
```

**Purpose:** Update status for multiple orders at once

**Request Body:**
```json
{
  "orderIds": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439014"
  ],
  "orderStatus": "Processing",
  "paymentStatus": "Completed"
}
```

**Note:** Provide at least one of `orderStatus` or `paymentStatus`

**Success Response (200):**
```json
{
  "success": true,
  "message": "3 orders updated successfully",
  "modifiedCount": 3,
  "matchedCount": 3
}
```

---

## Request & Response Examples

### Frontend Integration Examples

#### React with Fetch

**Create Order:**
```javascript
const createOrder = async (orderData) => {
  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    credentials: 'include', // Important for sessions
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(orderData)
  });
  return await response.json();
};
```

**Get User Orders:**
```javascript
const getUserOrders = async () => {
  const response = await fetch('http://localhost:5000/api/orders/user', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return await response.json();
};
```

**Cancel Order:**
```javascript
const cancelOrder = async (orderId) => {
  const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return await response.json();
};
```

#### React with Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Create order
const createOrder = (orderData) => api.post('/orders', orderData);

// Get user orders
const getUserOrders = () => api.get('/orders/user');

// Cancel order
const cancelOrder = (orderId) => api.post(`/orders/${orderId}/cancel`);

// Admin: Get all orders
const getAllOrders = () => api.get('/orders');

// Admin: Update order status
const updateOrderStatus = (orderId, updateData) => 
  api.put(`/orders/${orderId}`, updateData);

// Admin: Statistics
const getStatistics = () => api.get('/orders/statistics/dashboard');

// Admin: Filter by date
const filterByDate = (startDate, endDate) => 
  api.get(`/orders/filter/date?startDate=${startDate}&endDate=${endDate}`);

// Admin: Search customer
const searchCustomer = (query) => 
  api.get(`/orders/search/customer?query=${query}`);

// Admin: Bulk update
const bulkUpdate = (orderIds, orderStatus) => 
  api.put('/orders/bulk/status', { orderIds, orderStatus });
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "No active session"
}
```

**403 Forbidden (No admin access):**
```json
{
  "success": false,
  "message": "Not authorized to access this order"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Please provide a search query"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Error message details"
}
```

---

## Order Status Workflow

```
Order Confirmed
       ↓
Processing (Admin updates)
       ↓
In Transit (Admin updates)
       ↓
Delivered (Admin marks complete)

OR

Cancelled (User/Admin cancels at any point before delivery)
```

---

## Payment Status Workflow

```
Online Payment Path:
Pending → Completed → (or Refund Pending if cancelled)
          → Failed

COD Path:
Pending → Completed (on delivery)
        → (Pending remains if cancelled)
```

---

## Use Cases

### 1. Customer Places Order
1. Frontend collects order data
2. POST `/api/orders` with order details
3. Backend creates order with status "Order Confirmed"
4. Return order ID and confirmation

### 2. Customer Cancels Order
1. GET `/api/orders/:id` to check status
2. POST `/api/orders/:id/cancel` to cancel
3. Check if cancellation was successful
4. Update UI to show "Cancelled" status

### 3. Admin Views Dashboard
1. GET `/api/orders/statistics/dashboard` for overview
2. Display total orders, revenue, breakdown by status
3. Refresh stats periodically

### 4. Admin Manages Incoming Orders
1. GET `/api/orders` to see all orders
2. Filter by date: GET `/api/orders/filter/date?startDate=...&endDate=...`
3. Click order to view details: GET `/api/orders/:id`
4. Update status: PUT `/api/orders/:id` with new status

### 5. Admin Searches Customer
1. User types customer name in search
2. GET `/api/orders/search/customer?query=ayush`
3. Display matching orders
4. Admin can click to view/update

### 6. Admin Bulk Update Orders
1. Select multiple orders in admin panel
2. Choose new status
3. PUT `/api/orders/bulk/status` with array of IDs
4. Show success message with count updated

---

## Database Schema (MongoDB)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,  // Reference to user
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
        size: String,
        referenceImage: String,
        specialInstructions: String
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
  paymentMethod: String,  // "Online", "COD", "UPI"
  paymentStatus: String,  // "Pending", "Completed", "Failed"
  orderStatus: String,    // "Order Confirmed", "Processing", "In Transit", "Delivered", "Cancelled"
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Best Practices

### For Frontend Developers
1. ✅ Always include `credentials: 'include'` with fetch/axios
2. ✅ Store JWT token in localStorage and include in Authorization header
3. ✅ Handle 401 errors by redirecting to login
4. ✅ Show user-friendly error messages from API responses
5. ✅ Validate form data before sending to API
6. ✅ Show loading states during API calls

### For Admin Features
1. ✅ Use date filtering for revenue reports
2. ✅ Use search for quick customer lookup
3. ✅ Use bulk update for batch operations (e.g., marking all orders as "Processing")
4. ✅ Monitor statistics dashboard for business metrics
5. ✅ Review cancellation patterns to improve business

### Security
1. ✅ All protected endpoints require authentication
2. ✅ Users can only access their own orders
3. ✅ Admin-only operations verify user role
4. ✅ Never send passwords in responses
5. ✅ Use HTTPS in production for secure communication

---

## Rate Limiting & Performance

### Current Implementation
- No rate limiting (should be added for production)
- Queries optimized with MongoDB filtering
- Indexes recommended on: userId, createdAt, orderStatus

### Recommended Indexes
```javascript
// User's orders lookup
db.orders.createIndex({ userId: 1, createdAt: -1 })

// Date range queries
db.orders.createIndex({ createdAt: 1 })

// Status queries
db.orders.createIndex({ orderStatus: 1 })

// Search by customer
db.orders.createIndex({ 'shippingDetails.fullName': 1 })
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No active session" error | Ensure JWT token is in Authorization header or session cookie is included |
| "Not authorized to access" | Check user role (admin required for some endpoints) |
| Order not found | Verify order ID is correct and exists in database |
| Date filter returns no results | Check date format is YYYY-MM-DD |
| Bulk update doesn't work | Ensure orderIds array contains valid MongoDB ObjectIds |
| Search returns no results | Try partial name or email |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01 | Initial implementation with CRUD operations |
| 1.1 | 2025-01 | Added cancellation, statistics, filtering, search, bulk operations |

---

## Support & Questions

For API issues:
1. Check error response messages
2. Verify request format matches examples
3. Ensure proper authentication is included
4. Check MongoDB connection
5. Review server logs for detailed errors

---

**Last Updated:** January 2025  
**API Status:** ✅ Production Ready  
**Documentation Version:** 1.1