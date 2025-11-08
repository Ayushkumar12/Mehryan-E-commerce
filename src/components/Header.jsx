import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import logo from '../assets/logo.png';

const Header = () => {
  const { getTotalItems } = useCart();
  const { isAuthenticated, user, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  const handleNavLinkClick = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const navigationLinks = (
    <>
      <Link to="/" onClick={handleNavLinkClick}>Home</Link>
      <Link to="/products" onClick={handleNavLinkClick}>Products</Link>
      <Link to="/customization" onClick={handleNavLinkClick}>Customize</Link>
      <Link to="/cart" onClick={handleNavLinkClick}>
        🛒 Cart {getTotalItems() > 0 && <span className="cart-count">{getTotalItems()}</span>}
      </Link>
      {isAuthenticated && (
        <>
          <Link to="/dashboard" onClick={handleNavLinkClick}>👤 Dashboard</Link>
          <Link to="/profile" onClick={handleNavLinkClick}>🧾 Profile</Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin/login"
              onClick={handleNavLinkClick}
              style={{ background: 'var(--saffron)', padding: '8px 5px', borderRadius: '4px', textDecoration: 'none' }}
            >
              ⚙️ Admin
            </Link>
          )}
        </>
      )}
    </>
  );

  const authActionsContent = isAuthenticated ? (
    <>
      <button
        onClick={handleLogout}
        className="logout-btn"
        style={{
          background: 'transparent',
          border: '2px solid var(--saffron)',
          color: 'var(--saffron)',
          padding: '6px 5px',
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
      <Link to="/login" onClick={handleNavLinkClick} style={{ color: 'var(--maroon)', fontWeight: '600' }}>🔓 Login</Link>
      <Link to="/signup" onClick={handleNavLinkClick} style={{ background: 'var(--saffron)', padding: '8px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: '600' }}>✨ Sign Up</Link>
    </>
  );

  return (
    <header className="header">
      <div className="container header-bar">
        <div className="logo">
          <Link to="/" onClick={handleNavLinkClick}>
            <img src={logo} className="logo" alt="logo" /> Mehryaan
          </Link>
        </div>
        <button
          type="button"
          className={`nav-toggle${menuOpen ? ' open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <nav className="navigation-desktop" aria-label="Primary navigation">
          <div className="navigation-links">
            {navigationLinks}
          </div>
        </nav>
        <nav className={`navigation-mobile${menuOpen ? ' open' : ''}`} aria-label="Mobile navigation">
          <div className="navigation-links">
            {navigationLinks}
          </div>
          <div className="auth-actions-mobile">
            {authActionsContent}
          </div>
        </nav>
        <div className="auth-actions">
          {authActionsContent}
        </div>
      </div>
    </header>
  );
};

export default Header;
