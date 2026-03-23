"use client"

import { useCartStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"

export function CartSummary() {
  const { getTotal } = useCartStore()

  const total = getTotal()

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between font-bold text-xl text-[#b8682b]">
        <span>الإجمالي</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
