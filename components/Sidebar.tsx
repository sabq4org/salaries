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
  Settings2,
  X,
  Calendar,
  Bell,
  Shield,
  CheckSquare,
  Lock,
  BookOpen
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
  { icon: BookOpen, label: "دفتر الأستاذ", href: "/employee-ledger" },
  { icon: Shield, label: "سجل التدقيق", href: "/audit-log" },
  { icon: CheckSquare, label: "الموافقات المعلقة", href: "/pending-approvals" },
  { icon: Lock, label: "إدارة الفترات المالية", href: "/period-locks" },
  { icon: Settings2, label: "إعدادات النظام", href: "/system-settings" },
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
          bg-card border-l border-border
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="flex justify-between items-center p-4 lg:hidden">
            <h2 className="font-semibold text-foreground">القائمة</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Menu */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              القائمة الرئيسية
            </p>
            {menuItems.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                active={pathname === item.href || (item.href === "/budget" && pathname.startsWith("/budget/"))}
                onClick={onClose}
              >
                {item.label}
              </SidebarLink>
            ))}
          </nav>

          {/* Bottom Menu - Hidden for now */}
          {bottomMenuItems.length > 0 && (
            <div 
              className="px-3 py-4 space-y-1 border-t border-border"
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
            className="p-4 border-t border-border"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center bg-primary"
              >
                <span className="text-primary-foreground font-semibold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  المسؤول
                </p>
                <p className="text-xs text-muted-foreground truncate">
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
          ? 'text-primary bg-primary/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }
      `}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span>{children}</span>
    </Link>
  );
}

