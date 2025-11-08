import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Mehryaan</h3>
            <p className="footer-description">
              Bringing authentic Kashmiri craftsmanship directly to your home. Premium customized suits, dry fruits, and specialty products from the valleys of Kashmir.
            </p>
            <p className="footer-tagline">From the Valleys of Kashmir to Your Home</p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/customization">Customize Suit</Link></li>
              <li><Link to="/admin">Admin Panel</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Customer Support</h3>
            <ul>
              <li><Link to="/">Contact Us</Link></li>
              <li><Link to="/">Track Order</Link></li>
              <li><Link to="/">Return Policy</Link></li>
              <li><Link to="/">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Mehryaan. All rights reserved. | Crafted with 💚 from Kashmir</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;