import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
import util from 'util';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const LOG_COLLECTION_NAME = process.env.SERVER_LOGS_COLLECTION || 'server_logs';
const originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};
const logQueue = [];
let logsCollection;

const serializeLogArg = (value) => {
  if (value instanceof Error) {
    return {
      type: 'Error',
      name: value.name,
      message: value.message,
      stack: value.stack
    };
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return util.inspect(value, { depth: 5 });
    }
  }
  return value;
};

const persistLogEntry = (level, args) => {
  const entry = {
    level,
    messages: args.map(serializeLogArg),
    timestamp: new Date()
  };
  if (logsCollection) {
    logsCollection.insertOne(entry).catch((error) => {
      originalConsole.error('MongoDB log insert failed:', error);
    });
  } else {
    logQueue.push(entry);
  }
};

const flushLogQueue = () => {
  if (!logsCollection || logQueue.length === 0) {
    return;
  }
  const pending = logQueue.splice(0, logQueue.length);
  logsCollection.insertMany(pending).catch((error) => {
    originalConsole.error('MongoDB log insert failed:', error);
  });
};

const wrapConsole = (method) => (...args) => {
  originalConsole[method](...args);
  const level = method === 'log' ? 'info' : method;
  Promise.resolve().then(() => persistLogEntry(level, args));
};

console.log = wrapConsole('log');
console.info = wrapConsole('info');
console.warn = wrapConsole('warn');
console.error = wrapConsole('error');

const app = express();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mehryaan';
const mongoClient = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

const connectDB = async () => {
  try {
    await mongoClient.connect();
    db = mongoClient.db('mehryaan');
    logsCollection = db.collection(LOG_COLLECTION_NAME);
    flushLogQueue();
    console.log('✅ MongoDB connected successfully');
    console.log('📦 Database: mehryaan');
    console.log('📋 Collections: products, users, orders');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Store db instance in app for routes to access
app.locals.db = db;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update (in seconds)
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Make db available in req.app.locals
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    database: 'mehryaan',
    collections: ['products', 'users', 'orders']
  });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔌 Closing MongoDB connection...');
  await mongoClient.close();
  process.exit(0);
});