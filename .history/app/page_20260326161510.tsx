"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export default function HomePage() {

  return (
    <main className="py-6">
      <div className="container mx-auto px-4 space-y-12">
        {/* سكشن التواصل أسفل الصفحة الرئيسية */}
        <section className="py-12 flex flex-col items-center justify-center text-center bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30 mt-12" dir="rtl">
          <h2 className="text-2xl font-bold text-[#b8682b] mb-4">عندك استفسار أو طلب خاص؟</h2>
          <p className="text-muted-foreground mb-6 max-w-md">إحنا دايماً هنا عشان نسمعك ونظبطلك مزاجك، تواصل معانا في أي وقت.</p>
          <Button asChild size="lg" className="bg-[#b8682b] hover:bg-[#904a17] text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg transition-transform hover:scale-105 border-none">
            <Link href="/contact" className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              تواصل معنا
            </Link>
          </Button>
        </section>
      </div>
    </main>
  )
}