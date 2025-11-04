# Mehryaan Architecture

## System Overview

Mehryaan is a full-stack e-commerce platform with:
- **Frontend**: React 19 with Vite (SPA)
- **Backend**: Express.js with MongoDB (REST API)
- **Communication**: Axios with JWT authentication

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 5173)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages: Home, Products, Customization, Cart, Dashboard│   │
│  │        Admin                                         │   │
│  │ ┌────────────────────────────────────────────────┐   │   │
│  │ │  Context API                                   │   │   │
│  │ │  - UserContext (Auth)                          │   │   │
│  │ │  - ProductsContext (Products)                  │   │   │
│  │ │  - CartContext (Shopping Cart)                 │   │   │
│  │ ├────────────────────────────────────────────────┤   │   │
│  │ │  Services (API Calls)                          │   │   │
│  │ │  - authService                                 │   │   │
│  │ │  - productService                              │   │   │
│  │ │  - orderService                                │   │   │
│  │ ├────────────────────────────────────────────────┤   │   │
│  │ │  API Client                                    │   │   │
│  │ │  - Axios instance with interceptors            │   │   │
│  │ │  - JWT token management                        │   │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
              ↑ HTTP/REST API (Axios) ↓
┌─────────────────────────────────────────────────────────────┐
│             Express Backend (Port 5000)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes                                               │   │
│  │ - /api/auth      (Authentication)                   │   │
│  │ - /api/products  (Product CRUD)                     │   │
│  │ - /api/orders    (Order Management)                 │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Middleware                                           │   │
│  │ - JWT Protection                                     │   │
│  │ - Error Handling                                     │   │
│  │ - CORS Support                                       │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ Models (MongoDB)                                     │   │
│  │ - User (Authentication & Profile)                   │   │
│  │ - Product (Catalog)                                 │   │
│  │ - Order (Transactions)                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
              ↑ Mongoose ORM ↓
┌─────────────────────────────────────────────────────────────┐
│          MongoDB Database                                   │
│  Collections:                                               │
│  - users      (Authentication & Profile Data)              │
│  - products   (Product Catalog)                            │
│  - orders     (Order History & Tracking)                   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow
```
1. User enters credentials
   ↓
2. Frontend → POST /api/auth/login (Email, Password)
   ↓
3. Backend validates against MongoDB
   ↓
4. Backend returns JWT token + User data
   ↓
5. Frontend stores token in localStorage
   ↓
6. Future requests include: Authorization: Bearer <token>
```

### Product Fetching
```
1. App mounts → ProductsContext initializes
   ↓
2. Frontend → GET /api/products (with filters: category, search, sort)
   ↓
3. Backend queries MongoDB with filters
   ↓
4. Returns products array
   ↓
5. ProductsContext caches locally
```

### Order Creation
```
1. User adds items to cart (stored in CartContext & localStorage)
   ↓
2. User fills checkout form + shipping details
   ↓
3. Frontend → POST /api/orders (with JWT token)
   ↓
4. Backend validates + creates Order document
   ↓
5. Cart cleared in frontend
   ↓
6. Order stored in MongoDB with status tracking
```

## File Structure

### Frontend (`src/`)
```
src/
├── pages/                       # Page components
│   ├── Home.jsx               # Hero, categories, featured products
│   ├── Products.jsx           # Product listing with filters
│   ├── Customization.jsx      # Suit customizer
│   ├── Cart.jsx               # Shopping cart & checkout
│   ├── Dashboard.jsx          # User orders & admin panel
│   └── Admin.jsx              # (Integrated in Dashboard)
├── components/                 # Reusable components
│   ├── Header.jsx             # Navigation + cart icon
│   └── Footer.jsx             # Footer links
├── context/                    # React Context providers
│   ├── AppProviders.jsx       # Context wrapper
│   ├── UserContext.jsx        # Auth state
│   ├── ProductsContext.jsx    # Products state
│   └── CartContext.jsx        # Cart state
├── services/                   # API services
│   ├── api.js                 # Axios configuration
│   ├── authService.js         # Auth API calls
│   ├── productService.js      # Product API calls
│   └── orderService.js        # Order API calls
├── App.jsx                    # Main app component
├── App.css                    # App styles
├── index.css                  # Global styles
└── main.jsx                   # Entry point
```

