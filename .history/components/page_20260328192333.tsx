"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import { FoodItemGrid } from "@/components/food-item-grid"
import { ChevronLeft, ChevronRight } from "lucide-react"

// خريطة لتحويل الكلمات من الرابط إلى قيمها الأصلية في قاعدة البيانات
const slugToValue: Record<string, string> = {
  'sada': 'سادة',
  'mohawag': 'محوج',
  'fath': 'فاتح',
  'wast': 'وسط',
  'ghameq': 'غامق (محروق)',
  'classic': 'كلاسـيك',
  'gold': 'جولـد',
  'espresso': 'اسـبريـسو'
};

export default function SubCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string[] || []

  // نتوقع الرابط بهذا الشكل: [categoryId, blendType, roastLevel]
  const [categoryIdSlug, blendTypeSlug, roastLevelSlug] = slug

  // تحويل الكلمات الإنجليزية من الرابط إلى الكلمات العربية الصحيحة الموجودة في بياناتك
  const categoryName = slugToValue[categoryIdSlug] || categoryIdSlug
  const blendType = slugToValue[blendTypeSlug] || blendTypeSlug
  const roastLevel = slugToValue[roastLevelSlug] || roastLevelSlug

  // شريط التنقل (Breadcrumbs)
  const breadcrumbs = [
    { name: "الرئيسية", href: "/home" },
    { name: categoryName.replace('ـ', ''), href: `/home` },
    { name: `${blendType} ${roastLevel}`, href: "#" }
  ]

  return (
    <div className="container py-8" dir="rtl">
      <div className="flex items-center mb-8 text-sm text-muted-foreground">
        <button onClick={() => router.back()} className="flex items-center hover:text-primary transition-colors">
          <ChevronRight className="w-4 h-4 ml-1" />
          <span>العودة</span>
        </button>
        <span className="mx-2">/</span>
        <div className="flex items-center space-x-2 space-x-reverse">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.name}>
              {index > 0 && <ChevronLeft className="w-4 h-4 text-gray-400" />}
              <a href={crumb.href} className={`font-medium ${index === breadcrumbs.length - 1 ? 'text-primary' : 'hover:text-primary'}`}>
                {crumb.name}
              </a>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 text-primary">
        {`منتجات: ${categoryName.replace('ـ', '')} - ${blendType} ${roastLevel.replace(' (محروق)', '')}`}
      </h1>

      {/* استدعاء شبكة المنتجات مع تمرير الفلاتر الصحيحة */}
      <FoodItemGrid 
        category={categoryName} 
        blendType={blendType}
        roastLevel={roastLevel}
      />
    </div>
  )
}