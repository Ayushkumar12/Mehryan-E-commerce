import express from 'express';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { protect, authorize } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

const cloudinaryOrdersFolder = process.env.CLOUDINARY_ORDERS_FOLDER || 'orders';

const cloudinaryConfigured = Object.values(cloudinaryConfig).every(Boolean);

if (cloudinaryConfigured) {
  cloudinary.config(cloudinaryConfig);
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const uploadedImagesCache = new Map();

const isDataUriImage = (value) => typeof value === 'string' && /^data:image\/[a-zA-Z0-9+.-]+;base64,/.test(value);

const buildFolderPath = (suffix) => {
  const trimmedSuffix = suffix ? suffix.replace(/^\/+|\/+$|\s+/g, '') : '';
  return trimmedSuffix ? `${cloudinaryOrdersFolder}/${trimmedSuffix}` : cloudinaryOrdersFolder;
};

const uploadImageToCloudinary = async (dataUri, folderSuffix) => {
  if (!cloudinaryConfigured || !isDataUriImage(dataUri)) {
    return dataUri;
  }

  if (uploadedImagesCache.has(dataUri)) {
    return uploadedImagesCache.get(dataUri);
  }

  try {
    const folder = buildFolderPath(folderSuffix);
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'image'
    });

    const url = result.secure_url || result.url || dataUri;
    uploadedImagesCache.set(dataUri, url);
    return url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error.message);
    return dataUri;
  }
};

const processOrderItems = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return items;
  }

  const processedItems = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      processedItems.push(item);
      continue;
    }

    const updatedItem = { ...item };

    if (typeof updatedItem.image === 'string') {
      updatedItem.image = await uploadImageToCloudinary(updatedItem.image, 'items');
    }

    if (updatedItem.customization && typeof updatedItem.customization === 'object') {
      const customization = { ...updatedItem.customization };

      if (typeof customization.referenceImage === 'string') {
        customization.referenceImage = await uploadImageToCloudinary(customization.referenceImage, 'references');
      }

      updatedItem.customization = customization;
    }

    processedItems.push(updatedItem);
  }

  return processedItems;
};

