import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function PromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="relative aspect-[2.5/1] md:aspect-[3.5/1] w-full">
        <Image src="/colorful-food-banner.png" alt="Special promotion" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-10">
        <h1 className="text-2xl md:text-4xl font-bold max-w-md">Enjoy 20% Off Your First Order!</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Use code WELCOME20 at checkout for a special discount on your first delivery.
        </p>
        <div className="mt-4">
          <Button asChild size="lg">
            <Link href="/menu">Order Now</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
