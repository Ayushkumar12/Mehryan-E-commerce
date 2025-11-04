import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Customized Suits', 'Dry Fruits', 'Rajma', 'Kesar']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0
  },
  image: {
    type: String,
    default: '/products/default.jpg'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 100,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  // For customizable products (suits)
  customizable: {
    type: Boolean,
    default: false
  },
  fabricOptions: {
    type: [String],
    enum: ['Cotton', 'Silk', 'Linen', 'Wool'],
    default: []
  },
  embroideryOptions: {
    type: [String],
    enum: ['Traditional Kashmiri', 'Minimal', 'Heavy', 'None'],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Product', productSchema);