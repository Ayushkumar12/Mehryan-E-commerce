import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Mehryaan</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
            Bringing authentic Kashmiri craftsmanship directly to your home. Premium customized suits, dry fruits, and specialty products from the valleys of Kashmir.
          </p>
          <p style={{ fontSize: '13px', marginTop: '10px' }}>🌸 From the Valleys of Kashmir to Your Home</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/customization">Customize Suit</a></li>
            <li><a href="/admin">Admin Panel</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Categories</h3>
          <ul>
            <li><a href="/products">Customized Suits</a></li>
            <li><a href="/products">Dry Fruits</a></li>
            <li><a href="/products">Rajma</a></li>
            <li><a href="/products">Kesar (Saffron)</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Customer Support</h3>
          <ul>
            <li><a href="/">Contact Us</a></li>
            <li><a href="/">Track Order</a></li>
            <li><a href="/">Return Policy</a></li>
            <li><a href="/">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Mehryaan. All rights reserved. | Crafted with 💚 from Kashmir</p>
      </div>
    </footer>
  );
};

export default Footer;