"use client";

import React from 'react';
import { CheckCircle, Printer, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/lib/types';

interface OrderReceiptProps {
  order: Order;
  onClose: () => void;
}

export function OrderReceipt({ order, onClose }: OrderReceiptProps) {
  // دالة لطباعة الريسيت أو حفظه كـ PDF
  const handlePrint = () => {
    window.print();
  };

  // تجنب أخطاء الوقت إذا لم يكن موجوداً
  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 print:p-0 print:bg-transparent backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden print:shadow-none print:max-w-full">
        {/* رأس النافذة - يختفي عند الطباعة */}
        <div className="bg-primary/10 p-6 text-center relative print:hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-gray-500 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground shadow-lg">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-primary">تم استلام طلبك بنجاح!</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            جاري تجهيز طلبك، شكراً لتسوقك معنا.
          </p>
        </div>

        {/* محتوى الريسيت الفعلي */}
        <div className="p-6 md:p-8" id="receipt-content">
          <div className="text-center mb-6 border-b border-dashed border-gray-300 dark:border-gray-700 pb-6">
            <h1 className="text-2xl font-black mb-1">بن آسر</h1>
            <p className="text-sm text-gray-500">رقم الطلب: #{order.id.slice(-4)}</p>
            <p className="text-sm text-gray-500">التاريخ: {orderDate.toLocaleString('ar-EG')}</p>
          </div>

          {/* بيانات العميل */}
          <div className="mb-6">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-2">بيانات العميل</h3>
            <p className="font-semibold text-lg">{order.customer.firstName} {order.customer.lastName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer.phone}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer.address}</p>
          </div>

          {/* المنتجات */}
          <div className="mb-6">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">المنتجات</h3>
            <div className="space-y-3">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div className="flex-1 pl-4">
                    <p className="font-bold text-base">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-1">الكمية: {item.quantity} × {item.size || 'حجم افتراضي'}</p>
                  </div>
                  <div className="font-bold">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الإجمالي */}
          <div className="border-t border-dashed border-gray-300 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-xl font-black pt-2 border-t border-gray-100 dark:border-gray-800">
              <span>الإجمالي المطلوب</span>
              <span className="text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* ملاحظات */}
          {order.customer.notes && (
            <div className="mt-6 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-sm border border-gray-100 dark:border-zinc-700">
              <span className="font-bold text-primary">ملاحظات: </span>
              {order.customer.notes}
            </div>
          )}
        </div>

        {/* الأزرار (تختفي عند الطباعة) */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-950 flex gap-3 print:hidden">
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-foreground py-3 rounded-xl font-bold transition-colors">
            <Printer size={18} /> حفظ PDF
          </button>
          <button onClick={onClose} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-black transition-colors shadow-lg shadow-primary/20">
            متابعة التسوق
          </button>
        </div>
      </div>
      
      {/* تنسيقات الطباعة المخفية */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #receipt-content, #receipt-content * { visibility: visible; }
          #receipt-content { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
        }
      `}} />
    </div>
  );
}