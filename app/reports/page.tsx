"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Users, DollarSign, TrendingUp, Calendar } from "lucide-react";

interface ReportData {
  employees: any[];
  contractors: any[];
  payroll: any[];
  expenses: any[];
}

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export default function ReportsPage() {
  const [data, setData] = useState<ReportData>({
    employees: [],
    contractors: [],
    payroll: [],
    expenses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchAllData();
  }, [selectedYear, selectedMonth]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [employeesRes, contractorsRes, payrollRes, expensesRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/contractors'),
        fetch(`/api/payroll?year=${selectedYear}&month=${selectedMonth}`),
        fetch(`/api/expenses?year=${selectedYear}`),
      ]);

      // Check if all responses are ok
      if (!employeesRes.ok || !contractorsRes.ok || !payrollRes.ok || !expensesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [employees, contractors, payroll, expenses] = await Promise.all([
        employeesRes.json(),
        contractorsRes.json(),
        payrollRes.json(),
        expensesRes.json(),
      ]);

      setData({ 
        employees: employees || [], 
        contractors: contractors || [], 
        payroll: payroll || [], 
        expenses: expenses || [] 
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalEmployees = data.employees?.length || 0;
    const totalContractors = data.contractors?.length || 0;
    const monthlyPayroll = data.payroll?.reduce((sum, p) => sum + (p.netSalary || 0), 0) || 0;
    const yearlyExpenses = data.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const averageSalary = data.employees?.length > 0
      ? data.employees.reduce((sum, e) => sum + (e.baseSalary || 0), 0) / data.employees.length
      : 0;

    return {
      totalEmployees,
      totalContractors,
      monthlyPayroll,
      yearlyExpenses,
      averageSalary,
    };
  };

  const generateReport = () => {
    const stats = calculateStats();
    const reportContent = `
تقرير الرواتب والميزانية
صحيفة سبق

التاريخ: ${new Date().toLocaleDateString('ar-SA')}
الفترة: ${MONTHS[selectedMonth - 1]} ${selectedYear}

===========================================

📊 ملخص الإحصائيات:
- عدد الموظفين الرسميين: ${stats.totalEmployees}
- عدد المتعاونين: ${stats.totalContractors}
- الرواتب الشهرية: ${stats.monthlyPayroll.toLocaleString()} ر.س
- المصروفات السنوية: ${stats.yearlyExpenses.toLocaleString()} ر.س
- متوسط الراتب: ${Math.round(stats.averageSalary).toLocaleString()} ر.س

===========================================

👥 الموظفون الرسميون:
${data.employees?.map((e, i) => `${i + 1}. ${e.name} - ${e.position} - ${e.baseSalary?.toLocaleString()} ر.س`).join('\n') || 'لا توجد بيانات'}

===========================================

🤝 المتعاونون:
${data.contractors?.map((c, i) => `${i + 1}. ${c.name} - ${c.position} - ${c.salary?.toLocaleString()} ر.س`).join('\n') || 'لا توجد بيانات'}

===========================================

💰 مسير الرواتب لشهر ${MONTHS[selectedMonth - 1]} ${selectedYear}:
${data.payroll?.map((p, i) => {
  const employee = data.employees?.find(e => e.id === p.employeeId);
  return `${i + 1}. ${employee?.name || 'غير معروف'} - صافي الراتب: ${p.netSalary?.toLocaleString()} ر.س`;
}).join('\n') || 'لا توجد بيانات'}

===========================================

📊 المصروفات السنوية ${selectedYear}:
${data.expenses?.map((e, i) => `${i + 1}. ${e.description || e.type} - ${e.amount?.toLocaleString()} ر.س (${MONTHS[e.month - 1]})`).join('\n') || 'لا توجد بيانات'}

===========================================

إجمالي المصروفات: ${stats.yearlyExpenses.toLocaleString()} ر.س
`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_${MONTHS[selectedMonth - 1]}_${selectedYear}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <div className="text-center text-red-600">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">خطأ في تحميل التقرير</p>
            <p className="text-sm mb-4">{error}</p>
            <Button onClick={fetchAllData}>إعادة المحاولة</Button>
          </div>
        </Card>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">التقارير</h1>
        <Button onClick={generateReport} className="gap-2">
          <Download className="h-4 w-4" />
          تحميل التقرير
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>الشهر</Label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
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
          <div>
            <Label>السنة</Label>
            <Input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              min="2020"
              max="2030"
            />
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">الموظفون</p>
              <p className="text-2xl font-bold">{stats.totalEmployees}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">المتعاونون</p>
              <p className="text-2xl font-bold">{stats.totalContractors}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">الرواتب الشهرية</p>
              <p className="text-2xl font-bold">{stats.monthlyPayroll.toLocaleString()} ر.س</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">المصروفات السنوية</p>
              <p className="text-2xl font-bold">{stats.yearlyExpenses.toLocaleString()} ر.س</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Employees Report */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          الموظفون الرسميون
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-right">#</th>
                <th className="px-4 py-2 text-right">الاسم</th>
                <th className="px-4 py-2 text-right">المنصب</th>
                <th className="px-4 py-2 text-right">الراتب الأساسي</th>
                <th className="px-4 py-2 text-right">التأمينات</th>
              </tr>
            </thead>
            <tbody>
              {data.employees?.length > 0 ? (
                data.employees.map((employee, index) => (
                  <tr key={employee.id} className="border-b">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{employee.name}</td>
                    <td className="px-4 py-2">{employee.position}</td>
                    <td className="px-4 py-2">{employee.baseSalary?.toLocaleString()} ر.س</td>
                    <td className="px-4 py-2">{employee.socialInsurance?.toLocaleString()} ر.س</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    لا توجد بيانات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Contractors Report */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          المتعاونون
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-right">#</th>
                <th className="px-4 py-2 text-right">الاسم</th>
                <th className="px-4 py-2 text-right">المنصب</th>
                <th className="px-4 py-2 text-right">الراتب</th>
              </tr>
            </thead>
            <tbody>
              {data.contractors?.length > 0 ? (
                data.contractors.map((contractor, index) => (
                  <tr key={contractor.id} className="border-b">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{contractor.name}</td>
                    <td className="px-4 py-2">{contractor.position}</td>
                    <td className="px-4 py-2">{contractor.salary?.toLocaleString()} ر.س</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    لا توجد بيانات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payroll Report */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          مسير الرواتب - {MONTHS[selectedMonth - 1]} {selectedYear}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-right">#</th>
                <th className="px-4 py-2 text-right">الموظف</th>
                <th className="px-4 py-2 text-right">الراتب الأساسي</th>
                <th className="px-4 py-2 text-right">البدلات</th>
                <th className="px-4 py-2 text-right">المكافآت</th>
                <th className="px-4 py-2 text-right">الخصومات</th>
                <th className="px-4 py-2 text-right">صافي الراتب</th>
              </tr>
            </thead>
            <tbody>
              {data.payroll?.length > 0 ? (
                data.payroll.map((payroll, index) => {
                  const employee = data.employees?.find(e => e.id === payroll.employeeId);
                  return (
                    <tr key={payroll.id} className="border-b">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{employee?.name || 'غير معروف'}</td>
                      <td className="px-4 py-2">{payroll.baseSalary?.toLocaleString()} ر.س</td>
                      <td className="px-4 py-2">{payroll.allowance?.toLocaleString()} ر.س</td>
                      <td className="px-4 py-2">{payroll.bonus?.toLocaleString()} ر.س</td>
                      <td className="px-4 py-2">{payroll.deduction?.toLocaleString()} ر.س</td>
                      <td className="px-4 py-2 font-bold">{payroll.netSalary?.toLocaleString()} ر.س</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    لا توجد بيانات لهذا الشهر
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Expenses Report */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          المصروفات السنوية - {selectedYear}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-right">#</th>
                <th className="px-4 py-2 text-right">الشهر</th>
                <th className="px-4 py-2 text-right">النوع</th>
                <th className="px-4 py-2 text-right">الوصف</th>
                <th className="px-4 py-2 text-right">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses?.length > 0 ? (
                data.expenses.map((expense, index) => (
                  <tr key={expense.id} className="border-b">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{MONTHS[expense.month - 1]}</td>
                    <td className="px-4 py-2">
                      {expense.type === 'salary' ? 'رواتب' :
                       expense.type === 'operational' ? 'تشغيلية' :
                       expense.type === 'marketing' ? 'تسويق' : 'أخرى'}
                    </td>
                    <td className="px-4 py-2">{expense.description || '-'}</td>
                    <td className="px-4 py-2 font-bold">{expense.amount?.toLocaleString()} ر.س</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    لا توجد بيانات لهذه السنة
                  </td>
                </tr>
              )}
            </tbody>
            {data.expenses?.length > 0 && (
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right">الإجمالي</td>
                  <td className="px-4 py-2">{stats.yearlyExpenses.toLocaleString()} ر.س</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
}

