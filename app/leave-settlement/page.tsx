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
import { Plus, Calendar as CalendarIcon, FileText, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Employee {
  id: number;
  name: string;
  position: string | null;
}

interface LeaveSettlement {
  id: number;
  employeeId: number;
  employeeName: string;
  employeePosition: string | null;
  joinDate: string;
  leaveStartDate: string;
  leaveEndDate: string | null;
  leaveDays: number | null;
  previousBalanceDays: number;
  ticketsEntitlement: string;
  visasCount: number;
  deductionsAmount: number;
  serviceDays: number;
  accruedDays: number;
  balanceBeforeDeduction: number;
  currentLeaveDays: number;
  balanceAfterDeduction: number;
  ticketsCount: number;
  netPayable: number;
  createdAt: string;
}

export default function LeaveSettlementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settlements, setSettlements] = useState<LeaveSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [calculating, setCalculating] = useState(false);

  // Form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [joinDate, setJoinDate] = useState<Date>();
  const [leaveStartDate, setLeaveStartDate] = useState<Date>();
  const [leaveEndDate, setLeaveEndDate] = useState<Date>();
  const [leaveDays, setLeaveDays] = useState<string>("");
  const [inputMethod, setInputMethod] = useState<"days" | "endDate">("days");
  const [previousBalanceDays, setPreviousBalanceDays] = useState<string>("0");
  const [ticketsEntitlement, setTicketsEntitlement] = useState<string>("employee");
  const [visasCount, setVisasCount] = useState<string>("0");
  const [deductionsAmount, setDeductionsAmount] = useState<string>("0");

  // Result state
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchEmployees();
    fetchSettlements();
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

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leave-settlements");
      const data = await response.json();
      setSettlements(data);
    } catch (error) {
      console.error("Error fetching settlements:", error);
      toast.error("فشل تحميل التصفيات");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedEmployeeId || !joinDate || !leaveStartDate) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (inputMethod === "days" && !leaveDays) {
      toast.error("يرجى إدخال مدة الإجازة");
      return;
    }

    if (inputMethod === "endDate" && !leaveEndDate) {
      toast.error("يرجى اختيار تاريخ نهاية الإجازة");
      return;
    }

    try {
      setCalculating(true);

      const payload = {
        employeeId: parseInt(selectedEmployeeId),
        joinDate: joinDate.toISOString(),
        leaveStartDate: leaveStartDate.toISOString(),
        ...(inputMethod === "days"
          ? { leaveDays: parseInt(leaveDays) }
          : { leaveEndDate: leaveEndDate!.toISOString() }),
        previousBalanceDays: parseInt(previousBalanceDays),
        ticketsEntitlement,
        visasCount: parseInt(visasCount),
        deductionsAmount: parseInt(deductionsAmount),
      };

      const response = await fetch("/api/leave-settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("فشل في حساب الاستحقاق");
      }

      const data = await response.json();
      setResult(data);
      toast.success("تم حساب الاستحقاق بنجاح");
      fetchSettlements();
    } catch (error: any) {
      console.error("Error calculating settlement:", error);
      toast.error(error.message || "فشل في حساب الاستحقاق");
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setSelectedEmployeeId("");
    setJoinDate(undefined);
    setLeaveStartDate(undefined);
    setLeaveEndDate(undefined);
    setLeaveDays("");
    setPreviousBalanceDays("0");
    setTicketsEntitlement("employee");
    setVisasCount("0");
    setDeductionsAmount("0");
    setResult(null);
  };

  const handleAddNew = () => {
    handleReset();
    setOpen(true);
  };

  // Calculate statistics
  const totalSettlements = settlements.length;
  const totalNetPayable = settlements.reduce((sum, s) => sum + s.netPayable, 0);
  const totalLeaveDays = settlements.reduce(
    (sum, s) => sum + s.currentLeaveDays,
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تصفية إجازة</h1>
            <p className="text-gray-600 mt-1">
              حساب واستحقاق إجازات الموظفين مع التفاصيل الكاملة
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة تصفية جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  إضافة تصفية إجازة جديدة
                </DialogTitle>
                <p className="text-sm text-gray-600">
                  أدخل بيانات الموظف والإجازة لحساب الاستحقاق
                </p>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Employee Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee">الموظف *</Label>
                    <Select
                      value={selectedEmployeeId}
                      onValueChange={setSelectedEmployeeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name} - {emp.position || "بدون منصب"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>تاريخ مباشرة العمل *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal",
                            !joinDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {joinDate ? (
                            format(joinDate, "d MMMM yyyy", { locale: ar })
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={joinDate}
                          onSelect={setJoinDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Leave Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>بداية الإجازة الحالية *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-right font-normal",
                            !leaveStartDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {leaveStartDate ? (
                            format(leaveStartDate, "d MMMM yyyy", { locale: ar })
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={leaveStartDate}
                          onSelect={setLeaveStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>طريقة إدخال مدة الإجازة</Label>
                    <Select
                      value={inputMethod}
                      onValueChange={(value: "days" | "endDate") =>
                        setInputMethod(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">عدد الأيام</SelectItem>
                        <SelectItem value="endDate">تاريخ النهاية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Leave Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inputMethod === "days" ? (
                    <div className="space-y-2">
                      <Label htmlFor="leaveDays">مدة الإجازة (بالأيام) *</Label>
                      <Input
                        id="leaveDays"
                        type="number"
                        value={leaveDays}
                        onChange={(e) => setLeaveDays(e.target.value)}
                        placeholder="مثال: 21"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>نهاية الإجازة الحالية *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-right font-normal",
                              !leaveEndDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {leaveEndDate ? (
                              format(leaveEndDate, "d MMMM yyyy", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={leaveEndDate}
                            onSelect={setLeaveEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="previousBalance">رصيد سابق (بالأيام)</Label>
                    <Input
                      id="previousBalance"
                      type="number"
                      value={previousBalanceDays}
                      onChange={(e) => setPreviousBalanceDays(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Tickets and Deductions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>عدد أفراد التذاكر</Label>
                    <Select
                      value={ticketsEntitlement}
                      onValueChange={setTicketsEntitlement}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">
                          موظف فقط (1 تذكرة)
                        </SelectItem>
                        <SelectItem value="family4">
                          موظف + عائلة (4 تذاكر)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visas">عدد التأشيرات المطلوبة</Label>
                    <Input
                      id="visas"
                      type="number"
                      value={visasCount}
                      onChange={(e) => setVisasCount(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deductions">قيمة الخصومات (ر.س)</Label>
                    <Input
                      id="deductions"
                      type="number"
                      value={deductionsAmount}
                      onChange={(e) => setDeductionsAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCalculate}
                    disabled={calculating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {calculating ? "جاري الحساب..." : "احسب الاستحقاق"}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1"
                  >
                    إعادة تعيين
                  </Button>
                </div>

                {/* Results */}
                {result && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 ml-2 text-green-600" />
                      نتيجة الحساب
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">أيام الخدمة</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {result.serviceDays}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">الأيام المستحقة</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {result.accruedDays}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">الرصيد قبل الخصم</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {result.balanceBeforeDeduction}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">أيام الإجازة الحالية</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {result.currentLeaveDays}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">الرصيد بعد الخصم</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {result.balanceAfterDeduction}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-gray-600">عدد التذاكر</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {result.ticketsCount}
                        </p>
                      </div>
                      <div className="col-span-2 md:col-span-3 bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-lg">
                        <p className="text-sm text-white/90 mb-1">
                          صافي المستحق (ر.س)
                        </p>
                        <p className="text-4xl font-bold text-white">
                          {result.netPayable.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  إجمالي التصفيات
                </p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {totalSettlements}
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <Users className="w-8 h-8 text-blue-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">
                  إجمالي المستحقات
                </p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {totalNetPayable.toLocaleString()} ر.س
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <TrendingUp className="w-8 h-8 text-green-700" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">
                  إجمالي أيام الإجازات
                </p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  {totalLeaveDays}
                </p>
              </div>
              <div className="bg-orange-200 p-3 rounded-full">
                <CalendarIcon className="w-8 h-8 text-orange-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Settlements Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              التصفيات السابقة
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              جميع تصفيات الإجازات المسجلة
            </p>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">جاري التحميل...</p>
              </div>
            ) : settlements.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">لا توجد تصفيات مسجلة</p>
                <p className="text-gray-500 text-sm mt-2">
                  ابدأ بإضافة تصفية إجازة جديدة
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      الاسم
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      المنصب
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      تاريخ المباشرة
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      بداية الإجازة
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      أيام الإجازة
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      الرصيد المتبقي
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      صافي المستحق
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {settlements.map((settlement) => (
                    <tr
                      key={settlement.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {settlement.employeeName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {settlement.employeePosition || "بدون منصب"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(settlement.joinDate), "d MMM yyyy", {
                          locale: ar,
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(
                          new Date(settlement.leaveStartDate),
                          "d MMM yyyy",
                          { locale: ar }
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-orange-600">
                        {settlement.currentLeaveDays}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">
                        {settlement.balanceAfterDeduction}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        {settlement.netPayable.toLocaleString()} ر.س
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

