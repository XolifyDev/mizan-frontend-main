import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  imagesrc: string;
  price: number;
  quantity: number;
  productId: string;
}

interface CartStore {
  cart: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

const useCartStore = create<CartStore>((set) => ({
  cart: [],
  total: 0,
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
}));

export default useCartStore;
