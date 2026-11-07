import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductDto, ProductVariantDto } from '@libreriard/shared';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: ProductDto;
  variant?: ProductVariantDto;
  quantity: number;
}

export interface ItemPricing {
  unitPrice: number;
  originalUnitPrice: number;
  discountApplied: boolean;
  subtotal: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductDto, variant?: ProductVariantDto, qty?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, qty: number, variantId?: string) => void;
  getItemPricing: (item: CartItem) => ItemPricing;
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
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id && i.variant?.id === variant?.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += qty;
        return copy;
      }
      return [...prev, { product, variant, quantity: qty }];
    });
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.variant?.id === variantId)));
  };

  const updateQuantity = (productId: string, qty: number, variantId?: string) => {
    if (qty <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId && i.variant?.id === variantId ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => setItems([]);

  const getItemPricing = (item: CartItem): ItemPricing => {
    const modifier = item.variant?.priceModifier || 0;
    if (isWholesale) {
      const base = typeof item.product.wholesalePrice === 'number' ? item.product.wholesalePrice : 0;
      const unitPrice = base + modifier;
      return { unitPrice, originalUnitPrice: unitPrice, discountApplied: false, subtotal: unitPrice * item.quantity };
    }
    const base = typeof item.product.retailPrice === 'number' ? item.product.retailPrice : 0;
    const originalUnitPrice = base + modifier;
    if (item.product.retailPriceTiers && item.product.retailPriceTiers.length > 0) {
      const match = [...item.product.retailPriceTiers]
        .filter((t) => t.minQuantity <= item.quantity)
        .sort((a, b) => b.minQuantity - a.minQuantity);
      if (match.length > 0 && match[0].unitPrice < base) {
        const unitPrice = match[0].unitPrice + modifier;
        return { unitPrice, originalUnitPrice, discountApplied: true, subtotal: unitPrice * item.quantity };
      }
    }
    return { unitPrice: originalUnitPrice, originalUnitPrice, discountApplied: false, subtotal: originalUnitPrice * item.quantity };
  };

  const subtotal = items.reduce((acc, item) => acc + getItemPricing(item).subtotal, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, getItemPricing, clearCart, subtotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
};
