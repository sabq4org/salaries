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
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border shadow-sm transition-colors"
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-[1920px] mx-auto">
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
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary shadow-md"
            >
              <span className="text-primary-foreground font-bold text-xl">س</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">
                نظام الرواتب
              </h1>
              <p className="text-xs text-muted-foreground">
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
          <NavLink href="/budget" active={pathname === "/budget" || pathname.startsWith("/budget/")}>
            الميزانية
          </NavLink>
          <NavLink href="/reminders" active={pathname === "/reminders"}>
            التذكيرات
          </NavLink>
        </div>

        {/* Left Side - Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span 
              className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"
            ></span>
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
          ? 'text-primary bg-primary/10' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }
      `}
    >
      {children}
    </Link>
  );
}

