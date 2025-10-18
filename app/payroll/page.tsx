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
import { Plus, Pencil, Trash2, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";

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

interface Employee {
  id: number;
  name: string;
  baseSalary: number;
}

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
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      fetchPayroll();
    }
  }, [selectedYear, selectedMonth, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في تحميل الموظفين');
    }
  };

  const fetchPayroll = async () => {
    try {
      const response = await fetch(`/api/payroll?year=${selectedYear}&month=${selectedMonth}`);
      if (!response.ok) throw new Error('Failed to fetch payroll');
      const data = await response.json();
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const netSalary = formData.baseSalary - formData.socialInsurance - formData.deduction + formData.bonus;
    
    try {
      const url = editingId ? `/api/payroll?id=${editingId}` : '/api/payroll';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, netSalary }),
      });

      if (!response.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} payroll`);
      
      toast.success(editingId ? 'تم تحديث الراتب بنجاح' : 'تم إضافة الراتب بنجاح');
      setOpen(false);
      setEditingId(null);
      setFormData({
        employeeId: 0,
        year: selectedYear,
        month: selectedMonth,
        baseSalary: 0,
        socialInsurance: 0,
        deduction: 0,
        bonus: 0,
      });
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

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingId(null);
      setFormData({
        employeeId: 0,
        year: selectedYear,
        month: selectedMonth,
        baseSalary: 0,
        socialInsurance: 0,
        deduction: 0,
        bonus: 0,
      });
    }
  };

  const handleEmployeeChange = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    setFormData({
      ...formData,
      employeeId,
      baseSalary: employee?.baseSalary || 0,
    });
  };

  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">مسير الرواتب الشهرية</h1>
            <p className="text-gray-600">إدارة وتتبع رواتب الموظفين الشهرية</p>
          </div>
          <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: '#2563eb' }} className="text-white">
                <Plus className="ml-2" size={20} />
                إضافة راتب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingId ? 'تعديل راتب' : 'إضافة راتب جديد'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="employeeId">الموظف</Label>
                  <select
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => handleEmployeeChange(parseInt(e.target.value))}
                    required
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value={0}>اختر موظف</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
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
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="month">الشهر</Label>
                    <Input
                      id="month"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) || 0 })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="baseSalary">الراتب الأساسي (ر.س)</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: parseInt(e.target.value) || 0 })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="socialInsurance">التأمينات الاجتماعية (ر.س)</Label>
                  <Input
                    id="socialInsurance"
                    type="number"
                    value={formData.socialInsurance}
                    onChange={(e) => setFormData({ ...formData, socialInsurance: parseInt(e.target.value) || 0 })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deduction">الخصومات (ر.س)</Label>
                  <Input
                    id="deduction"
                    type="number"
                    value={formData.deduction}
                    onChange={(e) => setFormData({ ...formData, deduction: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bonus">المكافآت (ر.س)</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8f8f7' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">صافي الراتب:</span>
                    <span className="text-xl font-bold text-green-600">
                      {(formData.baseSalary - formData.socialInsurance - formData.deduction + formData.bonus).toLocaleString()} ر.س
                    </span>
                  </div>
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

        {/* Month/Year Selector */}
        <div className="mb-8 flex gap-4">
          <div>
            <Label>السنة</Label>
            <Input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
              className="mt-1"
            />
          </div>
          <div>
            <Label>الشهر</Label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full mt-1 p-2 border rounded-md"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            className="p-6 rounded-xl"
            style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0ef' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">عدد السجلات</p>
                <p className="text-3xl font-bold text-gray-900">{payroll.length}</p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
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
                <p className="text-sm text-gray-600 mb-1">إجمالي الرواتب</p>
                <p className="text-3xl font-bold text-gray-900">
                  {payroll.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()} ر.س
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}
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
                <p className="text-sm text-gray-600 mb-1">متوسط الراتب</p>
                <p className="text-3xl font-bold text-gray-900">
                  {payroll.length > 0 ? Math.round(payroll.reduce((sum, p) => sum + p.netSalary, 0) / payroll.length).toLocaleString() : 0} ر.س
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
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">الموظف</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">الراتب الأساسي</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">التأمينات</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">الخصومات</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">المكافآت</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">صافي الراتب</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {payroll.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-500">
                      لا توجد سجلات لهذا الشهر
                    </td>
                  </tr>
                ) : (
                  payroll.map((item, index) => (
                    <tr 
                      key={item.id}
                      style={{ 
                        borderTop: '1px solid #f0f0ef',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                      }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-gray-900 font-medium">{item.employeeName}</td>
                      <td className="p-4 text-gray-900">{item.baseSalary.toLocaleString()} ر.س</td>
                      <td className="p-4 text-gray-900">{item.socialInsurance.toLocaleString()} ر.س</td>
                      <td className="p-4 text-gray-900">{item.deduction.toLocaleString()} ر.س</td>
                      <td className="p-4 text-gray-900">{item.bonus.toLocaleString()} ر.س</td>
                      <td className="p-4 text-gray-900 font-bold">{item.netSalary.toLocaleString()} ر.س</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" style={{ color: '#2563eb' }} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
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

