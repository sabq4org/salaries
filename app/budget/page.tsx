"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Expense {
  id: number;
  year: number;
  month: number;
  type: 'salary' | 'operational' | 'marketing' | 'other';
  description: string | null;
  amount: number;
}

export default function BudgetPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    type: 'operational' as 'salary' | 'operational' | 'marketing' | 'other',
    description: '',
    amount: 0,
  });

  useEffect(() => {
    fetchExpenses();
  }, [selectedYear]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`/api/expenses?year=${selectedYear}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/expenses?id=${editingId}` : '/api/expenses';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} expense`);
      
      toast.success(editingId ? 'تم تحديث المصروف بنجاح' : 'تم إضافة المصروف بنجاح');
      setOpen(false);
      setEditingId(null);
      setFormData({
        year: selectedYear,
        month: new Date().getMonth() + 1,
        type: 'operational',
        description: '',
        amount: 0,
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editingId ? 'فشل في تحديث المصروف' : 'فشل في إضافة المصروف');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      year: expense.year,
      month: expense.month,
      type: expense.type,
      description: expense.description || '',
      amount: expense.amount,
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    
    try {
      const response = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete expense');
      
      toast.success('تم حذف المصروف بنجاح');
      fetchExpenses();
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في حذف المصروف');
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingId(null);
      setFormData({
        year: selectedYear,
        month: new Date().getMonth() + 1,
        type: 'operational',
        description: '',
        amount: 0,
      });
    }
  };

  const typeLabels: Record<string, string> = {
    salary: 'رواتب',
    operational: 'تشغيلية',
    marketing: 'تسويق',
    other: 'أخرى',
  };

  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const totalByType = (type: string) => {
    return expenses.filter(e => e.type === type).reduce((sum, e) => sum + e.amount, 0);
  };

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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الميزانية السنوية</h1>
            <p className="text-gray-600">تتبع وإدارة المصروفات السنوية</p>
          </div>
          <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: '#2563eb' }} className="text-white">
                <Plus className="ml-2" size={20} />
                إضافة مصروف
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingId ? 'تعديل مصروف' : 'إضافة مصروف جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">السنة</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="month">الشهر</Label>
                    <select
                      id="month"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                      required
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index + 1}>{month}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">نوع المصروف</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    required
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="salary">رواتب</option>
                    <option value="operational">تشغيلية</option>
                    <option value="marketing">تسويق</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1"
                    placeholder="وصف المصروف (اختياري)"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">المبلغ (ر.س)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" style={{ backgroundColor: '#2563eb' }} className="flex-1 text-white">
                    {editingId ? 'حفظ التعديلات' : 'إضافة'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Year Selector */}
        <div className="mb-8">
          <Label>السنة</Label>
          <Input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
            className="mt-1 max-w-xs"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="p-6 rounded-xl"
            style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0ef' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">رواتب</p>
                <p className="text-2xl font-bold text-gray-900">{totalByType('salary').toLocaleString()} ر.س</p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
              >
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div 
            className="p-6 rounded-xl"
            style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0ef' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">تشغيلية</p>
                <p className="text-2xl font-bold text-gray-900">{totalByType('operational').toLocaleString()} ر.س</p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}
              >
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div 
            className="p-6 rounded-xl"
            style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0ef' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">تسويق</p>
                <p className="text-2xl font-bold text-gray-900">{totalByType('marketing').toLocaleString()} ر.س</p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#fef3f2', color: '#dc2626' }}
              >
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div 
            className="p-6 rounded-xl"
            style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0ef' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">الإجمالي</p>
                <p className="text-2xl font-bold text-gray-900">
                  {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0ef' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#f8f8f7' }}>
                <tr>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">التاريخ</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">النوع</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">الوصف</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">المبلغ</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                      لا توجد مصروفات لهذه السنة
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense, index) => (
                    <tr 
                      key={expense.id}
                      style={{ 
                        borderTop: '1px solid #f0f0ef',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                      }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-gray-900 font-medium">
                        {months[expense.month - 1]} {expense.year}
                      </td>
                      <td className="p-4 text-gray-900">{typeLabels[expense.type]}</td>
                      <td className="p-4 text-gray-600">{expense.description || '-'}</td>
                      <td className="p-4 text-gray-900 font-bold">{expense.amount.toLocaleString()} ر.س</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(expense)}
                            className="hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" style={{ color: '#2563eb' }} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(expense.id)}
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" style={{ color: '#dc2626' }} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

