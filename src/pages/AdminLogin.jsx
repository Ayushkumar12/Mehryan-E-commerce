import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/AdminAuth.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const response = await login(formData.email, formData.password);
      setSuccess(`Welcome back, ${response.user.name}!`);
      
      // Navigate to admin after 1.5 seconds to show success message
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      // Log full error details for debugging
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors
          .map(e => e.msg)
          .join(', ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <h1>Admin Panel</h1>
            <p>Login to manage your Mehryaan store</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@mehryaan.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/admin/signup">Create one</Link></p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '15px' }}>
              <strong>Test Credentials:</strong><br />
              Email: admin@mehryaan.com<br />
              Password: admin123
            </p>
          </div>
        </div>

        {/* Branding Section */}
        <div className="auth-branding">
          <div className="branding-content">
            <h2>Mehryaan Admin</h2>
            <p>Manage your Premium Kashmiri Products</p>
            <div className="branding-features">
              <div className="feature">
                <span>📦</span>
                <p>Product Management</p>
              </div>
              <div className="feature">
                <span>🛒</span>
                <p>Order Management</p>
              </div>
              <div className="feature">
                <span>📊</span>
                <p>Analytics</p>
              </div>
              <div className="feature">
                <span>🏪</span>
                <p>Inventory Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;