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
import { Plus, Pencil, Trash2, Users, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableRow } from './SortableRow';

interface Employee {
  id: number;
  name: string;
  position: string | null;
  baseSalary: number;
  socialInsurance: number;
  leaveBalance: number;
  sortOrder: number;
  isActive: boolean;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    baseSalary: 0,
    socialInsurance: 0,
    leaveBalance: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = employees.findIndex((e) => e.id === active.id);
      const newIndex = employees.findIndex((e) => e.id === over.id);

      const newEmployees = arrayMove(employees, oldIndex, newIndex);
      setEmployees(newEmployees);

      // Update sortOrder for all employees
      const updates = newEmployees.map((emp, index) => ({
        id: emp.id,
        sortOrder: index,
      }));

      try {
        const response = await fetch('/api/employees/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: updates }),
        });

        if (!response.ok) throw new Error('Failed to reorder employees');
        toast.success('تم تحديث الترتيب بنجاح');
      } catch (error) {
        console.error('Error:', error);
        toast.error('فشل في حفظ الترتيب');
        fetchEmployees(); // Revert on error
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/employees?id=${editingId}` : '/api/employees';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} employee`);
      
      toast.success(editingId ? 'تم تحديث الموظف بنجاح' : 'تم إضافة الموظف بنجاح');
      setOpen(false);
      setEditingId(null);
      setFormData({ name: "", position: "", baseSalary: 0, socialInsurance: 0, leaveBalance: 0 });
      fetchEmployees();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editingId ? 'فشل في تحديث الموظف' : 'فشل في إضافة الموظف');
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setFormData({
      name: employee.name,
      position: employee.position || "",
      baseSalary: employee.baseSalary,
      socialInsurance: employee.socialInsurance,
      leaveBalance: employee.leaveBalance || 0,
    });
    setOpen(true);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            الموظفون الرسميون
          </h1>
          <p className="text-muted-foreground">
            إدارة بيانات الموظفين والرواتب والتأمينات الاجتماعية
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingId(null);
                setFormData({ name: "", position: "", baseSalary: 0, socialInsurance: 0, leaveBalance: 0 });
              }}
              className="text-white hover:opacity-90"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" className="bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingId ? 'تعديل موظف' : 'إضافة موظف جديد'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="position">المنصب الوظيفي</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="mt-1"
                />
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
                <Label htmlFor="leaveBalance">رصيد الإجازات (أيام)</Label>
                <Input
                  id="leaveBalance"
                  type="number"
                  value={formData.leaveBalance}
                  onChange={(e) => setFormData({ ...formData, leaveBalance: parseInt(e.target.value) || 0 })}
                  required
                  className="mt-1"
                  placeholder="عدد أيام الإجازات المستحقة"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 text-white">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي الموظفين</p>
              <p className="text-3xl font-bold text-foreground">{employees.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي الرواتب</p>
              <p className="text-3xl font-bold text-foreground">
                {employees.reduce((sum, e) => sum + e.baseSalary, 0).toLocaleString()} ر.س
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي التأمينات</p>
              <p className="text-3xl font-bold text-foreground">
                {employees.reduce((sum, e) => sum + e.socialInsurance, 0).toLocaleString()} ر.س
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden bg-card border border-border">
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700 w-12"></th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">الاسم</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">المنصب</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">الراتب الأساسي</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">التأمينات</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                      لا يوجد موظفون
                    </td>
                  </tr>
                ) : (
                  <SortableContext
                    items={employees.map(e => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {employees.map((employee, index) => (
                      <SortableRow
                        key={employee.id}
                        employee={employee}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>
    </DashboardLayout>
  );
}
