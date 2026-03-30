"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "../../config/firebase"
import { Coffee, Package, Users, ShoppingCart, BarChart3, History, Trash2, Edit, Save, X, Search, RotateCcw, Calendar, ArrowUpDown, LogOut, ShieldAlert, ChevronDown, PieChart as PieChartIcon, Key, Menu } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { AddProductForm } from "@/components/add-product-form"
import { PromoBannerForm } from "@/components/admin/PromoBannerForm";
import { EditProductForm } from "@/components/edit-product-form"
import { useOrderStore } from "@/lib/orderStore"
import { useAdminStore } from "@/lib/adminStore"
import type { Order, OrderStatus, Product } from "@/lib/types"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

export default function AdminDashboard() {
  const router = useRouter()
  const [loadingAuth, setLoadingAuth] = useState(true)
  const { isAccessGranted, logout: logoutAdmin, listenToBanners } = useAdminStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoadingAuth(false)
      } else {
        router.push('/admin-login')
      }
    })
    return () => unsubscribe()
  }, [router])

  const { 
    orders: storeOrders, 
    updateOrderStatus, 
    products: storeProducts, 
    removeProduct, 
    updateProduct,
    customers,
    initListener
  } = useOrderStore()

  const orders: Order[] = storeOrders || []
  const products = storeProducts || []
  const uniqueCustomers = customers || []

  const [activeTab, setActiveTab] = useState('orders')
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('newest')
  const [orderSearchTerm, setOrderSearchTerm] = useState('')
  const [visibleActiveCount, setVisibleActiveCount] = useState(5)
  const [visibleHistoryCount, setVisibleHistoryCount] = useState(5)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [salesChartRange, setSalesChartRange] = useState('7days')
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    initListener()
    const unsubBanners = listenToBanners()
    return () => {
      unsubBanners()
    }
  }, []) // إزالة التبعية لمنع إعادة التحميل اللانهائي وتجميد الصفحة

  const activeOrders = orders.filter((order) => order && order.status !== 'مكتمل')
  const historyOrders = orders.filter((order) => order && order.status === 'مكتمل')

  // المنتج الأكثر مبيعاً (Top Products)
  const productSalesCount = historyOrders.reduce((acc: Record<string, number>, order) => {
    if (order && order.items) {
      order.items.forEach((item: any) => {
        const itemName = item?.name || 'غير معروف';
        acc[itemName] = (acc[itemName] || 0) + (item?.quantity || 1);
      });
    }
    return acc;
  }, {});

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ef4444', '#eab308'];

  const topProductsData = Object.entries(productSalesCount)
    .map(([name, count], index) => ({
      name,
      value: count as number,
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // بيانات الرسم البياني (ديناميكية حسب الاختيار)
  let salesChartData: { name: string, total: number, orders: Order[] }[] = [];
  
  if (salesChartRange === '7days') {
    salesChartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i)) // ترتيب من الأقدم للأحدث
      const dateStr = d.toISOString().split('T')[0]
      const dayOrders = historyOrders.filter(order => {
        const orderDateStr = order?.completedAt || order?.createdAt
        return orderDateStr && new Date(orderDateStr).toISOString().split('T')[0] === dateStr
      })
      return { name: d.toLocaleDateString('ar-EG', { weekday: 'short' }), total: dayOrders.reduce((sum, order) => sum + (order?.total || 0), 0), orders: dayOrders }
    })
  } else if (salesChartRange === 'month') {
    salesChartData = Array.from({ length: 4 }).map((_, i) => {
      const dEnd = new Date();
      dEnd.setDate(dEnd.getDate() - (3 - i) * 7);
      const dStart = new Date(dEnd);
      dStart.setDate(dStart.getDate() - 6);
      const startStr = dStart.toISOString().split('T')[0];
      const endStr = dEnd.toISOString().split('T')[0];
      const weekOrders = historyOrders.filter(order => {
        const orderDateStr = order?.completedAt || order?.createdAt;
        if (!orderDateStr) return false;
        const orderDate = new Date(orderDateStr).toISOString().split('T')[0];
        return orderDate >= startStr && orderDate <= endStr;
      });
      return { name: `أسبوع ${i + 1}`, total: weekOrders.reduce((sum, order) => sum + (order?.total || 0), 0), orders: weekOrders }
    })
  } else if (salesChartRange === 'year') {
    const currentYear = new Date().getFullYear();
    salesChartData = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(currentYear, i, 1);
      const monthOrders = historyOrders.filter(order => {
        const orderDateStr = order?.completedAt || order?.createdAt;
        if (!orderDateStr) return false;
        const orderDate = new Date(orderDateStr);
        return orderDate.getMonth() === i && orderDate.getFullYear() === currentYear;
      });
      return { name: d.toLocaleDateString('ar-EG', { month: 'short' }), total: monthOrders.reduce((sum, order) => sum + (order?.total || 0), 0), orders: monthOrders }
    })
  }

  const statusOptions = [
    { value: 'جديد', label: 'جديد', color: 'bg-blue-100 text-blue-700' },
    { value: 'قيد التنفيذ', label: 'قيد التنفيذ', color: 'bg-orange-100 text-orange-700' },
    { value: 'جاري الشحن', label: 'جاري الشحن', color: 'bg-purple-100 text-purple-700' },
    { value: 'مكتمل', label: 'مكتمل', color: 'bg-green-100 text-green-700' },
  ]

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(o => o.value === status)
    return option ? option.color : 'bg-gray-100 text-gray-700'
  }

  const sortOrders = (ordersList: Order[]) => {
    return [...ordersList].filter(Boolean).sort((a, b) => {
      // دالة ذكية لاستخراج الوقت بشكل آمن سواء كان Firebase Timestamp أو نص
      const getSafeTime = (val: any) => {
        if (!val) return 0;
        if (typeof val === 'object' && val.seconds) return val.seconds * 1000;
        const t = new Date(val).getTime();
        return isNaN(t) ? 0 : t;
      };

      const dateA = getSafeTime(a?.completedAt || a?.createdAt);
      const dateB = getSafeTime(b?.completedAt || b?.createdAt);
      
      if (sortOption === 'newest') return dateB - dateA
      if (sortOption === 'oldest') return dateA - dateB
      if (sortOption === 'price-high') return (b?.total || 0) - (a?.total || 0)
      if (sortOption === 'price-low') return (a?.total || 0) - (b?.total || 0)
      return 0
    })
  }

  const filterOrders = (ordersList: Order[]) => {
    let filtered = ordersList.filter(Boolean)

    if (orderSearchTerm) {
      const term = orderSearchTerm.toLowerCase()
      filtered = filtered.filter(order => 
        (order?.id || '').toLowerCase().includes(term) ||
        `${order?.customer?.firstName || ''} ${order?.customer?.lastName || ''}`.toLowerCase().includes(term)
      )
    }

    if (startDate || endDate) {
      filtered = filtered.filter(order => {
        const orderDateVal = order?.completedAt || order?.createdAt;
        if (!orderDateVal) return false;
        
        let orderDateObj = new Date(orderDateVal);
        if (typeof orderDateVal === 'object' && (orderDateVal as any).seconds) {
          orderDateObj = new Date((orderDateVal as any).seconds * 1000);
        }
        
        if (isNaN(orderDateObj.getTime())) return false;
        
        // تنسيق التاريخ محلياً لمنع مشاكل فرق التوقيت مع UTC
        const year = orderDateObj.getFullYear();
        const month = String(orderDateObj.getMonth() + 1).padStart(2, '0');
        const day = String(orderDateObj.getDate()).padStart(2, '0');
        const orderDateStr = `${year}-${month}-${day}`;
        
        if (startDate && orderDateStr < startDate) return false;
        if (endDate && orderDateStr > endDate) return false;
        return true;
      })
    }

    return filtered
  }

  const resetFilters = () => {
    setOrderSearchTerm('')
    setStartDate('')
    setEndDate('')
    setShowSortMenu(false)
    setSortOption('newest')
    setVisibleActiveCount(5)
    setVisibleHistoryCount(5)
  }

  const filteredActiveOrders = filterOrders(activeOrders)
  const filteredHistoryOrders = filterOrders(historyOrders)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      logoutAdmin()
      router.push('/admin-login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--admin-bg)' }}>
        <div className="text-xl font-bold flex flex-col items-center gap-4 text-[var(--admin-text)]">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          جاري التحميل...
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout flex flex-col md:flex-row relative min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar - القائمة الجانبية */}
      <aside className={`admin-sidebar fixed md:relative inset-y-0 right-0 z-50 w-64 p-6 flex flex-col space-y-8 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 h-full md:h-auto overflow-y-auto`}>
        <div className="flex justify-between items-center border-b border-white/20 pb-4">
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <button className="md:hidden text-white hover:text-gray-300 transition" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="space-y-4 flex-1">
          {isAccessGranted && (
            <>
              <button 
                onClick={() => { setActiveTab('stats'); setIsSidebarOpen(false); }} 
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'stats' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
              >
                <BarChart3 size={20}/> الإحصائيات
              </button>
              <button 
                onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} 
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'products' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
              >
                <Package size={20}/> المنتجات
              </button>
              <button 
                onClick={() => { setActiveTab('customers'); setIsSidebarOpen(false); }} 
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'customers' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
              >
                <Users size={20}/> العملاء
              </button>
              <button 
                onClick={() => { setActiveTab('history'); setIsSidebarOpen(false); }} 
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'history' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
              >
                <History size={20}/> السجل
              </button>
              <button 
                onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} 
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'settings' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
              >
                <Key size={20}/> الإعدادات
              </button>
            </>
          )}
          <button 
            onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} 
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'orders' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
          >
            <ShoppingCart size={20}/> الطلبات
          </button>
        </nav>
        
        <div className="pt-8 border-t border-white/20 mt-8">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-2 rounded transition text-red-300 hover:bg-white/10 hover:text-red-400"
          >
            <LogOut size={20}/> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content - المحتوى الأساسي */}
      <main className="flex-1 p-4 md:p-8 space-y-8 w-full max-w-full overflow-x-hidden">
        {!isAccessGranted && activeTab !== 'orders' ? (
           <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
             <ShieldAlert size={64} className="mb-4 text-red-500" />
             <h2 className="text-2xl font-bold mb-2 text-[var(--admin-text)]">الوصول مقيد</h2>
             <p>الرجاء تفعيل <span className="font-bold text-green-500">وضع المسؤول</span> من أيقونة الدرع في الأعلى للوصول لهذه الصفحة.</p>
           </div>
        ) : (
        <>
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded-lg text-[var(--admin-text)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--admin-text)]">
                {activeTab === 'stats' && 'الإحصائيات والتقارير'}
                {activeTab === 'products' && 'إدارة المنتجات'}
                {activeTab === 'orders' && 'الطلبات'}
                {activeTab === 'history' && 'سجل الطلبات'}
                {activeTab === 'customers' && 'قاعدة العملاء'}
                {activeTab === 'settings' && 'الإعدادات والأمان'}
              </h2>
            </div>
          </header>

          {/* Stats Page - صفحة الإحصائيات المستقلة */}
          {activeTab === 'stats' && isAccessGranted && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <div className="admin-card flex items-center gap-5 p-6 border-l-4 border-blue-500">
                  <div className="p-4 bg-blue-100 rounded-2xl text-blue-600"><ShoppingCart size={32} /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">الطلبات النشطة</p>
                    <h3 className="text-3xl font-black text-[var(--admin-text)]">{activeOrders.length}</h3>
                  </div>
                </div>
                <div className="admin-card flex items-center gap-5 p-6 border-l-4 border-green-500">
                  <div className="p-4 bg-green-100 rounded-2xl text-green-600"><BarChart3 size={32} /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">إجمالي الأرباح</p>
                    <h3 className="text-2xl font-black text-[var(--admin-text)]">{historyOrders.reduce((acc, order) => acc + (order?.total || 0), 0).toLocaleString('ar-EG', { numberingSystem: 'latn',  style: 'currency', currency: 'EGP' }).replace('ج.م.', 'ج.م')}</h3>
                  </div>
                </div>
                <div className="admin-card flex items-center gap-5 p-6 border-l-4 border-orange-500">
                  <div className="p-4 bg-orange-100 rounded-2xl text-orange-600"><History size={32} /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">الطلبات المكتملة</p>
                    <h3 className="text-3xl font-black text-[var(--admin-text)]">{historyOrders.length}</h3>
                  </div>
                </div>
                <div className="admin-card flex items-center gap-5 p-6 border-l-4 border-purple-500">
                  <div className="p-4 bg-purple-100 rounded-2xl text-purple-600"><Users size={32} /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">إجمالي العملاء</p>
                    <h3 className="text-3xl font-black text-[var(--admin-text)]">{uniqueCustomers.length}</h3>
                  </div>
                </div>
                <div className="admin-card flex items-center gap-5 p-6 border-l-4 border-yellow-500">
                  <div className="p-4 bg-yellow-100 rounded-2xl text-yellow-600"><Package size={32} /></div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">إجمالي المنتجات</p>
                    <h3 className="text-3xl font-black text-[var(--admin-text)]">{products.length}</h3>
                  </div>
                </div>
              </div>

              {/* رسوم بيانية */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* رسم بياني للمبيعات */}
                <div className="admin-card p-6">
                  <h3 className="text-xl font-bold text-[var(--admin-text)] mb-6 flex items-center gap-2">
                    <BarChart3 className="text-blue-500" /> 
                    <div className="relative inline-flex items-center hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition px-2 py-1 -mr-2 cursor-pointer">
                      <select 
                        value={salesChartRange}
                        onChange={(e) => setSalesChartRange(e.target.value)}
                        className="bg-transparent border-none outline-none cursor-pointer appearance-none text-[var(--admin-text)] font-bold text-xl pl-8 w-full"
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                      >
                        <option value="7days" className="text-black dark:text-white bg-white dark:bg-gray-900">مبيعات آخر 7 أيام</option>
                        <option value="month" className="text-black dark:text-white bg-white dark:bg-gray-900">مبيعات آخر شهر</option>
                        <option value="year" className="text-black dark:text-white bg-white dark:bg-gray-900">مبيعات آخر سنة</option>
                      </select>
                      <ChevronDown className="absolute left-2 w-5 h-5 text-blue-500 pointer-events-none" />
                    </div>
                  </h3>
                  <div className="h-[300px] w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `${value}`} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value} ج.م`, 'المبيعات']} />
                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} onClick={(data) => setSelectedPeriod(data.payload || data)} className="cursor-pointer hover:fill-blue-400 transition-all" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {salesChartRange === 'year' && (
                    <div className="text-center mt-4 mb-[-10px]">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">عام {new Date().getFullYear()}</span>
                    </div>
                  )}
                </div>

                {/* رسم بياني للمنتجات الأكثر مبيعاً */}
                <div className="admin-card p-6">
                  <h3 className="text-xl font-bold text-[var(--admin-text)] mb-6 flex items-center gap-2">
                    <PieChartIcon className="text-orange-500" /> مبيعات المنتجات
                  </h3>
                  <div className="h-[300px] w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={topProductsData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                          {topProductsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value} قطعة`, 'العدد']} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* نافذة تفاصيل الإحصائية المحددة (تظهر عند الضغط على عمود) */}
              {selectedPeriod && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={() => setSelectedPeriod(null)}>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl p-6 shadow-2xl relative animate-in zoom-in-95" onClick={e => e.stopPropagation()} dir="rtl">
                    <button onClick={() => setSelectedPeriod(null)} className="absolute top-4 left-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition">
                      <X size={24} />
                    </button>
                    
                    <h3 className="text-2xl font-black text-[var(--admin-text)] mb-6 flex items-center gap-2">
                      <BarChart3 className="text-blue-500" />
                      تفاصيل المبيعات ({selectedPeriod.name})
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                        <p className="text-sm font-bold text-blue-600/80 dark:text-blue-400 mb-1">إجمالي الإيرادات</p>
                        <h4 className="text-3xl font-black text-blue-700 dark:text-blue-300">
                          {selectedPeriod.total?.toLocaleString('ar-EG', { numberingSystem: 'latn',  style: 'currency', currency: 'EGP' }).replace('ج.م.', 'ج.م')}
                        </h4>
                      </div>
                      <div className="p-5 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl">
                        <p className="text-sm font-bold text-purple-600/80 dark:text-purple-400 mb-1">الطلبات المكتملة</p>
                        <h4 className="text-3xl font-black text-purple-700 dark:text-purple-300">
                          {selectedPeriod.orders?.length || 0} طلب
                        </h4>
                      </div>
                    </div>

                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-[var(--admin-text)]">
                      <Package className="text-orange-500" size={20} />
                      المنتجات المباعة في ({selectedPeriod.name})
                    </h4>
                    
                    {(() => {
                      const periodProductSales = selectedPeriod.orders?.reduce((acc: any, order: any) => {
                        if (order && order.items) {
                          order.items.forEach((item: any) => {
                            const itemName = item?.name || 'غير معروف';
                            acc[itemName] = (acc[itemName] || 0) + (item?.quantity || 1);
                          });
                        }
                        return acc;
                      }, {});
                      
                      const periodTopProducts = Object.entries(periodProductSales || {})
                        .map(([name, count]) => ({ name, value: count as number }))
                        .sort((a, b) => b.value - a.value);

                      if (periodTopProducts.length === 0) {
                        return (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 text-center border border-gray-100 dark:border-gray-700">
                            <p className="text-gray-500 font-bold">لا توجد مبيعات في هذه الفترة</p>
                          </div>
                        );
                      }

                      const dailyDataMap: Record<string, number> = {};
                      selectedPeriod.orders?.forEach((order: any) => {
                        const orderDateStr = order.completedAt || order.createdAt;
                        if (orderDateStr) {
                          const dateStr = new Date(orderDateStr).toISOString().split('T')[0];
                          if (!dailyDataMap[dateStr]) dailyDataMap[dateStr] = 0;
                          dailyDataMap[dateStr] += (order.total || 0);
                        }
                      });
                      
                      const periodBarData = Object.keys(dailyDataMap).sort().map(date => {
                        const d = new Date(date);
                        return {
                          name: d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
                          total: dailyDataMap[date]
                        };
                      });

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* القائمة النصية */}
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 max-h-[250px] overflow-y-auto border border-gray-100 dark:border-gray-700 custom-scrollbar">
                            <ul className="space-y-2">
                              {periodTopProducts.map((p, idx) => (
                                <li key={idx} className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-3 rounded-lg shadow-sm transition hover:shadow-md">
                                  <span className="font-bold text-[var(--admin-text)] flex items-center gap-2">
                                    <span className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-500">{idx + 1}</span>
                                    {p.name}
                                  </span>
                                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-sm font-bold">{p.value} قطعة</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* الرسم البياني للأيام (Bar Chart) */}
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
                            <h5 className="text-sm font-bold text-gray-500 mb-4">مبيعات ({selectedPeriod.name}) بالأيام</h5>
                            <div className="h-[200px] w-full" dir="ltr">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={periodBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `${value}`} />
                                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`${value} ج.م`, 'المبيعات']} />
                                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders and Stats Page */}
          {activeTab === 'orders' && (
            <>
              {/* Recent Orders Table - جدول الطلبات الأخيرة */}
              <div className="admin-card mb-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4 w-full">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--admin-text)] whitespace-nowrap"><ShoppingCart size={20}/> الطلبات الحالية</h3>
                  
                  <div className="w-full lg:w-auto pb-2">
                    <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        autoComplete="nope"
                        name="active_orders_search_nope"
                        placeholder="بحث برقم الطلب..." 
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="pr-10 pl-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[var(--admin-text)] text-sm w-48 lg:w-48"
                      />
                      {orderSearchTerm && (
                        <button onClick={() => setOrderSearchTerm('')} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={`p-2 border rounded-lg flex items-center gap-2 text-sm font-medium transition ${startDate || endDate ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-[var(--admin-text)] hover:bg-gray-50'}`}
                        >
                          <Calendar size={16} />
                          <span>
                            {startDate || endDate ? (
                              <span className="text-xs" dir="ltr">
                                {startDate ? startDate : '...'} / {endDate ? endDate : '...'}
                              </span>
                            ) : 'تصفية بالتاريخ'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4" align="center">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-[var(--admin-text)] mb-1">من تاريخ</label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full p-2 rounded-lg border bg-gray-50 text-[var(--admin-text)] text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[var(--admin-text)] mb-1">إلى تاريخ</label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full p-2 rounded-lg border bg-gray-50 text-[var(--admin-text)] text-sm outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <div className="relative">
                      <button 
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="p-2 border rounded-lg flex items-center gap-2 text-sm font-medium bg-white border-gray-200 text-[var(--admin-text)] hover:bg-gray-50"
                      >
                        <ArrowUpDown size={16} />
                        <span>الترتيب</span>
                      </button>

                      {showSortMenu && (
                        <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                          <button onClick={() => { setSortOption('newest'); setShowSortMenu(false) }} className={`w-full text-right px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-gray-50 ${sortOption === 'newest' ? 'bg-gray-50 font-bold' : ''}`}>الوقت: الأحدث للأقدم</button>
                          <button onClick={() => { setSortOption('oldest'); setShowSortMenu(false) }} className={`w-full text-right px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-gray-50 ${sortOption === 'oldest' ? 'bg-gray-50 font-bold' : ''}`}>الوقت: الأقدم للأحدث</button>
                          <button onClick={() => { setSortOption('price-high'); setShowSortMenu(false) }} className={`w-full text-right px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-gray-50 ${sortOption === 'price-high' ? 'bg-gray-50 font-bold' : ''}`}>السعر: الأعلى سعراً</button>
                          <button onClick={() => { setSortOption('price-low'); setShowSortMenu(false) }} className={`w-full text-right px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-gray-50 ${sortOption === 'price-low' ? 'bg-gray-50 font-bold' : ''}`}>السعر: الأقل سعراً</button>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={resetFilters}
                      className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-1 text-sm font-bold"
                      title="إعادة تعيين الفلاتر"
                    >
                      <RotateCcw size={16} />
                      مسح الفلاتر
                    </button>
                    </div>
                    </div>
                  </div>
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-[var(--admin-text)]">رقم الطلب</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">وقت الطلب</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">العميل</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">رقم الهاتف</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">العنوان</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">المنتجات</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">الملاحظات</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">الإجمالي</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActiveOrders.length > 0 ? sortOrders(filteredActiveOrders).slice(0, visibleActiveCount).map((order) => (
                      <tr key={order?.id || Math.random()} className="border-b hover:bg-black/5 dark:hover:bg-white/5 transition">
                        <td className="py-4 px-4 text-[var(--admin-text)]">#{(order?.id || '').slice(-4)}</td>
                        <td className="py-4 px-4 text-sm text-[var(--admin-text)]">
                          {/* @ts-ignore */}
                          {order?.createdAt ? new Date(order.createdAt).toLocaleString('ar-EG', { numberingSystem: 'latn',  month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : '-'}
                        </td>
                        <td className="py-4 px-4 text-[var(--admin-text)]">{order?.customer?.firstName || ''} {order?.customer?.lastName || ''}</td>
                        <td className="py-4 px-4 text-[var(--admin-text)]">{order?.customer?.phone || '-'}</td>
                        <td className="py-4 px-4 text-[var(--admin-text)]">{order?.customer?.address || '-'}</td>
                        <td className="py-4 px-4 text-sm text-[var(--admin-text)]">{(order?.items || []).map((item: any) => `${item?.name || 'بدون اسم'} (x${item?.quantity || 1})`).join(', ')}</td>
                        <td className="py-4 px-4 text-[var(--admin-text)]">{order?.customer?.notes || '-'}</td>
                        <td className="py-4 px-4 text-[var(--admin-text)]">{(order?.total || 0).toLocaleString('ar-EG', { numberingSystem: 'latn',  style: 'currency', currency: 'EGP' }).replace('ج.م.', 'ج.م')}</td>
                        <td className="py-4 px-4">
                          <select 
                            value={order?.status || 'جديد'}
                            onChange={(e) => updateOrderStatus && updateOrderStatus(order?.id, e.target.value as OrderStatus)}
                            className={`px-2 py-1 rounded text-sm border-none cursor-pointer outline-none font-medium ${getStatusColor(order?.status || 'جديد')}`}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value} className="bg-white text-[var(--admin-text)]">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-muted-foreground">
                          {activeOrders.length > 0 ? 'لا توجد نتائج مطابقة للبحث' : 'لا توجد طلبات نشطة حالياً'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
                {filteredActiveOrders.length > visibleActiveCount && (
                  <div className="text-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button 
                      onClick={() => setVisibleActiveCount(prev => prev + 5)}
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition"
                    >
                      عرض المزيد ({filteredActiveOrders.length - visibleActiveCount} متبقي)
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Order History Table - سجل الطلبات المكتملة */}
          {activeTab === 'history' && isAccessGranted && (
            <>
              {historyOrders.length > 0 ? (
                <div className="admin-card mb-8">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4 w-full">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--admin-text)] whitespace-nowrap"><History size={20}/> سجل الطلبات المكتملة</h3>
                    
                    <div className="w-full lg:w-auto pb-2">
                      <div className="flex flex-wrap items-center gap-2 md:gap-4">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="بحث برقم الطلب..." 
                          value={orderSearchTerm}
                          onChange={(e) => setOrderSearchTerm(e.target.value)}
                          autoComplete="nope"
                          name="history_orders_search_nope"
                          className="pr-10 pl-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[var(--admin-text)] text-sm w-48 lg:w-48"
                        />
                        {orderSearchTerm && (
                          <button onClick={() => setOrderSearchTerm('')} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className={`p-2 border rounded-lg flex items-center gap-2 text-sm font-medium transition ${startDate || endDate ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-[var(--admin-text)] hover:bg-gray-50'}`}
                          >
                            <Calendar size={16} />
                            <span>
                              {startDate || endDate ? (
                                <span className="text-xs" dir="ltr">
                                  {startDate ? startDate : '...'} / {endDate ? endDate : '...'}
                                </span>
                              ) : 'تصفية بالتاريخ'}
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4" align="center">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-[var(--admin-text)] mb-1">من تاريخ</label>
                              <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full p-2 rounded-lg border bg-gray-50 text-[var(--admin-text)] text-sm outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-[var(--admin-text)] mb-1">إلى تاريخ</label>
                              <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full p-2 rounded-lg border bg-gray-50 text-[var(--admin-text)] text-sm outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <div className="relative">
                        <button 
                          onClick={() => setShowSortMenu(!showSortMenu)}
                          className="p-2 border rounded-lg flex items-center gap-2 text-sm font-medium bg-white border-gray-200 text-[var(--admin-text)] hover:bg-gray-50"
                        >
                          <ArrowUpDown size={16} />
                          <span>الترتيب</span>
                        </button>

                        {showSortMenu && (
                          <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                            <button onClick={() => { setSortOption('newest'); setShowSortMenu(false) }} className={`w-full text-right px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-gray-50 ${sortOption === 'newest' ? 'bg-gray-50 font-bold' : ''}`}>الوقت: الأحدث للأقدم</button>
                            <button onClick={() => { setSortOption('oldest'); setShowSortMenu(false) }} className={`w-full text-right px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-gray-50 ${sortOption === 'oldest' ? 'bg-gray-50 font-bold' : ''}`}>الوقت: الأقدم للأحدث</button>
                            <button onClick={() => { setSortOption('price-high'); setShowSortMenu(false) }} className={`w-full text-right px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-gray-50 ${sortOption === 'price-high' ? 'bg-gray-50 font-bold' : ''}`}>السعر: الأعلى سعراً</button>
                            <button onClick={() => { setSortOption('price-low'); setShowSortMenu(false) }} className={`w-full text-right px-4 py-2 text-sm text-[var(--admin-text)] hover:bg-gray-50 ${sortOption === 'price-low' ? 'bg-gray-50 font-bold' : ''}`}>السعر: الأقل سعراً</button>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={resetFilters}
                        className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-1 text-sm font-bold"
                        title="إعادة تعيين الفلاتر"
                      >
                        <RotateCcw size={16} />
                        مسح الفلاتر
                      </button>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 text-[var(--admin-text)]">رقم الطلب</th>
                        <th className="py-3 px-4 text-[var(--admin-text)]">وقت الطلب</th>
                        <th className="py-3 px-4 text-[var(--admin-text)]">العميل</th>
                        <th className="py-3 px-4 text-[var(--admin-text)]">رقم الهاتف</th>
                        <th className="py-3 px-4 text-[var(--admin-text)]">العنوان</th>
                        <th className="py-3 px-4 text-[var(--admin-text)]">المنتجات</th>
                        <th className="py-3 px-4 text-[var(--admin-text)]">الملاحظات</th>
                        <th className="py-3 px-4 text-[var(--admin-text)]">الإجمالي</th>
                        <th className="py-3 px-4 text-[var(--admin-text)]">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistoryOrders.length > 0 ? sortOrders(filteredHistoryOrders).slice(0, visibleHistoryCount).map((order) => (
                        <tr key={order?.id || Math.random()} className="border-b hover:bg-black/5 dark:hover:bg-white/5 transition">
                          <td className="py-4 px-4 text-[var(--admin-text)]">#{(order?.id || '').slice(-4)}</td>
                          <td className="py-4 px-4 text-sm text-[var(--admin-text)]">
                            {/* @ts-ignore */}
                            {order?.completedAt ? new Date(order.completedAt).toLocaleString('ar-EG', { numberingSystem: 'latn',  month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : (order?.createdAt ? new Date(order.createdAt).toLocaleString('ar-EG', { numberingSystem: 'latn',  month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : '-')}
                          </td>
                          <td className="py-4 px-4 text-[var(--admin-text)]">{order?.customer?.firstName || ''} {order?.customer?.lastName || ''}</td>
                          <td className="py-4 px-4 text-[var(--admin-text)]">{order?.customer?.phone || '-'}</td>
                          <td className="py-4 px-4 text-[var(--admin-text)]">{order?.customer?.address || '-'}</td>
                          <td className="py-4 px-4 text-sm text-[var(--admin-text)]">{(order?.items || []).map((item: any) => `${item?.name || 'بدون اسم'} (x${item?.quantity || 1})`).join(', ')}</td>
                          <td className="py-4 px-4 text-[var(--admin-text)]">{order?.customer?.notes || '-'}</td>
                          <td className="py-4 px-4 text-[var(--admin-text)]">{(order?.total || 0).toLocaleString('ar-EG', { numberingSystem: 'latn',  style: 'currency', currency: 'EGP' }).replace('ج.م.', 'ج.م')}</td>
                          <td className="py-4 px-4">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                              مكتمل
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-muted-foreground">لا توجد نتائج مطابقة للبحث</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                  {filteredHistoryOrders.length > visibleHistoryCount && (
                    <div className="text-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button 
                        onClick={() => setVisibleHistoryCount(prev => prev + 5)}
                        className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition"
                      >
                        عرض المزيد ({filteredHistoryOrders.length - visibleHistoryCount} متبقي)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="admin-card text-center py-12 text-gray-500 font-bold text-lg">
                  لا توجد طلبات في السجل حتى الآن
                </div>
              )}
            </>
          )}

          {/* Customers Table - جدول العملاء */}
          {activeTab === 'customers' && isAccessGranted && (
            <div className="admin-card overflow-x-auto">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--admin-text)]"><Users size={20}/> قاعدة العملاء</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-[var(--admin-text)]">الاسم</th>
                    <th className="py-3 px-4 text-[var(--admin-text)]">رقم الهاتف</th>
                    <th className="py-3 px-4 text-[var(--admin-text)]">العنوان</th>
                    <th className="py-3 px-4 text-[var(--admin-text)]">عدد الطلبات</th>
                    <th className="py-3 px-4 text-[var(--admin-text)]">إجمالي المبيعات</th>
                    <th className="py-3 px-4 text-[var(--admin-text)]">آخر ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueCustomers.map((customer: any, index: number) => {
                    if (!customer) return null;
                    
                    // حساب عدد وإجمالي الطلبات الخاصة بهذا العميل بناءً على رقم الهاتف
                    const customerOrders = orders.filter(o => o?.customer?.phone === customer.phone);
                    const ordersCount = customerOrders.length;
                    const totalSpent = customerOrders.reduce((sum, o) => sum + (o?.total || 0), 0);

                    return (
                      <tr key={index} className="border-b hover:bg-black/5 dark:hover:bg-white/5 transition">
                        <td className="py-4 px-4 text-[var(--admin-text)]">{customer?.firstName || ''} {customer?.lastName || ''}</td>
                        <td className="py-4 px-4 text-[var(--admin-text)]">{customer?.phone || '-'}</td>
                        <td className="py-4 px-4 text-[var(--admin-text)]">{customer?.address || '-'}</td>
                        <td className="py-4 px-4 text-[var(--admin-text)] font-bold">{ordersCount}</td>
                        <td className="py-4 px-4 text-[var(--admin-text)] font-bold text-green-600">{totalSpent.toLocaleString('ar-EG', { numberingSystem: 'latn',  style: 'currency', currency: 'EGP' }).replace('ج.م.', 'ج.م')}</td>
                        <td className="py-4 px-4 text-[var(--admin-text)]">{customer?.notes || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Settings Page - الإعدادات */}
          {activeTab === 'settings' && isAccessGranted && (
            <div className="space-y-8">
            <div className="admin-card max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <PromoBannerForm />
            </div>
            </div>
          )}

          {/* Add Product Form - إضافة منتج جديد */}
          {activeTab === 'products' && isAccessGranted && (
            <div className="space-y-8">
              <div className="admin-card">
                <h3 className="text-xl font-bold mb-6 text-[var(--admin-text)]">إضافة منتجات جديدة</h3>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  <AddProductForm type="coffee" />
                  <AddProductForm type="espresso" />
                  <AddProductForm type="derivatives" />
                </div>
              </div>

              <div className="admin-card overflow-x-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--admin-text)]"><Package size={20}/> قائمة المنتجات</h3>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      autoComplete="nope"
                      name="products_search_nope"
                      placeholder="بحث باسم المنتج..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-10 pl-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-[var(--admin-text)]"
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-[var(--admin-text)]">صورة</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">اسم المنتج</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">السعر</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">التصنيف</th>
                      <th className="py-3 px-4 text-[var(--admin-text)]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* @ts-ignore */}
                    {products && products.filter((p: Product) => (p?.name || '').toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? 
                      products.filter((p: Product) => (p?.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((product: Product) => (
                      <tr key={product.id} className="border-b hover:bg-black/5 dark:hover:bg-white/5 transition">
                        <td className="py-4 px-4">
                          <img src={product?.image || '/placeholder.svg'} alt={product?.name || 'بدون اسم'} className="w-12 h-12 object-cover rounded" />
                        </td>
                        <td className="py-4 px-4 font-medium text-[var(--admin-text)]">
                          {product?.name || 'بدون اسم'}
                        </td>
                        <td className="py-4 px-4 text-[var(--admin-text)]">
                              <div className="flex flex-col gap-1 text-sm">
                              {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
                                product.sizes.map((s: any, idx: number) => (
                                  <div key={idx}><span className="text-xs text-gray-500">{s.name}:</span> {Number(s.price).toLocaleString('ar-EG', { numberingSystem: 'latn', style: 'currency', currency: 'EGP' }).replace('ج.م.', 'ج.م')}</div>
                                ))
                              ) : product.sizes && typeof product.sizes === 'object' && !Array.isArray(product.sizes) ? (
                                ['50g', '100g', '250g'].map(size => {
                                  const price = Number((product.sizes as any)[size]?.price || 0);
                                  return price > 0 ? <div key={size}><span className="text-xs text-gray-500">{size}:</span> {price.toLocaleString('ar-EG', { numberingSystem: 'latn', style: 'currency', currency: 'EGP' }).replace('ج.م.', 'ج.م')}</div> : null;
                                })
                              ) : (
                                Number(product?.price || 0).toLocaleString('ar-EG', { numberingSystem: 'latn', style: 'currency', currency: 'EGP' }).replace('ج.م.', 'ج.م')
                              )}
                              </div>
                        </td>
                        <td className="py-4 px-4 text-[var(--admin-text)]">{product?.category || '-'}</td>
                        <td className="py-4 px-4 flex gap-2">
                            <>
                            <button onClick={() => setProductToEdit(product)} className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition" title="تعديل">
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  if (window.confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) {
                                    removeProduct(product.id)
                                  }
                                }}
                                className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                title="حذف المنتج"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">لا توجد منتجات مطابقة للبحث</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            
            <EditProductForm 
              product={productToEdit} 
              isOpen={!!productToEdit} 
              onClose={() => setProductToEdit(null)} 
            />
            </div>
          )}
        </>
        )}
      </main>
    </div>
  )
}
