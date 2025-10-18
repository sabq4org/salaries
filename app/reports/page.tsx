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
import { toast } from "sonner";

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchAllData();
  }, [selectedYear, selectedMonth]);

  const fetchAllData = async () => {
    try {
      const [employeesRes, contractorsRes, payrollRes, expensesRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/contractors'),
        fetch(`/api/payroll?year=${selectedYear}&month=${selectedMonth}`),
        fetch(`/api/expenses?year=${selectedYear}`),
      ]);

      const [employees, contractors, payroll, expenses] = await Promise.all([
        employeesRes.json(),
        contractorsRes.json(),
        payrollRes.json(),
        expensesRes.json(),
      ]);

      setData({ employees, contractors, payroll, expenses });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalEmployees = data.employees.length;
    const totalContractors = data.contractors.length;
    const monthlyPayroll = data.payroll.reduce((sum, p) => sum + p.netSalary, 0);
    const yearlyExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const averageSalary = data.employees.length > 0
      ? data.employees.reduce((sum, e) => sum + e.baseSalary, 0) / data.employees.length
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
- إجمالي الرواتب الشهرية: ${stats.monthlyPayroll.toLocaleString()} ريال
- إجمالي المصروفات السنوية: ${stats.yearlyExpenses.toLocaleString()} ريال
- متوسط الراتب: ${Math.round(stats.averageSalary).toLocaleString()} ريال

===========================================

👥 الموظفون الرسميون:
${data.employees.map((emp, i) => `
${i + 1}. ${emp.name}
   المنصب: ${emp.position || '-'}
   الراتب الأساسي: ${emp.baseSalary.toLocaleString()} ريال
   التأمينات: ${emp.socialInsurance.toLocaleString()} ريال
`).join('')}

===========================================

🤝 المتعاونون:
${data.contractors.map((con, i) => `
${i + 1}. ${con.name}
   المنصب: ${con.position || '-'}
   الراتب: ${con.salary.toLocaleString()} ريال
`).join('')}

===========================================

💰 مسير الرواتب - ${MONTHS[selectedMonth - 1]} ${selectedYear}:
${data.payroll.map((p, i) => {
  const emp = data.employees.find(e => e.id === p.employeeId);
  return `
${i + 1}. ${emp?.name || 'غير معروف'}
   الراتب الأساسي: ${p.baseSalary.toLocaleString()} ريال
   البدلات: ${p.allowance.toLocaleString()} ريال
   المكافآت: ${p.bonus.toLocaleString()} ريال
   الخصومات: ${p.deduction.toLocaleString()} ريال
   صافي الراتب: ${p.netSalary.toLocaleString()} ريال
`;
}).join('')}

إجمالي الرواتب: ${stats.monthlyPayroll.toLocaleString()} ريال

===========================================

📈 المصروفات - ${selectedYear}:
${data.expenses.map((exp, i) => `
${i + 1}. ${MONTHS[exp.month - 1]} - ${exp.type}
   المبلغ: ${exp.amount.toLocaleString()} ريال
   ${exp.description ? `الوصف: ${exp.description}` : ''}
`).join('')}

إجمالي المصروفات: ${stats.yearlyExpenses.toLocaleString()} ريال

===========================================

تم إنشاء التقرير بواسطة نظام الميزانية والرواتب
صحيفة سبق
    `.trim();

    return reportContent;
  };

  const downloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_${MONTHS[selectedMonth - 1]}_${selectedYear}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('تم تحميل التقرير بنجاح');
  };

  const stats = calculateStats();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">التقارير</h1>
        <Button onClick={downloadReport}>
          <Download className="ml-2" size={20} />
          تحميل التقرير
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <Calendar size={20} className="text-gray-600" />
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[180px]">
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
          <Input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
            className="w-[120px]"
          />
        </div>
      </Card>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">الموظفون</p>
                  <p className="text-3xl font-bold">{stats.totalEmployees}</p>
                </div>
                <Users size={40} className="text-blue-200" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">المتعاونون</p>
                  <p className="text-3xl font-bold">{stats.totalContractors}</p>
                </div>
                <Users size={40} className="text-green-200" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">الرواتب الشهرية</p>
                  <p className="text-2xl font-bold">{stats.monthlyPayroll.toLocaleString()} ر.س</p>
                </div>
                <DollarSign size={40} className="text-purple-200" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm mb-1">المصروفات السنوية</p>
                  <p className="text-2xl font-bold">{stats.yearlyExpenses.toLocaleString()} ر.س</p>
                </div>
                <TrendingUp size={40} className="text-orange-200" />
              </div>
            </Card>
          </div>

          {/* Detailed Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employees Report */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users size={20} />
                الموظفون الرسميون
              </h2>
              <div className="space-y-3">
                {data.employees.slice(0, 5).map((emp) => (
                  <div key={emp.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="font-medium">{emp.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{emp.position || '-'}</p>
                    </div>
                    <p className="font-semibold">{emp.baseSalary.toLocaleString()} ر.س</p>
                  </div>
                ))}
                {data.employees.length > 5 && (
                  <p className="text-sm text-gray-600 text-center">و {data.employees.length - 5} موظف آخر...</p>
                )}
              </div>
            </Card>

            {/* Contractors Report */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users size={20} />
                المتعاونون
              </h2>
              <div className="space-y-3">
                {data.contractors.slice(0, 5).map((con) => (
                  <div key={con.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="font-medium">{con.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{con.position || '-'}</p>
                    </div>
                    <p className="font-semibold">{con.salary.toLocaleString()} ر.س</p>
                  </div>
                ))}
                {data.contractors.length > 5 && (
                  <p className="text-sm text-gray-600 text-center">و {data.contractors.length - 5} متعاون آخر...</p>
                )}
              </div>
            </Card>

            {/* Payroll Report */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign size={20} />
                مسير الرواتب - {MONTHS[selectedMonth - 1]}
              </h2>
              <div className="space-y-3">
                {data.payroll.slice(0, 5).map((p) => {
                  const emp = data.employees.find(e => e.id === p.employeeId);
                  return (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <p className="font-medium">{emp?.name || 'غير معروف'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          الأساسي: {p.baseSalary.toLocaleString()} | الخصم: {p.deduction.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">{p.netSalary.toLocaleString()} ر.س</p>
                    </div>
                  );
                })}
                {data.payroll.length > 5 && (
                  <p className="text-sm text-gray-600 text-center">و {data.payroll.length - 5} سجل آخر...</p>
                )}
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center font-bold">
                    <span>الإجمالي:</span>
                    <span className="text-green-600">{stats.monthlyPayroll.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Expenses Report */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                المصروفات - {selectedYear}
              </h2>
              <div className="space-y-3">
                {data.expenses.slice(0, 5).map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <p className="font-medium">{MONTHS[exp.month - 1]}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{exp.type}</p>
                    </div>
                    <p className="font-semibold text-red-600">{exp.amount.toLocaleString()} ر.س</p>
                  </div>
                ))}
                {data.expenses.length > 5 && (
                  <p className="text-sm text-gray-600 text-center">و {data.expenses.length - 5} مصروف آخر...</p>
                )}
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center font-bold">
                    <span>الإجمالي:</span>
                    <span className="text-red-600">{stats.yearlyExpenses.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

