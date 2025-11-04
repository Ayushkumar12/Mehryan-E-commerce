# Mehryaan - Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites
- ✅ Node.js installed ([Download](https://nodejs.org/))
- ✅ MongoDB ([Local](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas))

### Step 1: Frontend Setup (Terminal 1)
```bash
# From project root
npm install
npm run dev
```
✅ Frontend runs at http://localhost:5173

### Step 2: Backend Setup (Terminal 2)
```bash
# From backend folder
cd backend
npm install
cp .env.example .env
npm run dev
```
✅ Backend runs at http://localhost:5000

### Step 3: Seed Database (Terminal 3)
```bash
cd backend
node scripts/seedDatabase.js
```
✅ Sample data loaded with test credentials

### Step 4: Access Application
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:5000/api
- ✅ Health Check: http://localhost:5000/api/health

## 🧪 Test Credentials

**Admin User:**
- Email: `admin@mehryaan.com`
- Password: `admin123`

**Regular User:**
- Email: `user@mehryaan.com`
- Password: `user123`

## 📋 Available Routes

### Frontend
- `/` - Home page
- `/products` - Browse products
- `/customization` - Customize suits
- `/cart` - Shopping cart
- `/dashboard` - User dashboard & admin panel
- `/admin` - Admin panel

### Backend APIs
```
GET    /api/health                      - Server status
POST   /api/auth/signup                 - Register
POST   /api/auth/login                  - Login
GET    /api/auth/me                     - Current user
GET    /api/products                    - List products
POST   /api/products                    - Add product (Admin)
POST   /api/orders                      - Create order
GET    /api/orders/user                 - User orders
```

## 🔧 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongosh` or MongoDB Compass
- Check MONGODB_URI in `backend/.env`

### Port Already in Use
```bash
# Change port in backend/.env
PORT=5001
```

### Cannot Connect Frontend to Backend
- Check backend is running on port 5000
- Check CORS is enabled
- Clear browser cache

### Dependencies Issue
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 Full Documentation
See `SETUP_GUIDE.md` for detailed setup and API documentation

## ✨ Features Implemented

- ✅ Product management with MongoDB
- ✅ User authentication with JWT
- ✅ Shopping cart functionality
- ✅ Order management system
- ✅ Admin panel with CRUD operations
- ✅ Custom suit designer
- ✅ Responsive design
- ✅ React Context API for state management

## 🎯 Next Steps

1. Run the application following steps above
2. Test features with provided credentials
3. Review `backend/README.md` for API details
4. Explore code structure
5. Ready for deployment! 🚀

---

**From the Valleys of Kashmir to Your Home! 💚**