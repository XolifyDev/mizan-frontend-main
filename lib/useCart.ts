"use client";

import useCartStore from './useCartStore';
import { CartItem, validateCartItem } from './cartItemSchema';

const useCart = () => {
  const { cart, addItem, removeItem, clearCart, calculateTotal } = useCartStore();

  const addToCart = (item: CartItem) => {
    try {
      const validatedItem = validateCartItem(item);
      addItem(validatedItem);
    } catch (error: any) {
      console.error("Item validation failed:", error.message);
    }
  };

  const getTotal = () => {
    calculateTotal();
    return useCartStore.getState().total;
  };

  return {
    cart,
    addToCart,
    removeFromCart: removeItem,
    clearCart,
    getTotal
  };
};

export default useCart;

