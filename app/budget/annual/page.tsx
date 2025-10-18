"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Expense {
  id: number;
  year: number;
  month: number;
  quarter: number;
  type: 'salary' | 'operational' | 'marketing' | 'other';
  description: string | null;
  amount: number;
  date: string;
}

interface Revenue {
  id: number;
  year: number;
  month: number;
  quarter: number;
  source: string;
  amount: number;
  date: string;
}

export default function AnnualBudgetPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesRes, revenuesRes] = await Promise.all([
        fetch(`/api/expenses?year=${selectedYear}`),
        fetch(`/api/revenues?year=${selectedYear}`)
      ]);

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData);
      }

      if (revenuesRes.ok) {
        const revenuesData = await revenuesRes.json();
        setRevenues(revenuesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const quarters = [
    { id: 1, name: 'الربع الأول' },
    { id: 2, name: 'الربع الثاني' },
    { id: 3, name: 'الربع الثالث' },
    { id: 4, name: 'الربع الرابع' },
  ];

  const typeLabels: Record<string, string> = {
    salary: 'رواتب',
    operational: 'تشغيلية',
    marketing: 'تسويق',
    other: 'أخرى',
  };

  const getQuarterData = (quarter: number) => {
    const quarterRevenues = revenues.filter(r => r.quarter === quarter);
    const quarterExpenses = expenses.filter(e => e.quarter === quarter);
    const totalRevenues = quarterRevenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = quarterExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = totalRevenues - totalExpenses;
    const operationsCount = quarterRevenues.length + quarterExpenses.length;

    return { totalRevenues, totalExpenses, netBalance, operationsCount };
  };

  const totalRevenues = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalRevenues - totalExpenses;
  const totalOperations = revenues.length + expenses.length;

  const avgQuarterlyRevenues = totalRevenues / 4;
  const avgQuarterlyExpenses = totalExpenses / 4;

  const expensesByType = expenses.reduce((acc, expense) => {
    acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">جاري التحميل...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الميزانية السنوية</h1>
            <p className="text-gray-600">ملخص شامل للإيرادات والمصروفات السنوية</p>
          </div>
          <Link href="/budget/quarterly">
            <Button style={{ backgroundColor: '#2563eb' }} className="text-white">
              الميزانية الربعية
            </Button>
          </Link>
        </div>

        {/* Year Selector */}
        <div className="mb-8">
          <Label>السنة</Label>
          <Input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="mt-1 w-32"
          />
        </div>

        {/* Annual Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات السنوية</p>
                <p className="text-2xl font-bold text-green-600">{totalRevenues.toLocaleString()} ر.س</p>
                <p className="text-xs text-gray-500 mt-1">{revenues.length} عملية</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي المصروفات السنوية</p>
                <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()} ر.س</p>
                <p className="text-xs text-gray-500 mt-1">{expenses.length} عملية</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">الصافي السنوي</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {netBalance.toLocaleString()} ر.س
                </p>
                <p className="text-xs text-gray-500 mt-1">{netBalance >= 0 ? 'فائض' : 'عجز'}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${netBalance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">متوسط الإيرادات الربعية</p>
                <p className="text-2xl font-bold text-gray-900">{avgQuarterlyRevenues.toLocaleString()} ر.س</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-1">متوسط المصروفات الربعية</p>
              <p className="text-lg font-bold text-gray-900">{avgQuarterlyExpenses.toLocaleString()} ر.س</p>
            </div>
          </div>
        </div>

        {/* Quarterly Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">مقارنة الأرباع - {selectedYear}</h2>
          <p className="text-gray-600 mb-6">تفصيل الإيرادات والمصروفات لكل ربع</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4">الربع</th>
                  <th className="text-right py-3 px-4">الإيرادات</th>
                  <th className="text-right py-3 px-4">المصروفات</th>
                  <th className="text-right py-3 px-4">الصافي</th>
                  <th className="text-right py-3 px-4">عدد العمليات</th>
                </tr>
              </thead>
              <tbody>
                {quarters.map((quarter) => {
                  const data = getQuarterData(quarter.id);
                  return (
                    <tr key={quarter.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold">{quarter.name}</td>
                      <td className="py-3 px-4 text-green-600">{data.totalRevenues.toLocaleString()} ر.س</td>
                      <td className="py-3 px-4 text-red-600">{data.totalExpenses.toLocaleString()} ر.س</td>
                      <td className={`py-3 px-4 font-semibold ${data.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {data.netBalance.toLocaleString()} ر.س
                      </td>
                      <td className="py-3 px-4">{data.operationsCount}</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-bold">
                  <td className="py-3 px-4">الإجمالي السنوي</td>
                  <td className="py-3 px-4 text-green-600">{totalRevenues.toLocaleString()} ر.س</td>
                  <td className="py-3 px-4 text-red-600">{totalExpenses.toLocaleString()} ر.س</td>
                  <td className={`py-3 px-4 ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {netBalance.toLocaleString()} ر.س
                  </td>
                  <td className="py-3 px-4">{totalOperations}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses by Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-6">توزيع المصروفات حسب النوع</h2>
          <p className="text-gray-600 mb-6">تفصيل المصروفات السنوية حسب الفئة</p>
          <div className="space-y-4">
            {Object.entries(expensesByType).map(([type, amount]) => {
              const percentage = ((amount / totalExpenses) * 100).toFixed(1);
              return (
                <div key={type}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{typeLabels[type]}</span>
                    <span className="text-gray-600">{amount.toLocaleString()} ر.س ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>ملاحظة:</strong> يتم تحديث البيانات في هذه الصفحة تلقائياً عند إضافة أو تعديل أي إيراد أو مصروف في الميزانية الربعية. 
            جميع الأرقام المعروضة هنا هي نتيجة تجميع البيانات من الأرباع الأربعة للسنة المحددة.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

