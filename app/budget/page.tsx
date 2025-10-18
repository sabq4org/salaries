"use client";
"use client";

import DashboardLayout from "@/components/DashboardLayout";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface Expense {
  id: number;
  year: number;
  month: number;
  type: string;
  description: string | null;
  amount: number;
}

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const EXPENSE_TYPES = [
  { value: "salary", label: "رواتب" },
  { value: "operational", label: "تشغيلية" },
  { value: "marketing", label: "تسويق" },
  { value: "other", label: "أخرى" },
];

export default function BudgetPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    type: "operational",
    description: "",
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
      resetForm();
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
      description: expense.description || "",
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

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      type: "operational",
      description: "",
      amount: 0,
    });
  };

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingId(null);
      resetForm();
    }
  };

  const getExpensesByType = () => {
    return EXPENSE_TYPES.map(type => ({
      ...type,
      total: expenses
        .filter(e => e.type === type.value)
        .reduce((sum, e) => sum + e.amount, 0)
    }));
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  };

  const getMonthlyExpenses = () => {
    const monthly = Array(12).fill(0);
    expenses.forEach(e => {
      if (e.month >= 1 && e.month <= 12) {
        monthly[e.month - 1] += e.amount;
      }
    });
    return monthly;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">الميزانية السنوية</h1>
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2" size={20} />
              إضافة مصروف
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل المصروف' : 'إضافة مصروف جديد'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">السنة</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="month">الشهر</Label>
                  <Select
                    value={formData.month.toString()}
                    onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="type">نوع المصروف</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">المبلغ</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="أدخل وصف المصروف"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  إلغاء
                </Button>
                <Button type="submit">{editingId ? 'تحديث' : 'حفظ'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Year Filter */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <Label>السنة:</Label>
          <Input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
            className="w-[120px]"
          />
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm mb-1">إجمالي المصروفات</p>
              <p className="text-2xl font-bold">{getTotalExpenses().toLocaleString()} ر.س</p>
            </div>
            <TrendingDown size={40} className="text-red-200" />
          </div>
        </Card>

        {getExpensesByType().slice(0, 3).map((type, index) => (
          <Card key={type.value} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{type.label}</p>
                <p className="text-2xl font-bold">{type.total.toLocaleString()} ر.س</p>
              </div>
              <TrendingUp size={40} className="text-gray-400" />
            </div>
          </Card>
        ))}
      </div>

      {/* Monthly Chart */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">المصروفات الشهرية</h2>
        <div className="grid grid-cols-12 gap-2">
          {getMonthlyExpenses().map((amount, index) => {
            const maxAmount = Math.max(...getMonthlyExpenses());
            const height = maxAmount > 0 ? (amount / maxAmount) * 200 : 0;
            
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="text-xs text-gray-600">{amount.toLocaleString()}</div>
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${height}px`, minHeight: amount > 0 ? '20px' : '0' }}
                />
                <div className="text-xs text-gray-600">{MONTHS[index].slice(0, 3)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Expenses Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">سجل المصروفات</h2>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : expenses.length === 0 ? (
          <p className="text-muted-foreground">لا توجد بيانات لهذه السنة</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderTop: "1px solid #f0f0ef" }}>
                  <th className="text-right p-2">التاريخ</th>
                  <th className="text-right p-2">النوع</th>
                  <th className="text-right p-2">الوصف</th>
                  <th className="text-right p-2">المبلغ</th>
                  <th className="text-right p-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} style={{ borderTop: "1px solid #f0f0ef" }}>
                    <td className="p-2">{MONTHS[expense.month - 1]} {expense.year}</td>
                    <td className="p-2">
                      {EXPENSE_TYPES.find(t => t.value === expense.type)?.label || expense.type}
                    </td>
                    <td className="p-2">{expense.description || '-'}</td>
                    <td className="p-2 font-semibold">{expense.amount.toLocaleString()} ر.س</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(expense)}>
                          <Pencil size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(expense.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
    </DashboardLayout>
  );
}

