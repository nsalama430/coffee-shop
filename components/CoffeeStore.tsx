"use client"; 

import React, { useState } from 'react';

// تعريف نوع بيانات المنتج لـ TypeScript
export type Product = {
  id: number | string;
  name: string;
  price: number;
  image?: string;
};

// تعريف الخصائص (Props) التي سيستقبلها المكون
type CoffeeStoreProps = {
  products: Product[];
};

const weightOptions = [
  { label: '10 جرام', priceMultiplier: 0.1 },
  { label: '100 جرام', priceMultiplier: 1 },
  { label: '250 جرام', priceMultiplier: 2.2 },
  { label: '1 كيلو', priceMultiplier: 8 },
];

export default function CoffeeStore({ products }: CoffeeStoreProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[2]); 

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedWeight(weightOptions[2]); 
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const finalPrice = selectedProduct.price * selectedWeight.priceMultiplier;
    const itemToAdd = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      weight: selectedWeight.label,
      price: finalPrice,
      quantity: 1
    };
    
    // هنا سنربطها بـ Zustand لاحقاً
    console.log('تمت الإضافة للسلة:', itemToAdd);
    alert(`تمت إضافة ${itemToAdd.name} بوزن ${itemToAdd.weight} إلى السلة!`);
    closeModal();
  };

  if (!products || products.length === 0) {
    return <div className="text-center p-8 text-xl">جاري تحميل المنتجات...</div>;
  }

  return (
    <div className="p-8 font-sans" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded-lg shadow-sm bg-white">
            <div className="relative h-48 mb-4 w-full bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
              صورة {product.name}
            </div>
            <h2 className="text-lg font-bold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">يبدأ من ${product.price}</p>
            <button 
              onClick={() => openProductModal(product)}
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
            >
              عرض الخيارات
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button onClick={closeModal} className="absolute top-3 left-3 text-gray-500 hover:text-red-500 text-2xl font-bold leading-none">&times;</button>
            <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
            <p className="text-xl text-orange-600 font-bold mb-4">
              ${(selectedProduct.price * selectedWeight.priceMultiplier).toFixed(2)}
            </p>
            <p className="text-gray-600 mb-4">اختر وزن العبوة:</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {weightOptions.map((weight) => (
                <button
                  key={weight.label}
                  onClick={() => setSelectedWeight(weight)}
                  className={`py-2 px-4 rounded border transition-all ${selectedWeight.label === weight.label ? 'bg-orange-100 border-orange-500 text-orange-700 font-bold' : 'bg-white border-gray-300 text-gray-700'}`}
                >
                  {weight.label}
                </button>
              ))}
            </div>
            <button onClick={handleAddToCart} className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition text-lg shadow-md">
              إضافة للسلة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}