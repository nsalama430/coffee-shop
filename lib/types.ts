export interface FoodItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
  featured: boolean
}

export interface CartItem extends FoodItem {
  quantity: number
}

export interface Category {
  id: string
  name: string
}