const createStripeInvoice = async ({ userId, orderId, items = [], shippingDetails = {}, orderSummary = {}, customerEmail }) => {
  if (!stripe) return null;
  const email = shippingDetails.email || customerEmail;
  const customerName = shippingDetails.fullName || [shippingDetails.firstName, shippingDetails.lastName].filter(Boolean).join(' ').trim() || undefined;
  try {
    const customer = await stripe.customers.create({
      email: email || undefined,
      name: customerName,
      metadata: {
        userId: userId ? userId.toString() : '',
        orderId: orderId ? orderId.toString() : ''
      }
    });

    const invoiceItemPromises = [];

    for (const item of items) {
      const unitAmount = Math.round(Number(item.price || 0) * 100);
      const quantity = Number(item.quantity) || 1;
      if (!Number.isFinite(unitAmount) || unitAmount <= 0 || !Number.isFinite(quantity) || quantity <= 0) continue;
      invoiceItemPromises.push(
        stripe.invoiceItems.create({
          customer: customer.id,
          currency: 'inr',
          unit_amount: unitAmount,
          quantity,
          description: item.name || 'Product',
          metadata: {
            orderId: orderId ? orderId.toString() : '',
            itemId: item._id ? item._id.toString() : item.id || ''
          }
        })
      );
    }

    const deliveryAmount = Math.round(Number(orderSummary.deliveryCharges || 0) * 100);
    if (Number.isFinite(deliveryAmount) && deliveryAmount > 0) {
      invoiceItemPromises.push(
        stripe.invoiceItems.create({
          customer: customer.id,
          currency: 'inr',
          unit_amount: deliveryAmount,
          quantity: 1,
          description: 'Delivery Charges',
          metadata: {
            orderId: orderId ? orderId.toString() : ''
          }
        })
      );
    }

    if (invoiceItemPromises.length === 0) {
      const fallbackAmount = Math.round(Number(orderSummary.total || 0) * 100);
      if (!Number.isFinite(fallbackAmount) || fallbackAmount <= 0) {
        return null;
      }
      invoiceItemPromises.push(
        stripe.invoiceItems.create({
          customer: customer.id,
          currency: 'inr',
          unit_amount: fallbackAmount,
          quantity: 1,
          description: 'Order Total',
          metadata: {
            orderId: orderId ? orderId.toString() : ''
          }
        })
      );
    }

    await Promise.all(invoiceItemPromises);

    const invoicePayload = {
      customer: customer.id,
      collection_method: 'send_invoice',
      metadata: {
        orderId: orderId ? orderId.toString() : '',
        userId: userId ? userId.toString() : ''
      }
    };

    const invoice = await stripe.invoices.create(invoicePayload);
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    try {
      await stripe.invoices.sendInvoice(finalizedInvoice.id);
    } catch (sendError) {
      console.error('Stripe invoice send failed:', sendError.message);
    }

    return finalizedInvoice;
  } catch (error) {
    console.error('Stripe invoice creation failed:', error.message);
    return null;
  }
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const roundToTwo = (value) => Math.round(toNumber(value) * 100) / 100;

const normalizeShippingDetails = (details = {}) => {
  const firstName = details.firstName || '';
  const lastName = details.lastName || '';
  const fallbackName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const fullName = details.fullName || details.name || fallbackName;
  return {
    ...details,
    firstName,
    lastName,
    fullName: fullName || ''
  };
};

const buildInvoiceData = (orderDoc, orderId) => {
  const shipping = normalizeShippingDetails(orderDoc.shippingDetails || {});
  const items = (orderDoc.items || []).map((item) => {
    const quantity = Number(item.quantity) || 1;
    const unitPrice = roundToTwo(item.price);
    const totalPrice = roundToTwo(unitPrice * quantity);
    return {
      name: item.name || 'Product',
      quantity,
      unitPrice,
      totalPrice
    };
  });

  const subtotal = roundToTwo(items.reduce((sum, item) => sum + item.totalPrice, 0));
  const deliveryCharges = roundToTwo(orderDoc.orderSummary?.deliveryCharges);
  const total = roundToTwo(orderDoc.orderSummary?.total || subtotal + deliveryCharges);
  const issueDate = new Date();
  const idSegment = orderId ? orderId.toString().slice(-6).toUpperCase() : `${issueDate.getTime()}`;
  const invoiceNumber = `INV-${issueDate.getFullYear()}${String(issueDate.getMonth() + 1).padStart(2, '0')}${String(issueDate.getDate()).padStart(2, '0')}-${idSegment}`;
  const billingName = shipping.fullName || [shipping.firstName, shipping.lastName].filter(Boolean).join(' ').trim();
  const invoiceUrl = orderDoc.invoiceUrl || orderDoc.invoice?.url || '';

  return {
    invoiceNumber,
    issueDate,
    billingDetails: {
      name: billingName,
      email: shipping.email || '',
      phone: shipping.phone || '',
      address: shipping.address || '',
      city: shipping.city || '',
      state: shipping.state || '',
      pincode: shipping.pincode || ''
    },
    payment: {
      method: orderDoc.paymentMethod,
      status: orderDoc.paymentStatus
    },
    items,
    summary: {
      subtotal,
      deliveryCharges,
      total
    },
    access: {
      customer: true,
      admin: true
    },
    url: invoiceUrl
  };
};

// ============ IMPORTANT: Specific routes MUST come BEFORE generic parameter routes ============

router.post('/stripe-checkout', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe not configured'
      });
    }

    const { items: incomingItems, shippingDetails, orderSummary, successUrl, cancelUrl, customerEmail, paymentMethod } = req.body;

    if (!Array.isArray(incomingItems) || incomingItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required'
      });
    }

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        message: 'successUrl and cancelUrl are required'
      });
    }

    const items = await processOrderItems(incomingItems);

    const requestedPaymentMethod = typeof paymentMethod === 'string' ? paymentMethod.toLowerCase() : 'online';
    let paymentMethodTypes = ['card'];
    let paymentLabel = 'Online';

    if (requestedPaymentMethod === 'upi') {
      paymentMethodTypes = null;
      paymentLabel = 'UPI';
    }

    const lineItems = [];
    let subtotal = 0;

    for (const item of items) {
      const price = Number(item.price);
      const quantity = Number(item.quantity) || 1;

      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must include a valid price'
        });
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must include a valid quantity'
        });
      }

      subtotal += price * quantity;

      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name || 'Product',
            metadata: {
              itemId: item._id || item.id || ''
            }
          },
          unit_amount: Math.round(price * 100)
        },
        quantity
      });
    }

    const deliveryChargeValue = Number(orderSummary?.deliveryCharges ?? 0);
    const deliveryCharges = Number.isFinite(deliveryChargeValue) && deliveryChargeValue > 0 ? deliveryChargeValue : 0;

    if (deliveryCharges > 0) {
      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Delivery Charges'
          },
          unit_amount: Math.round(deliveryCharges * 100)
        },
        quantity: 1
      });
    }

    const sessionPayload = {
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: req.user.id,
        paymentMethod: paymentLabel
      }
    };

    if (paymentMethodTypes) {
      sessionPayload.payment_method_types = paymentMethodTypes;
    }

    if (customerEmail) {
      sessionPayload.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);

    const userId = new ObjectId(req.user.id);
    const paymentDetails = {
      provider: 'Stripe',
      sessionId: session.id,
      method: paymentLabel
    };

    if (typeof session.payment_intent === 'string') {
      paymentDetails.paymentIntentId = session.payment_intent;
    }

    if (typeof session.payment_method_types !== 'undefined') {
      paymentDetails.availableMethods = session.payment_method_types;
    }

    const invoiceData = buildInvoiceData(
      {
        userId,
        items,
        shippingDetails,
        orderSummary: {
          subtotal: Math.round(subtotal * 100) / 100,
          deliveryCharges: Math.round(deliveryCharges * 100) / 100,
          total: Math.round((subtotal + deliveryCharges) * 100) / 100
        },
        paymentMethod: paymentLabel,
        paymentStatus: 'Pending'
      }
    );

    const orderRecord = {
      userId,
      items,
      shippingDetails,
      orderSummary: {
        subtotal: invoiceData.summary.subtotal,
        deliveryCharges: invoiceData.summary.deliveryCharges,
        total: invoiceData.summary.total
      },
      paymentMethod: paymentLabel,
      paymentStatus: 'Pending',
      orderStatus: 'Order Confirmed',
      notes: '',
      paymentDetails,
      requestedPaymentMethod,
      invoice: {
        ...invoiceData,
        generatedAt: new Date(),
        url: session.url
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await req.db
      .collection('orders')
      .insertOne(orderRecord);

    await req.db
      .collection('users')
      .updateOne(
        { _id: userId },
        {
          $push: {
            orders: result.insertedId
          },
          $set: {
            updatedAt: new Date()
          }
        }
      );

    await stripe.checkout.sessions.update(session.id, {
      metadata: {
        userId: req.user.id,
        orderId: result.insertedId.toString(),
        paymentMethod: paymentLabel
      }
    });

    const stripeInvoice = await createStripeInvoice({
      userId,
      orderId: result.insertedId,
      items,
      shippingDetails,
      orderSummary: orderRecord.orderSummary,
      customerEmail
    });

    if (stripeInvoice) {
      orderRecord.invoice.url = stripeInvoice.hosted_invoice_url || orderRecord.invoice.url;
      orderRecord.invoice.stripeId = stripeInvoice.id;
      orderRecord.invoice.pdfUrl = stripeInvoice.invoice_pdf || orderRecord.invoice.pdfUrl || '';
      await req.db
        .collection('orders')
        .updateOne(
          { _id: result.insertedId },
          {
            $set: {
              invoice: orderRecord.invoice,
              stripeInvoice: {
                id: stripeInvoice.id,
                number: stripeInvoice.number,
                status: stripeInvoice.status,
                hostedUrl: stripeInvoice.hosted_invoice_url,
                pdf: stripeInvoice.invoice_pdf
              },
              updatedAt: new Date()
            }
          }
        );
    }

    res.status(200).json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
      orderId: result.insertedId,
      invoice: orderRecord.invoice,
      invoiceUrl: orderRecord.invoice.url,
      stripeInvoiceId: orderRecord.invoice.stripeId,
      paymentMethod: paymentLabel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/orders
// @desc    Create order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items: incomingItems, shippingDetails, orderSummary, paymentMethod } = req.body;
    const userId = new ObjectId(req.user.id);

    const items = await processOrderItems(incomingItems);

    const methodValue = typeof paymentMethod === 'string' ? paymentMethod.toLowerCase() : '';
    const normalizedPaymentMethod = methodValue === 'cod' ? 'COD' : methodValue === 'upi' ? 'UPI' : 'Online';
    const paymentStatusValue = req.body.paymentStatus || (normalizedPaymentMethod === 'COD' ? 'Pending' : 'Pending');

    const invoiceData = buildInvoiceData(
      {
        userId,
        items,
        shippingDetails,
        orderSummary,
        paymentMethod: normalizedPaymentMethod,
        paymentStatus: paymentStatusValue,
        invoiceUrl: req.body.invoiceUrl
      }
    );

    const order = {
      userId,
      items,
      shippingDetails,
      orderSummary: {
        subtotal: invoiceData.summary.subtotal,
        deliveryCharges: invoiceData.summary.deliveryCharges,
        total: invoiceData.summary.total
      },
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: paymentStatusValue,
      orderStatus: 'Order Confirmed',
      notes: '',
      invoice: {
        ...invoiceData,
        generatedAt: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (req.body.paymentDetails && typeof req.body.paymentDetails === 'object') {
      order.paymentDetails = req.body.paymentDetails;
    }

    const result = await req.db
      .collection('orders')
      .insertOne(order);

    await req.db
      .collection('users')
      .updateOne(
        { _id: userId },
        {
          $push: {
            orders: result.insertedId
          },
          $set: {
            updatedAt: new Date()
          }
        }
      );

    const stripeInvoice = await createStripeInvoice({
      userId,
      orderId: result.insertedId,
      items,
      shippingDetails,
      orderSummary: order.orderSummary
    });

    if (stripeInvoice) {
      order.invoice.url = stripeInvoice.hosted_invoice_url || order.invoice.url;
      order.invoice.stripeId = stripeInvoice.id;
      order.invoice.pdfUrl = stripeInvoice.invoice_pdf || order.invoice.pdfUrl || '';
      await req.db
        .collection('orders')
        .updateOne(
          { _id: result.insertedId },
          {
            $set: {
              invoice: order.invoice,
              stripeInvoice: {
                id: stripeInvoice.id,
                number: stripeInvoice.number,
                status: stripeInvoice.status,
                hostedUrl: stripeInvoice.hosted_invoice_url,
                pdf: stripeInvoice.invoice_pdf
              },
              updatedAt: new Date()
            }
          }
        );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully and saved to your profile',
      order: {
        _id: result.insertedId,
        ...order
      },
      invoiceUrl: order.invoice.url,
      stripeInvoiceId: order.invoice.stripeId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/statistics/dashboard
// @desc    Get order statistics (Admin)
// @access  Private/Admin
router.get('/statistics/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await req.db
      .collection('orders')
      .find({})
      .toArray();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.orderSummary?.total || 0), 0);

    const statusBreakdown = {
      confirmed: orders.filter(o => o.orderStatus === 'Order Confirmed').length,
      processing: orders.filter(o => o.orderStatus === 'Processing').length,
      inTransit: orders.filter(o => o.orderStatus === 'In Transit').length,
      delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
      cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length
    };

    const paymentBreakdown = {
      pending: orders.filter(o => o.paymentStatus === 'Pending').length,
      completed: orders.filter(o => o.paymentStatus === 'Completed').length,
      failed: orders.filter(o => o.paymentStatus === 'Failed').length
    };

    const paymentMethodBreakdown = {
      online: orders.filter(o => o.paymentMethod === 'Online').length,
      cod: orders.filter(o => o.paymentMethod === 'COD').length,
      upi: orders.filter(o => o.paymentMethod === 'UPI').length
    };

    res.status(200).json({
      success: true,
      statistics: {
        totalOrders,
        totalRevenue,
        averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
        statusBreakdown,
        paymentBreakdown,
        paymentMethodBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/filter/date
// @desc    Get orders filtered by date range (Admin)
// @access  Private/Admin
router.get('/filter/date', protect, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startDate and endDate (YYYY-MM-DD format)'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const orders = await req.db
      .collection('orders')
      .find({
        createdAt: {
          $gte: start,
          $lte: end
        }
      })
      .sort({ createdAt: -1 })
      .toArray();

    const totalRevenue = orders.reduce((sum, order) => sum + (order.orderSummary?.total || 0), 0);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalRevenue,
      dateRange: {
        from: startDate,
        to: endDate
      },
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/search/customer
// @desc    Search orders by customer name (Admin)
// @access  Private/Admin
router.get('/search/customer', protect, authorize('admin'), async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const orders = await req.db
      .collection('orders')
      .find({
        $or: [
          { 'shippingDetails.fullName': { $regex: query, $options: 'i' } },
          { 'shippingDetails.email': { $regex: query, $options: 'i' } },
          { 'shippingDetails.phone': { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: orders.length,
      searchQuery: query,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/orders/bulk/status
// @desc    Update status for multiple orders (Admin)
// @access  Private/Admin
router.put('/bulk/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { orderIds, orderStatus, paymentStatus } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of orderIds'
      });
    }

    if (!orderStatus && !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Please provide orderStatus or paymentStatus to update'
      });
    }

    const objectIds = orderIds.map(id => new ObjectId(id));
    const updateData = { updatedAt: new Date() };

    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const result = await req.db
      .collection('orders')
      .updateMany(
        { _id: { $in: objectIds } },
        { $set: updateData }
      );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} orders updated successfully`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/user
// @desc    Get user orders
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const userId = new ObjectId(req.user.id);
    const orders = await req.db
      .collection('orders')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private (User/Admin)
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const orderId = new ObjectId(req.params.id);

    const order = await req.db
      .collection('orders')
      .findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}`
      });
    }

    const updateData = {
      orderStatus: 'Cancelled',
      paymentStatus: order.paymentMethod === 'COD' ? 'Pending' : 'Refund Pending',
      updatedAt: new Date()
    };

    await req.db
      .collection('orders')
      .updateOne({ _id: orderId }, { $set: updateData });

    const cancelledOrder = await req.db
      .collection('orders')
      .findOne({ _id: orderId });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: cancelledOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ Generic parameter routes (AFTER specific routes) ============

// @route   GET /api/orders
// @desc    Get all orders (Admin)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await req.db
      .collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const orderId = new ObjectId(req.params.id);
    const order = await req.db
      .collection('orders')
      .findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order status (Admin)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const orderId = new ObjectId(req.params.id);

    const order = await req.db
      .collection('orders')
      .findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updateData = { updatedAt: new Date() };

    if (req.body.orderStatus) {
      updateData.orderStatus = req.body.orderStatus;
    }

    if (req.body.paymentStatus) {
      updateData.paymentStatus = req.body.paymentStatus;
    }

    if (req.body.notes) {
      updateData.notes = req.body.notes;
    }

    await req.db
      .collection('orders')
      .updateOne({ _id: orderId }, { $set: updateData });

    const updatedOrder = await req.db
      .collection('orders')
      .findOne({ _id: orderId });

    res.status(200).json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete order (Admin)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const orderId = new ObjectId(req.params.id);

    const order = await req.db
      .collection('orders')
      .findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await req.db
      .collection('orders')
      .deleteOne({ _id: orderId });

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
