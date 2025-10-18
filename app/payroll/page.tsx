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
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: number;
  name: string;
  baseSalary: number;
}

interface Payroll {
  id: number;
  employeeId: number;
  employeeName?: string;
  year: number;
  month: number;
  baseSalary: number;
  socialInsurance: number;
  deduction: number;
  bonus: number;
  netSalary: number;
}

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [formData, setFormData] = useState({
    employeeId: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    baseSalary: 0,
    socialInsurance: 0,
    deduction: 0,
    bonus: 0,
  });

  useEffect(() => {
    fetchEmployees();
    fetchPayroll();
  }, [selectedYear, selectedMonth]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPayroll = async () => {
    try {
      const response = await fetch(`/api/payroll?year=${selectedYear}&month=${selectedMonth}`);
      if (!response.ok) throw new Error('Failed to fetch payroll');
      const data = await response.json();
      
      // Map employee names
      const payrollWithNames = data.map((p: Payroll) => {
        const employee = employees.find(e => e.id === p.employeeId);
        return { ...p, employeeName: employee?.name || 'غير معروف' };
      });
      
      setPayroll(payrollWithNames);
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const calculateNetSalary = () => {
    const { baseSalary, socialInsurance, deduction, bonus } = formData;
    return baseSalary + socialInsurance - deduction + bonus;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const netSalary = calculateNetSalary();
      const payload = { ...formData, netSalary };
      
      const url = editingId ? `/api/payroll?id=${editingId}` : '/api/payroll';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} payroll`);
      
      toast.success(editingId ? 'تم تحديث الراتب بنجاح' : 'تم إضافة الراتب بنجاح');
      setOpen(false);
      setEditingId(null);
      resetForm();
      fetchPayroll();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editingId ? 'فشل في تحديث الراتب' : 'فشل في إضافة الراتب');
    }
  };

  const handleEdit = (item: Payroll) => {
    setEditingId(item.id);
    setFormData({
      employeeId: item.employeeId,
      year: item.year,
      month: item.month,
      baseSalary: item.baseSalary,
      socialInsurance: item.socialInsurance,
      deduction: item.deduction,
      bonus: item.bonus,
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    
    try {
      const response = await fetch(`/api/payroll?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete payroll');
      
      toast.success('تم حذف السجل بنجاح');
      fetchPayroll();
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في حذف السجل');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: 0,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      baseSalary: 0,
      socialInsurance: 0,
      deduction: 0,
      bonus: 0,
    });
  };

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingId(null);
      resetForm();
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(e => e.id === parseInt(employeeId));
    setFormData({
      ...formData,
      employeeId: parseInt(employeeId),
      baseSalary: employee?.baseSalary || 0,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">مسير الرواتب الشهرية</h1>
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2" size={20} />
              إضافة راتب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل الراتب' : 'إضافة راتب جديد'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employee">الموظف</Label>
                  <Select
                    value={formData.employeeId.toString()}
                    onValueChange={handleEmployeeChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر موظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="baseSalary">الراتب الأساسي</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="socialInsurance">التأمينات الاجتماعية</Label>
                  <Input
                    id="socialInsurance"
                    type="number"
                    value={formData.socialInsurance}
                    onChange={(e) => setFormData({ ...formData, socialInsurance: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="bonus">المكافآت</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deduction">الخصومات</Label>
                <Input
                  id="deduction"
                  type="number"
                  value={formData.deduction}
                  onChange={(e) => setFormData({ ...formData, deduction: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">صافي الراتب</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {calculateNetSalary().toLocaleString()} ر.س
                </p>
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

      {/* Filter */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <Calendar size={20} className="text-gray-600" />
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[180px]">
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
          <Input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
            className="w-[120px]"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">سجلات الرواتب</h2>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : payroll.length === 0 ? (
          <p className="text-muted-foreground">لا توجد بيانات لهذا الشهر</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">الموظف</th>
                  <th className="text-right p-2">الراتب الأساسي</th>
                  <th className="text-right p-2">التأمينات الاجتماعية</th>
                  <th className="text-right p-2">المكافآت</th>
                  <th className="text-right p-2">الخصومات</th>
                  <th className="text-right p-2">صافي الراتب</th>
                  <th className="text-right p-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.employeeName}</td>
                    <td className="p-2">{item.baseSalary.toLocaleString()} ر.س</td>
                    <td className="p-2">{item.socialInsurance.toLocaleString()} ر.س</td>
                    <td className="p-2">{item.bonus.toLocaleString()} ر.س</td>
                    <td className="p-2 text-red-600">{item.deduction.toLocaleString()} ر.س</td>
                    <td className="p-2 font-semibold">{item.netSalary.toLocaleString()} ر.س</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                          <Pencil size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="p-2">الإجمالي</td>
                  <td className="p-2">{payroll.reduce((sum, item) => sum + item.baseSalary, 0).toLocaleString()} ر.س</td>
                  <td className="p-2">{payroll.reduce((sum, item) => sum + item.socialInsurance, 0).toLocaleString()} ر.س</td>
                  <td className="p-2">{payroll.reduce((sum, item) => sum + item.bonus, 0).toLocaleString()} ر.س</td>
                  <td className="p-2 text-red-600">{payroll.reduce((sum, item) => sum + item.deduction, 0).toLocaleString()} ر.س</td>
                  <td className="p-2 text-blue-600">{payroll.reduce((sum, item) => sum + item.netSalary, 0).toLocaleString()} ر.س</td>
                  <td className="p-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
    </DashboardLayout>
  );
}

