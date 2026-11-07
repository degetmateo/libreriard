import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductDto, ProductVariantDto } from '@libreriard/shared';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: ProductDto;
  variant?: ProductVariantDto;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductDto, variant?: ProductVariantDto, qty?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, qty: number, variantId?: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('rd_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const { isWholesale } = useAuth();

  useEffect(() => {
    localStorage.setItem('rd_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: ProductDto, variant?: ProductVariantDto, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id && i.variant?.id === variant?.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += qty;
        return copy;
      }
      return [...prev, { product, variant, quantity: qty }];
    });
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.variant?.id === variantId)));
  };

  const updateQuantity = (productId: string, qty: number, variantId?: string) => {
    if (qty <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems(prev => prev.map(i => (i.product.id === productId && i.variant?.id === variantId) ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((acc, item) => {
    const basePrice = isWholesale ? item.product.wholesalePrice : item.product.retailPrice;
    const modifier = item.variant?.priceModifier || 0;
    return acc + (basePrice + modifier) * item.quantity;
  }, 0);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
};
