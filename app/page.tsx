"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import RemindersAlert from "@/components/RemindersAlert";
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  TrendingUp,
  ArrowLeft,
  FileText
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalEmployees: number;
  totalContractors: number;
  totalSalaries: number;
  averageSalary: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    totalContractors: 0,
    totalSalaries: 0,
    averageSalary: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [employeesRes, contractorsRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/contractors'),
      ]);

      const employees = await employeesRes.json();
      const contractors = await contractorsRes.json();

      const totalSalaries = employees.reduce((sum: number, e: any) => sum + (e.baseSalary || 0), 0) +
                           contractors.reduce((sum: number, c: any) => sum + (c.salary || 0), 0);
      
      const averageSalary = employees.length > 0 
        ? employees.reduce((sum: number, e: any) => sum + (e.baseSalary || 0), 0) / employees.length 
        : 0;

      setStats({
        totalEmployees: employees.length,
        totalContractors: contractors.length,
        totalSalaries,
        averageSalary: Math.round(averageSalary),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2563eb' }}></div>
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          لوحة التحكم
        </h1>
        <p className="text-gray-600">
          نظرة عامة على الموظفين والرواتب والميزانية
        </p>
      </div>

      {/* Reminders Alert */}
      <RemindersAlert />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="الموظفون الرسميون"
          value={stats.totalEmployees}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="المتعاونون"
          value={stats.totalContractors}
          icon={UserCheck}
          color="green"
        />
        <StatsCard
          title="إجمالي الرواتب"
          value={`${stats.totalSalaries.toLocaleString()} ر.س`}
          icon={DollarSign}
          color="purple"
        />
        <StatsCard
          title="متوسط الراتب"
          value={`${stats.averageSalary.toLocaleString()} ر.س`}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SectionCard
          href="/employees"
          icon={Users}
          title="الموظفون الرسميون"
          description="إدارة بيانات الموظفين والرواتب والتأمينات"
          color="blue"
        />
        <SectionCard
          href="/contractors"
          icon={UserCheck}
          title="المتعاونون"
          description="إدارة المتعاونين والمستقلين"
          color="green"
        />
        <SectionCard
          href="/payroll"
          icon={DollarSign}
          title="مسير الرواتب"
          description="إنشاء وإدارة مسير الرواتب الشهرية"
          color="purple"
        />
        <SectionCard
          href="/budget"
          icon={TrendingUp}
          title="الميزانية السنوية"
          description="تتبع المصروفات والميزانية السنوية"
          color="orange"
        />
        <SectionCard
          href="/reports"
          icon={FileText}
          title="التقارير"
          description="عرض وتصدير التقارير المالية"
          color="red"
        />
      </div>
    </DashboardLayout>
  );
}

const colorStyles = {
  blue: { bg: "#eff6ff", text: "#2563eb" },
  green: { bg: "#f0fdf4", text: "#16a34a" },
  purple: { bg: "#faf5ff", text: "#9333ea" },
  orange: { bg: "#fff7ed", text: "#ea580c" },
  red: { bg: "#fef2f2", text: "#dc2626" },
};

function SectionCard({ href, icon: Icon, title, description, color }: any) {
  const colors = colorStyles[color as keyof typeof colorStyles];

  return (
    <Link href={href}>
      <div 
        className="p-6 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer group h-full"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #f0f0ef'
        }}
      >
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{
            backgroundColor: colors.bg,
            color: colors.text
          }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {description}
        </p>
        <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
          <span>عرض التفاصيل</span>
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
