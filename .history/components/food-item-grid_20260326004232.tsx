"use client"

import { useEffect, useState } from "react"
import { FoodItemCard } from "@/components/food-item-card"
import { FoodItemSkeleton } from "@/components/food-item-skeleton"
import { useOrderStore } from "@/lib/orderStore"
import type { FoodItem } from "@/lib/types"

interface FoodItemGridProps {
  category?: string | null
  featured?: boolean
  limit?: number
  blendType?: string | null
  roastLevel?: string | null
}

export function FoodItemGrid({ category = null, featured = false, limit, blendType = null, roastLevel = null }: FoodItemGridProps) {
  const { products, isProductsLoading } = useOrderStore()
  const [items, setItems] = useState<FoodItem[]>([])

  useEffect(() => {
    // تحويل المنتجات من المخزن الجديد (orderStore) إلى الشكل الذي يتوقعه الكارت (FoodItem)
    let filteredItems: FoodItem[] = products.map((product) => {
      let foodItemSizes: any[] = [];
      
      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        foodItemSizes = product.sizes.map((s: any) => ({
          name: s.name,
          price: Number(s.price),
          images: s.images || [s.image || product.image || "/placeholder.svg"]
        }));
      } else if (product.sizes && typeof product.sizes === 'object' && !Array.isArray(product.sizes)) {
        const sizeOrder: any[] = ["50g", "100g", "250g"];
        sizeOrder.forEach(key => {
          const sizeData = (product.sizes as Record<string, { price: number; image: string }>)?.[key];
          if (sizeData && Number(sizeData.price) > 0) {
            foodItemSizes.push({
              name: key,
              price: Number(sizeData.price),
              images: [sizeData.image || product.image || "/placeholder.svg"],
            });
          }
        });
      }

      if (foodItemSizes.length === 0) {
        foodItemSizes = [{ 
          name: "100g", 
          price: Number(product.price) || 0, 
          images: [product.image || "/placeholder.svg"] 
        }];
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description || product.category,
        categoryId: product.categoryId || product.category,
        featured: false,
        roastLevel: (product.roastLevel as any) || "وسط",
        blendType: (product.blendType as any) || "سادة",
        sizes: foodItemSizes
      };
    });

    if (category) {
      filteredItems = filteredItems.filter((item) => item.categoryId === category)
    }

    if (featured) {
      filteredItems = filteredItems.filter((item) => item.featured)
    }

    if (blendType) {
      filteredItems = filteredItems.filter((item) => item.blendType === blendType)
    }

    if (roastLevel) {
      filteredItems = filteredItems.filter((item) => item.roastLevel === roastLevel)
    }

    if (limit) {
      filteredItems = filteredItems.slice(0, limit)
    }

    setItems(filteredItems)
  }, [category, featured, limit, products, blendType, roastLevel])

  if (isProductsLoading) {
    return (
      <div className="flex flex-wrap justify-center gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="w-[260px] md:w-[280px] flex-shrink-0"><FoodItemSkeleton /></div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12" dir="rtl">
        <h3 className="text-lg font-medium">لم يتم العثور على منتجات</h3>
        <p className="text-muted-foreground mt-2">حاول اختيار تصنيف مختلف أو تحقق مرة أخرى لاحقاً.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {items.map((item) => (
        <div key={item.id} className="w-[260px] md:w-[280px] flex-shrink-0">
          <FoodItemCard item={item} />
        </div>
      ))}
    </div>
  )
}
