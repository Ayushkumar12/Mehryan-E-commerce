import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mehryaan';
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ MongoDB connected');

    const db = client.db('mehryaan');

    // Clear existing collections
    console.log('🗑️  Clearing existing data...');
    await db.collection('products').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('orders').deleteMany({});

    // Seed Products
    console.log('📦 Seeding products...');
    const products = [
      {
        name: 'Premium Rajma',
        description: 'Premium quality Kashmiri Rajma with authentic taste',
        category: 'Rajma',
        price: 499,
        image: '/products/rajma.jpg',
        inStock: true,
        stock: 100,
        rating: 4.5,
        reviews: 25,
        customizable: false,
        fabricOptions: [],
        embroideryOptions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dry Fruits Mix',
        description: 'Premium dry fruits collection from Kashmir',
        category: 'Dry Fruits',
        price: 1299,
        image: '/products/dry-fruits.jpg',
        inStock: true,
        stock: 50,
        rating: 4.8,
        reviews: 45,
        customizable: false,
        fabricOptions: [],
        embroideryOptions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Premium Kesar',
        description: 'Authentic Kashmiri Kesar (Saffron)',
        category: 'Kesar',
        price: 2499,
        image: '/products/kesar.jpg',
        inStock: true,
        stock: 30,
        rating: 4.9,
        reviews: 60,
        customizable: false,
        fabricOptions: [],
        embroideryOptions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Customized Silk Suit',
        description: 'Premium silk suit with traditional Kashmiri embroidery',
        category: 'Customized Suits',
        price: 5999,
        image: '/products/suit-silk.jpg',
        inStock: true,
        stock: 20,
        rating: 4.7,
        reviews: 35,
        customizable: true,
        fabricOptions: ['Silk', 'Cotton', 'Linen'],
        embroideryOptions: ['Traditional Kashmiri', 'Minimal', 'Heavy'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Customized Cotton Suit',
        description: 'Premium cotton suit perfect for daily wear',
        category: 'Customized Suits',
        price: 2999,
        image: '/products/suit-cotton.jpg',
        inStock: true,
        stock: 40,
        rating: 4.6,
        reviews: 20,
        customizable: true,
        fabricOptions: ['Cotton', 'Linen'],
        embroideryOptions: ['Minimal', 'Traditional Kashmiri'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Woolens Collection',
        description: 'Premium Kashmiri woolen products',
        category: 'Dry Fruits',
        price: 3499,
        image: '/products/woolens.jpg',
        inStock: true,
        stock: 25,
        rating: 4.4,
        reviews: 18,
        customizable: false,
        fabricOptions: [],
        embroideryOptions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Customized Luxury Suit',
        description: 'Luxury customized suit with premium embroidery',
        category: 'Customized Suits',
        price: 9999,
        image: '/products/suit-luxury.jpg',
        inStock: true,
        stock: 10,
        rating: 4.9,
        reviews: 50,
        customizable: true,
        fabricOptions: ['Silk', 'Cotton', 'Wool'],
        embroideryOptions: ['Traditional Kashmiri', 'Heavy'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mixed Spices Pack',
        description: 'Authentic Kashmiri spices collection',
        category: 'Rajma',
        price: 799,
        image: '/products/spices.jpg',
        inStock: true,
        stock: 60,
        rating: 4.3,
        reviews: 15,
        customizable: false,
        fabricOptions: [],
        embroideryOptions: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const productsResult = await db.collection('products').insertMany(products);
    console.log(`✅ ${productsResult.insertedCount} products added`);

    // Seed Users
    console.log('👥 Seeding users...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@mehryaan.com',
        password: hashedAdminPassword,
        phone: '+91-9999999999',
        address: 'Admin Office, Kashmir',
        city: 'Srinagar',
        state: 'Jammu & Kashmir',
        pincode: '190001',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Test User',
        email: 'user@mehryaan.com',
        password: hashedUserPassword,
        phone: '+91-8888888888',
        address: 'Test Address, Delhi',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const usersResult = await db.collection('users').insertMany(users);
    console.log(`✅ ${usersResult.insertedCount} users added`);

    // Seed Sample Orders
    console.log('📋 Seeding orders...');
    const userIds = usersResult.insertedIds;
    const productIds = productsResult.insertedIds;

    const orders = [
      {
        userId: userIds[1], // Test user
        items: [
          {
            productId: productIds[0],
            name: 'Premium Rajma',
            price: 499,
            quantity: 2,
            customization: null
          },
          {
            productId: productIds[1],
            name: 'Dry Fruits Mix',
            price: 1299,
            quantity: 1,
            customization: null
          }
        ],
        shippingDetails: {
          fullName: 'Test User',
          email: 'user@mehryaan.com',
          phone: '+91-8888888888',
          address: 'Test Address, Delhi',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        orderSummary: {
          subtotal: 2297,
          deliveryCharges: 100,
          total: 2397
        },
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        orderStatus: 'Order Confirmed',
        notes: 'Please deliver after 6 PM',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: userIds[1],
        items: [
          {
            productId: productIds[3],
            name: 'Customized Silk Suit',
            price: 5999,
            quantity: 1,
            customization: {
              fabric: 'Silk',
              embroidery: 'Traditional Kashmiri',
              color: 'Maroon',
              size: 'L',
              referenceImage: 'https://example.com/ref.jpg',
              specialInstructions: 'Gold embroidery on chest'
            }
          }
        ],
        shippingDetails: {
          fullName: 'Test User',
          email: 'user@mehryaan.com',
          phone: '+91-8888888888',
          address: 'Test Address, Delhi',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        orderSummary: {
          subtotal: 5999,
          deliveryCharges: 200,
          total: 6199
        },
        paymentMethod: 'Online',
        paymentStatus: 'Completed',
        orderStatus: 'Processing',
        notes: 'Customization in progress',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const ordersResult = await db.collection('orders').insertMany(orders);
    console.log(`✅ ${ordersResult.insertedCount} orders added`);

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@mehryaan.com / admin123');
    console.log('   User: user@mehryaan.com / user123');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed');
  }
};

seedDatabase();