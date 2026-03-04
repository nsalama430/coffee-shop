export interface Size {
  name: "50g" | "100g" | "250g"
  price: number
  images: string[]
}

export interface FoodItem {
  id: string
  name: string
  description: string
  categoryId: string
  featured: boolean
  sizes: Size[]
  roastLevel: "فاتح" | "وسط" | "غامق (محروق)"
}

export interface CartItem extends FoodItem {
  quantity: number
  size: Size["name"]
}

export interface Category {
  id: string
  name: string
}

export type OrderStatus = "جديد" | "قيد التنفيذ" | "جاري الشحن" | "مكتمل";

export interface Order {
  id: string
  customer: {
    firstName: string
    lastName: string
    phone: string
    address: string
    notes?: string
  }
  items: CartItem[]
  total: number
  status: OrderStatus
  createdAt?: string | Date
  completedAt?: string | Date
}
