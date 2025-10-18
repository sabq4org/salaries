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
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

interface Contractor {
  id: number;
  name: string;
  position: string | null;
  salary: number;
  // No social insurance for contractors
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2563eb' }}></div>
            <p className="text-gray-600">جاري تحميل البيانات...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            المتعاونون
          </h1>
          <p className="text-gray-600">
            إدارة بيانات المتعاونين والمستقلين
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingId(null);
              }}
              style={{ backgroundColor: '#2563eb' }}
              className="text-white hover:opacity-90"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة متعاون جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" style={{ backgroundColor: '#ffffff' }}>
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
                <Label htmlFor="salary">الراتب الشهري (ر.س)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Input
                  type="number"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0ef' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي المتعاونين</p>
              <p className="text-3xl font-bold text-gray-900">{contractors.length}</p>
            </div>
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
            >
              <Users className="h-6 w-6" />
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
                {contractors.reduce((sum, e) => sum + e.salary, 0).toLocaleString()} ر.س
              </p>
            </div>
          </div>
        </div>

        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0ef' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">إجمالي التأمينات</p>
              <p className="text-3xl font-bold text-gray-900">
                {contractors.reduce((sum, e) => sum + e. 0).toLocaleString()} ر.س
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0ef' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#f8f8f7' }}>
              <tr>
                <th className="text-right p-4 text-sm font-semibold text-gray-700">الاسم</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-700">المنصب</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-700">الراتب الشهري</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-700">التأمينات</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {contractors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-500">
                    لا يوجد متعاونون
                  </td>
                </tr>
              ) : (
                contractors.map((contractor, index) => (
                  <tr 
                    key={contractor.id}
                    style={{ 
                      borderTop: '1px solid #f0f0ef',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                    }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-gray-900 font-medium">{contractor.name}</td>
                    <td className="p-4 text-gray-600">{contractor.position || '-'}</td>
                    <td className="p-4 text-gray-900">{contractor.salary.toLocaleString()} ر.س</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(contractor)}
                          className="hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" style={{ color: '#2563eb' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(contractor.id)}
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
    </DashboardLayout>
  );
}
