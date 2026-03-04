import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatImagePath(src: string | undefined | null): string {
  if (!src) {
    return "/placeholder.svg";
  }

  // إذا كان الرابط خارجي (Cloudinary, Firebase Storage, etc.) يرجع زي ما هو
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // إذا كان مسار محلي يبدأ بـ / يرجع زي ما هو
  if (src.startsWith("/")) {
    return src;
  }

  // لو مسار ملف محلي من جهاز (مثل C:\Users\...\image.png)
  let imagePath = src.replace(/"/g, '');
  const parts = imagePath.split(/[\\/]/);
  const filename = parts[parts.length - 1];

  if (!filename) {
    return "/placeholder.svg";
  }

  return `/${filename}`;
}
