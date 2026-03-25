"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { FoodItem } from "@/lib/types"
import { formatCurrency, formatImagePath } from "@/lib/utils"
import { Plus } from "lucide-react"

interface FoodItemCardProps {
  item: FoodItem
}

export function FoodItemCard({ item }: FoodItemCardProps) {
  // Use the first size's image and price for the card display
  const rawImage = item.sizes?.[0]?.images?.[0] || (item as any).image;
  const displayImage = formatImagePath(rawImage || "/placeholder.svg");
  const displayPrice = item.sizes?.[0]?.price || (item as any).price;

  return (
    <Link href={`/product/${item.id}`} className="group">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-square">
          <Image
            src={displayImage}
            alt={item.name}
            fill
            unoptimized
            className="object-contain p-2 bg-white dark:bg-zinc-800 transition-transform duration-300 group-hover:scale-105"
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
          {displayPrice !== undefined ? (
            <span className="font-semibold">{formatCurrency(displayPrice)}</span>
          ) : (
            <span className="text-sm text-muted-foreground">See details</span>
          )}
          <Button size="sm" asChild>
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              <span>View</span>
            </div>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
