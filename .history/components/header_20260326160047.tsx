"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, Menu, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store"
import { useAdminStore } from "@/lib/adminStore"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { getCartItemCount } = useCartStore()
  const { isAccessGranted, logout } = useAdminStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const totalItems = getCartItemCount()

  const routes = [
    { href: "/", label: "الرئيسية" },
    { href: "/contact", label: "تواصل معنا" },
  ]

  const handleAdminClick = () => {
    if (isAccessGranted) {
      logout() // قفل وضع الإدارة (يتحول لأحمر وتختفي الصلاحيات)
    } else {
      useAdminStore.setState({ showPasswordModal: true }) // إجبار فتح نافذة الباسورد
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold"> بن اّسـر</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === route.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
        {pathname.startsWith('/admin') && (
          <Button variant="outline" size="icon" onClick={handleAdminClick} title="وضع الإدارة">
            <Shield className={cn("h-5 w-5", isAccessGranted ? "text-green-500" : "text-destructive")} />
          </Button>
        )}
          <ThemeToggle />

          <Button variant="outline" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {isMounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "block px-2 py-2 text-base font-medium transition-colors hover:text-primary",
                  pathname === route.href ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}