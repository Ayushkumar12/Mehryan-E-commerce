import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useUser } from '../context/UserContext';
import orderService from '../services/orderService';

const Admin = () => {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { user, logout } = useUser();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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
      if (activeTab !== 'orders') return;
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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/admin/login');
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
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
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Payment</th>
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
                            <strong>#{order._id}</strong>
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
            <div className="grid grid-3">
              <div
                style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  Total Products
                </h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--maroon)' }}>
                  {products.length}
                </p>
              </div>

              <div
                style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  Total Orders
                </h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--maroon)' }}>
                  {orders.length}
                </p>
              </div>

              <div
                style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  Total Revenue
                </h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--maroon)' }}>
                  ₹{orders.reduce((sum, order) => sum + order.total, 0)}
                </p>
              </div>
            </div>

            {/* Top Products */}
            <div style={{ marginTop: '40px' }}>
              <h2 style={{ color: 'var(--maroon)', marginBottom: '20px' }}>Top Products</h2>
              <div className="grid grid-2">
                {products.slice(0, 4).map(product => (
                  <div
                    key={product.id}
                    style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <h4 style={{ marginBottom: '10px' }}>{product.name}</h4>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                      {product.category}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--maroon)' }}>₹{product.price}</strong>
                      <span>⭐ {product.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Admin;