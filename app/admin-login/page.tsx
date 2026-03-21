"use client"
import { useState } from "react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useRouter } from "next/navigation";
import { Coffee, Lock, AlertCircle, ArrowRight, User, Eye, EyeOff, UserPlus } from "lucide-react";
import Link from "next/link";

export default function AdminLogin() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoggingIn(true);

        try {
            // Construct the dummy email from the username
            const email = `${name.replace(/\s+/g, '-').toLowerCase()}@c.com`;

            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin");

        } catch (err: any) {
            console.error("Login error:", err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
                setError("اسم المستخدم غير صحيح.");
            } else if (err.code === 'auth/wrong-password') {
                setError("كلمة المرور غير صحيحة.");
            } else {
                setError("فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.");
            }
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4" dir="rtl">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl p-8 border border-gray-100 dark:border-zinc-800">
                
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4"><Coffee className="w-8 h-8 text-primary" /></div>
                    <h2 className="text-2xl font-black text-black dark:text-white">تسجيل الدخول</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">أدخل اسم المستخدم وكلمة المرور</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5" autoComplete="off">
                    <div>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">اسم المستخدم</label>
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                            <input 
                                type="text" 
                                placeholder="مثال: أحمد" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                autoFocus
                                autoComplete="off" 
                                className="block w-full pr-10 pl-3 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-zinc-800 text-black dark:text-white text-sm transition-all" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">كلمة المرور</label>
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                autoComplete="current-password"
                                className="block w-full pr-10 pl-10 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-zinc-800 text-black dark:text-white text-sm transition-all" />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5" /> <p>{error}</p>
                        </div>
                    )}

                    <button type="submit" disabled={isLoggingIn} className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-70 group shadow-lg shadow-primary/20">
                        {isLoggingIn ? <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div> : <>تسجيل الدخول <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /></>}
                    </button>
                </form>
                

            </div>
        </div>
    );
}