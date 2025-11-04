import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, isAuthenticated } = useUser();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/cart');
    }
  }, [isAuthenticated, navigate]);

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
        role: 'user'
      };

      const response = await signup(signupData);
      setSuccess(`Account created successfully! Welcome, ${response.user.name}!`);
      
      // Navigate to cart after success
      setTimeout(() => {
        navigate('/cart');
      }, 1500);
    } catch (err) {
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
    <div className="signup-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--gold) 0%, rgba(255,215,0,0.1) 100%)' }}>
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
          {/* Signup Form Section */}
          <div style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ color: 'var(--maroon)', marginBottom: '10px', fontSize: '28px' }}>Create Account</h1>
              <p style={{ color: '#666', fontSize: '14px' }}>Join Mehryaan to shop premium Kashmiri products</p>
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
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

              <div className="form-group" style={{ marginBottom: '20px' }}>
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
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>At least 6 characters</small>
              </div>

              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
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
                {loading ? '⏳ Creating Account...' : '✨ Create Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--maroon)', fontWeight: '600', textDecoration: 'none' }}>
                  Login here
                </Link>
              </p>
            </div>
          </div>

          {/* Branding Section */}
          <div style={{
            background: 'linear-gradient(135deg, var(--saffron) 0%, rgba(255,144,14,0.8) 100%)',
            color: 'white',
            padding: '60px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '15px' }}>Join Mehryaan</h2>
              <p style={{ fontSize: '16px', opacity: 0.9 }}>From the Valleys of Kashmir to Your Home</p>
            </div>

            <div style={{ display: 'grid', gap: '20px', marginTop: '40px', width: '100%' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>👔</div>
                <p style={{ fontWeight: '500', marginBottom: '5px' }}>Customized Suits</p>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>Design your own with personalized options</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🥜</div>
                <p style={{ fontWeight: '500', marginBottom: '5px' }}>Premium Dry Fruits</p>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>Authentic, fresh, and delicious</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎁</div>
                <p style={{ fontWeight: '500', marginBottom: '5px' }}>Specialty Products</p>
                <p style={{ fontSize: '12px', opacity: 0.8 }}>Unique Kashmiri specialties</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;