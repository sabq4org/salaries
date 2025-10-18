'use client';

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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: number;
  name: string;
  position: string | null;
  baseSalary: number;
  socialInsurance: number;
  isActive: boolean;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    baseSalary: 0,
    socialInsurance: 0,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
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
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create employee');
      
      toast.success('تم إضافة الموظف بنجاح');
      setOpen(false);
      setFormData({ name: "", position: "", baseSalary: 0, socialInsurance: 0 });
      fetchEmployees();
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في إضافة الموظف');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    
    try {
      const response = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete employee');
      
      toast.success('تم حذف الموظف بنجاح');
      fetchEmployees();
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في حذف الموظف');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">الموظفون الرسميون</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2" size={20} />
              إضافة موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>إضافة موظف جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسم الموظف"
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">المنصب الوظيفي</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="أدخل المنصب الوظيفي"
                />
              </div>
              <div>
                <Label htmlFor="baseSalary">الراتب الأساسي</Label>
                <Input
                  id="baseSalary"
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="socialInsurance">التأمينات الاجتماعية</Label>
                <Input
                  id="socialInsurance"
                  type="number"
                  value={formData.socialInsurance}
                  onChange={(e) => setFormData({ ...formData, socialInsurance: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">حفظ</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">قائمة الموظفين</h2>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : employees.length === 0 ? (
          <p className="text-muted-foreground">لا توجد بيانات</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">الاسم</th>
                  <th className="text-right p-2">المنصب</th>
                  <th className="text-right p-2">الراتب الأساسي</th>
                  <th className="text-right p-2">التأمينات</th>
                  <th className="text-right p-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b">
                    <td className="p-2">{emp.name}</td>
                    <td className="p-2">{emp.position || '-'}</td>
                    <td className="p-2">{emp.baseSalary.toLocaleString()} ر.س</td>
                    <td className="p-2">{emp.socialInsurance.toLocaleString()} ر.س</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Pencil size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(emp.id)}>
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
  );
}

