import { create } from 'zustand';
import { persist, createJSONStorage } from "zustand/middleware"

interface CartItem {
  id: string;
  name: string;
  imagesrc: string;
  price: number;
  quantity: number;
  productId: string;
};

export type Discount = {
  id: string;
  percent: number;
  code: string;
};

interface CartStore {
  cart: CartItem[];
  total: number;
  discount: Discount | null;
  addItem: (item: CartItem) => void;
  setDiscount: (discount: Discount) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

const useCartStore = create<CartStore>()(
  persist(
    set => ({
      cart: [],
      total: 0,
      discount: null,
      setDiscount: (discount: Discount | null) => set((state) => ({
        discount: discount
      })),
      addItem: (item) => set((state) => ({
        cart: [...state.cart, item]
      })),
      removeItem: (itemId) => set((state) => ({
        cart: state.cart.filter(item => item.id !== itemId)
      })),
      clearCart: () => set(() => ({
        cart: []
      })),
      calculateTotal: () => set((state) => ({
        total: state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
      })),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => typeof window !== "undefined" ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      })
    }
  )
);

export default useCartStore;
