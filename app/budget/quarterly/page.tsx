"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
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
  notes: string | null;
}

interface Revenue {
  id: number;
  year: number;
  month: number;
  quarter: number;
  source: string;
  amount: number;
  date: string;
  notes: string | null;
}

export default function QuarterlyBudgetPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [activeTab, setActiveTab] = useState<'expenses' | 'revenues'>('expenses');
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    type: 'operational' as 'salary' | 'operational' | 'marketing' | 'other',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [revenueForm, setRevenueForm] = useState({
    source: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedQuarter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesRes, revenuesRes] = await Promise.all([
        fetch(`/api/expenses?year=${selectedYear}&quarter=${selectedQuarter}`),
        fetch(`/api/revenues?year=${selectedYear}&quarter=${selectedQuarter}`)
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

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const date = new Date(expenseForm.date);
      const month = date.getMonth() + 1;

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          month,
          quarter: selectedQuarter,
          ...expenseForm,
        }),
      });

      if (!response.ok) throw new Error('Failed to add expense');

      toast.success('تم إضافة المصروف بنجاح');
      setExpenseDialogOpen(false);
      setExpenseForm({
        type: 'operational',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في إضافة المصروف');
    }
  };

  const handleAddRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const date = new Date(revenueForm.date);
      const month = date.getMonth() + 1;

      const response = await fetch('/api/revenues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          month,
          quarter: selectedQuarter,
          ...revenueForm,
        }),
      });

      if (!response.ok) throw new Error('Failed to add revenue');

      toast.success('تم إضافة الإيراد بنجاح');
      setRevenueDialogOpen(false);
      setRevenueForm({
        source: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في إضافة الإيراد');
    }
  };

  const quarters = [
    { id: 1, name: 'الربع الأول', months: 'يناير - مارس' },
    { id: 2, name: 'الربع الثاني', months: 'أبريل - يونيو' },
    { id: 3, name: 'الربع الثالث', months: 'يوليو - سبتمبر' },
    { id: 4, name: 'الربع الرابع', months: 'أكتوبر - ديسمبر' },
  ];

  const typeLabels: Record<string, string> = {
    salary: 'رواتب',
    operational: 'تشغيلية',
    marketing: 'تسويق',
    other: 'أخرى',
  };

  const totalRevenues = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalRevenues - totalExpenses;

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الميزانية الربعية</h1>
            <p className="text-gray-600">تتبع الإيرادات والمصروفات ربع سنوياً</p>
          </div>
          <Link href="/budget/annual">
            <Button style={{ backgroundColor: '#10b981' }} className="text-white">
              الميزانية السنوية
            </Button>
          </Link>
        </div>

        {/* Year Selector */}
        <div className="mb-6 flex gap-4">
          <div>
            <Label>السنة</Label>
            <Input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="mt-1 w-32"
            />
          </div>
        </div>

        {/* Quarters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quarters.map((quarter) => {
            const isSelected = quarter.id === selectedQuarter;
            return (
              <button
                key={quarter.id}
                onClick={() => setSelectedQuarter(quarter.id)}
                className={`p-6 rounded-xl text-right transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-white border border-gray-200 hover:border-blue-300'
                }`}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-1">{quarter.name}</h3>
                <p className="text-sm text-gray-600">{quarter.months}</p>
              </button>
            );
          })}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</p>
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
                <p className="text-sm text-gray-600 mb-1">إجمالي المصروفات</p>
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
                <p className="text-sm text-gray-600 mb-1">الصافي</p>
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
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'expenses'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            المصروفات
          </button>
          <button
            onClick={() => setActiveTab('revenues')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'revenues'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            الإيرادات
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {activeTab === 'expenses' ? `المصروفات - ${quarters[selectedQuarter - 1].name}` : `الإيرادات - ${quarters[selectedQuarter - 1].name}`}
            </h2>
            <Button
              onClick={() => activeTab === 'expenses' ? setExpenseDialogOpen(true) : setRevenueDialogOpen(true)}
              style={{ backgroundColor: activeTab === 'expenses' ? '#ef4444' : '#10b981' }}
              className="text-white"
            >
              <Plus className="ml-2" size={20} />
              {activeTab === 'expenses' ? 'إضافة مصروف' : 'إضافة إيراد'}
            </Button>
          </div>

          {activeTab === 'expenses' ? (
            expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">النوع</th>
                      <th className="text-right py-3 px-4">الوصف</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{new Date(expense.date).toLocaleDateString('ar-SA')}</td>
                        <td className="py-3 px-4">{typeLabels[expense.type]}</td>
                        <td className="py-3 px-4">{expense.description || '-'}</td>
                        <td className="py-3 px-4 font-semibold">{expense.amount.toLocaleString()} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد مصروفات مسجلة لهذا الربع</p>
            )
          ) : (
            revenues.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">المصدر</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenues.map((revenue) => (
                      <tr key={revenue.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{new Date(revenue.date).toLocaleDateString('ar-SA')}</td>
                        <td className="py-3 px-4">{revenue.source}</td>
                        <td className="py-3 px-4 font-semibold">{revenue.amount.toLocaleString()} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد إيرادات مسجلة لهذا الربع</p>
            )
          )}
        </div>

        {/* Expense Dialog */}
        <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مصروف جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <Label>النوع</Label>
                <select
                  value={expenseForm.type}
                  onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value as any })}
                  className="w-full mt-1 p-2 border rounded-md"
                  required
                >
                  <option value="salary">رواتب</option>
                  <option value="operational">تشغيلية</option>
                  <option value="marketing">تسويق</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <Label>الوصف</Label>
                <Input
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="وصف المصروف"
                />
              </div>
              <div>
                <Label>المبلغ (ر.س)</Label>
                <Input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label>التاريخ</Label>
                <Input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  placeholder="ملاحظات إضافية (اختياري)"
                />
              </div>
              <Button type="submit" className="w-full" style={{ backgroundColor: '#ef4444' }}>
                إضافة
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Revenue Dialog */}
        <Dialog open={revenueDialogOpen} onOpenChange={setRevenueDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة إيراد جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRevenue} className="space-y-4">
              <div>
                <Label>المصدر</Label>
                <Input
                  value={revenueForm.source}
                  onChange={(e) => setRevenueForm({ ...revenueForm, source: e.target.value })}
                  placeholder="مصدر الإيراد"
                  required
                />
              </div>
              <div>
                <Label>المبلغ (ر.س)</Label>
                <Input
                  type="number"
                  value={revenueForm.amount}
                  onChange={(e) => setRevenueForm({ ...revenueForm, amount: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label>التاريخ</Label>
                <Input
                  type="date"
                  value={revenueForm.date}
                  onChange={(e) => setRevenueForm({ ...revenueForm, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  value={revenueForm.notes}
                  onChange={(e) => setRevenueForm({ ...revenueForm, notes: e.target.value })}
                  placeholder="ملاحظات إضافية (اختياري)"
                />
              </div>
              <Button type="submit" className="w-full" style={{ backgroundColor: '#10b981' }}>
                إضافة
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

