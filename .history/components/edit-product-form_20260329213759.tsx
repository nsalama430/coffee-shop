"use client"
import React, { useState, useRef, useEffect } from "react"
import { useOrderStore } from "@/lib/orderStore"
import type { FoodItem, Product } from "@/lib/types"
import { categories } from "@/lib/data"
import { ImagePlus, Loader2, X } from "lucide-react"

// ============================
// ⚙️ إعدادات Cloudinary
// ============================
const CLOUDINARY_CLOUD_NAME = "dfeisclog"       
const CLOUDINARY_UPLOAD_PRESET = "coffee-shop"  
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)
  formData.append("folder", "products")

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData?.error?.message || "فشل رفع الصورة على Cloudinary")
  }

  const data = await response.json()
  return data.secure_url as string
}

interface SizeEntry {
  id: number;
  name: string;
  price: number;
  image: string;
  uploading: boolean;
  preview: string;
}

type RoastLevel = FoodItem["roastLevel"];
type BlendType = FoodItem["blendType"];

const roastLevels: RoastLevel[] = ["فاتح", "وسط", "غامق (محروق)"];
const blendTypes: BlendType[] = ["سادة", "محوج"];

interface EditProductFormProps {
  product: Product | FoodItem | any;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProductForm({ product, isOpen, onClose }: EditProductFormProps) {
  // تأكد من وجود دالة updateProduct في useOrderStore أو قم بتعديلها حسب الكود الخاص بك
  const { updateProduct } = useOrderStore() as any;

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    roastLevel: "وسط" as RoastLevel,
    blendType: "سادة" as BlendType,
    categoryId: "",
    ratio: "100",
    derivativeType: "نسكافيه كلاسيك",
    flavor: "كلاسيك",
  })
  const [sizes, setSizes] = useState<SizeEntry[]>([])
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // ============================
  // 🔄 تحميل بيانات المنتج للتعديل
  // ============================
  useEffect(() => {
    if (!product || !isOpen) return;

    setNewProduct({
      name: product.name || "",
      description: product.description || "",
      roastLevel: product.roastLevel || "وسط",
      blendType: product.blendType || "سادة",
      categoryId: product.categoryId || product.category || categories[0]?.id || "",
      ratio: product.ratio || "100",
      derivativeType: product.derivativeType || "نسكافيه كلاسيك",
      flavor: product.flavor || "كلاسيك",
    });

    let loadedSizes: SizeEntry[] = [];

    // التعامل مع هيكل الأوزان الجديد (مصفوفة) فقط
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      loadedSizes = product.sizes.map((s: any, index: number) => ({
        id: Date.now() + index,
        name: s.name,
        price: Number(s.price),
        image: (Array.isArray(s.images) && s.images.length > 0) ? s.images[0] : (s.image || ""),
        uploading: false,
        preview: ""
      }));
    }

    // لو لم يتم العثور على أوزان، نعرض الحجم الافتراضي
    if (loadedSizes.length === 0) {
      loadedSizes = [{
        id: Date.now(),
        name: "حجم واحد",
        price: product.price || 0,
        image: product.image || "",
        uploading: false,
        preview: ""
      }];
    }

    setSizes(loadedSizes);
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewProduct(prev => ({ ...prev, [name]: value }))
  }

  const handleRoastLevelChange = (level: RoastLevel) => {
    setNewProduct(prev => ({ ...prev, roastLevel: level }));
  };

  const handleBlendTypeChange = (type: BlendType) => {
    setNewProduct(prev => ({ ...prev, blendType: type }));
  };

  const handleCategoryChange = (value: string) => {
    setNewProduct(prev => ({ ...prev, categoryId: value }))
  }

  const handleSizeChange = (id: number, field: 'name' | 'price', value: string) => {
    setSizes(prevSizes => prevSizes.map(size => {
      if (size.id === id) {
        if (field === 'price') {
          return { ...size, price: parseFloat(value) || 0 };
        }
        return { ...size, [field]: value };
      }
      return size;
    }));
  };

  const addSize = () => {
    if (sizes.length < 10) {
      setSizes(prev => [...prev, { id: Date.now(), name: "", price: 0, image: "", uploading: false, preview: "" }]);
    }
  };

  const removeSize = (id: number) => {
    if (sizes.length > 1) {
      setSizes(prev => prev.filter(s => s.id !== id));
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localPreview = URL.createObjectURL(file)
    setSizes(prevSizes => prevSizes.map(size => 
      size.id === id ? { ...size, uploading: true, preview: localPreview } : size
    ));

    try {
      const cloudinaryUrl = await uploadToCloudinary(file)
      setSizes(prevSizes => prevSizes.map(size => 
        size.id === id ? { ...size, image: cloudinaryUrl, uploading: false } : size
      ));
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error)
      setSizes(prevSizes => prevSizes.map(size => 
        size.id === id ? { ...size, uploading: false, preview: "" } : size
      ));
      alert("حدث خطأ أثناء رفع الصورة.")
    }
  }

  const clearImage = (id: number) => {
    setSizes(prevSizes => prevSizes.map(size => 
      size.id === id ? { ...size, image: "", preview: "" } : size
    ));
    const fileInput = fileInputRefs.current[id.toString()];
    if (fileInput) {
      fileInput.value = "";
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validSizes = sizes
      .filter(s => s.name.trim() !== "" && s.price > 0)
      .map(s => ({
        name: s.name,
        price: s.price,
        images: [s.image || "/placeholder.svg"]
      }));

    if (validSizes.length === 0) {
      alert("يجب إضافة حجم وسعر واحد صالح على الأقل.");
      return;
    }

    const updatedProduct = {
      ...product, // الحفاظ على الـ ID القديم
      name: newProduct.name,
      description: newProduct.description,
      roastLevel: newProduct.roastLevel,
      blendType: newProduct.blendType,
      ratio: newProduct.ratio,
      derivativeType: newProduct.derivativeType,
      flavor: newProduct.flavor,
      categoryId: newProduct.categoryId,
      sizes: validSizes,
      price: validSizes[0].price,
      image: validSizes[0].images[0],
      category: categories.find(c => c.id === newProduct.categoryId)?.name || newProduct.categoryId
    }

    // استدعاء دالة التحديث (تأكد أن الدالة اسمها updateProduct في الستور الخاص بك)
    if (updateProduct) {
      updateProduct(product.id, updatedProduct);
    } else {
      console.error("⚠️ لم يتم العثور على دالة updateProduct في الـ store.");
    }
    
    onClose()
  }

  const isAnyUploading = sizes.some(s => s.uploading)
  
  const productType = newProduct.categoryId === 'اسـبريـسو' ? 'espresso' : newProduct.categoryId === 'مشتقات القهوة' ? 'derivatives' : 'coffee';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-6">
      <div className="admin-card w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-8 border-b border-[#D8D2C2] pb-4 sticky top-0 bg-inherit z-10">
          <h2 className="text-2xl font-black text-[var(--admin-text)]">تعديل بيانات المنتج</h2>
          <button onClick={onClose} className="text-3xl hover:text-red-500 transition text-[var(--admin-text)]">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4 p-1">
            <h3 className="text-xl font-bold text-center text-[var(--admin-text)] border-b-2 border-[#D8D2C2] pb-2 mb-6">تفاصيل المنتج الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">اسم نوع البن</label>
                <input name="name" value={newProduct.name} onChange={handleChange} type="text" className="w-full p-3 rounded-lg border admin-border bg-white/50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-[#B17457] text-[var(--admin-text)]" placeholder="مثلاً: بن يمني إكسبريسو" required />
              </div>
              {productType === 'coffee' && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">درجة التحميص</label>
                    <div className="flex gap-2">
                      {roastLevels.map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleRoastLevelChange(level)}
                          className={`flex-1 p-3 rounded-lg border transition-colors font-bold ${
                            newProduct.roastLevel === level
                              ? 'bg-[#B17457] text-white border-[#B17457]'
                              : 'bg-white/50 dark:bg-gray-800 admin-border text-[var(--admin-text)] hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {level === "غامق (محروق)" ? "غامق" : level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">التوليفة</label>
                    <div className="flex gap-2">
                      {blendTypes.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleBlendTypeChange(t)}
                          className={`flex-1 p-3 rounded-lg border transition-colors font-bold ${
                            newProduct.blendType === t
                              ? 'bg-[#B17457] text-white border-[#B17457]'
                              : 'bg-white/50 dark:bg-gray-800 admin-border text-[var(--admin-text)] hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {productType === 'espresso' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">النسبة</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2 flex-wrap justify-center">
                      {['90:10', '80:20', '70:30', '60:40', '50:50', '40:60', '30:70', '20:80', '10:90'].map(ratioVal => (
                        <button
                          key={ratioVal}
                          type="button"
                          onClick={() => setNewProduct(prev => ({ ...prev, ratio: ratioVal }))}
                          className={`flex-1 min-w-[80px] p-3 rounded-lg border transition-colors font-bold ${
                            newProduct.ratio === ratioVal
                              ? 'bg-[#B17457] text-white border-[#B17457]'
                              : 'bg-white/50 dark:bg-gray-800 admin-border text-[var(--admin-text)] hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          dir="ltr"
                        >
                          {ratioVal}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setNewProduct(prev => ({ ...prev, ratio: '100' }))}
                        className={`w-full sm:w-1/3 p-3 rounded-lg border transition-colors font-bold ${
                          newProduct.ratio === '100'
                            ? 'bg-[#B17457] text-white border-[#B17457]'
                            : 'bg-white/50 dark:bg-gray-800 admin-border text-[var(--admin-text)] hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        dir="ltr"
                      >
                        100
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {productType === 'derivatives' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">النوع (تصنيف المشروب)</label>
                    <div className="flex gap-2 flex-wrap">
                      {['نسكافيه كلاسيك', 'نسكافيه جولد', 'بندق فلافر', 'بندق قطع', 'هوت شوكلت', 'قهوة شوكولاتة', 'كابيتشينو'].map(dType => (
                        <button
                          key={dType}
                          type="button"
                          onClick={() => setNewProduct(prev => ({ ...prev, derivativeType: dType }))}
                          className={`flex-1 min-w-[100px] p-3 rounded-lg border transition-colors font-bold ${
                            newProduct.derivativeType === dType
                              ? 'bg-[#B17457] text-white border-[#B17457]'
                              : 'bg-white/50 dark:bg-gray-800 admin-border text-[var(--admin-text)] hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {dType}
                        </button>
                      ))}
                    </div>
                  </div>
                  {newProduct.derivativeType === 'كابيتشينو' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">نكهة الكابيتشينو</label>
                      <div className="flex gap-2 flex-wrap">
                        {['بندق', 'كراميل', 'فانيليا', 'كلاسيك'].map(f => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setNewProduct(prev => ({ ...prev, flavor: f }))}
                            className={`flex-1 min-w-[80px] p-3 rounded-lg border transition-colors font-bold ${
                              newProduct.flavor === f
                                ? 'bg-[#B17457] text-white border-[#B17457]'
                                : 'bg-white/50 dark:bg-gray-800 admin-border text-[var(--admin-text)] hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {productType === 'coffee' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">التصنيف</label>
                  <div className="flex gap-2 flex-wrap">
                    {categories.filter(c => c.id !== 'اسـبريـسو' && c.id !== 'مشتقات القهوة').map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryChange(category.id)}
                        className={`flex-1 min-w-[100px] p-3 rounded-lg border transition-colors font-bold ${
                          newProduct.categoryId === category.id
                            ? 'bg-[#B17457] text-white border-[#B17457]'
                            : 'bg-white/50 dark:bg-gray-800 admin-border text-[var(--admin-text)] hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2 text-[var(--admin-text)]">وصف النكهة</label>
                <textarea name="description" value={newProduct.description} onChange={handleChange} className="w-full p-3 rounded-lg border admin-border bg-white/50 dark:bg-gray-800 outline-none h-24 text-[var(--admin-text)]" placeholder="اكتبي تفاصيل الطعم والإيحاءات..."></textarea>
              </div>
            </div>
          </div>
          
          <div className="space-y-8 p-1">
            <h3 className="text-xl font-bold text-center text-[var(--admin-text)] border-b-2 border-[#D8D2C2] pb-2 mb-6">تعديل الأوزان والأسعار</h3>
            
            {sizes.map((size) => (
              <div key={size.id} className="p-4 border rounded-lg admin-border space-y-4 bg-white/20 dark:bg-white/5 relative">
                {sizes.length > 1 && (
                  <button type="button" onClick={() => removeSize(size.id)} className="absolute -top-3 -left-3 bg-red-500 text-white rounded-full p-1 w-7 h-7 flex items-center justify-center shadow-md hover:bg-red-600">
                    <X size={16} />
                  </button>
                )}
                <h4 className="font-bold text-[var(--admin-text)] text-lg mb-2 border-b border-dashed border-gray-300 dark:border-gray-700 pb-2">
                  تعديل بيانات حجم: <span className="text-[#B17457]">{size.name || "جديد"}</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[var(--admin-text)]">الوزن (مثال: 250g)</label>
                    <input type="text" value={size.name} onChange={(e) => handleSizeChange(size.id, 'name', e.target.value)} className="w-full p-2 rounded-md border admin-border text-[var(--admin-text)] bg-white dark:bg-gray-800" placeholder="الوزن" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[var(--admin-text)]">تعديل السعر (ج.م)</label>
                    <input type="number" value={size.price === 0 ? '' : size.price} onChange={(e) => handleSizeChange(size.id, 'price', e.target.value)} className="w-full p-2 rounded-md border admin-border text-[var(--admin-text)] bg-white dark:bg-gray-800" placeholder="السعر" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 text-[var(--admin-text)]">تعديل الصورة</label>
                    {size.preview || size.image ? (
                      <div className="relative group w-full h-28 rounded-lg overflow-hidden border admin-border">
                        <img src={size.preview || size.image} alt={`${size.name} preview`} className="w-full h-full object-cover" />
                        {size.uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                          </div>
                        )}
                        {!size.uploading && (
                          <button type="button" onClick={() => clearImage(size.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-28 rounded-lg border-2 border-dashed admin-border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center">
                        <ImagePlus className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">اضغط لرفع صورة</span>
                        <input ref={el => { fileInputRefs.current[size.id.toString()] = el }} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, size.id)} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sizes.length < 10 && (
              <button type="button" onClick={addSize} className="w-full p-3 border-2 border-dashed admin-border rounded-lg text-[var(--admin-text)] font-bold hover:bg-white/30 dark:hover:bg-white/10 transition">
                + إضافة حجم جديد
              </button>
            )}
          </div>
          
          <div className="flex gap-4 mt-8 pt-4 border-t border-[#D8D2C2]">
            <button type="submit" disabled={isAnyUploading} className="admin-btn-primary flex-1 py-3 rounded-lg font-black text-white disabled:opacity-50 flex items-center justify-center gap-2">
              {isAnyUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</> : 'حفظ التعديلات'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-[#D8D2C2] rounded-lg font-bold transition text-[var(--admin-text)]">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  )
}