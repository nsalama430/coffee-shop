"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { categories } from "@/lib/data"

interface FoodCategoriesProps {
  onSelectCategory?: (category: string | null) => void
  selectedCategory?: string | null
}

export function FoodCategories({ onSelectCategory, selectedCategory }: FoodCategoriesProps) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-2 pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            className={cn("whitespace-nowrap")}
            onClick={() => onSelectCategory?.(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
