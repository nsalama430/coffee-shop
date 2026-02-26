"use client"

import { useCartStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"

export function CartSummary() {
  const { items } = useCartStore()

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  const deliveryFee = subtotal > 0 ? 2.99 : 0
  const total = subtotal + deliveryFee

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      <div className="flex justify-between">
        <span>Delivery Fee</span>
        <span>{formatCurrency(deliveryFee)}</span>
      </div>

      <div className="border-t pt-4 flex justify-between font-medium text-lg">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
