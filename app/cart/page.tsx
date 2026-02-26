"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CartItemList } from "@/components/cart-item-list"
import { CartSummary } from "@/components/cart-summary"
import { useCartStore } from "@/lib/store"
import { EmptyState } from "@/components/empty-state"
import { ShoppingBag } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const { items } = useCartStore()

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12" />}
        title="Your cart is empty"
        description="Add some delicious items to your cart and they'll appear here."
        action={<Button onClick={() => router.push("/menu")}>Browse Menu</Button>}
      />
    )
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <CartItemList />
        </div>

        <div className="md:col-span-1">
          <CartSummary />
          <Button className="w-full mt-4" size="lg" onClick={() => router.push("/checkout")}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </main>
  )
}
