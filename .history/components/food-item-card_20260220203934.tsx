"use client"

import React, { useState } from "react" // قمنا بإضافة useState
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCartStore } from "@/lib/store"
import type { FoodItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Plus, X } from "lucide-react" // أضفنا أيقونة X لإغلاق النافذة

interface FoodItemCardProps {
  item: FoodItem
}

// مصفوفة الأوزان (بافتراض أن السعر الأساسي للمنتج هو سعر الـ 100 جرام)
const weightOptions = [
  { label: '10 جرام', multiplier: 0.1 },
  { label: '100 جرام', multiplier: 1 },
  { label: '250 جرام', multiplier: 2.5 },
  { label: '1 كيلو', multiplier: 10 },
]

export function FoodItemCard({ item }: FoodItemCardProps) {
  const { addItem } = useCartStore()
  
  // حالات التحكم في النافذة والوزن
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[2]) // الافتراضي 250 جرام

  // دالة لفتح النافذة بدلاً من الإضافة المباشرة
  const handleOpenModal = () => {
    setSelectedWeight(weightOptions[2]) // إعادة تعيين للوزن الافتراضي
    setIsModalOpen(true)
  }

  // دالة الإضافة الفعلية للسلة (تعمل من داخل النافذة)
  const handleConfirmAddToCart = () => {
    // حساب السعر الجديد بناءً على الوزن
    const finalPrice = item.price * selectedWeight.multiplier

    // إنشاء نسخة جديدة من المنتج بالوزن والسعر الجديد
    const itemToAdd = {
      ...item,
      // نعدل الـ ID والاسم عشان السلة تفهم إن ده نفس المنتج بس بوزن مختلف وماتدمجهمش غلط
      id: `${item.id}-${selectedWeight.label}`, 
      name: `${item.name} (${selectedWeight.label})`,
      price: finalPrice,
    }

    // إرسال المنتج لمخزن Zustand
    addItem(itemToAdd)

    // إظهار إشعار النجاح
    toast({
      title: "تمت الإضافة للسلة",
      description: `تمت إضافة ${itemToAdd.name} بنجاح.`,
    })

    // إغلاق النافذة
    setIsModalOpen(false)
  }

  return (
    <>
      {/* 1. الكارت الأساسي للمنتج */}
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative aspect-square">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {item.featured && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              Popular
            </div>
          )}
        </div>
        <CardContent className="pt-4 flex-1">
          <h3 className="font-semibold text-lg">{item.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{item.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-0">
          <span className="font-semibold">{formatCurrency(item.price)}</span>
          {/* الزرار هنا أصبح يفتح النافذة */}
          <Button size="sm" onClick={handleOpenModal}>
            <Plus className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>

      {/* 2. النافذة المنبثقة (Modal) التي ستظهر عند الضغط */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background w-full max-w-md rounded-xl shadow-2xl relative p-6 border animate-in fade-in zoom-in duration-200">
            
            {/* زر الإغلاق X */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-1 pr-6">{item.name}</h2>
            <p className="text-muted-foreground mb-4 text-sm">اختر الوزن المناسب:</p>

            {/* عرض السعر الديناميكي */}
            <div className="text-3xl font-bold text-primary mb-6">
              {formatCurrency(item.price * selectedWeight.multiplier)}
            </div>

            {/* أزرار اختيار الأوزان */}
            <div className="grid grid-cols-2 gap-3 mb-6" dir="rtl">
              {weightOptions.map((weight) => (
                <button
                  key={weight.label}
                  onClick={() => setSelectedWeight(weight)}
                  className={`py-3 px-4 rounded-lg border text-center font-medium transition-all ${
                    selectedWeight.label === weight.label
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                      : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {weight.label}
                </button>
              ))}
            </div>

            {/* زر تأكيد الإضافة للسلة */}
            <Button className="w-full h-12 text-lg" onClick={handleConfirmAddToCart}>
              تأكيد الإضافة - {selectedWeight.label}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}