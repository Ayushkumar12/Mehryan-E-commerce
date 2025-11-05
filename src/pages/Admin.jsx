import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useUser } from '../context/UserContext';
import orderService from '../services/orderService';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const STATUS_COLOR_PALETTE = ['#9b1c31', '#ffb347', '#5b8def', '#00bfa6', '#ef6cde'];
const CATEGORY_COLOR_PALETTE = ['#9b1c31', '#5b8def', '#ffc145', '#3cb4ac', '#ef6cde', '#7f5af0'];

const formatINR = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

const AdminOrderDetailModal = ({ order, onClose, onStatusChange }) => {
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 2000
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: 'white',
          borderRadius: '16px',
          width: 'min(900px, 96vw)',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 32px',
            borderBottom: '1px solid #eee',
            background: 'linear-gradient(135deg, rgba(128,0,32,0.08), rgba(128,0,32,0.18))'
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--maroon)' }}>
              Order #{order._id?.slice(-6)?.toUpperCase() || 'XXXXXX'}
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--maroon)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(128,0,32,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            aria-label="Close order details"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px 32px', overflowY: 'auto', maxHeight: 'calc(90vh - 96px)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 320px',
              gap: '24px'
            }}
          >
            <div>
              <h3 style={{ marginBottom: '16px', color: '#222', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📦 Ordered Items
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {order.items?.map((item, index) => {
                  const customizationEntries = item.customization
                    ? Object.entries(item.customization).filter(([, value]) => Boolean(value))
                    : [];

                  return (
                    <div
                      key={`${item._id || item.productId || index}-${index}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '110px 1fr',
                        gap: '16px',
                        background: '#f9f9f9',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #eee'
                      }}
                    >
                      <div
                        style={{
                          width: '110px',
                          height: '110px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '1px solid #e5e5e5',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              textAlign: 'center',
                              fontSize: '12px',
                              color: '#999',
                              padding: '12px'
                            }}
                          >
                            No Image
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <div>
                            <p style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600' }}>{item.name}</p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>SKU: {item.productId || 'N/A'}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontWeight: '600', color: 'var(--maroon)' }}>{formatINR(item.price)}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Qty: {item.quantity}</p>
                          </div>
                        </div>

                        {customizationEntries.length > 0 && (
                          <div style={{ marginTop: '12px', fontSize: '13px', color: '#444' }}>
                            <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>Customization Details:</p>
                            <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '4px' }}>
                              {customizationEntries.map(([key, value]) => (
                                <li key={key} style={{ textTransform: 'capitalize' }}>
                                  <strong>{key.replace(/([A-Z])/g, ' $1')}</strong>: {value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {item.customization?.referenceImage && (
                          <div style={{ marginTop: '12px' }}>
                            <p style={{ margin: '0 0 6px 0', fontWeight: '600', fontSize: '13px' }}>Customization Reference:</p>
                            <div
                              style={{
                                width: '100%',
                                maxWidth: '220px',
                                borderRadius: '10px',
                                border: '1px solid #ddd',
                                overflow: 'hidden',
                                background: '#fff'
                              }}
                            >
                              <img
                                src={item.customization.referenceImage}
                                alt={`${item.name} customization reference`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
              <div
                style={{
                  border: '1px solid #eee',
                  borderRadius: '12px',
                  padding: '20px',
                  background: 'white'
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', color: '#222' }}>Order Status</h3>
                <div style={{ marginBottom: '14px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      background: 'rgba(128,0,32,0.08)',
                      color: 'var(--maroon)',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    <span style={{ fontSize: '10px' }}>●</span>
                    {order.orderStatus || 'Order Confirmed'}
                  </span>
                </div>
                <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '6px' }}>Update status</label>
                <select
                  value={order.orderStatus || 'Order Confirmed'}
                  onChange={(event) => onStatusChange(order._id, event.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: 'white',
                    fontWeight: '500'
                  }}
                >
                  {['Order Confirmed', 'Processing', 'In Transit', 'Delivered', 'Cancelled'].map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
                <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#999' }}>
                  Last updated: {new Date(order.updatedAt || order.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              <div
                style={{
                  border: '1px solid #eee',
                  borderRadius: '12px',
                  padding: '20px',
                  background: 'white'
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', color: '#222' }}>Customer</h3>
                <p style={{ margin: '0 0 6px 0', fontWeight: '600', fontSize: '15px' }}>
                  {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
                </p>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#555' }}>
                  {order.shippingDetails?.email}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                  {order.shippingDetails?.phone}
                </p>
              </div>

              <div
                style={{
                  border: '1px solid #eee',
                  borderRadius: '12px',
                  padding: '20px',
                  background: 'white'
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', color: '#222' }}>Shipping Address</h3>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#555' }}>
                  {order.shippingDetails?.address}
                </p>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#555' }}>
                  {order.shippingDetails?.city}, {order.shippingDetails?.state} {order.shippingDetails?.pincode}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                  Landmark: {order.shippingDetails?.landmark || '—'}
                </p>
              </div>

              <div
                style={{
                  border: '1px solid #eee',
                  borderRadius: '12px',
                  padding: '20px',
                  background: 'white'
                }}
              >
                <h3 style={{ margin: '0 0 12px 0', color: '#222' }}>Payment Summary</h3>
                <div style={{ display: 'grid', gap: '6px', fontSize: '14px', color: '#444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal</span>
                    <span>{formatINR(order.orderSummary?.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery Charges</span>
                    <span>{formatINR(order.orderSummary?.deliveryCharges)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Discount</span>
                    <span>{formatINR(order.orderSummary?.discount || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginTop: '8px', color: 'var(--maroon)' }}>
                    <span>Total Paid</span>
                    <span>{formatINR(order.orderSummary?.total || order.total)}</span>
                  </div>
                </div>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#666' }}>
                  <span>Payment Method:</span>
                  <span style={{ fontWeight: '600' }}>{order.paymentMethod || order.shippingDetails?.paymentMethod || 'Online'}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { user, logout } = useUser();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    inStock: true,
    rating: 4.5
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (activeTab !== 'orders' && activeTab !== 'analytics') return;
      setOrdersLoading(true);
      setOrdersError('');
      try {
        const response = await orderService.getAllOrders();
        setOrders(response.orders || []);
      } catch (error) {
        setOrdersError(error.response?.data?.message || error.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab]);

  const categories = ['Customized Suits', 'Dry Fruits', 'Rajma', 'Kesar'];
  const orderStatusOptions = ['Order Confirmed', 'Processing', 'In Transit', 'Delivered', 'Cancelled'];

  const closeSelectedOrder = () => setSelectedOrder(null);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'price' || name === 'rating' ? parseFloat(value) : value
    }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingProduct) {
      // Update existing product
      updateProduct({
        ...formData,
        id: editingProduct.id
      });
      alert('Product updated successfully!');
    } else {
      // Add new product
      addProduct(formData);
      alert('Product added successfully!');
    }

    // Reset form
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      inStock: true,
      rating: 4.5
    });
    setIsFormVisible(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setFormData(product);
    setEditingProduct(product);
    setIsFormVisible(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      alert('Product deleted successfully!');
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await orderService.updateOrder(orderId, { orderStatus: status });
      const updatedOrder = response.order || null;
      setOrders(prev => prev.map(order => (order._id === orderId ? { ...order, ...(updatedOrder || {}), orderStatus: status } : order)));
      setSelectedOrder(prev => (prev && prev._id === orderId ? { ...prev, ...(updatedOrder || {}), orderStatus: status } : prev));
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      inStock: true,
      rating: 4.5
    });
    setEditingProduct(null);
    setIsFormVisible(false);
  };

  const getOrderStatusColor = (order) => {
    const createdDate = new Date(order.createdAt);
    const daysPassed = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));

    if (daysPassed < 1) return '#007bff';
    if (daysPassed < 3) return '#ffc107';
    if (daysPassed < 7) return '#17a2b8';
    return '#28a745';
  };

  const analyticsData = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        revenueSeries: [],
        categoryDistribution: [],
        statusSummary: [],
        topCustomers: []
      };
    }

    const revenueByDate = new Map();
    const statusCounts = new Map();
    const categoryCounts = new Map();
    const customerTotals = new Map();

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const dateKey = orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const totalAmount = order.orderSummary?.total || order.total || 0;

      revenueByDate.set(dateKey, (revenueByDate.get(dateKey) || 0) + totalAmount);
      statusCounts.set(order.orderStatus || 'Order Confirmed', (statusCounts.get(order.orderStatus || 'Order Confirmed') || 0) + 1);

      order.items?.forEach((item) => {
        const categoryKey = item.category || 'Uncategorized';
        categoryCounts.set(categoryKey, (categoryCounts.get(categoryKey) || 0) + item.quantity);
      });

      const customerKey = `${order.shippingDetails?.firstName || 'Guest'} ${order.shippingDetails?.lastName || ''}`.trim() || 'Guest';
      customerTotals.set(customerKey, (customerTotals.get(customerKey) || 0) + totalAmount);
    });

    const revenueSeries = Array.from(revenueByDate.entries()).map(([date, amount]) => ({
      date,
      revenue: Number(amount.toFixed(2))
    }));

    const categoryDistribution = Array.from(categoryCounts.entries())
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const statusSummary = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count
    }));

    const topCustomers = Array.from(customerTotals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const totalRevenue = revenueSeries.reduce((acc, point) => acc + point.revenue, 0);
    const totalOrders = orders.length;
    const totalCustomers = customerTotals.size;
    const totalItems = Array.from(categoryCounts.values()).reduce((acc, count) => acc + count, 0);

    return {
      revenueSeries,
      categoryDistribution,
      statusSummary,
      topCustomers,
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalItems,
      averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0
    };
  }, [orders]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const AnalyticsCard = ({ title, description, children }) => (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '26px 28px',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ margin: '0 0 6px 0', color: '#222', fontSize: '20px' }}>{title}</h3>
        {description && <p style={{ margin: 0, color: '#777', fontSize: '13px' }}>{description}</p>}
      </div>
      {children}
    </div>
  );

  const AnalyticsKpiCard = ({ title, value, subtitle, accentColor }) => (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 18px 40px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: accentColor,
          opacity: 0.9,
          zIndex: 0
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', fontWeight: 600 }}>{title}</p>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '28px', color: 'var(--maroon)' }}>{value}</h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="admin-page" style={{ position: 'relative' }}>
      <div className="container">
        {/* Order Detail Modal */}
        {selectedOrder && (
          <AdminOrderDetailModal order={selectedOrder} onClose={closeSelectedOrder} onStatusChange={handleOrderStatusChange} />
        )}

        {ordersLoading && activeTab === 'analytics' && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500
          }}>
            <div style={{
              background: 'white',
              padding: '40px 50px',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ margin: 0, color: 'var(--maroon)' }}>Loading analytics...</h3>
            </div>
          </div>
        )}

        {/* Admin Header */}
        <section className="section" style={{ paddingBottom: 0 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--maroon), #a00000)',
              color: 'white',
              padding: '30px',
              borderRadius: '8px',
              marginBottom: '30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h1 style={{ marginBottom: '10px' }}>Admin Dashboard</h1>
              <p>Manage products, orders, and inventory</p>
              {user && <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.9 }}>Welcome, <strong>{user.name}</strong></p>}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid white',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              🚪 Logout
            </button>
          </div>
        </section>

        {/* Tabs */}
        <section className="section" style={{ paddingBottom: '20px', paddingTop: 0 }}>
          <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid var(--border)' }}>
            {['products', 'orders', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '15px 20px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                  color: activeTab === tab ? 'var(--maroon)' : '#666',
                  borderBottom: activeTab === tab ? '3px solid var(--maroon)' : 'none',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'products' && '📦 Products'}
                {tab === 'orders' && '🛒 Orders'}
                {tab === 'analytics' && '📊 Analytics'}
              </button>
            ))}
          </div>
        </section>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <section className="section" style={{ paddingTop: 0 }}>
            {/* Add Product Button */}
            <div style={{ marginBottom: '20px' }}>
              {!isFormVisible && (
                <button
                  onClick={() => setIsFormVisible(true)}
                  className="btn btn-primary"
                >
                  ➕ Add New Product
                </button>
              )}
            </div>

            {/* Add/Edit Product Form */}
            {isFormVisible && (
              <div
                style={{
                  background: 'white',
                  padding: '30px',
                  borderRadius: '8px',
                  marginBottom: '30px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <h2 style={{ color: 'var(--maroon)', marginBottom: '20px' }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>

                <form onSubmit={handleAddProduct}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="Product name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleFormChange}
                        placeholder="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Rating</label>
                      <input
                        type="number"
                        name="rating"
                        value={formData.rating}
                        onChange={handleFormChange}
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="0-5"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Product description"
                      rows="4"
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="inStock"
                        checked={formData.inStock}
                        onChange={handleFormChange}
                        style={{ marginRight: '10px' }}
                      />
                      In Stock
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button type="submit" className="btn btn-primary">
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleCancelForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <strong>{product.name}</strong>
                      </td>
                      <td>{product.category}</td>
                      <td>₹{product.price}</td>
                      <td>⭐ {product.rating}</td>
                      <td>
                        <span
                          style={{
                            color: product.inStock ? '#28a745' : '#dc3545',
                            fontWeight: 'bold'
                          }}
                        >
                          {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleEditProduct(product)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--maroon)',
                            cursor: 'pointer',
                            marginRight: '10px',
                            fontWeight: 'bold'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <section className="section" style={{ paddingTop: 0 }}>
            {ordersLoading && (
              <div style={{ background: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--maroon)' }}>Loading orders...</h3>
              </div>
            )}

            {ordersError && !ordersLoading && (
              <div style={{ background: '#ffe6e6', padding: '20px', borderRadius: '8px', color: '#b30000', marginBottom: '20px' }}>
                {ordersError}
              </div>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 ? (
              <div style={{ background: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
                <h3 style={{ color: '#999' }}>No orders yet</h3>
              </div>
            ) : null}

            {!ordersLoading && !ordersError && orders.length > 0 && (
              <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Order ID</th>
                      <th style={{ width: '220px' }}>Customer</th>
                      <th style={{ width: '120px' }}>Items</th>
                      <th style={{ width: '120px' }}>Total</th>
                      <th style={{ width: '180px' }}>Status</th>
                      <th style={{ width: '120px' }}>Date</th>
                      <th style={{ width: '100px' }}>Payment</th>
                      <th style={{ width: '80px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const createdDate = new Date(order.createdAt);
                      const total = order.orderSummary?.total || order.total || 0;
                      const paymentMethod = order.paymentMethod || order.shippingDetails?.paymentMethod || 'online';

                      return (
                        <tr key={order._id}>
                          <td>
                            <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                          </td>
                          <td>
                            {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
                            <br />
                            <small style={{ color: '#999' }}>
                              {order.shippingDetails?.email}
                            </small>
                          </td>
                          <td>{order.items?.length || 0} item(s)</td>
                          <td>₹{total}</td>
                          <td>
                            <select
                              value={order.orderStatus || 'Order Confirmed'}
                              onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                              disabled={updatingOrderId === order._id}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                background: updatingOrderId === order._id ? '#f5f5f5' : 'white',
                                cursor: updatingOrderId === order._id ? 'wait' : 'pointer'
                              }}
                            >
                              {orderStatusOptions.map(statusOption => (
                                <option key={statusOption} value={statusOption}>
                                  {statusOption}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            {createdDate.toLocaleDateString('en-IN')}
                          </td>
                          <td>
                            {paymentMethod === 'Online' && '💳'}
                            {paymentMethod === 'COD' && '💵'}
                            {paymentMethod === 'UPI' && '📱'}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="btn btn-secondary"
                              style={{ padding: '8px 12px', fontSize: '12px' }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <section className="section" style={{ paddingTop: 0 }}>
            {ordersError && (
              <div style={{
                background: '#ffe6e6',
                padding: '20px',
                borderRadius: '8px',
                color: '#b30000',
                marginBottom: '20px'
              }}>
                {ordersError}
              </div>
            )}

            {!ordersLoading && orders.length === 0 ? (
              <div style={{
                background: 'white',
                padding: '50px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '2px dashed var(--border)',
                color: '#999'
              }}>
                <h3 style={{ marginBottom: '12px', color: 'var(--maroon)' }}>No analytics data available yet</h3>
                <p style={{ margin: 0 }}>Once orders start coming in, you'll see engagement and sales insights here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* KPI Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '20px'
                }}>
                  <AnalyticsKpiCard
                    title="Total Revenue"
                    value={formatINR(analyticsData.totalRevenue)}
                    subtitle="Lifetime revenue from all orders"
                    accentColor="rgba(155,28,49,0.1)"
                  />
                  <AnalyticsKpiCard
                    title="Total Orders"
                    value={analyticsData.totalOrders}
                    subtitle="Orders placed across all channels"
                    accentColor="rgba(91,141,239,0.1)"
                  />
                  <AnalyticsKpiCard
                    title="Average Order Value"
                    value={formatINR(analyticsData.averageOrderValue)}
                    subtitle="Revenue per order"
                    accentColor="rgba(0,191,166,0.1)"
                  />
                  <AnalyticsKpiCard
                    title="Customers"
                    value={analyticsData.totalCustomers}
                    subtitle="Unique customer accounts"
                    accentColor="rgba(239,108,222,0.1)"
                  />
                </div>

                {/* Revenue Trends */}
                <AnalyticsCard title="Revenue Trend" description="Track order volume and revenue over time">
                  <div style={{ width: '100%', height: 340 }}>
                    <ResponsiveContainer>
                      <AreaChart data={analyticsData.revenueSeries} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--maroon)" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="var(--maroon)" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value) => formatINR(value)}
                          contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                          labelStyle={{ color: 'var(--maroon)', fontWeight: 600 }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="var(--maroon)" strokeWidth={3} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </AnalyticsCard>

                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
                  {/* Status Breakdown */}
                  <AnalyticsCard title="Order Status Overview" description="Current distribution of order states">
                    <div style={{ width: '100%', height: 320 }}>
                      <ResponsiveContainer>
                        <BarChart data={analyticsData.statusSummary}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                          <XAxis dataKey="status" stroke="#888" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#888" allowDecimals={false} />
                          <Tooltip
                            cursor={{ fill: 'rgba(155,28,49,0.08)' }}
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {analyticsData.statusSummary.map((entry, index) => (
                              <Cell key={`status-${entry.status}`} fill={STATUS_COLOR_PALETTE[index % STATUS_COLOR_PALETTE.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </AnalyticsCard>

                  {/* Category Share */}
                  <AnalyticsCard title="Category Contribution" description="Items sold by category">
                    <div style={{ width: '100%', height: 320 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={analyticsData.categoryDistribution}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={110}
                            paddingAngle={4}
                          >
                            {analyticsData.categoryDistribution.map((entry, index) => (
                              <Cell key={`category-${entry.name}`} fill={CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length]} />
                            ))}
                          </Pie>
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                          <Tooltip
                            formatter={(value, name) => [`${value} items`, name]}
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </AnalyticsCard>
                </div>

                {/* Top Customers */}
                <AnalyticsCard title="Top Customers" description="Highest lifetime order value">
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {analyticsData.topCustomers.map((customer, index) => (
                      <div
                        key={customer.name || index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px 18px',
                          background: '#fff',
                          borderRadius: '12px',
                          border: '1px solid #eee',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            display: 'inline-flex',
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(155,28,49,0.12)',
                            color: 'var(--maroon)',
                            fontWeight: '700'
                          }}>
                            {index + 1}
                          </span>
                          <div>
                            <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#222' }}>{customer.name}</p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Lifetime orders value</p>
                          </div>
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--maroon)', fontSize: '16px' }}>
                          {formatINR(customer.total)}
                        </span>
                      </div>
                    ))}
                    {analyticsData.topCustomers.length === 0 && (
                      <p style={{ margin: 0, color: '#999' }}>No customer data available yet.</p>
                    )}
                  </div>
                </AnalyticsCard>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Admin;