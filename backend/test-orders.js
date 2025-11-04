import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
const TEST_USER = {
  email: 'user@mehryaan.com',
  password: 'user123'
};

const TEST_ADMIN = {
  email: 'admin@mehryaan.com',
  password: 'admin123'
};

let userToken = null;
let adminToken = null;
let testOrderId = null;
let testOrderId2 = null;
let testUserId = null;
let testProductId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n${colors.blue}${msg}${colors.reset}\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`)
};

// ============= HELPER FUNCTIONS =============

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      withCredentials: true
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      data: error.response?.data || { message: error.message },
      status: error.response?.status || 500
    };
  }
};

// ============= LOGIN TESTS =============

const loginUser = async () => {
  log.section('1️⃣  USER LOGIN');
  
  const res = await makeRequest('POST', '/auth/login', TEST_USER);
  
  if (res.success && res.status === 200) {
    userToken = res.data.token;
    testUserId = res.data.user.id;
    log.success(`User logged in: ${res.data.user.email}`);
    log.info(`Token: ${userToken.substring(0, 20)}...`);
    return true;
  } else {
    log.error(`Login failed: ${res.data.message}`);
    return false;
  }
};

const loginAdmin = async () => {
  log.section('2️⃣  ADMIN LOGIN');
  
  const res = await makeRequest('POST', '/auth/login', TEST_ADMIN);
  
  if (res.success && res.status === 200) {
    adminToken = res.data.token;
    log.success(`Admin logged in: ${res.data.user.email}`);
    log.info(`Token: ${adminToken.substring(0, 20)}...`);
    return true;
  } else {
    log.error(`Admin login failed: ${res.data.message}`);
    return false;
  }
};

// ============= ORDER CREATION TESTS =============

const createOrder = async () => {
  log.section('3️⃣  CREATE ORDER');
  
  const orderData = {
    items: [
      {
        productId: '507f1f77bcf86cd799439011',
        name: 'Premium Embroidered Suit',
        price: 5999,
        quantity: 1,
        customization: {
          fabric: 'Cotton',
          embroidery: 'Gold',
          color: 'Maroon',
          size: 'XL',
          specialInstructions: 'Rush delivery'
        }
      }
    ],
    shippingDetails: {
      fullName: 'Ayush Kumar',
      email: 'user@mehryaan.com',
      phone: '9876543210',
      address: '123 Main St, Apartment 4B',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001'
    },
    orderSummary: {
      subtotal: 5999,
      deliveryCharges: 0,
      total: 5999
    },
    paymentMethod: 'Online'
  };

  const res = await makeRequest('POST', '/orders', orderData, userToken);
  
  if (res.success && res.status === 201) {
    testOrderId = res.data.order._id;
    log.success(`Order created successfully`);
    log.info(`Order ID: ${testOrderId}`);
    log.info(`Status: ${res.data.order.orderStatus}`);
    log.info(`Total: ₹${res.data.order.orderSummary.total}`);
    return true;
  } else {
    log.error(`Order creation failed: ${res.data.message}`);
    return false;
  }
};

const createSecondOrder = async () => {
  log.section('4️⃣  CREATE SECOND ORDER');
  
  const orderData = {
    items: [
      {
        productId: '507f1f77bcf86cd799439012',
        name: 'Premium Dry Fruits',
        price: 2999,
        quantity: 2,
        customization: {}
      }
    ],
    shippingDetails: {
      fullName: 'Ayush Kumar',
      email: 'user@mehryaan.com',
      phone: '9876543210',
      address: '123 Main St, Apartment 4B',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001'
    },
    orderSummary: {
      subtotal: 5998,
      deliveryCharges: 100,
      total: 6098
    },
    paymentMethod: 'COD'
  };

  const res = await makeRequest('POST', '/orders', orderData, userToken);
  
  if (res.success && res.status === 201) {
    testOrderId2 = res.data.order._id;
    log.success(`Second order created`);
    log.info(`Order ID: ${testOrderId2}`);
    return true;
  } else {
    log.error(`Second order creation failed: ${res.data.message}`);
    return false;
  }
};

// ============= ORDER RETRIEVAL TESTS =============

const getUserOrders = async () => {
  log.section('5️⃣  GET USER ORDERS');
  
  const res = await makeRequest('GET', '/orders/user', null, userToken);
  
  if (res.success && res.status === 200) {
    log.success(`Retrieved user orders`);
    log.info(`Total orders: ${res.data.count}`);
    res.data.orders.forEach((order, i) => {
      console.log(`  ${i + 1}. Order ${order._id} - Status: ${order.orderStatus}`);
    });
    return true;
  } else {
    log.error(`Failed to get user orders: ${res.data.message}`);
    return false;
  }
};

const getSingleOrder = async () => {
  log.section('6️⃣  GET SINGLE ORDER');
  
  const res = await makeRequest('GET', `/orders/${testOrderId}`, null, userToken);
  
  if (res.success && res.status === 200) {
    log.success(`Retrieved single order details`);
    log.info(`Order ID: ${res.data.order._id}`);
    log.info(`Status: ${res.data.order.orderStatus}`);
    log.info(`Payment Status: ${res.data.order.paymentStatus}`);
    log.info(`Total Amount: ₹${res.data.order.orderSummary.total}`);
    return true;
  } else {
    log.error(`Failed to get order: ${res.data.message}`);
    return false;
  }
};

const getAllOrders = async () => {
  log.section('7️⃣  GET ALL ORDERS (ADMIN)');
  
  const res = await makeRequest('GET', '/orders', null, adminToken);
  
  if (res.success && res.status === 200) {
    log.success(`Retrieved all orders (Admin)`);
    log.info(`Total orders in system: ${res.data.count}`);
    return true;
  } else {
    log.error(`Failed to get all orders: ${res.data.message}`);
    return false;
  }
};

// ============= ORDER CANCELLATION TEST =============

const cancelOrder = async () => {
  log.section('8️⃣  CANCEL ORDER');
  
  const res = await makeRequest('POST', `/orders/${testOrderId}/cancel`, {}, userToken);
  
  if (res.success && res.status === 200) {
    log.success(`Order cancelled successfully`);
    log.info(`Order ID: ${res.data.order._id}`);
    log.info(`New Status: ${res.data.order.orderStatus}`);
    log.info(`Payment Status: ${res.data.order.paymentStatus}`);
    return true;
  } else {
    log.error(`Failed to cancel order: ${res.data.message}`);
    return false;
  }
};

// ============= ORDER UPDATE TESTS =============

const updateOrderStatus = async () => {
  log.section('9️⃣  UPDATE ORDER STATUS (ADMIN)');
  
  const updateData = {
    orderStatus: 'In Transit',
    paymentStatus: 'Completed',
    notes: 'Dispatched with tracking number ABC123'
  };

  const res = await makeRequest('PUT', `/orders/${testOrderId2}`, updateData, adminToken);
  
  if (res.success && res.status === 200) {
    log.success(`Order status updated`);
    log.info(`Order Status: ${res.data.order.orderStatus}`);
    log.info(`Payment Status: ${res.data.order.paymentStatus}`);
    log.info(`Notes: ${res.data.order.notes}`);
    return true;
  } else {
    log.error(`Failed to update order: ${res.data.message}`);
    return false;
  }
};

// ============= STATISTICS TEST =============

const getStatistics = async () => {
  log.section('🔟 ORDER STATISTICS (ADMIN)');
  
  const res = await makeRequest('GET', '/orders/statistics/dashboard', null, adminToken);
  
  if (res.success && res.status === 200) {
    const stats = res.data.statistics;
    log.success(`Retrieved order statistics`);
    log.info(`Total Orders: ${stats.totalOrders}`);
    log.info(`Total Revenue: ₹${stats.totalRevenue}`);
    log.info(`Average Order Value: ₹${stats.averageOrderValue}`);
    console.log(`\n  Status Breakdown:`);
    console.log(`    • Confirmed: ${stats.statusBreakdown.confirmed}`);
    console.log(`    • Processing: ${stats.statusBreakdown.processing}`);
    console.log(`    • In Transit: ${stats.statusBreakdown.inTransit}`);
    console.log(`    • Delivered: ${stats.statusBreakdown.delivered}`);
    console.log(`    • Cancelled: ${stats.statusBreakdown.cancelled}`);
    console.log(`\n  Payment Breakdown:`);
    console.log(`    • Pending: ${stats.paymentBreakdown.pending}`);
    console.log(`    • Completed: ${stats.paymentBreakdown.completed}`);
    console.log(`    • Failed: ${stats.paymentBreakdown.failed}`);
    console.log(`\n  Payment Method Breakdown:`);
    console.log(`    • Online: ${stats.paymentMethodBreakdown.online}`);
    console.log(`    • COD: ${stats.paymentMethodBreakdown.cod}`);
    console.log(`    • UPI: ${stats.paymentMethodBreakdown.upi}\n`);
    return true;
  } else {
    log.error(`Failed to get statistics: ${res.data.message}`);
    return false;
  }
};

// ============= DATE FILTER TEST =============

const filterByDate = async () => {
  log.section('1️⃣1️⃣  FILTER ORDERS BY DATE (ADMIN)');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const endDate = new Date();
  
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  const res = await makeRequest('GET', `/orders/filter/date?startDate=${start}&endDate=${end}`, null, adminToken);
  
  if (res.success && res.status === 200) {
    log.success(`Filtered orders by date`);
    log.info(`Date Range: ${res.data.dateRange.from} to ${res.data.dateRange.to}`);
    log.info(`Orders found: ${res.data.count}`);
    log.info(`Total Revenue: ₹${res.data.totalRevenue}`);
    return true;
  } else {
    log.error(`Failed to filter by date: ${res.data.message}`);
    return false;
  }
};

// ============= SEARCH TEST =============

const searchCustomer = async () => {
  log.section('1️⃣2️⃣  SEARCH CUSTOMER (ADMIN)');
  
  const res = await makeRequest('GET', '/orders/search/customer?query=Ayush', null, adminToken);
  
  if (res.success && res.status === 200) {
    log.success(`Customer search completed`);
    log.info(`Search query: ${res.data.searchQuery}`);
    log.info(`Orders found: ${res.data.count}`);
    res.data.orders.forEach((order, i) => {
      console.log(`  ${i + 1}. ${order.shippingDetails.fullName} - ${order.shippingDetails.email}`);
    });
    return true;
  } else {
    log.error(`Failed to search customer: ${res.data.message}`);
    return false;
  }
};

// ============= BULK UPDATE TEST =============

const bulkUpdateStatus = async () => {
  log.section('1️⃣3️⃣  BULK UPDATE ORDER STATUS (ADMIN)');
  
  // Get all orders first
  const getAllRes = await makeRequest('GET', '/orders', null, adminToken);
  
  if (!getAllRes.success || getAllRes.data.orders.length < 2) {
    log.error('Not enough orders for bulk update test');
    return false;
  }

  const orderIds = getAllRes.data.orders.slice(0, 2).map(o => o._id);
  
  const bulkData = {
    orderIds,
    orderStatus: 'Processing'
  };

  const res = await makeRequest('PUT', '/orders/bulk/status', bulkData, adminToken);
  
  if (res.success && res.status === 200) {
    log.success(`Bulk update completed`);
    log.info(`${res.data.modifiedCount} orders updated`);
    log.info(`${res.data.matchedCount} orders matched`);
    return true;
  } else {
    log.error(`Failed to bulk update: ${res.data.message}`);
    return false;
  }
};

// ============= AUTHORIZATION TEST =============

const testAuthorizationProtection = async () => {
  log.section('1️⃣4️⃣  AUTHORIZATION PROTECTION TEST');
  
  // Try to access admin endpoint without admin token
  const res = await makeRequest('GET', '/orders', null, userToken);
  
  if (!res.success && res.status === 403) {
    log.success(`Authorization protection working (user cannot access admin endpoints)`);
    return true;
  } else {
    log.error(`Authorization protection NOT working`);
    return false;
  }
};

// ============= DELETE TEST =============

const deleteOrder = async () => {
  log.section('1️⃣5️⃣  DELETE ORDER (ADMIN)');
  
  // Create a test order to delete
  const orderData = {
    items: [
      {
        productId: '507f1f77bcf86cd799439011',
        name: 'Test Delete Order',
        price: 999,
        quantity: 1,
        customization: {}
      }
    ],
    shippingDetails: {
      fullName: 'Test Delete',
      email: 'test@example.com',
      phone: '9999999999',
      address: 'Test Address',
      city: 'Test City',
      state: 'Test State',
      pincode: '999999'
    },
    orderSummary: {
      subtotal: 999,
      deliveryCharges: 0,
      total: 999
    },
    paymentMethod: 'Online'
  };

  const createRes = await makeRequest('POST', '/orders', orderData, userToken);
  
  if (!createRes.success) {
    log.error(`Failed to create test order for deletion`);
    return false;
  }

  const deleteOrderId = createRes.data.order._id;

  const res = await makeRequest('DELETE', `/orders/${deleteOrderId}`, null, adminToken);
  
  if (res.success && res.status === 200) {
    log.success(`Order deleted successfully`);
    log.info(`Deleted Order ID: ${deleteOrderId}`);
    return true;
  } else {
    log.error(`Failed to delete order: ${res.data.message}`);
    return false;
  }
};

// ============= MAIN TEST RUNNER =============

const runAllTests = async () => {
  console.clear();
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  MEHRYAAN ORDERS API - TEST SUITE v1.0  ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

  const tests = [
    { name: 'User Login', fn: loginUser },
    { name: 'Admin Login', fn: loginAdmin },
    { name: 'Create Order', fn: createOrder },
    { name: 'Create Second Order', fn: createSecondOrder },
    { name: 'Get User Orders', fn: getUserOrders },
    { name: 'Get Single Order', fn: getSingleOrder },
    { name: 'Get All Orders (Admin)', fn: getAllOrders },
    { name: 'Cancel Order', fn: cancelOrder },
    { name: 'Update Order Status', fn: updateOrderStatus },
    { name: 'Order Statistics', fn: getStatistics },
    { name: 'Filter By Date', fn: filterByDate },
    { name: 'Search Customer', fn: searchCustomer },
    { name: 'Bulk Update Status', fn: bulkUpdateStatus },
    { name: 'Authorization Protection', fn: testAuthorizationProtection },
    { name: 'Delete Order', fn: deleteOrder }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await sleep(500); // Delay between tests
  }

  // Summary
  log.section('TEST SUMMARY');
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.cyan}📊 Total: ${tests.length}${colors.reset}\n`);

  if (failed === 0) {
    console.log(`${colors.green}🎉 ALL TESTS PASSED! 🎉${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed. Check output above.${colors.reset}\n`);
  }

  process.exit(failed === 0 ? 0 : 1);
};

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});