"use client"

import { useState } from "react"
import { FoodCategories } from "@/components/food-categories"
import { FoodItemGrid } from "@/components/food-item-grid"

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      <h1 className="text-3xl font-bold">Our Menu</h1>

      <div className="sticky top-16 z-10 bg-background pt-4 pb-2">
        <FoodCategories
          onSelectCategory={(category) => setSelectedCategory(category)}
          selectedCategory={selectedCategory}
        />
      </div>

      <FoodItemGrid category={selectedCategory} />
    </main>
  )
}
