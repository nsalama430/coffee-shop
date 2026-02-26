"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store"
import { formatCurrency } from "@/lib/utils"
import { Minus, Plus, Trash2 } from "lucide-react"

export function CartItemList() {
  const { items, updateItemQuantity, removeItem } = useCartStore()

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-0">
          <div className="relative h-20 w-20 overflow-hidden rounded-md">
            <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
            <p className="font-medium mt-1">{formatCurrency(item.price)}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <span className="w-8 text-center">{item.quantity}</span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(item.id)}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      ))}
    </div>
  )
}
