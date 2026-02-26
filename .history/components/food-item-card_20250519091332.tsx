"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCartStore } from "@/lib/store"
import type { FoodItem } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

interface FoodItemCardProps {
  item: FoodItem
}

export function FoodItemCard({ item }: FoodItemCardProps) {
  const { addItem } = useCartStore()

  const handleAddToCart = () => {
    addItem(item)
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    })
  }

  return (
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
        <Button size="sm" onClick={handleAddToCart}>
          <Plus className="h-4 w-4 mr-1" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
