"use client"
import React, { useState, useRef } from "react"
import { useOrderStore } from "@/lib/orderStore"
import type { FoodItem } from "@/lib/types"
import { categories } from "@/lib/data"
import { ImagePlus, Loader2, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ============================
// ⚙️ إعدادات Cloudinary
// ============================
// غيّر القيم دي بحسابك على Cloudinary
// يمكنك إيجادها من Dashboard -> Settings -> Upload -> Upload presets
const CLOUDINARY_CLOUD_NAME = "dfeisclog"       // ← ضع اسم حسابك هنا
const CLOUDINARY_UPLOAD_PRESET = "coffee-shop"  // ← ضع اسم الـ upload preset هنا (unsigned)
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

// ============================
// 🔧 دالة رفع الصور على Cloudinary
// ============================
// تستخدم Unsigned Upload (لا تحتاج API Secret)
// تأكد من إنشاء Upload Preset من نوع "unsigned" في Cloudinary Dashboard
async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)                          // الملف المراد رفعه
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET) // الـ preset المسبق الإعداد
  formData.append("folder", "products")                  // فولدر التخزين في Cloudinary

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData?.error?.message || "فشل رفع الصورة على Cloudinary")
  }

  const data = await response.json()
  // الـ secure_url هو رابط HTTPS للصورة المرفوعة
  return data.secure_url as string
}

// Helper to generate a unique ID
const generateId = () => `food_${new Date().getTime()}`

interface SizeData {
  price: number
  image: string       // رابط الصورة من Cloudinary (أو فارغ)
  uploading: boolean   // هل الصورة بترفع حالياً؟
  preview: string      // معاينة محلية مؤقتة قبل انتهاء الرفع
}

interface SizesState {
  "50g": SizeData
  "100g": SizeData
  "250g": SizeData
}

