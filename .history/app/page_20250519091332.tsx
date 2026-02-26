import { FoodCategories } from "@/components/food-categories"
import { FoodItemGrid } from "@/components/food-item-grid"
import { PromoBanner } from "@/components/promo-banner"

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      <PromoBanner />
      <section>
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <FoodCategories />
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4">Popular Items</h2>
        <FoodItemGrid featured={true} limit={4} />
      </section>
    </main>
  )
}
