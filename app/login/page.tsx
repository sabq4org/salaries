"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('تم تسجيل الدخول بنجاح');
        router.push('/');
      } else {
        toast.error('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      className="bg-accent"
    >
      <div 
        className="w-full max-w-md p-8 rounded-2xl shadow-lg"
        className="bg-card border border-border"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            className="bg-blue-50 dark:bg-blue-950"
          >
            <Lock className="h-8 w-8" style={{ color: '#2563eb' }} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">نظام الرواتب</h1>
          <p className="text-muted-foreground">صحيفة سبق</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="username" className="text-gray-700 font-semibold">
              اسم المستخدم
            </Label>
            <div className="relative mt-2">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="h-5 w-5" />
              </div>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="pr-10 h-12 text-lg"
                placeholder="أدخل اسم المستخدم"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 font-semibold">
              كلمة المرور
            </Label>
            <div className="relative mt-2">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10 pl-10 h-12 text-lg"
                placeholder="أدخل كلمة المرور"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-lg font-semibold text-white"
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 صحيفة سبق. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
}

