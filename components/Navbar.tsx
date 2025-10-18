"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 h-16 shadow-sm"
      style={{ 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f0f0ef'
      }}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-[1920px] mx-auto">
        {/* Right Side - Logo & Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden hover:bg-gray-50"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </Button>
          
          <Link href="/" className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
              }}
            >
              <span className="text-white font-bold text-xl">س</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">
                نظام الرواتب
              </h1>
              <p className="text-xs text-gray-500">
                صحيفة سبق
              </p>
            </div>
          </Link>
        </div>

        {/* Center - Quick Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink href="/" active={pathname === "/"}>
            لوحة التحكم
          </NavLink>
          <NavLink href="/employees" active={pathname === "/employees"}>
            الموظفون
          </NavLink>
          <NavLink href="/contractors" active={pathname === "/contractors"}>
            المتعاونون
          </NavLink>
          <NavLink href="/payroll" active={pathname === "/payroll"}>
            الرواتب
          </NavLink>
          <NavLink href="/budget" active={pathname === "/budget"}>
            الميزانية
          </NavLink>
          <NavLink href="/reports" active={pathname === "/reports"}>
            التقارير
          </NavLink>
        </div>

        {/* Left Side - Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-gray-50"
          >
            <Bell className="h-5 w-5 text-gray-700" />
            <span 
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: '#ef4444' }}
            ></span>
          </Button>
          
          <Button variant="ghost" size="icon" className="hover:bg-gray-50">
            <User className="h-5 w-5 text-gray-700" />
          </Button>

          <Button variant="ghost" size="icon" asChild className="hover:bg-gray-50">
            <Link href="/login">
              <LogOut className="h-5 w-5 text-gray-700" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${active 
          ? 'text-blue-600' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
      style={active ? { 
        backgroundColor: '#eff6ff',
      } : undefined}
    >
      {children}
    </Link>
  );
}

