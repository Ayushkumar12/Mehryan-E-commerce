import React from 'react';
import { CartProvider } from './CartContext';
import { UserProvider } from './UserContext';
import { ProductsProvider } from './ProductsContext';

export const AppProviders = ({ children }) => {
  return (
    <UserProvider>
      <ProductsProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ProductsProvider>
    </UserProvider>
  );
};