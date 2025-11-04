import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';

const Products = () => {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, selectedCategory, sortBy, searchTerm]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      alert('Please login to add products to your cart');
      navigate('/login');
      return;
    }
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Title */}
        <section className="section" style={{ paddingBottom: 0 }}>
          <h1 style={{ color: 'var(--maroon)', marginBottom: '20px' }}>Our Products</h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
            Discover authentic Kashmiri products & customizable suits
          </p>
        </section>

        {/* Filters Section */}
        <section className="section" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* Search Bar */}
            <div className="form-group">
              <label>Search Products</label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="rating">Rating (High to Low)</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <p style={{ fontSize: '14px', color: '#666', marginTop: '15px' }}>
              Found <strong>{filteredAndSortedProducts.length}</strong> product(s)
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="section" style={{ paddingTop: 0 }}>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {filteredAndSortedProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ fontSize: '50px', marginBottom: '10px' }}>📦</div>
                        <div style={{ fontSize: '12px' }}>{product.name}</div>
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-rating">
                      ⭐ {product.rating} Rating
                      <br />
                      {product.inStock ? (
                        <span style={{ color: '#28a745' }}>✅ In Stock</span>
                      ) : (
                        <span style={{ color: '#dc3545' }}>❌ Out of Stock</span>
                      )}
                    </div>
                    <div className="product-footer">
                      <span className="product-price">₹{product.price}</span>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock || !isAuthenticated}
                        title={!isAuthenticated ? 'Login required to add to cart' : !product.inStock ? 'Out of stock' : 'Add to cart'}
                      >
                        {!isAuthenticated ? '🔒 Login to Add' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Products;