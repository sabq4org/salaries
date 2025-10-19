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

interface Contractor {
  id: number;
  name: string;
  position: string | null;
  salary: number;
  sortOrder: number;
  isActive: boolean;
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    salary: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      const response = await fetch('/api/contractors');
      if (!response.ok) throw new Error('Failed to fetch contractors');
      const data = await response.json();
      setContractors(data);
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
      const oldIndex = contractors.findIndex((c) => c.id === active.id);
      const newIndex = contractors.findIndex((c) => c.id === over.id);

      const newContractors = arrayMove(contractors, oldIndex, newIndex);
      setContractors(newContractors);

      // Update sortOrder for all contractors
      const updates = newContractors.map((con, index) => ({
        id: con.id,
        sortOrder: index,
      }));

      try {
        const response = await fetch('/api/contractors/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: updates }),
        });

        if (!response.ok) throw new Error('Failed to reorder contractors');
        toast.success('تم تحديث الترتيب بنجاح');
      } catch (error) {
        console.error('Error:', error);
        toast.error('فشل في حفظ الترتيب');
        fetchContractors(); // Revert on error
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/contractors?id=${editingId}` : '/api/contractors';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Failed to ${editingId ? 'update' : 'create'} contractor`);
      
      toast.success(editingId ? 'تم تحديث المتعاون بنجاح' : 'تم إضافة المتعاون بنجاح');
      setOpen(false);
      setEditingId(null);
      setFormData({ name: "", position: "", salary: 0 });
      fetchContractors();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editingId ? 'فشل في تحديث المتعاون' : 'فشل في إضافة المتعاون');
    }
  };

  const handleEdit = (contractor: Contractor) => {
    setEditingId(contractor.id);
    setFormData({
      name: contractor.name,
      position: contractor.position || "",
      salary: contractor.salary,
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المتعاون؟')) return;
    
    try {
      const response = await fetch(`/api/contractors?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete contractor');
      
      toast.success('تم حذف المتعاون بنجاح');
      fetchContractors();
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في حذف المتعاون');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary"></div>
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
            المتعاونون
          </h1>
          <p className="text-muted-foreground">
            إدارة بيانات المتعاونين والرواتب
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingId(null);
                setFormData({ name: "", position: "", salary: 0 });
              }}
              className="bg-primary text-primary-foreground hover:opacity-90"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة متعاون جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingId ? 'تعديل متعاون' : 'إضافة متعاون جديد'}
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
                <Label htmlFor="salary">الراتب (ر.س)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })}
                  required
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي المتعاونين</p>
              <p className="text-3xl font-bold text-foreground">{contractors.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">إجمالي الرواتب</p>
              <p className="text-3xl font-bold text-foreground">
                {contractors.reduce((sum, c) => sum + c.salary, 0).toLocaleString()} ر.س
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
              <thead className="bg-muted">
                <tr>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground w-12"></th>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground">الاسم</th>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground">المنصب</th>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground">الراتب</th>
                  <th className="text-center p-4 text-sm font-semibold text-muted-foreground">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {contractors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">
                      لا يوجد متعاونون
                    </td>
                  </tr>
                ) : (
                  <SortableContext
                    items={contractors.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {contractors.map((contractor, index) => (
                      <SortableRow
                        key={contractor.id}
                        contractor={contractor}
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
