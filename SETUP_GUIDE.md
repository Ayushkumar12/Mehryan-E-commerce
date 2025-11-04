# Mehryaan E-Commerce Platform - Complete Setup Guide

## Project Structure

```
mehryaan/
├── src/                          # React Frontend
│   ├── services/                 # API Services
│   │   ├── api.js               # Axios configuration
│   │   ├── authService.js       # Authentication APIs
│   │   ├── productService.js    # Product APIs
│   │   └── orderService.js      # Order APIs
│   ├── pages/                    # Page components
│   ├── components/               # Reusable components
│   ├── context/                  # React Context
│   ├── App.jsx                   # Main app component
│   └── main.jsx                  # Entry point
├── backend/                      # Express Backend
│   ├── models/                   # MongoDB schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── orders.js
│   ├── middleware/               # Custom middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── scripts/                  # Database scripts
│   │   └── seedDatabase.js
│   ├── server.js                 # Express server
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── package.json                  # Frontend dependencies
└── vite.config.js               # Vite configuration
```

## Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (Local or Atlas) - [Download](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
3. **Git** (optional) - [Download](https://git-scm.com/)

## Installation Steps

### Step 1: Setup Frontend Dependencies

```bash
# Navigate to project root
cd mehryaan

# Install frontend dependencies
npm install
```

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install backend dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `backend/.env` file:**
```env
MONGODB_URI=mongodb://localhost:27017/mehryaan
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 3: Setup MongoDB

#### Option A: MongoDB Local Installation
```bash
# MongoDB should be running on localhost:27017
# Test connection: Open MongoDB Compass and connect to mongodb://localhost:27017
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `MONGODB_URI` in `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mehryaan
```

### Step 4: Seed Database

```bash
# From backend folder
cd backend

# Populate sample data
node scripts/seedDatabase.js
```

You should see:
```
✅ Database seeding completed successfully!

📝 Test Credentials:
Admin: admin@mehryaan.com / admin123
User: user@mehryaan.com / user123
```

## Running the Application

### Terminal 1 - Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
```

### Terminal 2 - Start Frontend Development Server

```bash
npm run dev
```

You should see:
```
VITE v7.1.7 ready in XXX ms

➜  Local:   http://localhost:5173/
```

## Accessing the Application

1. **Frontend:** Open browser and go to `http://localhost:5173`
2. **Backend API:** `http://localhost:5000/api`
3. **Health Check:** `http://localhost:5000/api/health`

## Testing the Features

### 1. User Authentication
- Click "Dashboard" in header (top-right)
- Click "Login/Signup" tab
- Try login with:
  - Email: `user@mehryaan.com`
  - Password: `user123`

### 2. Browse Products
- Go to "Products" page
- Use filters (Category, Search, Sort)
- View product details

### 3. Customize Suit
- Go to "Customization" page
- Select fabric, embroidery, color, size
- Upload reference image
- See dynamic pricing

### 4. Shopping Cart
- Add items to cart
- Adjust quantities
- Proceed to checkout
- Enter shipping details
- Select payment method
- Place order

### 5. Admin Panel
- Login as admin: `admin@mehryaan.com / admin123`
- Access "Admin" in header
- Manage products, orders, view analytics

## Available Scripts

### Frontend
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Check code quality
```

### Backend
```bash
npm run dev       # Start with nodemon (hot reload)
npm start         # Start production server
```

## Environment Variables Reference

### Frontend (no .env needed, uses localhost defaults)
- Backend API automatically connects to `http://localhost:5000/api`

### Backend (.env file)
| Variable | Description | Example |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/mehryaan |
| JWT_SECRET | Secret key for JWT tokens | your_secret_key_here |
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| FRONTEND_URL | Frontend origin for CORS | http://localhost:5173 |

## Troubleshooting

### Issue: MongoDB Connection Error
**Solution:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Try: `mongosh` (MongoDB CLI) or MongoDB Compass

### Issue: Port Already in Use
**Solution:**
```bash
# Change port in backend/.env
PORT=5001

# Or kill the process using port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

### Issue: CORS Error
**Solution:**
- Check `FRONTEND_URL` in `backend/.env`
- Ensure backend is running on correct port
- Clear browser cache

### Issue: Token Expiration
**Solution:**
- Re-login to get new token
- Tokens expire after 30 days
- Check browser console for errors

### Issue: npm install fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## API Documentation

### Authentication Endpoints
```
POST   /api/auth/signup          - Register new user
POST   /api/auth/login           - Login user
GET    /api/auth/me              - Get current user (Protected)
PUT    /api/auth/updateprofile   - Update profile (Protected)
```

### Product Endpoints
```
GET    /api/products             - Get all products
GET    /api/products/:id         - Get single product
POST   /api/products             - Add product (Admin)
PUT    /api/products/:id         - Update product (Admin)
DELETE /api/products/:id         - Delete product (Admin)
```

### Order Endpoints
```
POST   /api/orders               - Create order (Protected)
GET    /api/orders/user          - Get user orders (Protected)
GET    /api/orders/:id           - Get single order (Protected)
GET    /api/orders               - Get all orders (Admin)
PUT    /api/orders/:id           - Update order (Admin)
DELETE /api/orders/:id           - Delete order (Admin)
```

## Development Tips

1. **Use React DevTools** - Browser extension for debugging
2. **Use MongoDB Compass** - Visual MongoDB management
3. **Check Network Tab** - Browser DevTools for API calls
4. **Console Logs** - Backend logs appear in terminal

## Production Deployment

### Frontend
```bash
npm run build
# Deploy `dist` folder to Vercel, Netlify, or any static hosting
```

### Backend
- Deploy to Heroku, Railway, Render, or similar
- Update `FRONTEND_URL` in environment variables
- Use MongoDB Atlas for production database

## Next Steps

1. ✅ Setup complete!
2. 📱 Test all features
3. 🔐 Implement payment gateway (Razorpay/Stripe)
4. 📧 Add email notifications
5. 🖼️ Setup image hosting service
6. 📊 Add analytics
7. 🚀 Deploy to production

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review backend README.md
3. Check browser console for errors
4. Check backend terminal for server errors

---

**Happy Coding! 🚀**
From the Valleys of Kashmir to Your Home! 💚