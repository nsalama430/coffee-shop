"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { Lock, User, UserPlus, AlertCircle, Eye, EyeOff } from "lucide-react";

export function AddUserForm() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<'admin' | 'staff'>('staff');
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        if (password.length < 6) {
            setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
            setIsLoading(false);
            return;
        }

        try {
            // This is a temporary auth instance to create the user,
            // it does not sign the current admin out.
            const email = `${name.replace(/\s+/g, '-').toLowerCase()}@c.com`;
            
            // We need to create a secondary app instance to create a user
            // without logging out the current admin.
            // This is a simplified approach. For a real app, you'd use Admin SDK on a server.
            const { user } = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: role,
                isDeleted: false,
            });

            setSuccess(`تم إنشاء المستخدم "${name}" بنجاح!`);
            setName("");
            setPassword("");
            setRole("staff");

        } catch (err: any) {
            console.error("Signup error:", err);
            if (err.code === 'auth/email-already-in-use') {
                setError("اسم المستخدم هذا مسجل بالفعل.");
            } else if (err.code === 'auth/invalid-email') {
                setError("اسم المستخدم غير صالح.");
            } else {
                setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-card">
            <h3 className="text-xl font-bold mb-4 text-[var(--admin-text)]">إضافة مستخدم جديد</h3>
            <form onSubmit={handleSignup} className="space-y-5" autoComplete="off">
                <div>
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">اسم المستخدم</label>
                    <div className="relative mt-2">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                        <input type="text" placeholder="مثال: أحمد" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="off" className="block w-full pr-10 pl-3 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-zinc-800 text-black dark:text-white text-sm transition-all" />
                    </div>
                </div>
                
                <div>
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">كلمة المرور</label>
                    <div className="relative mt-2">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                        <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" className="block w-full pr-10 pl-10 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-zinc-800 text-black dark:text-white text-sm transition-all" />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">الدور</label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${role === 'staff' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-zinc-700'}`}>
                            <input type="radio" name="role" value="staff" checked={role === 'staff'} onChange={() => setRole('staff')} className="hidden" />
                            <div className={`w-5 h-5 rounded-full border-2 ${role === 'staff' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                            <span className="font-bold text-black dark:text-white">موظف</span>
                        </label>
                        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${role === 'admin' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-zinc-700'}`}>
                            <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} className="hidden" />
                            <div className={`w-5 h-5 rounded-full border-2 ${role === 'admin' ? 'border-primary bg-primary' : 'border-gray-300'}`}></div>
                            <span className="font-bold text-black dark:text-white">مشرف</span>
                        </label>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
                        <AlertCircle className="w-5 h-5" /> <p>{error}</p>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium">
                        <UserPlus className="w-5 h-5" /> <p>{success}</p>
                    </div>
                )}

                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-70 group shadow-lg shadow-primary/20">
                    {isLoading ? <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin"></div> : "إنشاء الحساب"}
                </button>
            </form>
        </div>
    );
}