### Backend (`backend/`)
```
backend/
├── models/                    # MongoDB schemas
│   ├── User.js               # User schema (auth + profile)
│   ├── Product.js            # Product schema
│   └── Order.js              # Order schema
├── routes/                    # API routes
│   ├── auth.js               # Auth endpoints
│   ├── products.js           # Product endpoints
│   └── orders.js             # Order endpoints
├── middleware/                # Custom middleware
│   ├── auth.js               # JWT protection
│   └── errorHandler.js       # Error handling
├── scripts/                   # Utility scripts
│   └── seedDatabase.js       # Database seeding
├── server.js                  # Express server entry
├── package.json              # Dependencies
├── .env.example              # Environment template
└── README.md                 # Backend documentation
```

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.1.1 |
| Build Tool | Vite | 7.1.7 |
| Routing | React Router DOM | 7.9.5 |
| HTTP Client | Axios | 1.6.5 |
| State Management | Context API | Built-in |
| Backend | Express.js | 4.18.2 |
| Database | MongoDB | 8.0.0 |
| Authentication | JWT | 9.1.2 |
| Password Hashing | bcryptjs | 2.4.3 |
| Validation | express-validator | 7.0.0 |
| CORS | cors | 2.8.5 |

## API Authentication

All protected routes require JWT token:

```javascript
// Request format
Authorization: Bearer eyJhbGc...

// Token structure
{
  id: "user_mongodb_id",
  role: "user" | "admin",
  iat: 1234567890,
  exp: 1234654290
}
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  role: "user" | "admin",
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: "Customized Suits" | "Dry Fruits" | "Rajma" | "Kesar",
  price: Number,
  image: String,
  inStock: Boolean,
  stock: Number,
  rating: Number,
  reviews: Number,
  customizable: Boolean,
  fabricOptions: [String],
  embroideryOptions: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    customization: {
      fabric: String,
      embroidery: String,
      color: String,
      size: String,
      referenceImage: String,
      specialInstructions: String
    }
  }],
  shippingDetails: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  orderSummary: {
    subtotal: Number,
    deliveryCharges: Number,
    total: Number
  },
  paymentMethod: "Online" | "COD" | "UPI",
  paymentStatus: "Pending" | "Completed" | "Failed",
  orderStatus: "Order Confirmed" | "Processing" | "In Transit" | "Delivered" | "Cancelled",
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## State Management

### UserContext
- Manages user authentication state
- Handles login/signup/logout
- Stores JWT token in localStorage
- Provides user profile information

### ProductsContext
- Fetches products from backend
- Caches products locally
- Provides filtering/searching functionality
- Handles CRUD operations (Admin)

### CartContext
- Manages shopping cart items
- Persists cart in localStorage
- Calculates totals
- Creates orders via API

## Error Handling

### Frontend
- API errors caught and displayed to user
- 401 errors trigger re-login
- Network errors show helpful messages
- Validation errors prevent form submission

### Backend
- Input validation via express-validator
- MongoDB validation errors caught
- JWT verification failures handled
- Duplicate email/unique field errors handled
- 404 for missing resources
- 403 for unauthorized access

## Security Features

1. **Password Hashing**: bcryptjs (10 salt rounds)
2. **JWT Tokens**: 30-day expiration
3. **Protected Routes**: Admin-only endpoints secured
4. **CORS**: Configured for frontend domain only
5. **Input Validation**: express-validator on all inputs
6. **Error Messages**: Generic messages (no database leakage)

## Deployment Considerations

### Frontend
- Build: `npm run build` → creates `dist/` folder
- Deploy to: Vercel, Netlify, AWS S3, GitHub Pages
- Environment: Change `API_BASE_URL` to production backend

### Backend
- Deploy to: Heroku, Railway, Render, AWS EC2
- Environment: Update `.env` with production values
- Database: Use MongoDB Atlas (cloud)
- Domain: Get SSL certificate (HTTPS)
- Monitoring: Add logging/error tracking

## Performance Optimization

1. **Frontend**:
   - React Compiler enabled
   - Code splitting with React.lazy()
   - Lazy loading outside viewport
   - Image optimization (WebP)

2. **Backend**:
   - Database indexes on frequently queried fields
   - Pagination for large datasets
   - Caching headers for static responses
   - Request/response compression

## Future Enhancements

- [ ] WebSocket for real-time notifications
- [ ] Payment gateway integration
- [ ] Image upload service
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Review/rating system
- [ ] Wishlist feature
- [ ] Promotional codes/discounts
- [ ] Multi-language support
- [ ] Advanced search with Elasticsearch

---

**Architecture designed for scalability and maintainability** 🏗️