import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <Link href="/" className="text-xl font-bold">
            بن اّسـر
          </Link>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            Delicious food delivered to your doorstep
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 md:items-end">
          <nav className="flex gap-4 text-sm">
            <Link href="/about" className="text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground">
              Contact
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
          </nav>
          <p className="text-center text-sm text-muted-foreground md:text-right">
            &copy; {new Date().getFullYear()} Tasty Bites. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
