import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: String,
      price: Number,
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      customization: {
        fabric: String,
        embroidery: String,
        color: String,
        size: String,
        referenceImage: String,
        specialInstructions: String
      }
    }
  ],
  shippingDetails: {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  },
  orderSummary: {
    subtotal: {
      type: Number,
      required: true
    },
    deliveryCharges: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    enum: ['Online', 'COD', 'UPI'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Order Confirmed', 'Processing', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Order Confirmed'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Order', orderSchema);