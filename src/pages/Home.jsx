import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';

const Home = () => {
  const { products } = useProducts();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const categories = [
    {
      id: 1,
      name: 'Customized Suits',
      description: 'Handcrafted with traditional Kashmiri embroidery',
      count: 'Coming Soon'
    },
    {
      id: 2,
      name: 'Dry Fruits',
      description: 'Premium quality from Kashmir valleys',
      count: 'In Stock'
    },
    {
      id: 3,
      name: 'Rajma',
      description: 'Finest red kidney beans',
      count: 'In Stock'
    },
    {
      id: 4,
      name: 'Kesar',
      description: 'Pure saffron threads',
      count: 'In Stock'
    }
  ];

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Mehryaan</h1>
          <p>From the Valleys of Kashmir to Your Home</p>
          <p style={{ fontSize: '16px', marginBottom: '30px' }}>
            Premium handcrafted products & customized suits with authentic Kashmiri heritage
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">
              Explore Products
            </Link>
            <Link to="/customization" className="btn btn-secondary">
              Design Your Suit
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section container">
        <h2 className="section-title">Featured Products</h2>
        <div className="grid grid-4">
          {featuredProducts.map(product => (
            <div key={product.id || product._id} className="product-card">
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '50px', marginBottom: '10px' }}>📦</div>
                    <div>{product.name}</div>
                  </div>
                )}
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-rating">
                  ⭐ {product.rating} | {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                </div>
                <div className="product-footer">
                  <span className="product-price">₹{product.price}</span>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section
        className="section"
        style={{
          background: 'linear-gradient(135deg, var(--maroon), #a00000)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <div className="container">
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Why Choose Mehryaan?</h2>
          <div className="grid grid-3">
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--gold)' }}>
                🏆 Authentic Quality
              </h3>
              <p>100% genuine products directly from Kashmiri artisans & producers</p>
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--gold)' }}>
                ✨ Customization
              </h3>
              <p>Personalize your suits with unique embroidery, colors & designs</p>
            </div>
            <div style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--gold)' }}>
                🚚 Fast Delivery
              </h3>
              <p>Quick shipping with real-time tracking across India</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section container">
        <div style={{ textAlign: 'center' }}>
          <h2 className="section-title">Ready to Experience Kashmiri Craftsmanship?</h2>
          <Link to="/customization" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: '16px' }}>
            Start Customizing Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;