export function AddProductForm() {
  const [isOpen, setIsOpen] = useState(false)
  const { addProduct } = useOrderStore()

  const initialSizes: SizesState = {
    "50g": { price: 0, image: "", uploading: false, preview: "" },
    "100g": { price: 0, image: "", uploading: false, preview: "" },
    "250g": { price: 0, image: "", uploading: false, preview: "" },
  }
  const initialProductState = {
    name: "",
    description: "",
    roastLevel: "وسط" as FoodItem["roastLevel"],
    categoryId: categories[0]?.id || "",
  }

  const [newProduct, setNewProduct] = useState(initialProductState)
  const [sizes, setSizes] = useState<SizesState>(initialSizes)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewProduct(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setNewProduct(prev => ({ ...prev, categoryId: value }))
  }

  const handleSizePriceChange = (e: React.ChangeEvent<HTMLInputElement>, sizeName: keyof SizesState) => {
    const price = parseFloat(e.target.value) || 0
    setSizes(prev => ({
      ...prev,
      [sizeName]: { ...prev[sizeName], price },
    }))
  }

  // ============================
  // 📸 رفع الصورة على Cloudinary
  // ============================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, sizeName: keyof SizesState) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. عرض معاينة فورية من الملف المحلي
    const localPreview = URL.createObjectURL(file)
    setSizes(prev => ({
      ...prev,
      [sizeName]: { ...prev[sizeName], uploading: true, preview: localPreview },
    }))

    try {
      // 2. رفع الصورة على Cloudinary والحصول على الرابط
      const cloudinaryUrl = await uploadToCloudinary(file)

      // 3. حفظ رابط الصورة من Cloudinary في الـ state
      setSizes(prev => ({
        ...prev,
        [sizeName]: { ...prev[sizeName], image: cloudinaryUrl, uploading: false },
      }))
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error)
      setSizes(prev => ({
        ...prev,
        [sizeName]: { ...prev[sizeName], uploading: false, preview: "" },
      }))
      alert("حدث خطأ أثناء رفع الصورة. تأكد من إعدادات Cloudinary (CLOUD_NAME و UPLOAD_PRESET).")
    }
  }


  // مسح الصورة المرفوعة
  const clearImage = (sizeName: keyof SizesState) => {
    setSizes(prev => ({
      ...prev,
      [sizeName]: { ...prev[sizeName], image: "", preview: "" },
    }))
    if (fileInputRefs.current[sizeName]) {
      fileInputRefs.current[sizeName]!.value = ""
    }
  }

  // ============================
  // 💾 حفظ المنتج في Firestore
  // ============================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // تجميع بيانات الأحجام مع روابط الصور من Cloudinary
    const sizesData: Record<string, { price: number; image: string }> = {}
    for (const key of Object.keys(sizes) as Array<keyof SizesState>) {
      sizesData[key] = {
        price: sizes[key].price,
        image: sizes[key].image || "/placeholder.svg", // رابط Cloudinary أو placeholder
      }
    }

    // المنتج النهائي اللي هيتحفظ في Firestore
    const productToAdd = {
      id: generateId(),
      name: newProduct.name,
      description: newProduct.description,
      roastLevel: newProduct.roastLevel,
      categoryId: newProduct.categoryId,
      sizes: sizesData,
      // حقول التوافق مع عرض القوائم (بيستخدم حجم 100g كافتراضي)
      price: sizes["100g"].price || 0,
      image: sizes["100g"].image || "/placeholder.svg",
      category: categories.find(c => c.id === newProduct.categoryId)?.name || newProduct.categoryId
    }

    // حفظ في Firestore عبر الـ Store
    addProduct(productToAdd)
    setIsOpen(false)
    setNewProduct(initialProductState)
    setSizes(initialSizes)
  }

  // هل في صورة بيتم رفعها حالياً؟
  const isAnyUploading = Object.values(sizes).some(s => s.uploading)

  return (
    <div className="mt-8">
      <button 
        onClick={() => setIsOpen(true)}
        className="admin-btn-primary px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-white"
      >
        <span>+</span> إضافة صنف جديد للمحمصة
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-6">
          <div className="admin-card w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-8 border-b border-[#D8D2C2] pb-4 sticky top-0 bg-inherit z-10">
              <h2 className="text-2xl font-black text-[var(--admin-text)]">إضافة منتج جديد - بن آسر</h2>
              <button onClick={() => setIsOpen(false)} className="text-3xl hover:text-red-500 transition text-[var(--admin-text)]">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* تفاصيل المنتج الأساسية */}
              <div className="space-y-4 p-1">
                <h3 className="text-xl font-bold text-center text-[var(--admin-text)] border-b-2 border-[#D8D2C2] pb-2 mb-6">تفاصيل المنتج الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">اسم نوع البن</label>
                    <input name="name" value={newProduct.name} onChange={handleChange} type="text" className="w-full p-3 rounded-lg border admin-border bg-white/50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[#B17457] text-[var(--admin-text)]" placeholder="مثلاً: بن يمني إكسبريسو" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">درجة التحميص</label>
                    <select name="roastLevel" value={newProduct.roastLevel} onChange={handleChange} className="w-full p-3 rounded-lg border admin-border bg-white/50 dark:bg-gray-800 outline-none text-[var(--admin-text)]">
                      <option value="فاتح">فاتح</option>
                      <option value="وسط">وسط</option>
                      <option value="غامق (محروق)">غامق (محروق)</option>
                    </select>
                  </div>
                   <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">التصنيف</label>
                    <Select onValueChange={handleCategoryChange} value={newProduct.categoryId}>
                      <SelectTrigger className="w-full p-3 rounded-lg border admin-border bg-white/50 dark:bg-gray-800 outline-none text-[var(--admin-text)]">
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">وصف النكهة</label>
                    <textarea name="description" value={newProduct.description} onChange={handleChange} className="w-full p-3 rounded-lg border admin-border bg-white/50 dark:bg-gray-800 outline-none h-24 text-[var(--admin-text)]" placeholder="اكتبي تفاصيل الطعم والإيحاءات..."></textarea>
                  </div>
                </div>
              </div>

              {/* الأحجام والأسعار والصور */}
              <div className="space-y-8 p-1">
                <h3 className="text-xl font-bold text-center text-[var(--admin-text)] border-b-2 border-[#D8D2C2] pb-2 mb-6">الأحجام والأسعار والصور</h3>
                
                {(Object.keys(sizes) as Array<keyof SizesState>).map(sizeName => (
                  <div key={sizeName} className="p-4 border rounded-lg admin-border space-y-4 bg-white/20 dark:bg-white/5">
                    <h4 className="font-bold text-lg text-[var(--admin-text)]">حجم: {sizeName}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-bold mb-1 text-[var(--admin-text)]">السعر (ج.م)</label>
                        <input
                          type="number"
                          value={sizes[sizeName].price}
                          onChange={(e) => handleSizePriceChange(e, sizeName)}
                          className="w-full p-2 rounded-md border admin-border text-[var(--admin-text)] bg-white dark:bg-gray-800"
                          placeholder="السعر"
                          required
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-sm font-bold mb-1 text-[var(--admin-text)]">صورة المنتج</label>
                        
                        {/* منطقة المعاينة أو الرفع */}
                        {sizes[sizeName].preview || sizes[sizeName].image ? (
                          <div className="relative group w-full h-28 rounded-lg overflow-hidden border admin-border">
                            <img 
                              src={sizes[sizeName].preview || sizes[sizeName].image} 
                              alt={`${sizeName} preview`}
                              className="w-full h-full object-cover"
                            />
                            {/* سبينر أثناء الرفع */}
                            {sizes[sizeName].uploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                              </div>
                            )}
                            {/* زر حذف الصورة */}
                            {!sizes[sizeName].uploading && (
                              <button
                                type="button"
                                onClick={() => clearImage(sizeName)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-28 rounded-lg border-2 border-dashed admin-border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <ImagePlus className="w-8 h-8 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">اضغط لرفع صورة</span>
                            <input
                              ref={el => { fileInputRefs.current[sizeName] = el }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, sizeName)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 mt-8 pt-4 border-t border-[#D8D2C2]">
                <button 
                  type="submit" 
                  disabled={isAnyUploading}
                  className="admin-btn-primary flex-1 py-3 rounded-lg font-black text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnyUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري رفع الصور...
                    </>
                  ) : (
                    'حفظ في المخزن'
                  )}
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-3 border-2 border-[#D8D2C2] rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition text-[var(--admin-text)]">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
