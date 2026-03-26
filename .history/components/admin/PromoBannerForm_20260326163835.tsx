"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useAdminStore } from '@/lib/adminStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagePlus, Loader2, X, Edit, Trash2, PlusCircle } from "lucide-react";

const CLOUDINARY_CLOUD_NAME = "dfeisclog";
const CLOUDINARY_UPLOAD_PRESET = "coffee-shop";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "banners");

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("فشل رفع الصورة على Cloudinary");
    }

    const data = await response.json();
    return data.secure_url as string;
}

interface BannerEditorProps {
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
    initialBanner?: any;
}

// هذا المكون هو الفورم الخاص بتعديل أو إضافة بانر واحد، وسيظهر داخل النافذة المنبثقة (Modal)
function BannerEditor({ onSave, onCancel, initialBanner }: BannerEditorProps) {
    const [title, setTitle] = useState(initialBanner?.title || '');
    const [subtitle, setSubtitle] = useState(initialBanner?.subtitle || '');
    const [image, setImage] = useState(initialBanner?.image || '');
    const [isVisible, setIsVisible] = useState(initialBanner?.isVisible ?? true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({ title, subtitle, image, isVisible });
        } catch (error) {
            alert('حدث خطأ أثناء حفظ البانر. تأكد من اتصالك بالإنترنت.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localPreview = URL.createObjectURL(file);
        setImage(localPreview);
        setIsUploading(true);

        try {
            const cloudinaryUrl = await uploadToCloudinary(file);
            setImage(cloudinaryUrl);
        } catch (error) {
            console.error("Error uploading image:", error);
            setImage(initialBanner?.image || ''); // الرجوع للصورة القديمة عند الفشل
            alert("حدث خطأ أثناء رفع الصورة.");
        } finally {
            setIsUploading(false);
        }
    };

    const clearImage = () => {
        setImage('');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{initialBanner ? 'تعديل البانر' : 'إضافة بانر جديد'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onCancel}><X /></Button>
                </div>
                <CardDescription>
                    املأ التفاصيل التالية للبانر الإعلاني.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-700">
                        <input
                            type="checkbox"
                            id="promo-visible"
                            checked={isVisible}
                            onChange={(e) => setIsVisible(e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-600 cursor-pointer"
                        />
                        <Label htmlFor="promo-visible" className="cursor-pointer text-base font-bold">تفعيل وإظهار البانر للعملاء</Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="promo-title">العنوان الرئيسي</Label>
                        <Input
                            id="promo-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="مثال: خصم 20% على كل شيء!"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="promo-subtitle">النص الفرعي</Label>
                        <Input
                            id="promo-subtitle"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="مثال: استخدم كود SUMMER20"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>صورة البانر (اختياري)</Label>
                        {image ? (
                            <div className="relative group w-full h-40 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
                                <img
                                    src={image}
                                    alt="صورة البانر"
                                    className="w-full h-full object-cover"
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                                    </div>
                                )}
                                {!isUploading && (
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">اضغط لرفع صورة من جهازك</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
                        <Button type="submit" disabled={isUploading || isSaving}>
                            {isUploading ? "جاري الرفع..." : isSaving ? "جاري الحفظ..." : "حفظ البانر"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// هذا هو المكون الرئيسي الجديد لإدارة جميع البانرات
export function PromoBannerForm() {
    // ملاحظة: نفترض هنا أن `useAdminStore` تم تعديلها لتعمل مع مصفوفة من البانرات
    // بدلاً من متغيرات فردية لكل بانر
    const { banners, addBanner, updateBanner, deleteBanner } = useAdminStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBanner, setCurrentBanner] = useState(null); // البانر الذي يتم تعديله حالياً

    const handleAddNew = () => {
        setCurrentBanner(null); // لا يوجد بانر حالي عند الإضافة
        setIsModalOpen(true);
    };

    const handleEdit = (banner) => {
        setCurrentBanner(banner);
        setIsModalOpen(true);
    };

    const handleDelete = async (bannerId) => {
        if (window.confirm('هل أنت متأكد من حذف هذا البانر؟ لا يمكن التراجع عن هذا الإجراء.')) {
            try {
                await deleteBanner(bannerId);
                alert('تم حذف البانر بنجاح.');
            } catch (error) {
                alert('حدث خطأ أثناء حذف البانر.');
            }
        }
    };

    const handleSave = async (bannerData) => {
        if (currentBanner) {
            await updateBanner(currentBanner.id, bannerData);
        } else {
            await addBanner(bannerData);
        }
        setIsModalOpen(false);
        setCurrentBanner(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>إدارة البانرات الإعلانية</CardTitle>
                <CardDescription>
                    أضف، عدّل، أو احذف البانرات التي تظهر للعملاء في الصفحة الرئيسية.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-end mb-6">
                    <Button onClick={handleAddNew} className="flex items-center gap-2">
                        <PlusCircle size={18} />
                        <span>إضافة بانر جديد</span>
                    </Button>
                </div>

                <div className="space-y-3">
                    {banners && banners.length > 0 ? (
                        banners.map(banner => (
                            <div key={banner.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50 dark:bg-zinc-800/50">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <img src={banner.image || '/placeholder.svg'} alt={banner.title} className="w-24 h-12 object-cover rounded-md bg-gray-200" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold truncate">{banner.title}</p>
                                        <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${banner.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {banner.isVisible ? 'مُفعّل' : 'مُعطّل'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)} aria-label="تعديل">
                                        <Edit size={18} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(banner.id)} aria-label="حذف">
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">لا توجد بانرات حالياً. قم بإضافة بانر جديد.</p>
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" dir="rtl">
                        <div className="bg-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                           <BannerEditor 
                                onSave={handleSave} 
                                onCancel={() => setIsModalOpen(false)} 
                                initialBanner={currentBanner} 
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
