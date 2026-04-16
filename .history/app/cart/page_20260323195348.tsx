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
        title="سلة التسوق فارغة"
        description="أضف بعض المنتجات الرائعة لسلة التسوق وستظهر هنا."
        action={<Button onClick={() => router.push("/menu")}>تصفح المنيو</Button>}
      />
    )
  }

  return (
    <main className="container mx-auto px-4 py-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">سلة التسوق</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <CartItemList />
        </div>

        <div className="md:col-span-1">
          <CartSummary />
          <Button className="w-full mt-4 bg-[#b8682b] hover:bg-[#904a17] text-white py-6 text-lg font-bold" size="lg" onClick={() => router.push("/checkout")}>
            إتمام الطلب
          </Button>
        </div>
      </div>
    </main>
  )
}
