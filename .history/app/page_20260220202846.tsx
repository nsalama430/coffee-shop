import { FoodCategories } from "@/components/food-categories"
import { FoodItemGrid } from "@/components/food-item-grid"
import { PromoBanner } from "@/components/promo-banner"

// 1. استدعاء المكون الجديد اللي عملناه
import CoffeeStore from "@/components/CoffeeStore" 

// 2. المنتجات المؤقتة للتجربة (لحد ما نربطها بالداتا بتاعتك)
const sampleProducts = [
  { id: 101, name: 'بن يمني أصيل', price: 25 },
  { id: 102, name: 'بن برازيلي محمص', price: 18 },
  { id: 103, name: 'بن إثيوبي', price: 22 },
];

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

      {/* 3. ده القسم الجديد بتاعنا اللي هيعرض منتجات البن */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-right">أضف للسلة (البن)</h2>
        <CoffeeStore products={sampleProducts} />
      </section>

    </main>
  )
}