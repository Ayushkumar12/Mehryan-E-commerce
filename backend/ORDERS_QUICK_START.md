# 🚀 Orders API - Quick Start Guide

## 5-Minute Setup

### 1. Verify Backend is Running
```bash
cd backend
npm start
```

Expected output:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
🔗 API: http://localhost:5000/api
```

### 2. Run Test Suite
```bash
node test-orders.js
```

Expected result:
```
✅ All 15 tests PASSED
📊 Success Rate: 100%
```

### 3. Ready to Use!

---

## 📌 Most Used Endpoints

### Create Order (POST)
```bash
POST /api/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "items": [{ "productId": "...", "name": "Suit", "price": 5999, "quantity": 1 }],
  "shippingDetails": { "fullName": "Name", "email": "...", "phone": "...", "address": "...", "city": "...", "state": "...", "pincode": "..." },
  "orderSummary": { "subtotal": 5999, "deliveryCharges": 0, "total": 5999 },
  "paymentMethod": "Online"
}
```

### Get User Orders (GET)
```bash
GET /api/orders/user
Authorization: Bearer YOUR_TOKEN
```

### Cancel Order (POST)
```bash
POST /api/orders/ORDER_ID/cancel
Authorization: Bearer YOUR_TOKEN
```

### Admin: Get Statistics (GET)
```bash
GET /api/orders/statistics/dashboard
Authorization: Bearer ADMIN_TOKEN
```

### Admin: Search Customer (GET)
```bash
GET /api/orders/search/customer?query=ayush
Authorization: Bearer ADMIN_TOKEN
```

### Admin: Filter by Date (GET)
```bash
GET /api/orders/filter/date?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer ADMIN_TOKEN
```

---

## 🔑 Test Credentials

```
User Email:  user@mehryaan.com
User Pass:   user123

Admin Email: admin@mehryaan.com
Admin Pass:  admin123
```

---

## 📱 React/Frontend Usage

### Install Dependencies
```bash
npm install axios
```

### API Client Setup
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // ⚠️ IMPORTANT for sessions!
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

export default api;
```

### Create Order
```javascript
import api from './api';

const createOrder = async (orderData) => {
  try {
    const res = await api.post('/orders', orderData);
    console.log('Order created:', res.data.order);
    return res.data.order;
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
};
```

### Get User Orders
```javascript
const getUserOrders = async () => {
  try {
    const res = await api.get('/orders/user');
    console.log('User orders:', res.data.orders);
    return res.data.orders;
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
};
```

### Cancel Order
```javascript
const cancelOrder = async (orderId) => {
  try {
    const res = await api.post(`/orders/${orderId}/cancel`);
    console.log('Order cancelled:', res.data.order);
    return res.data.order;
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
};
```

---

## 🛠️ Admin Panel Examples

### Display Dashboard Statistics
```javascript
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/orders/statistics/dashboard')
      .then(res => setStats(res.data.statistics))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1>Order Statistics</h1>
      <p>Total Orders: {stats.totalOrders}</p>
      <p>Total Revenue: ₹{stats.totalRevenue}</p>
      <p>Average Order Value: ₹{stats.averageOrderValue}</p>
      
      <h3>Status Breakdown:</h3>
      <ul>
        <li>Confirmed: {stats.statusBreakdown.confirmed}</li>
        <li>Processing: {stats.statusBreakdown.processing}</li>
        <li>In Transit: {stats.statusBreakdown.inTransit}</li>
        <li>Delivered: {stats.statusBreakdown.delivered}</li>
        <li>Cancelled: {stats.statusBreakdown.cancelled}</li>
      </ul>
    </div>
  );
};
```

### Search Customer Orders
```javascript
const CustomerSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(`/orders/search/customer?query=${query}`);
      setResults(res.data.orders);
    } catch (error) {
      console.error('Search failed:', error.response.data.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or phone..."
        />
        <button type="submit">Search</button>
      </form>

      {results.map(order => (
        <div key={order._id}>
          <p>{order.shippingDetails.fullName}</p>
          <p>{order.shippingDetails.email}</p>
          <p>Order: {order._id}</p>
        </div>
      ))}
    </div>
  );
};
```

### Update Order Status
```javascript
const updateOrderStatus = async (orderId, orderStatus) => {
  try {
    const res = await api.put(`/orders/${orderId}`, {
      orderStatus,
      notes: `Updated to ${orderStatus}`
    });
    console.log('Order updated:', res.data.order);
    return res.data.order;
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
};
```

---

## ✅ Verification Checklist

Run through these to verify everything is working:

- [ ] Backend server is running (`npm start`)
- [ ] MongoDB is connected (check: `http://localhost:5000/api/health`)
- [ ] Run all tests: `node test-orders.js` (should see ✅ All 15 tests PASSED)
- [ ] Can login with user credentials
- [ ] Can login with admin credentials
- [ ] Can create an order
- [ ] Can get user orders
- [ ] Can cancel an order
- [ ] Can view order statistics (admin)
- [ ] Can search by customer (admin)
- [ ] Can filter by date (admin)

---

## 🎯 Common Tasks

### Task: Display User's Orders on Dashboard
```javascript
useEffect(() => {
  const fetchOrders = async () => {
    const res = await api.get('/orders/user');
    setUserOrders(res.data.orders);
  };
  fetchOrders();
}, []);

return (
  <div>
    {userOrders.map(order => (
      <OrderCard key={order._id} order={order} />
    ))}
  </div>
);
```

