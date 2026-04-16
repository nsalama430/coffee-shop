"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CartSummary } from "@/components/cart-summary"
import { useCartStore } from "@/lib/store"
import { useOrderStore } from "@/lib/orderStore"
import type { Order } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { EmptyState } from "@/components/empty-state"
import { ShoppingBag } from "lucide-react"
import { OrderReceipt } from "@/components/order-receipt"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, getTotal } = useCartStore()
  const { addOrder } = useOrderStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null)

  if (items.length === 0 && !showReceipt) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12" />}
        title="سلة التسوق فارغة"
        description="أضف بعض المنتجات لسلة التسوق قبل إتمام الطلب."
        action={<Button onClick={() => router.push("/menu")}>تصفح المنيو</Button>}
      />
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const customer = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      notes: formData.get("notes") as string,
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      customer,
      items,
      total: getTotal(),
      status: "جديد",
    }

    addOrder(newOrder)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "تم استلام طلبك بنجاح!",
        description: "قهوتك المفضلة قادمة إليك قريباً.",
      })
      setPlacedOrder(newOrder)
      setShowReceipt(true)
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <main className="container mx-auto px-4 py-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">إتمام الطلب</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold">بيانات التوصيل</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">الاسم الأول</Label>
                <Input id="firstName" name="firstName" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">اسم العائلة</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" name="phone" type="tel" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">عنوان التوصيل بالتفصيل</Label>
              <Textarea id="address" name="address" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
              <Textarea id="notes" name="notes" />
            </div>
            <Button className="w-full mt-4 bg-[#b8682b] hover:bg-[#904a17] text-white py-6 text-xl font-bold rounded-xl" size="lg" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب"}
            </Button>
          </form>
        </div>

        <div className="md:col-span-1">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4 text-center">ملخص الطلب</h2>
            <CartSummary />
          </div>
        </div>
      </div>

      {showReceipt && placedOrder && (
        <OrderReceipt
          order={placedOrder}
          onClose={() => {
            setShowReceipt(false)
            clearCart() // مسح السلة هنا عند الإغلاق
            router.push("/") // تحويل المستخدم للرئيسية
          }}
        />
      )}
    </main>
  )
}
