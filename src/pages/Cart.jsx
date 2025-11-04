import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import orderService from '../services/orderService';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useUser();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize checkout data with user profile or empty
  const initializeCheckoutData = () => {
    if (user) {
      // Parse user name into first and last name
      const nameParts = (user.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      return {
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        state: user.state || '',
        paymentMethod: 'online'
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      pincode: '',
      state: '',
      paymentMethod: 'online'
    };
  };

  const [checkoutData, setCheckoutData] = useState(initializeCheckoutData());

  // Update checkout data when user profile changes
  useEffect(() => {
    setCheckoutData(initializeCheckoutData());
  }, [user]);

  const totalPrice = getTotalPrice();
  const deliveryCharge = totalPrice > 1000 ? 0 : 100;
  const finalTotal = totalPrice + deliveryCharge;

  const handleQuantityChange = (id, quantity) => {
    if (quantity > 0) {
      updateQuantity(id, quantity);
    }
  };

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!checkoutData.firstName || !checkoutData.email || !checkoutData.address) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order object
      const order = {
        items: items,
        shippingDetails: {
          firstName: checkoutData.firstName,
          lastName: checkoutData.lastName,
          email: checkoutData.email,
          phone: checkoutData.phone,
          address: checkoutData.address,
          city: checkoutData.city,
          state: checkoutData.state,
          pincode: checkoutData.pincode
        },
        paymentMethod: checkoutData.paymentMethod,
        orderSummary: {
          subtotal: totalPrice,
          deliveryCharges: deliveryCharge,
          total: finalTotal
        }
      };

      if (checkoutData.paymentMethod === 'online' || checkoutData.paymentMethod === 'upi') {
        const origin = window.location.origin;
        const session = await orderService.createStripeCheckoutSession({
          items,
          shippingDetails: order.shippingDetails,
          orderSummary: order.orderSummary,
          successUrl: `${origin}/dashboard`,
          cancelUrl: `${origin}/cart`,
          customerEmail: checkoutData.email,
          paymentMethod: checkoutData.paymentMethod
        });

        if (session.checkoutUrl) {
          window.location.href = session.checkoutUrl;
          return;
        }

        if (session.invoice?.summary?.total || session.orderId) {
          clearCart();
          const totalAmount = session.invoice?.summary?.total || order.orderSummary.total;
          alert(`✅ Order confirmed!\n\nOrder ID: ${session.orderId}\nInvoice Total: ₹${totalAmount}`);
          setShowCheckout(false);
          setCheckoutData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            pincode: '',
            state: '',
            paymentMethod: 'online'
          });
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          return;
        }

        alert('Unable to create Stripe checkout session. Please try again later.');
        return;
      }

      const response = await orderService.createOrder(order);

      clearCart();

      const orderId = response.order?._id;
      alert(`✅ Order placed successfully!\n\nOrder ID: ${orderId}\n\nYou will receive a confirmation email at ${checkoutData.email}`);

      // Reset checkout
      setShowCheckout(false);
      setCheckoutData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        state: '',
        paymentMethod: 'online'
      });

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`❌ Error placing order: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="container">
        {/* Page Title */}
        <section className="section" style={{ paddingBottom: 0 }}>
          <h1 style={{ color: 'var(--maroon)', marginBottom: '20px' }}>Shopping Cart</h1>
        </section>

        {/* Cart Content */}
        <section className="section" style={{ paddingTop: '20px' }}>
          {items.length === 0 ? (
            <div
              style={{
                background: 'white',
                padding: '60px 20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}
            >
              <h2 style={{ color: '#999', marginBottom: '20px' }}>Your cart is empty</h2>
              <p style={{ color: '#666', marginBottom: '30px' }}>
                Start shopping to add products to your cart
              </p>
              <Link to="/products" className="btn btn-primary">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start' }}>
              {/* Cart Items */}
              <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id || item._id}>
                        <td>
                          <strong>{item.name}</strong>
                          <br />
                          <small style={{ color: '#999' }}>{item.category}</small>
                        </td>
                        <td>₹{item.price}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item.id, parseInt(e.target.value))
                            }
                            style={{
                              width: '60px',
                              padding: '5px',
                              border: '1px solid var(--border)',
                              borderRadius: '4px'
                            }}
                          />
                        </td>
                        <td style={{ fontWeight: 'bold' }}>
                          ₹{item.price * item.quantity}
                        </td>
                        <td>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#dc3545',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div
                style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'sticky',
                  top: '100px'
                }}
              >
                <h3 style={{ color: 'var(--maroon)', marginBottom: '20px' }}>Order Summary</h3>

                <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Subtotal:</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Delivery:</span>
                    <span style={{ color: 'var(--saffron)' }}>
                      {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {totalPrice > 1000 && (
                    <small style={{ display: 'block', color: '#28a745', marginTop: '5px' }}>
                      ✅ Free delivery on orders above ₹1000
                    </small>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'var(--maroon)',
                    marginBottom: '20px'
                  }}
                >
                  <span>Total:</span>
                  <span>₹{finalTotal}</span>
                </div>

                {!showCheckout ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        alert('Please login to proceed with checkout');
                        navigate('/login');
                        return;
                      }
                      setShowCheckout(true);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', marginBottom: '10px' }}
                    disabled={!isAuthenticated}
                    title={!isAuthenticated ? 'Login required to checkout' : 'Proceed to checkout'}
                  >
                    {!isAuthenticated ? '🔒 Login to Checkout' : 'Proceed to Checkout'}
                  </button>
                ) : null}

                <button
                  onClick={() => {
                    clearCart();
                    setShowCheckout(false);
                  }}
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Checkout Form */}
        {showCheckout && items.length > 0 && (
          <section className="section" style={{ paddingTop: '40px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '8px' }}>
              <h2 style={{ color: 'var(--maroon)', marginBottom: '30px' }}>Shipping & Payment</h2>

              <form onSubmit={handlePlaceOrder}>
                {/* Name */}
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={checkoutData.firstName}
                      onChange={handleCheckoutChange}
                      required
                      placeholder="First name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={checkoutData.lastName}
                      onChange={handleCheckoutChange}
                      required
                      placeholder="Last name"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={checkoutData.email}
                      onChange={handleCheckoutChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={checkoutData.phone}
                      onChange={handleCheckoutChange}
                      required
                      placeholder="10-digit phone number"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={checkoutData.address}
                    onChange={handleCheckoutChange}
                    required
                    placeholder="Street address"
                  />
                </div>

                {/* City, State, Pincode */}
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={checkoutData.city}
                      onChange={handleCheckoutChange}
                      required
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={checkoutData.state}
                      onChange={handleCheckoutChange}
                      required
                      placeholder="State"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={checkoutData.pincode}
                      onChange={handleCheckoutChange}
                      required
                      placeholder="Postal code"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="form-group">
                  <label>Payment Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                    {['online', 'cod', 'upi'].map(method => (
                      <label key={method} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={checkoutData.paymentMethod === method}
                          onChange={handleCheckoutChange}
                          style={{ marginRight: '10px' }}
                        />
                        {method === 'online' && 'Online Payment (Card/Net Banking)'}
                        {method === 'cod' && 'Cash on Delivery'}
                        {method === 'upi' && 'UPI Payment'}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order Buttons */}
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowCheckout(false)}
                    disabled={isSubmitting}
                  >
                    Back to Cart
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                  >
                    {isSubmitting ? '⏳ Processing...' : `Place Order (₹${finalTotal})`}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Cart;