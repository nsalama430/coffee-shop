"use client"

import React, { useRef } from "react"
import Link from "next/link"
import { FoodItemCard } from "@/components/food-item-card"
import { Button } from "@/components/ui/button"
import type { FoodItem } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductRowProps {
  title: string
  items: FoodItem[]
  viewAllLink: string
}

export function ProductRow({ title, items, viewAllLink }: ProductRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!items || items.length === 0) {
    return null // لا تقم بعرض الصف إذا كان فارغاً
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return

    const { clientWidth } = scrollRef.current
    const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8

    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <div className="space-y-4 py-8">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="relative">
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-8 pt-4 scrollbar-hide -mx-4 px-4">
          {items.map((item) => (
            <div key={item.id} className="w-[260px] flex-shrink-0">
              <FoodItemCard item={item} />
            </div>
          ))}
        </div>
        <Button variant="outline" size="icon" className="absolute -right-2 md:right-0 top-1/2 z-10 -translate-y-1/2 bg-background/95 shadow-lg flex rounded-full w-9 h-9 md:w-10 md:h-10 hover:scale-105 transition-transform" onClick={() => scroll("right")}><ChevronRight className="h-5 w-5" /></Button>
        <Button variant="outline" size="icon" className="absolute -left-2 md:left-0 top-1/2 z-10 -translate-y-1/2 bg-background/95 shadow-lg flex rounded-full w-9 h-9 md:w-10 md:h-10 hover:scale-105 transition-transform" onClick={() => scroll("left")}><ChevronLeft className="h-5 w-5" /></Button>
      </div>
    </div>
  )
}