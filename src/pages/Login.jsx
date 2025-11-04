import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/cart';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location]);

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
      
      // Navigate back to cart or home after success
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/cart';
        navigate(from);
      }, 1000);
    } catch (err) {
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
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--saffron) 0%, rgba(214,69,65,0.1) 100%)' }}>
      <div className="container">
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {/* Login Form Section */}
          <div style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ color: 'var(--maroon)', marginBottom: '10px', fontSize: '28px' }}>Welcome Back!</h1>
              <p style={{ color: '#666', fontSize: '14px' }}>Login to your Mehryaan account</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  background: '#fee',
                  color: '#c33',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  border: '1px solid #fcc',
                  fontSize: '14px'
                }}>
                  ❌ {error}
                </div>
              )}
              {success && (
                <div style={{
                  background: '#efe',
                  color: '#3c3',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  border: '1px solid #cfc',
                  fontSize: '14px'
                }}>
                  ✅ {success}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳ Logging in...' : '🔓 Login'}
              </button>
            </form>

            <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                Don't have an account?{' '}
                <Link to="/signup" style={{ color: 'var(--saffron)', fontWeight: '600', textDecoration: 'none' }}>
                  Sign up here
                </Link>
              </p>
            </div>
          </div>

          {/* Branding Section */}
          <div style={{
            background: 'linear-gradient(135deg, var(--maroon) 0%, rgba(214,69,65,0.8) 100%)',
            color: 'white',
            padding: '60px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '15px' }}>Mehryaan</h2>
              <p style={{ fontSize: '16px', opacity: 0.9 }}>From the Valleys of Kashmir to Your Home</p>
            </div>

            <div style={{ display: 'grid', gap: '20px', marginTop: '40px', width: '100%' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>👔</div>
                <p style={{ fontWeight: '500', marginBottom: '5px' }}>Customized Suits</p>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>Personalized embroidery & fabrics</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🥜</div>
                <p style={{ fontWeight: '500', marginBottom: '5px' }}>Premium Dry Fruits</p>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>Authentic Kashmiri quality</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>✨</div>
                <p style={{ fontWeight: '500', marginBottom: '5px' }}>Specialty Products</p>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>Rajma, Kesar & more</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;