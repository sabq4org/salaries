"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Calendar as CalendarIcon,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Employee {
  id: number;
  name: string;
  position: string | null;
}

interface Reminder {
  id: number;
  title: string;
  type: string;
  employeeId: number | null;
  employeeName: string | null;
  startDate: string | null;
  dueDate: string;
  notes: string | null;
  status: string;
  isCompleted: boolean;
  createdAt: string;
}

const reminderTypes = {
  residence_expiry: "انتهاء إقامة",
  leave_start: "بداية إجازة",
  leave_end: "نهاية إجازة",
  insurance_payment: "استحقاق تأمينات",
  contract_renewal: "تجديد عقد",
  document_expiry: "انتهاء وثيقة",
  other: "أخرى",
};

const statusColors = {
  overdue: "bg-red-100 border-red-300 text-red-800",
  due_soon: "bg-orange-100 border-orange-300 text-orange-800",
  pending: "bg-yellow-100 border-yellow-300 text-yellow-800",
  completed: "bg-green-100 border-green-300 text-green-800",
};

const statusIcons = {
  overdue: AlertCircle,
  due_soon: Clock,
  pending: Bell,
  completed: CheckCircle2,
};

export default function RemindersPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "other",
    employeeId: "",
    notes: "",
  });
  const [startDate, setStartDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();

  useEffect(() => {
    fetchEmployees();
    fetchReminders();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees");
      const data = await response.json();
      setEmployees(data.filter((emp: any) => emp.isActive));
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("فشل تحميل الموظفين");
    }
  };

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reminders");
      const data = await response.json();
      setReminders(data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast.error("فشل تحميل التذكيرات");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !dueDate) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      const payload = {
        ...formData,
        employeeId: formData.employeeId && formData.employeeId !== 'none' ? parseInt(formData.employeeId) : null,
        startDate: startDate?.toISOString() || null,
        dueDate: dueDate.toISOString(),
      };

      const url = editingId ? "/api/reminders" : "/api/reminders";
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...payload, id: editingId } : payload;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("فشل في حفظ التذكير");
      }

      toast.success(editingId ? "تم تحديث التذكير" : "تم إضافة التذكير");
      handleReset();
      fetchReminders();
      setOpen(false);
    } catch (error: any) {
      console.error("Error saving reminder:", error);
      toast.error(error.message || "فشل في حفظ التذكير");
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setFormData({
      title: reminder.title,
      type: reminder.type,
      employeeId: reminder.employeeId?.toString() || "",
      notes: reminder.notes || "",
    });
    setStartDate(reminder.startDate ? new Date(reminder.startDate) : undefined);
    setDueDate(new Date(reminder.dueDate));
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا التذكير؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/reminders?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("فشل في حذف التذكير");
      }

      toast.success("تم حذف التذكير");
      fetchReminders();
    } catch (error: any) {
      console.error("Error deleting reminder:", error);
      toast.error(error.message || "فشل في حذف التذكير");
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const response = await fetch("/api/reminders/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("فشل في إكمال التذكير");
      }

      toast.success("تم إكمال التذكير");
      fetchReminders();
    } catch (error: any) {
      console.error("Error completing reminder:", error);
      toast.error(error.message || "فشل في إكمال التذكير");
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({
      title: "",
      type: "other",
      employeeId: "",
      notes: "",
    });
    setStartDate(undefined);
    setDueDate(undefined);
  };

  const handleAddNew = () => {
    handleReset();
    setOpen(true);
  };

  // Calculate statistics
  const totalReminders = reminders.filter((r) => !r.isCompleted).length;
  const overdueCount = reminders.filter((r) => r.status === "overdue").length;
  const dueSoonCount = reminders.filter((r) => r.status === "due_soon").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">التذكيرات</h1>
            <p className="text-gray-600 mt-1">
              إدارة التنبيهات المهمة والمواعيد القادمة
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة تذكير جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingId ? "تعديل تذكير" : "إضافة تذكير جديد"}
                </DialogTitle>
                <DialogDescription>
                  قم بإدخال تفاصيل التذكير والموعد المطلوب
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان التذكير *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="مثال: انتهاء إقامة هاني النجومي"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع التذكير *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(reminderTypes).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>الموظف المعني (اختياري)</Label>
                    <Select
                      value={formData.employeeId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, employeeId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون موظف</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>تاريخ البداية (اختياري)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {startDate ? (
                            format(startDate, "d MMMM yyyy", { locale: ar })
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>تاريخ الاستحقاق *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {dueDate ? (
                            format(dueDate, "d MMMM yyyy", { locale: ar })
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="أضف أي ملاحظات إضافية..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {editingId ? "حفظ التعديلات" : "إضافة التذكير"}
                  </Button>
                  <Button
                    onClick={() => setOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">
                  إجمالي التذكيرات النشطة
                </p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {totalReminders}
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Bell className="w-8 h-8 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">
                  تذكيرات متأخرة
                </p>
                <p className="text-3xl font-bold text-red-900 mt-2">
                  {overdueCount}
                </p>
              </div>
              <div className="bg-red-200 p-3 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">
                  تذكيرات قريبة
                </p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  {dueSoonCount}
                </p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <Clock className="w-8 h-8 text-orange-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Reminders List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              جميع التذكيرات
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              التذكيرات مرتبة حسب تاريخ الاستحقاق
            </p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">جاري التحميل...</p>
              </div>
            ) : reminders.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">لا توجد تذكيرات</p>
                <p className="text-gray-500 text-sm mt-2">
                  ابدأ بإضافة تذكير جديد
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => {
                  const StatusIcon =
                    statusIcons[reminder.status as keyof typeof statusIcons];
                  return (
                    <div
                      key={reminder.id}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all",
                        statusColors[
                          reminder.status as keyof typeof statusColors
                        ]
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <StatusIcon className="w-5 h-5 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">
                              {reminder.title}
                            </h3>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <strong>النوع:</strong>
                                {
                                  reminderTypes[
                                    reminder.type as keyof typeof reminderTypes
                                  ]
                                }
                              </span>
                              {reminder.employeeName && (
                                <span className="flex items-center gap-1">
                                  <strong>الموظف:</strong>
                                  {reminder.employeeName}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <strong>الاستحقاق:</strong>
                                {format(new Date(reminder.dueDate), "d MMMM yyyy", {
                                  locale: ar,
                                })}
                              </span>
                            </div>
                            {reminder.notes && (
                              <p className="text-sm mt-2 opacity-90">
                                {reminder.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!reminder.isCompleted && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleComplete(reminder.id)}
                                className="hover:bg-white/50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(reminder)}
                                className="hover:bg-white/50"
                              >
                                تعديل
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(reminder.id)}
                            className="hover:bg-white/50 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

