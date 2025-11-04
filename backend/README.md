# Mehryaan Backend API

Express.js backend server with MongoDB for the Mehryaan E-Commerce platform.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```

3. **Update `.env` with your values:**
```
MONGODB_URI=mongodb://localhost:27017/mehryaan
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Running the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

### Seeding Database

To populate the database with sample data:

```bash
node scripts/seedDatabase.js
```

This will create:
- 8 sample products (Rajma, Dry Fruits, Saffron, Customized Suits)
- 1 admin user (admin@mehryaan.com / admin123)
- 1 regular user (user@mehryaan.com / user123)

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (Protected)
- `PUT /updateprofile` - Update user profile (Protected)

### Products (`/api/products`)
- `GET /` - Get all products (with filters: category, search, sort)
- `GET /:id` - Get single product
- `POST /` - Add product (Admin only)
- `PUT /:id` - Update product (Admin only)
- `DELETE /:id` - Delete product (Admin only)

### Orders (`/api/orders`)
- `POST /` - Create order (Protected)
- `GET /user` - Get user's orders (Protected)
- `GET /:id` - Get single order (Protected)
- `GET /` - Get all orders (Admin only)
- `PUT /:id` - Update order status (Admin only)
- `DELETE /:id` - Delete order (Admin only)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

Include the token in request headers:
```
Authorization: Bearer <your_jwt_token>
```

## Project Structure

```
backend/
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   └── orders.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── scripts/
│   └── seedDatabase.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

## Key Features

✅ User Authentication & Authorization
✅ Product Management (CRUD)
✅ Order Management with Status Tracking
✅ Admin Dashboard Access
✅ JWT Token-based Security
✅ MongoDB Integration
✅ Input Validation
✅ Error Handling
✅ CORS Support

## Database Schema

### User
- name, email, password (hashed)
- phone, address, city, state, pincode
- role (user/admin)
- timestamps

### Product
- name, description, category
- price, image, inStock, stock
- rating, reviews
- customizable (for suits)
- fabricOptions, embroideryOptions
- timestamps

### Order
- userId, items (product details + customization)
- shippingDetails (name, email, phone, address, city, state, pincode)
- orderSummary (subtotal, deliveryCharges, total)
- paymentMethod, paymentStatus, orderStatus
- timestamps

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or check your MongoDB Atlas connection string
- Verify `MONGODB_URI` in `.env` file

### JWT Errors
- Check that `JWT_SECRET` is set in `.env`
- Ensure token is being sent in Authorization header

### CORS Errors
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Check if frontend and backend are on same network

## Future Enhancements
- Payment gateway integration (Razorpay/Stripe)
- Email notifications
- Image upload service
- Rate limiting
- Caching with Redis
- API documentation with Swagger
- Unit and integration tests