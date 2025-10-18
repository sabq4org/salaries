"use client";

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

interface Contractor {
  id: number;
  name: string;
  position: string | null;
  salary: number;
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

  const handleDialogClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingId(null);
      setFormData({ name: "", position: "", salary: 0 });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">المتعاونون</h1>
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2" size={20} />
              إضافة متعاون جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل بيانات المتعاون' : 'إضافة متعاون جديد'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسم المتعاون"
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
                <Label htmlFor="salary">الراتب</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  required
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

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">قائمة المتعاونين</h2>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : contractors.length === 0 ? (
          <p className="text-muted-foreground">لا توجد بيانات</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">الاسم</th>
                  <th className="text-right p-2">المنصب</th>
                  <th className="text-right p-2">الراتب</th>
                  <th className="text-right p-2">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {contractors.map((contractor) => (
                  <tr key={contractor.id} className="border-b">
                    <td className="p-2">{contractor.name}</td>
                    <td className="p-2">{contractor.position || '-'}</td>
                    <td className="p-2">{contractor.salary.toLocaleString()} ر.س</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(contractor)}>
                          <Pencil size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(contractor.id)}>
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