### Task: Show Order Details Modal
```javascript
const [selectedOrder, setSelectedOrder] = useState(null);

const viewOrderDetails = async (orderId) => {
  const res = await api.get(`/orders/${orderId}`);
  setSelectedOrder(res.data.order);
};
```

### Task: Cancel Order with Confirmation
```javascript
const handleCancelOrder = async (orderId) => {
  if (window.confirm('Are you sure you want to cancel this order?')) {
    await api.post(`/orders/${orderId}/cancel`);
    // Refresh orders
    const res = await api.get('/orders/user');
    setUserOrders(res.data.orders);
  }
};
```

### Task: Admin - View All Orders
```javascript
useEffect(() => {
  api.get('/orders')
    .then(res => setAllOrders(res.data.orders))
    .catch(err => console.error(err));
}, []);
```

### Task: Admin - Bulk Update Orders
```javascript
const bulkUpdateStatus = async (selectedOrderIds, newStatus) => {
  await api.put('/orders/bulk/status', {
    orderIds: selectedOrderIds,
    orderStatus: newStatus
  });
  // Refresh orders
  const res = await api.get('/orders');
  setAllOrders(res.data.orders);
};
```

---

## 🐛 Troubleshooting

### "401 Unauthorized" Error
**Solution:** Make sure you include Authorization header with JWT token
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

### "403 Forbidden" Error
**Solution:** User doesn't have permission. Check:
- Admin endpoints require admin role
- Users can only access their own orders

### "404 Order Not Found"
**Solution:** Order ID doesn't exist. Verify:
- Order ID is correct
- Order actually exists in database

### Sessions Not Working
**Solution:** Always include `credentials: 'include'` in fetch/axios
```javascript
withCredentials: true  // for axios
// OR
credentials: 'include'  // for fetch
```

### Test Script Fails
**Solution:** 
1. Check backend is running: `npm start`
2. Check MongoDB is connected
3. Check test credentials exist in database
4. Run: `node test-orders.js` again

---

## 📚 Full Documentation

For complete documentation, see:
- **[ORDERS_API_DOCUMENTATION.md](./ORDERS_API_DOCUMENTATION.md)** - Full API reference with examples
- **[ORDERS_IMPLEMENTATION_REVIEW.md](./ORDERS_IMPLEMENTATION_REVIEW.md)** - Implementation details and security review

---

## 📊 API Summary Table

| Operation | Endpoint | Method | Auth |
|-----------|----------|--------|------|
| Create Order | `/api/orders` | POST | ✓ |
| Get All Orders | `/api/orders` | GET | ✓ Admin |
| Get User Orders | `/api/orders/user` | GET | ✓ |
| Get Single Order | `/api/orders/:id` | GET | ✓ |
| Update Order | `/api/orders/:id` | PUT | ✓ Admin |
| Delete Order | `/api/orders/:id` | DELETE | ✓ Admin |
| Cancel Order | `/api/orders/:id/cancel` | POST | ✓ |
| Statistics | `/api/orders/statistics/dashboard` | GET | ✓ Admin |
| Filter by Date | `/api/orders/filter/date` | GET | ✓ Admin |
| Search Customer | `/api/orders/search/customer` | GET | ✓ Admin |
| Bulk Update | `/api/orders/bulk/status` | PUT | ✓ Admin |

---

## 🚀 Deployment

Before deploying to production:

1. ✅ Run test suite: `node test-orders.js`
2. ✅ Verify MongoDB indexes are created
3. ✅ Update environment variables
4. ✅ Set strong JWT_SECRET and SESSION_SECRET
5. ✅ Enable HTTPS/SSL
6. ✅ Configure CORS for production domain
7. ✅ Set NODE_ENV=production
8. ✅ Deploy and test with real data

---

## 🎓 Learn More

**Want to understand the implementation?**
1. Read [ORDERS_API_DOCUMENTATION.md](./ORDERS_API_DOCUMENTATION.md) - How API works
2. Read [ORDERS_IMPLEMENTATION_REVIEW.md](./ORDERS_IMPLEMENTATION_REVIEW.md) - Implementation details
3. Review [routes/orders.js](./routes/orders.js) - Source code
4. Run [test-orders.js](./test-orders.js) - See it in action

---

## 💡 Pro Tips

1. **Token Management:** Store JWT token in localStorage after login
2. **Sessions:** Always use `credentials: 'include'` with fetch/axios
3. **Error Handling:** Check `error.response.data.message` for API error details
4. **Admin Panel:** Create separate components for admin features
5. **Loading States:** Show loading indicators during API calls
6. **Pagination:** Consider adding pagination for large datasets

---

## ✨ Quick Links

- 🏠 [Backend Home](./README.md)
- 📄 [Full API Documentation](./ORDERS_API_DOCUMENTATION.md)
- 🔍 [Implementation Review](./ORDERS_IMPLEMENTATION_REVIEW.md)
- 🧪 [Run Tests](./test-orders.js)
- 🔐 [Auth Documentation](./SESSION_MANAGEMENT.md)

---

**Status:** ✅ Production Ready  
**Last Updated:** January 2025  
**Version:** 1.0

🎉 **Happy Coding!** 🎉