"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Download, Filter, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: number;
  name: string;
  position: string;
  baseSalary: number;
  socialInsurance: number;
  leaveBalance: number;
  isActive: boolean;
}

interface LedgerEntry {
  id: number;
  date: string;
  type: string;
  description: string;
  amount: number;
  year: number;
  month: number;
  details?: any;
}

interface EmployeeLedger {
  employee: Employee;
  entries: LedgerEntry[];
  summary: {
    totalSalaries: number;
    totalLeaveSettlements: number;
    totalBonuses: number;
    totalDeductions: number;
    netTotal: number;
    entryCount: number;
  };
}

export default function EmployeeLedgerPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [ledger, setLedger] = useState<EmployeeLedger | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchLedger();
    }
  }, [selectedEmployeeId, year, month]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("فشل في تحميل الموظفين");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل قائمة الموظفين",
        variant: "destructive",
      });
    }
  };

  const fetchLedger = async () => {
    if (!selectedEmployeeId) return;

    try {
      setLoading(true);
      let url = `/api/employee-ledger?employeeId=${selectedEmployeeId}&year=${year}`;
      if (month) {
        url += `&month=${month}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("فشل في تحميل دفتر الأستاذ");
      const data = await response.json();
      setLedger(data);
    } catch (error) {
      console.error("Error fetching ledger:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل دفتر الأستاذ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      salary: "راتب",
      leave_settlement: "تصفية إجازة",
      bonus: "مكافأة",
      deduction: "خصم",
    };
    return labels[type] || type;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      salary: "default",
      leave_settlement: "secondary",
      bonus: "default",
      deduction: "destructive",
    };
    return (
      <Badge variant={variants[type] || "outline"}>
        {getTypeLabel(type)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleExport = () => {
    if (!ledger) return;

    const csv = [
      ['التاريخ', 'النوع', 'الوصف', 'المبلغ'].join(','),
      ...ledger.entries.map(entry => [
        formatDate(entry.date),
        getTypeLabel(entry.type),
        entry.description,
        entry.amount,
      ].join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `دفتر_أستاذ_${ledger.employee.name}_${year}.csv`;
    link.click();

    toast({
      title: "تم التصدير",
      description: "تم تصدير دفتر الأستاذ بنجاح",
    });
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: null, label: "جميع الأشهر" },
    { value: 1, label: "يناير" },
    { value: 2, label: "فبراير" },
    { value: 3, label: "مارس" },
    { value: 4, label: "أبريل" },
    { value: 5, label: "مايو" },
    { value: 6, label: "يونيو" },
    { value: 7, label: "يوليو" },
    { value: 8, label: "أغسطس" },
    { value: 9, label: "سبتمبر" },
    { value: 10, label: "أكتوبر" },
    { value: 11, label: "نوفمبر" },
    { value: 12, label: "ديسمبر" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              دفتر الأستاذ للموظفين
            </h1>
            <p className="text-muted-foreground mt-1">
              عرض السجل المالي الكامل لكل موظف
            </p>
          </div>
          {ledger && (
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 ml-2" />
              تصدير CSV
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              الفلاتر
            </CardTitle>
            <CardDescription>اختر الموظف والفترة الزمنية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الموظف</label>
                <Select
                  value={selectedEmployeeId?.toString()}
                  onValueChange={(value) => setSelectedEmployeeId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر موظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.name} - {emp.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">السنة</label>
                <Select
                  value={year.toString()}
                  onValueChange={(value) => setYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الشهر</label>
                <Select
                  value={month?.toString() || "all"}
                  onValueChange={(value) => setMonth(value === "all" ? null : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value || "all"} value={m.value?.toString() || "all"}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {ledger && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الرواتب</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(ledger.summary.totalSalaries)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تصفية إجازات</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(ledger.summary.totalLeaveSettlements)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الخصومات</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(ledger.summary.totalDeductions)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الصافي</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(ledger.summary.netTotal)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ledger Table */}
        {ledger && (
          <Card>
            <CardHeader>
              <CardTitle>السجل المالي - {ledger.employee.name}</CardTitle>
              <CardDescription>
                {ledger.employee.position} | عدد السجلات: {ledger.summary.entryCount}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  جاري التحميل...
                </div>
              ) : ledger.entries.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  لا توجد سجلات مالية للفترة المحددة
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledger.entries.map((entry) => (
                      <TableRow key={`${entry.type}-${entry.id}`}>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell>{getTypeBadge(entry.type)}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(entry.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedEmployeeId && (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    اختر موظفاً لعرض دفتر الأستاذ
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    دفتر الأستاذ يعرض السجل المالي الكامل للموظف بما في ذلك الرواتب وتصفية الإجازات
                    والمكافآت والخصومات.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

