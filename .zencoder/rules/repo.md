# Mehryaan - Repository Documentation

## Project Overview
**Mehryaan** is a full-stack e-commerce platform specializing in Kashmiri products:
- **Customized Suits** (with personalized embroidery, fabric, and size options)
- **Premium Dry Fruits**
- **Specialty Products** (Rajma, Kesar, etc.)

**Brand Identity:**
- Tagline: "From the Valleys of Kashmir to Your Home"
- Color Palette: Saffron, Gold, Maroon, Cream
- Target: Premium handcrafted products with focus on customization

---

## Tech Stack

### Frontend
- **Framework:** React 19.1.1 with React Router DOM 7.9.5
- **Build Tool:** Vite 7.1.7 (fast development server, optimized builds)
- **React Compiler:** Enabled for performance optimization
- **Styling:** CSS (located in `src/index.css` and `src/App.css`)
- **Node Modules:** React 19 with latest best practices

### State Management
- **Context API** (no Redux/Zustand) - Used for:
  - `CartContext` - Shopping cart management
  - `UserContext` - User authentication & profile
  - `ProductsContext` - Products catalog & filtering
  - `AppProviders` - Central provider wrapper

### Development Tools
- **ESLint:** 9.36.0 (with React hooks & refresh plugins)
- **Babel:** React Compiler plugin enabled
- **Node:** ES Module (type: "module" in package.json)

---

## Project Structure

```
mehryaan/
├── src/
│   ├── pages/
│   │   ├── Home.jsx            # Hero, categories, featured products
│   │   ├── Products.jsx         # Product listing & filtering
│   │   ├── Customization.jsx    # Suit customization form
│   │   ├── Cart.jsx             # Shopping cart & checkout
│   │   ├── Dashboard.jsx        # Customer dashboard (orders, wishlist, tracking)
│   │   └── Admin.jsx            # Admin panel (manage products, orders, inventory)
│   ├── components/
│   │   ├── Header.jsx           # Navigation & brand header
│   │   └── Footer.jsx           # Footer with links
│   ├── context/
│   │   ├── AppProviders.jsx     # Context provider wrapper
│   │   ├── CartContext.jsx      # Cart state & operations
│   │   ├── UserContext.jsx      # User auth & profile state
│   │   └── ProductsContext.jsx  # Products data & filtering
│   ├── assets/
│   │   └── react.svg
│   ├── App.jsx                  # Main app component with routing
│   ├── App.css                  # App-level styles
│   ├── index.css                # Global styles
│   └── main.jsx                 # React entry point
├── public/
│   └── vite.svg
├── index.html                   # HTML entry point
├── vite.config.js               # Vite configuration with React plugin
├── eslint.config.js             # ESLint rules
├── package.json                 # Dependencies & scripts
└── README.md                    # Original template README
```

---

## Routing Architecture

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Hero banner, categories, featured products |
| `/products` | Products | Browse all products with filters |
| `/customization` | Customization | Create custom suit orders |
| `/cart` | Cart | Review cart, checkout |
| `/dashboard` | Dashboard | Order history, tracking, wishlist |
| `/admin` | Admin | Manage products, orders, inventory |

---

## Functional Requirements Roadmap

### Phase 1: Core Features
- [ ] **Home Page** - Hero banner, category showcase, featured products
- [ ] **Product Pages** - Multi-image gallery, descriptions, pricing, stock status
- [ ] **Add to Cart** - Cart management with quantity adjustments
- [ ] **Product Listing** - Filtering by category, price, availability

### Phase 2: Customization & Orders
- [ ] **Suit Customization** - Fabric, embroidery, color, size selection
- [ ] **Design Upload** - Users upload reference photos
- [ ] **Virtual Preview** - Basic 3D preview (optional, can use placeholder)
- [ ] **Checkout Flow** - Order summary, shipping info

### Phase 3: Payment & Delivery
- [ ] **Payment Gateway** - Razorpay or Stripe integration
- [ ] **Multiple Payment Options** - UPI, COD, Cards
- [ ] **Order Tracking** - Real-time delivery updates
- [ ] **Delivery Address** - Shipping management

### Phase 4: User & Admin Features
- [ ] **User Dashboard** - Order history, wishlist, shipment tracking
- [ ] **User Authentication** - Login/signup (Firebase or custom backend)
- [ ] **Support Chat** - WhatsApp integration option
- [ ] **Admin Panel** - Add/manage products, view analytics
- [ ] **Inventory Management** - Stock tracking

---

## Coding Standards & Guidelines

### Component Structure
- Functional components with hooks
- Props validation (consider PropTypes or TypeScript in future)
- Clear component documentation

### State Management
- Use Context API for global state (Cart, User, Products)
- Local state with `useState` for component-specific data
- Keep context contexts focused and minimal

### File Naming
- Components: `PascalCase.jsx`
- Utilities/Helpers: `camelCase.js`
- Context: `[Name]Context.jsx`
- CSS files: `[Name].css` (co-located with components)

### Styling
- Use CSS modules or CSS-in-JS in future phases
- Maintain brand color palette (saffron, gold, maroon, cream)
- Responsive design (mobile-first approach)

### Performance
- React Compiler enabled - leverage automatic optimizations
- Code split routes with React.lazy() if bundle grows
- Optimize images (use WebP where possible)
- Lazy load components outside viewport

---

## Future Technology Additions

### Backend (When Needed)
- **Node.js + Express** or **Python/Django**
- **Database:** MongoDB (NoSQL) or PostgreSQL
- **Authentication:** JWT + Firebase or Auth0
- **Payment:** Razorpay/Stripe SDKs

### Enhancements
- **TypeScript:** For type safety
- **Testing:** Jest, React Testing Library
- **UI Library:** Tailwind CSS, Material-UI, or shadcn/ui
- **Form Management:** React Hook Form, Formik
- **API Client:** Axios or TanStack Query

---

## Development Commands

```bash
# Start development server (HMR enabled)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

---

## Notes for Development

1. **No Backend Yet:** Currently frontend-only. Backend integration needed for:
   - Product database
   - User authentication
   - Order management
   - Payment processing

2. **Context API Limitations:** If state becomes complex, consider migrating to Redux or Zustand

3. **Image Optimization:** Ensure high-quality product images are optimized for web

4. **Mobile Responsiveness:** Critical for e-commerce - test on various devices

5. **Accessibility:** Ensure WCAG compliance (alt text, semantic HTML, color contrast)

6. **SEO:** Add meta tags, structured data for products

---

## Dependencies to Consider Adding

- `axios` - HTTP client for API calls
- `react-hook-form` - Form handling
- `zustand` or `redux-toolkit` - If state management becomes complex
- `tailwindcss` - Utility-first CSS framework
- `react-hot-toast` - Notifications
- `date-fns` - Date manipulation
- `dotenv` - Environment variables

---

*Last Updated: 2025*
*Project: Mehryaan E-commerce Platform*