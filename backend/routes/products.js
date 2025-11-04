import express from 'express';
import { ObjectId } from 'mongodb';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    }

    const products = await req.db
      .collection('products')
      .find(query)
      .sort(sortOptions)
      .toArray();

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);
    const product = await req.db
      .collection('products')
      .findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/products
// @desc    Add product
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const product = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await req.db
      .collection('products')
      .insertOne(product);

    res.status(201).json({
      success: true,
      product: {
        _id: result.insertedId,
        ...product
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);
    
    const existingProduct = await req.db
      .collection('products')
      .findOne({ _id: productId });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date()
    };

    const result = await req.db
      .collection('products')
      .updateOne({ _id: productId }, { $set: updatedData });

    const updatedProduct = await req.db
      .collection('products')
      .findOne({ _id: productId });

    res.status(200).json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);
    
    const product = await req.db
      .collection('products')
      .findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await req.db
      .collection('products')
      .deleteOne({ _id: productId });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;