import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const Customization = () => {
  const { addToCart } = useCart();

  const [customization, setCustomization] = useState({
    suitType: 'salwar-kameez',
    fabric: 'cotton',
    embroidery: 'traditional',
    color: '#FF9933',
    size: 'M',
    specialInstructions: '',
    referenceImage: null
  });

  const [preview, setPreview] = useState(null);

  const fabricOptions = [
    { value: 'cotton', label: 'Pure Cotton' },
    { value: 'silk', label: 'Silk Blend' },
    { value: 'linen', label: 'Linen' },
    { value: 'wool', label: 'Wool' }
  ];

  const embroideryOptions = [
    { value: 'traditional', label: 'Traditional Kashmiri' },
    { value: 'minimal', label: 'Minimal Design' },
    { value: 'heavy', label: 'Heavy Embroidery' },
    { value: 'none', label: 'No Embroidery' }
  ];

  const colorOptions = [
    { value: '#FF9933', label: 'Saffron' },
    { value: '#800000', label: 'Maroon' },
    { value: '#FFD700', label: 'Gold' },
    { value: '#FFFFFF', label: 'Cream' },
    { value: '#2c3e50', label: 'Navy Blue' },
    { value: '#27ae60', label: 'Forest Green' }
  ];

  const sizeOptions = [
    { value: 'XS', label: 'Extra Small' },
    { value: 'S', label: 'Small' },
    { value: 'M', label: 'Medium' },
    { value: 'L', label: 'Large' },
    { value: 'XL', label: 'Extra Large' },
    { value: 'XXL', label: 'XXL' }
  ];

  const suitTypes = [
    { value: 'salwar-kameez', label: 'Salwar Kameez' },
    { value: 'lehenga', label: 'Lehenga' },
    { value: 'kurti', label: 'Kurti' },
    { value: 'anarkali', label: 'Anarkali Suit' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomization(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomization(prev => ({
          ...prev,
          referenceImage: reader.result
        }));
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatePrice = () => {
    let basePrice = 8500; // Base suit price
    const fabricMultiplier = { cotton: 1, silk: 1.5, linen: 1.2, wool: 1.3 };
    const embroideryMultiplier = { traditional: 1.3, minimal: 1.1, heavy: 1.5, none: 1 };

    return Math.round(
      basePrice *
      (fabricMultiplier[customization.fabric] || 1) *
      (embroideryMultiplier[customization.embroidery] || 1)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const customSuit = {
      id: Date.now(),
      name: `Custom ${customization.suitType} - ${customization.embroidery}`,
      category: 'Customized Suits',
      price: calculatePrice(),
      description: `
        Type: ${suitTypes.find(s => s.value === customization.suitType)?.label}
        Fabric: ${fabricOptions.find(f => f.value === customization.fabric)?.label}
        Embroidery: ${embroideryOptions.find(e => e.value === customization.embroidery)?.label}
        Size: ${customization.size}
      `,
      customizationDetails: customization,
      image: customization.referenceImage,
      inStock: true,
      rating: 4.8
    };

    addToCart(customSuit);
    alert(`Custom suit added to cart! Total: ₹${calculatePrice()}`);
    
    // Reset form
    setCustomization({
      suitType: 'salwar-kameez',
      fabric: 'cotton',
      embroidery: 'traditional',
      color: '#FF9933',
      size: 'M',
      specialInstructions: '',
      referenceImage: null
    });
    setPreview(null);
  };

  const finalPrice = calculatePrice();

  return (
    <div className="customization-page">
      <div className="container">
        {/* Page Title */}
        <section className="section" style={{ paddingBottom: 0 }}>
          <h1 style={{ color: 'var(--maroon)', marginBottom: '20px' }}>Design Your Custom Suit</h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
            Create a personalized suit with your choice of fabric, embroidery, color, and size
          </p>
        </section>

        {/* Form Section */}
        <section className="section" style={{ paddingTop: '20px' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleSubmit}>
              {/* Suit Type */}
              <div className="form-group">
                <label>Suit Type</label>
                <select name="suitType" value={customization.suitType} onChange={handleChange}>
                  {suitTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 1: Fabric & Embroidery */}
              <div className="form-row">
                <div className="form-group">
                  <label>Fabric Type</label>
                  <select name="fabric" value={customization.fabric} onChange={handleChange}>
                    {fabricOptions.map(fabric => (
                      <option key={fabric.value} value={fabric.value}>
                        {fabric.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Embroidery Style</label>
                  <select name="embroidery" value={customization.embroidery} onChange={handleChange}>
                    {embroideryOptions.map(emb => (
                      <option key={emb.value} value={emb.value}>
                        {emb.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Color & Size */}
              <div className="form-row">
                <div className="form-group">
                  <label>Color</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {colorOptions.map(color => (
                      <div key={color.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="radio"
                          id={color.value}
                          name="color"
                          value={color.value}
                          checked={customization.color === color.value}
                          onChange={handleChange}
                        />
                        <label htmlFor={color.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: color.value,
                              borderRadius: '4px',
                              border: '2px solid #ddd'
                            }}
                          />
                          {color.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Size</label>
                  <select name="size" value={customization.size} onChange={handleChange}>
                    {sizeOptions.map(size => (
                      <option key={size.value} value={size.value}>
                        {size.label} ({size.value})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reference Image Upload */}
              <div className="form-group">
                <label>Upload Reference Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <small style={{ display: 'block', color: '#666', marginTop: '8px' }}>
                  Upload a design or reference image you'd like to match
                </small>
              </div>

              {/* Image Preview */}
              {preview && (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Reference Image Preview:</p>
                  <img
                    src={preview}
                    alt="Reference"
                    style={{
                      maxWidth: '300px',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      border: '2px solid var(--border)'
                    }}
                  />
                </div>
              )}

              {/* Special Instructions */}
              <div className="form-group">
                <label>Special Instructions</label>
                <textarea
                  name="specialInstructions"
                  value={customization.specialInstructions}
                  onChange={handleChange}
                  placeholder="Any special requests or details for your custom suit..."
                  rows="5"
                />
              </div>

              {/* Price Breakdown */}
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--cream), var(--gold))',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '2px solid var(--saffron)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: 'var(--maroon)', marginBottom: '5px' }}>Price Breakdown</h3>
                    <small style={{ color: '#666' }}>
                      Base: ₹8,500 | Fabric: {fabricOptions.find(f => f.value === customization.fabric)?.label} | Embroidery: {embroideryOptions.find(e => e.value === customization.embroidery)?.label}
                    </small>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--maroon)' }}>
                    ₹{finalPrice}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add to Cart (₹{finalPrice})
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Info Section */}
        <section className="section" style={{ paddingTop: '40px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px' }}>
            <h2 style={{ color: 'var(--maroon)', marginBottom: '20px' }}>How It Works</h2>
            <div className="grid grid-3">
              <div>
                <h4 style={{ color: 'var(--saffron)', marginBottom: '10px' }}>1️⃣ Design</h4>
                <p>Choose your fabric, embroidery style, color, and size</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--saffron)', marginBottom: '10px' }}>2️⃣ Upload & Details</h4>
                <p>Upload reference images and add special instructions</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--saffron)', marginBottom: '10px' }}>3️⃣ Checkout</h4>
                <p>Add to cart, proceed to checkout, and we'll craft your suit</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Customization;