"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, FileText } from "lucide-react";

interface Stats {
  totalEmployees: number;
  totalContractors: number;
  totalSalaries: number;
  averageSalary: number;
}

export default function Home() {
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

      if (employeesRes.ok && contractorsRes.ok) {
        const employees = await employeesRes.json();
        const contractors = await contractorsRes.json();

        const totalSalaries = employees.reduce((sum: number, emp: any) => sum + emp.baseSalary, 0);
        const averageSalary = employees.length > 0 ? Math.round(totalSalaries / employees.length) : 0;

        setStats({
          totalEmployees: employees.length,
          totalContractors: contractors.length,
          totalSalaries,
          averageSalary,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <DollarSign className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">نظام الميزانية والرواتب</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">صحيفة سبق</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">مرحباً بك</h2>
          <p className="text-gray-600 dark:text-gray-400">نظام إدارة شامل للرواتب والميزانية</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">الموظفون الرسميون</p>
                <p className="text-3xl font-bold">{loading ? "..." : stats.totalEmployees}</p>
              </div>
              <Users size={40} className="text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">المتعاونون</p>
                <p className="text-3xl font-bold">{loading ? "..." : stats.totalContractors}</p>
              </div>
              <UserCheck size={40} className="text-green-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">إجمالي الرواتب</p>
                <p className="text-2xl font-bold">{loading ? "..." : stats.totalSalaries.toLocaleString()} ر.س</p>
              </div>
              <TrendingUp size={40} className="text-purple-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">متوسط الراتب</p>
                <p className="text-2xl font-bold">{loading ? "..." : stats.averageSalary.toLocaleString()} ر.س</p>
              </div>
              <DollarSign size={40} className="text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/employees">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">الموظفون الرسميون</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إدارة بيانات الموظفين</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/contractors">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <UserCheck className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">المتعاونون</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">إدارة بيانات المتعاونين</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/payroll">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">مسير الرواتب</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الرواتب الشهرية</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/budget">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">الميزانية السنوية</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">التقارير والإحصائيات</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">التقارير</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">تقارير مفصلة</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}

