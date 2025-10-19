"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Settings,
  Settings2,
  HelpCircle,
  X,
  Calendar,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/" },
  { icon: Users, label: "الموظفون الرسميون", href: "/employees" },
  { icon: UserCheck, label: "المتعاونون", href: "/contractors" },
  { icon: DollarSign, label: "مسير الرواتب", href: "/payroll" },
  { icon: Calendar, label: "تصفية إجازة", href: "/leave-settlement" },
  { icon: Bell, label: "التذكيرات", href: "/reminders" },
  { icon: TrendingUp, label: "الميزانية السنوية", href: "/budget" },
  { icon: FileText, label: "التقارير", href: "/reports" },
  { icon: Settings2, label: "الإعدادات", href: "/settings" },
];

const bottomMenuItems: any[] = [
  // يمكن إضافة روابط إضافية هنا لاحقاً
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 right-0 bottom-0 z-40 w-64
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0
        `}
        style={{
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #f0f0ef'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="flex justify-between items-center p-4 lg:hidden">
            <h2 className="font-semibold text-gray-900">القائمة</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Menu */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              القائمة الرئيسية
            </p>
            {menuItems.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                active={pathname === item.href}
                onClick={onClose}
              >
                {item.label}
              </SidebarLink>
            ))}
          </nav>

          {/* Bottom Menu - Hidden for now */}
          {bottomMenuItems.length > 0 && (
            <div 
              className="px-3 py-4 space-y-1"
              style={{ borderTop: '1px solid #f0f0ef' }}
            >
              {bottomMenuItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  active={pathname === item.href}
                  onClick={onClose}
                >
                  {item.label}
                </SidebarLink>
              ))}
            </div>
          )}

          {/* User Info */}
          <div 
            className="p-4"
            style={{ borderTop: '1px solid #f0f0ef' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                }}
              >
                <span className="text-white font-semibold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  المسؤول
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@sabq.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

function SidebarLink({ href, icon: Icon, active, children, onClick }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200
        ${active
          ? 'text-blue-600'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
      style={active ? {
        backgroundColor: '#eff6ff',
      } : undefined}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span>{children}</span>
    </Link>
  );
}

