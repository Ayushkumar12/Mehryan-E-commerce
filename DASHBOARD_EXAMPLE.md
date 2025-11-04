# Dashboard Component Example - Displaying User Orders

## 🎯 Usage Example

Here's how to use the new `getProfileWithOrders` function in your Dashboard component:

---

## Complete Dashboard Component

```jsx
import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import { useUser } from '../context/UserContext';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isAuthenticated } = useUser();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfileWithOrders();
      setProfile(response.user);
      setError('');
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Unable to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="not-authenticated">Please login to view dashboard</div>;
  }

  if (loading) {
    return <div className="loading">⏳ Loading your profile...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>❌ {error}</p>
        <button onClick={fetchUserProfile}>Retry</button>
      </div>
    );
  }

  if (!profile) {
    return <div className="error">❌ Profile not found</div>;
  }

  return (
    <div className="dashboard" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Profile Header */}
      <section className="profile-header" style={{
        background: 'linear-gradient(135deg, var(--maroon) 0%, rgba(214,69,65,0.8) 100%)',
        color: 'white',
        padding: '40px',
        borderRadius: '12px',
        marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>
              👤 Welcome, {profile.name}!
            </h1>
            <p style={{ margin: '0', opacity: 0.9 }}>
              {profile.email} • {profile.phone}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', opacity: 0.9 }}>
              Member Since: {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="stats-section" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <StatCard 
          icon="📦" 
          title="Total Orders" 
          value={profile.totalOrders}
          subtitle="Orders placed"
        />
        <StatCard 
          icon="💰" 
          title="Total Spent" 
          value={`₹${profile.totalSpent?.toLocaleString() || 0}`}
          subtitle="Lifetime spending"
        />
        <StatCard 
          icon="🚚" 
          title="In Transit" 
          value={profile.orders?.filter(o => o.orderStatus === 'In Transit').length || 0}
          subtitle="Orders on the way"
        />
        <StatCard 
          icon="✅" 
          title="Delivered" 
          value={profile.orders?.filter(o => o.orderStatus === 'Delivered').length || 0}
          subtitle="Successfully delivered"
        />
      </section>

      {/* Orders History */}
      <section className="orders-section">
        <h2 style={{ 
          fontSize: '24px', 
          marginBottom: '20px', 
          color: 'var(--maroon)',
          borderBottom: '2px solid var(--maroon)',
          paddingBottom: '10px'
        }}>
          📋 Order History
        </h2>

        {profile.orders && profile.orders.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            {profile.orders.map((order) => (
              <OrderCard 
                key={order._id} 
                order={order}
                onSelect={() => setSelectedOrder(order)}
              />
            ))}
          </div>
        ) : (
          <div style={{
            background: '#f5f5f5',
            padding: '40px',
            textAlign: 'center',
            borderRadius: '8px'
          }}>
            <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
              📭 No orders yet. Start shopping!
            </p>
          </div>
        )}
      </section>

      {/* Selected Order Details Modal */}
      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Contact Section */}
      <section className="contact-section" style={{
        marginTop: '40px',
        padding: '20px',
        background: '#f9f9f9',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3>Need Help? 🤝</h3>
        <p>Contact us at support@mehryaan.com or call +91-9876543210</p>
      </section>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle }) => (
  <div style={{
    background: 'white',
    border: '2px solid var(--border)',
    borderRadius: '12px',
    padding: '25px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'}
  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
  >
    <div style={{ fontSize: '40px', marginBottom: '10px' }}>{icon}</div>
    <h3 style={{ margin: '0 0 5px 0', color: 'var(--maroon)', fontSize: '18px' }}>
      {title}
    </h3>
    <p style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
      {value}
    </p>
    <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
      {subtitle}
    </p>
  </div>
);

// Order Card Component
const OrderCard = ({ order, onSelect }) => (
  <div 
    onClick={onSelect}
    style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
      alignItems: 'center',
      gap: '20px'
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
  >
    {/* Order ID */}
    <div>
      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>Order ID</p>
      <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
        #{order._id.slice(-6).toUpperCase()}
      </p>
    </div>

    {/* Date */}
    <div>
      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>Date</p>
      <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
        {new Date(order.createdAt).toLocaleDateString()}
      </p>
    </div>

    {/* Amount */}
    <div>
      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>Amount</p>
      <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--maroon)' }}>
        ₹{order.orderSummary?.total?.toLocaleString() || 0}
      </p>
    </div>

    {/* Status */}
    <div>
      <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>Status</p>
      <p style={{
        margin: 0,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        background: getStatusColor(order.orderStatus),
        color: 'white',
        display: 'inline-block'
      }}>
        {order.orderStatus}
      </p>
    </div>

    {/* Arrow */}
    <div style={{ fontSize: '20px', color: 'var(--maroon)' }}>
      →
    </div>
  </div>
);

// Order Detail Modal
const OrderDetailModal = ({ order, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, color: 'var(--maroon)' }}>
          Order #{order._id.slice(-6).toUpperCase()}
        </h2>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* Order Items */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>📦 Items</h3>
        {order.items?.map((item, idx) => (
          <div key={idx} style={{
            background: '#f9f9f9',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
              {item.name} × {item.quantity}
            </p>
            <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
              Price: ₹{item.price}
            </p>
            {item.customization && (
              <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                Customization: {Object.entries(item.customization)
                  .filter(([, v]) => v)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' • ')}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Shipping Details */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>🚚 Shipping Address</h3>
        <p style={{ margin: '0 0 5px 0' }}>
          {order.shippingDetails?.fullName}
        </p>
        <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
          {order.shippingDetails?.address}
        </p>
        <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
          {order.shippingDetails?.city}, {order.shippingDetails?.state} {order.shippingDetails?.pincode}
        </p>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          📱 {order.shippingDetails?.phone}
        </p>
      </div>

      {/* Order Summary */}
      <div style={{ marginBottom: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>💳 Order Summary</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Subtotal:</span>
          <span>₹{order.orderSummary?.subtotal?.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Delivery:</span>
          <span>₹{order.orderSummary?.deliveryCharges?.toLocaleString()}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid #ddd',
          fontWeight: 'bold',
          color: 'var(--maroon)'
        }}>
          <span>Total:</span>
          <span>₹{order.orderSummary?.total?.toLocaleString()}</span>
        </div>
      </div>

      {/* Status Info */}
      <div style={{
        background: getStatusBgColor(order.orderStatus),
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '12px', opacity: 0.8 }}>
          ORDER STATUS
        </p>
        <p style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>
          {order.orderStatus}
        </p>
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
          Last updated: {new Date(order.updatedAt).toLocaleString()}
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button style={{
          padding: '12px',
          borderRadius: '6px',
          border: '2px solid var(--maroon)',
          background: 'white',
          color: 'var(--maroon)',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
          📥 Download Invoice
        </button>
        <button style={{
          padding: '12px',
          borderRadius: '6px',
          border: 'none',
          background: 'var(--maroon)',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
          🔄 Track Order
        </button>
      </div>
    </div>
  </div>
);

// Helper function for status color
const getStatusColor = (status) => {
  switch(status) {
    case 'Order Confirmed': return '#4CAF50';
    case 'Processing': return '#2196F3';
    case 'In Transit': return '#FF9800';
    case 'Delivered': return '#4CAF50';
    case 'Cancelled': return '#F44336';
    default: return '#9E9E9E';
  }
};

const getStatusBgColor = (status) => {
  switch(status) {
    case 'Order Confirmed': return '#E8F5E9';
    case 'Processing': return '#E3F2FD';
    case 'In Transit': return '#FFF3E0';
    case 'Delivered': return '#E8F5E9';
    case 'Cancelled': return '#FFEBEE';
    default: return '#F5F5F5';
  }
};

export default Dashboard;
```

