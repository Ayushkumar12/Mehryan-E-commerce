import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProviders } from './context/AppProviders';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import Customization from './pages/Customization';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminRoute from './components/AdminRoute';
import './App.css';

function App() {
  return (
    <AppProviders>
      <Router>
        <div className="App">
          <Routes>
            {/* Admin Auth Routes (No Header/Footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            
            {/* Customer Auth Routes (No Header/Footer) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* All Other Routes (With Header/Footer via Layout) */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customization" element={<Customization />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } 
              />
            </Route>
          </Routes>
        </div>
      </Router>
    </AppProviders>
  );
}

export default App;
