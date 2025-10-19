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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, TrendingDown, DollarSign, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Expense {
  id: number;
  year: number;
  month: number;
  quarter: number;
  type: string;
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

interface ExpenseCategory {
  id: number;
  name: string;
  nameEn: string | null;
  description: string | null;
  color: string | null;
  icon: string | null;
  isActive: boolean;
  displayOrder: number;
}

export default function QuarterlyBudgetPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [activeTab, setActiveTab] = useState<'expenses' | 'revenues'>('expenses');
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'expense' | 'revenue', id: number } | null>(null);

  const [expenseForm, setExpenseForm] = useState({
    type: '',
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
    fetchExpenseCategories();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedQuarter]);

  const fetchExpenseCategories = async () => {
    try {
      const response = await fetch('/api/expense-categories?active=true');
      if (response.ok) {
        const categories = await response.json();
        setExpenseCategories(categories);
        // Set default category if available
        if (categories.length > 0 && !expenseForm.type) {
          setExpenseForm(prev => ({ ...prev, type: categories[0].name }));
        }
      }
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      toast.error('فشل في تحميل فئات المصروفات');
    }
  };

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
          type: expenseForm.type,
          description: expenseForm.description,
          amount: expenseForm.amount,
          date: expenseForm.date,
          notes: expenseForm.notes,
        }),
      });

      if (response.ok) {
        toast.success('تم إضافة المصروف بنجاح');
        setExpenseDialogOpen(false);
        setExpenseForm({
          type: expenseCategories.length > 0 ? expenseCategories[0].name : '',
          description: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        fetchData();
      } else {
        toast.error('فشل في إضافة المصروف');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('حدث خطأ أثناء إضافة المصروف');
    }
  };

  const handleEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    try {
      const date = new Date(expenseForm.date);
      const month = date.getMonth() + 1;

      const response = await fetch(`/api/expenses?id=${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          month,
          quarter: selectedQuarter,
          type: expenseForm.type,
          description: expenseForm.description,
          amount: expenseForm.amount,
          date: expenseForm.date,
          notes: expenseForm.notes,
        }),
      });

      if (response.ok) {
        toast.success('تم تحديث المصروف بنجاح');
        setExpenseDialogOpen(false);
        setEditingExpense(null);
        setExpenseForm({
          type: expenseCategories.length > 0 ? expenseCategories[0].name : '',
          description: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        fetchData();
      } else {
        toast.error('فشل في تحديث المصروف');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('حدث خطأ أثناء تحديث المصروف');
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
          source: revenueForm.source,
          amount: revenueForm.amount,
          date: revenueForm.date,
          notes: revenueForm.notes,
        }),
      });

      if (response.ok) {
        toast.success('تم إضافة الإيراد بنجاح');
        setRevenueDialogOpen(false);
        setRevenueForm({
          source: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        fetchData();
      } else {
        toast.error('فشل في إضافة الإيراد');
      }
    } catch (error) {
      console.error('Error adding revenue:', error);
      toast.error('حدث خطأ أثناء إضافة الإيراد');
    }
  };

  const handleEditRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRevenue) return;

    try {
      const date = new Date(revenueForm.date);
      const month = date.getMonth() + 1;

      const response = await fetch(`/api/revenues?id=${editingRevenue.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          month,
          quarter: selectedQuarter,
          source: revenueForm.source,
          amount: revenueForm.amount,
          date: revenueForm.date,
          notes: revenueForm.notes,
        }),
      });

      if (response.ok) {
        toast.success('تم تحديث الإيراد بنجاح');
        setRevenueDialogOpen(false);
        setEditingRevenue(null);
        setRevenueForm({
          source: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        fetchData();
      } else {
        toast.error('فشل في تحديث الإيراد');
      }
    } catch (error) {
      console.error('Error updating revenue:', error);
      toast.error('حدث خطأ أثناء تحديث الإيراد');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const endpoint = itemToDelete.type === 'expense' ? '/api/expenses' : '/api/revenues';
      const response = await fetch(`${endpoint}?id=${itemToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(`تم حذف ${itemToDelete.type === 'expense' ? 'المصروف' : 'الإيراد'} بنجاح`);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        fetchData();
      } else {
        toast.error(`فشل في حذف ${itemToDelete.type === 'expense' ? 'المصروف' : 'الإيراد'}`);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const openEditExpenseDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      type: expense.type,
      description: expense.description || '',
      amount: expense.amount,
      date: new Date(expense.date).toISOString().split('T')[0],
      notes: expense.notes || '',
    });
    setExpenseDialogOpen(true);
  };

  const openEditRevenueDialog = (revenue: Revenue) => {
    setEditingRevenue(revenue);
    setRevenueForm({
      source: revenue.source,
      amount: revenue.amount,
      date: new Date(revenue.date).toISOString().split('T')[0],
      notes: revenue.notes || '',
    });
    setRevenueDialogOpen(true);
  };

  const openDeleteDialog = (type: 'expense' | 'revenue', id: number) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const closeExpenseDialog = () => {
    setExpenseDialogOpen(false);
    setEditingExpense(null);
    setExpenseForm({
      type: expenseCategories.length > 0 ? expenseCategories[0].name : '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const closeRevenueDialog = () => {
    setRevenueDialogOpen(false);
    setEditingRevenue(null);
    setRevenueForm({
      source: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const quarters = [
    { id: 1, name: 'الربع الأول', months: 'يناير - مارس' },
    { id: 2, name: 'الربع الثاني', months: 'أبريل - يونيو' },
    { id: 3, name: 'الربع الثالث', months: 'يوليو - سبتمبر' },
    { id: 4, name: 'الربع الرابع', months: 'أكتوبر - ديسمبر' },
  ];

  // Create a map of category names for display
  const getCategoryDisplay = (categoryName: string) => {
    const category = expenseCategories.find(cat => cat.name === categoryName);
    return category ? category.name : categoryName;
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalRevenues = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const netBalance = totalRevenues - totalExpenses;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">الميزانية الربعية</h1>
            <p className="text-muted-foreground mt-1">إدارة المصروفات والإيرادات الربعية</p>
          </div>
          <Link href="/budget/annual">
            <Button variant="outline">
              عرض الميزانية السنوية
            </Button>
          </Link>
        </div>

        {/* Year Selector */}
        <div className="flex gap-4 items-center">
          <Label className="text-lg font-semibold">السنة:</Label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 border rounded-md"
          >
            {[2023, 2024, 2025, 2026, 2027].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Quarter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quarters.map((quarter) => {
            const isSelected = selectedQuarter === quarter.id;
            return (
              <button
                key={quarter.id}
                onClick={() => setSelectedQuarter(quarter.id)}
                className={`p-6 rounded-xl text-right transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-white border border-border hover:border-blue-300'
                }`}
              >
                <h3 className="text-lg font-bold text-foreground mb-1">{quarter.name}</h3>
                <p className="text-sm text-muted-foreground">{quarter.months}</p>
              </button>
            );
          })}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">{totalRevenues.toLocaleString()} ر.س</p>
                <p className="text-xs text-muted-foreground mt-1">{revenues.length} عملية</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()} ر.س</p>
                <p className="text-xs text-muted-foreground mt-1">{expenses.length} عملية</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">الصافي</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {netBalance.toLocaleString()} ر.س
                </p>
                <p className="text-xs text-muted-foreground mt-1">{netBalance >= 0 ? 'فائض' : 'عجز'}</p>
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
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            المصروفات
          </button>
          <button
            onClick={() => setActiveTab('revenues')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'revenues'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            الإيرادات
          </button>
        </div>

        {/* Content */}
        <div className="bg-card rounded-xl border border-border p-6">
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
                      <th className="text-right py-3 px-4">الفئة</th>
                      <th className="text-right py-3 px-4">الوصف</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b hover:bg-accent">
                        <td className="py-3 px-4">{new Date(expense.date).toLocaleDateString('ar-SA')}</td>
                        <td className="py-3 px-4">{getCategoryDisplay(expense.type)}</td>
                        <td className="py-3 px-4">{expense.description || '-'}</td>
                        <td className="py-3 px-4 font-semibold">{expense.amount.toLocaleString()} ر.س</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditExpenseDialog(expense)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog('expense', expense.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد مصروفات مسجلة لهذا الربع</p>
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
                      <th className="text-right py-3 px-4">الملاحظات</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenues.map((revenue) => (
                      <tr key={revenue.id} className="border-b hover:bg-accent">
                        <td className="py-3 px-4">{new Date(revenue.date).toLocaleDateString('ar-SA')}</td>
                        <td className="py-3 px-4">{revenue.source}</td>
                        <td className="py-3 px-4 font-semibold">{revenue.amount.toLocaleString()} ر.س</td>
                        <td className="py-3 px-4">{revenue.notes || '-'}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditRevenueDialog(revenue)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog('revenue', revenue.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد إيرادات مسجلة لهذا الربع</p>
            )
          )}
        </div>
      </div>

      {/* Expense Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={closeExpenseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'تعديل مصروف' : 'إضافة مصروف جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editingExpense ? handleEditExpense : handleAddExpense} className="space-y-4">
            <div>
              <Label>الفئة</Label>
              <select
                value={expenseForm.type}
                onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
                className="w-full mt-1 p-2 border rounded-md"
                required
              >
                {expenseCategories.length === 0 ? (
                  <option value="">لا توجد فئات متاحة</option>
                ) : (
                  expenseCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <Label>الوصف</Label>
              <Input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="وصف المصروف"
                required
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
              {editingExpense ? 'تحديث' : 'إضافة'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Revenue Dialog */}
      <Dialog open={revenueDialogOpen} onOpenChange={closeRevenueDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingRevenue ? 'تعديل إيراد' : 'إضافة إيراد جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editingRevenue ? handleEditRevenue : handleAddRevenue} className="space-y-4">
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
              {editingRevenue ? 'تحديث' : 'إضافة'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا {itemToDelete?.type === 'expense' ? 'المصروف' : 'الإيراد'}؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

