import { redirect } from "next/navigation"

export default function RootPage() {
  // تحويل الزائر تلقائياً إلى صفحة الرئيسية الجديدة
  redirect("/home")
}