---

## 📊 What This Component Shows

### Profile Header
- User's name and email
- Phone number
- Member since date

### Statistics Cards
- **Total Orders** - Count of all orders placed
- **Total Spent** - Sum of all order amounts
- **In Transit** - Orders currently being delivered
- **Delivered** - Successfully delivered orders

### Order History Table
- Order ID (last 6 digits)
- Order Date
- Order Amount (in ₹)
- Order Status (with color coding)
- Click to view full details

### Order Details Modal
- Order items with quantity
- Customization details
- Full shipping address
- Order summary (subtotal, delivery, total)
- Order status with timestamp
- Action buttons (download invoice, track order)

---

## 🎨 CSS Variables Used

Make sure your `src/index.css` defines:

```css
:root {
  --maroon: #D64541;
  --saffron: #FF9000;
  --gold: #D4AF37;
  --cream: #FFF8F0;
  --border: #E0E0E0;
}
```

---

## 🚀 Integration Steps

1. **Replace existing Dashboard.jsx with this code**
2. **Ensure authService has getProfileWithOrders method**
3. **Test in browser:**
   - Login
   - Place an order
   - Navigate to dashboard
   - Should see orders listed

---

## 🔧 Customization

### Change stats layout
```jsx
gridTemplateColumns: 'repeat(2, 1fr)' // 2 columns instead of 4
```

### Change order card layout
```jsx
gridTemplateColumns: '1fr 1fr auto' // Different columns
```

### Modify colors
```jsx
background: 'linear-gradient(135deg, var(--saffron) 0%, rgba(255,144,14,0.8) 100%)'
```

---

**Status:** ✅ Ready to Use
**Last Updated:** November 2024