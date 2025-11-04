import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import logo from '../assets/logo.png';

const Header = () => {
  const { getTotalItems } = useCart();
  const { isAuthenticated, user, logout } = useUser();

  return (
    <header className="header">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="logo">
          <Link to="/"><img src={logo} className='logo' alt="logo" /> Mehryaan</Link>
        </div>
        
        <nav className="navigation">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/customization">Customize</Link>
          <Link to="/cart">
            🛒 Cart {getTotalItems() > 0 && <span className="cart-count">{getTotalItems()}</span>}
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">👤 Dashboard</Link>
              <span className="user-info" title={user?.email}>{user?.name}</span>
              <button 
                onClick={logout} 
                className="logout-btn"
                style={{
                  background: 'transparent',
                  border: '2px solid var(--saffron)',
                  color: 'var(--saffron)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--maroon)', fontWeight: '600' }}>🔓 Login</Link>
              <Link to="/signup" style={{ background: 'var(--saffron)', padding: '8px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: '600' }}>✨ Sign Up</Link>
            </>
          )}
          <Link to="/admin/login" style={{ background: 'var(--saffron)', padding: '8px 12px', borderRadius: '4px', textDecoration: 'none' }}>
            ⚙️ Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;