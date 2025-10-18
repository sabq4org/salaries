"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          لوحة التحكم
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          نظرة عامة على الموظفين والرواتب والميزانية
        </p>
      </div>

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

function SectionCard({ href, icon: Icon, title, description, color }: any) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  };

  return (
    <Link href={href}>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {description}
        </p>
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
          <span>عرض التفاصيل</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
}
