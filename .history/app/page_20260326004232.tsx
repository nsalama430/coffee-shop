"use client"
import { useEffect } from "react"
import { useOrderStore } from "@/lib/orderStore"
import { useAdminStore } from "@/lib/adminStore"
import { FoodItemCard } from "@/components/food-item-card"
import type { FoodItem, Size } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function HomePage() {
  const { products, isProductsLoading } = useOrderStore()
  const { banners, isBannersLoading } = useAdminStore()
  const visibleBanners = banners?.filter(b => b.isVisible) || []

  // ترتيب البانرات: البانرات التي لا تحتوي على نصوص (صور فقط) تظهر أولاً
  const sortedBanners = [...visibleBanners].sort((a, b) => {
    const aHasText = !!(a.title || a.subtitle);
    const bHasText = !!(b.title || b.subtitle);
    if (!aHasText && bHasText) return -1; // الصورة بدون نص تأتي أولاً
    if (aHasText && !bHasText) return 1;
    return 0; // الحفاظ على الترتيب الأصلي لباقي البانرات
  });

  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      {isBannersLoading ? (
        <Skeleton className="w-full aspect-[21/9] md:aspect-[4/1] rounded-2xl" />
      ) : visibleBanners.length > 0 ? (
        <section className="w-full" dir="rtl">
          <Carousel className="w-full" opts={{ loop: visibleBanners.length > 1, direction: 'rtl' }}>
            <CarouselContent>
              {sortedBanners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <Card className="overflow-hidden border-0 shadow-sm rounded-2xl">
                    <CardContent className="flex aspect-[3/4] md:aspect-[16/9] items-center justify-center p-0 relative">
                      <img src={banner.image || '/placeholder.svg'} alt={banner.title || 'الواجهة الأساسية'} className="w-full h-full object-cover" />
                      {/* إخفاء الطبقة السوداء والنصوص إذا كان البانر عبارة عن صورة فقط */}
                      {(banner.title || banner.subtitle) && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white p-4">
                          {banner.title && <h2 className="text-2xl md:text-5xl font-black drop-shadow-xl">{banner.title}</h2>}
                          {banner.subtitle && <p className="mt-2 md:mt-4 text-sm md:text-xl drop-shadow-lg font-medium">{banner.subtitle}</p>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 w-10 h-10 bg-white/20 hover:bg-white/40 text-white border-none" />
            <CarouselNext className="right-4 w-10 h-10 bg-white/20 hover:bg-white/40 text-white border-none" />
          </Carousel>
        </section>
      ) : null}
      
      <section>
        <h2 className="text-2xl font-bold mb-4">أحدث المنتجات</h2>
        {isProductsLoading ? (
          <div className="flex flex-wrap justify-center gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[260px] md:w-[280px] space-y-4 flex-shrink-0">
                <Skeleton className="aspect-square w-full rounded-xl shadow-sm" />
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6">
            {products.map((product) => {
              // تحويل بيانات المنتج من Firestore لتناسب شكل الكارت
              let foodItemSizes: Size[] = [];

              // التعامل مع هيكل الأوزان الجديد (مصفوفة) فقط
              if (Array.isArray(product.sizes) && product.sizes.length > 0) {
                foodItemSizes = product.sizes.map((s: any) => ({
                  name: s.name,
                  price: Number(s.price),
                  images: (Array.isArray(s.images) && s.images.length > 0) ? s.images : [s.image || "/placeholder.svg"],
                }));
              }

              // 3. لو لم يتم العثور على أحجام بأي من الطريقتين، نستخدم السعر والصورة الافتراضية للمنتج
              if (foodItemSizes.length === 0) {
                foodItemSizes = [{ 
                  // استخدام اسم افتراضي أو ترك فارغاً حسب الحاجة
                  name: "حجم واحد", 
                  price: product.price, 
                  images: [product.image || "/placeholder.svg"] 
                }];
              }

              const foodItem: FoodItem = {
                id: product.id,
                name: product.name,
                description: product.description || product.category,
                categoryId: product.categoryId || product.category || 'coffee',
                featured: false,
                roastLevel: (product.roastLevel as FoodItem["roastLevel"]) || "وسط",
                blendType: (product.blendType as FoodItem["blendType"]) || "سادة",
                sizes: foodItemSizes
              }
              return (
                <div key={product.id} className="w-[260px] md:w-[280px] h-full flex-shrink-0">
                  <FoodItemCard item={foodItem} />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">لا توجد منتجات متاحة حالياً.</p>
          </div>
        )}
      </section>

      {/* سكشن التواصل أسفل الصفحة الرئيسية */}
      <section className="py-12 flex flex-col items-center justify-center text-center bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30 mt-12" dir="rtl">
        <h2 className="text-2xl font-bold text-[#b8682b] mb-4">عندك استفسار أو طلب خاص؟</h2>
        <p className="text-muted-foreground mb-6 max-w-md">إحنا دايماً هنا عشان نسمعك ونظبطلك مزاجك، تواصل معانا في أي وقت.</p>
        <Button asChild size="lg" className="bg-[#b8682b] hover:bg-[#904a17] text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg transition-transform hover:scale-105 border-none">
          <Link href="/contact" className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            تواصل معنا
          </Link>
        </Button>
      </section>

    </main>
  )
}