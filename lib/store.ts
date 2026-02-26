import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, FoodItem } from "./types"

interface CartState {
  items: CartItem[]
  addItem: (item: FoodItem) => void
  updateItemQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)

          if (existingItem) {
            return {
              items: state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
            }
          }

          return {
            items: [...state.items, { ...item, quantity: 1 }],
          }
        }),

      updateItemQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== id),
            }
          }

          return {
            items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
          }
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    },
  ),
)
