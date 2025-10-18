"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Right Side - Logo & Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">س</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                نظام الرواتب
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
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
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/login">
              <LogOut className="h-5 w-5" />
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
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }
      `}
    >
      {children}
    </Link>
  );
}

