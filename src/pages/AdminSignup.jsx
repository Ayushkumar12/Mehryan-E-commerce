import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/AdminAuth.css';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useUser();
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
      setSuccess('');
      // Validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'admin'
      };

      const response = await signup(signupData);
      setSuccess(`Account created successfully! Welcome, ${response.user.name}!`);
      
      // Navigate to admin after 1.5 seconds to show success message
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      // Log full error details for debugging
      console.error('Signup error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors
          .map(e => e.msg)
          .join(', ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || 'Signup failed. Please try again.');
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
            <h1>Create Admin Account</h1>
            <p>Set up your Mehryaan store management account</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@yourstore.com"
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
              <small style={{ color: '#666' }}>At least 6 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>Already have an account? <Link to="/admin/login">Login here</Link></p>
          </div>
        </div>

        {/* Branding Section */}
        <div className="auth-branding">
          <div className="branding-content">
            <h2>Join Mehryaan</h2>
            <p>Start Managing Your Premium Kashmiri Products</p>
            <div className="branding-features">
              <div className="feature">
                <span>🎯</span>
                <p>Easy Setup</p>
              </div>
              <div className="feature">
                <span>⚡</span>
                <p>Quick Start</p>
              </div>
              <div className="feature">
                <span>🔒</span>
                <p>Secure</p>
              </div>
              <div className="feature">
                <span>💼</span>
                <p>Professional</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;