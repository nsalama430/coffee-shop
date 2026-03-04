import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "./types"

interface CartState {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  updateItemQuantity: (id: string, size: CartItem['size'], quantity: number) => void
  removeItem: (id: string, size: CartItem['size']) => void
  clearCart: () => void
  getTotal: () => number
  getCartItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) =>
        set((state) => {
          // Check if the item with the same id and size already exists
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.size === item.size
          );

          if (existingItem) {
            // If it exists, map over the items and update the quantity of the matching item
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.size === item.size
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            };
          }

          // If it doesn't exist, add the new item to the cart
          return {
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
          }
        }),

      updateItemQuantity: (id, size, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            // Remove the item if quantity is 0 or less
            return {
              items: state.items.filter((item) => !(item.id === id && item.size === size)),
            }
          }

          return {
            items: state.items.map((item) =>
              item.id === id && item.size === size ? { ...item, quantity } : item
            ),
          }
        }),

      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter((item) => !(item.id === id && item.size === size)),
        })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((total, item) => {
          // Find the price for the specific size of the item
          const sizeDetails = item.sizes?.find(s => s.name === item.size);
          const price = sizeDetails ? sizeDetails.price : 0;
          return total + price * item.quantity;
        }, 0);
      },
      
      getCartItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: "cart-storage",
    },
  ),
)
