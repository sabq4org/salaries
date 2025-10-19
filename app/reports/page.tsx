"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, DollarSign, TrendingUp, FileText } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: number;
  name: string;
  position: string | null;
  baseSalary: number;
  socialInsurance: number;
}

interface Contractor {
  id: number;
  name: string;
  position: string | null;
  salary: number;
}

interface Payroll {
  id: number;
  employeeId: number;
  year: number;
  month: number;
  netSalary: number;
}

interface Expense {
  id: number;
  year: number;
  month: number;
  type: string;
  amount: number;
}

export default function ReportsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [empRes, conRes, payRes, expRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/contractors'),
        fetch(`/api/payroll?year=${selectedYear}`),
        fetch(`/api/expenses?year=${selectedYear}`),
      ]);

      if (empRes.ok) setEmployees(await empRes.json());
      if (conRes.ok) setContractors(await conRes.json());
      if (payRes.ok) setPayroll(await payRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
    } catch (error) {
      console.error('Error:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const totalEmployeeSalaries = employees.reduce((sum, e) => sum + e.baseSalary, 0);
  const totalContractorSalaries = contractors.reduce((sum, c) => sum + c.salary, 0);
  const totalPayroll = payroll.reduce((sum, p) => sum + p.netSalary, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCost = totalPayroll + totalExpenses;

  const expensesByType = expenses.reduce((acc, exp) => {
    acc[exp.type] = (acc[exp.type] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const typeLabels: Record<string, string> = {
    salary: 'رواتب',
    operational: 'تشغيلية',
    marketing: 'تسويق',
    other: 'أخرى',
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">جاري التحميل...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">التقارير الشاملة</h1>
          <p className="text-muted-foreground">ملخص شامل للموظفين والرواتب والمصروفات</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-2xl font-bold text-foreground">{totalPayroll.toLocaleString()} ر.س</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-foreground">{totalCost.toLocaleString()} ر.س</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Employees Summary */}
        <div 
          className="p-6 rounded-xl mb-8"
          className="bg-card border border-border"
        >
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
            <FileText className="ml-2" size={24} />
            ملخص الموظفين الرسميين
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">الاسم</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">المنصب</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">الراتب الأساسي</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">التأمينات</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-muted-foreground">
                      لا توجد بيانات
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, index) => (
                    <tr 
                      key={emp.id}
                      style={{ 
                        borderTop: '1px solid #f0f0ef',
                        backgroundColor: 'transparent'
                      }}
                      className="hover:bg-accent transition-colors"
                    >
                      <td className="p-4 text-foreground font-medium">{emp.name}</td>
                      <td className="p-4 text-foreground">{emp.position || '-'}</td>
                      <td className="p-4 text-foreground">{emp.baseSalary.toLocaleString()} ر.س</td>
                      <td className="p-4 text-foreground">{emp.socialInsurance.toLocaleString()} ر.س</td>
                    </tr>
                  ))
                )}
                {employees.length > 0 && (
                  <tr style={{ borderTop: '2px solid #f0f0ef', backgroundColor: '#f8f8f7' }}>
                    <td colSpan={2} className="p-4 text-foreground font-bold">الإجمالي</td>
                    <td className="p-4 text-foreground font-bold">{totalEmployeeSalaries.toLocaleString()} ر.س</td>
                    <td className="p-4 text-foreground font-bold">
                      {employees.reduce((sum, e) => sum + e.socialInsurance, 0).toLocaleString()} ر.س
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contractors Summary */}
        <div 
          className="p-6 rounded-xl mb-8"
          className="bg-card border border-border"
        >
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
            <FileText className="ml-2" size={24} />
            ملخص المتعاونين
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">الاسم</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">المنصب</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">الراتب</th>
                </tr>
              </thead>
              <tbody>
                {contractors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-muted-foreground">
                      لا توجد بيانات
                    </td>
                  </tr>
                ) : (
                  contractors.map((con, index) => (
                    <tr 
                      key={con.id}
                      style={{ 
                        borderTop: '1px solid #f0f0ef',
                        backgroundColor: 'transparent'
                      }}
                      className="hover:bg-accent transition-colors"
                    >
                      <td className="p-4 text-foreground font-medium">{con.name}</td>
                      <td className="p-4 text-foreground">{con.position || '-'}</td>
                      <td className="p-4 text-foreground">{con.salary.toLocaleString()} ر.س</td>
                    </tr>
                  ))
                )}
                {contractors.length > 0 && (
                  <tr style={{ borderTop: '2px solid #f0f0ef', backgroundColor: '#f8f8f7' }}>
                    <td colSpan={2} className="p-4 text-foreground font-bold">الإجمالي</td>
                    <td className="p-4 text-foreground font-bold">{totalContractorSalaries.toLocaleString()} ر.س</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Summary */}
        <div 
          className="p-6 rounded-xl"
          className="bg-card border border-border"
        >
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
            <FileText className="ml-2" size={24} />
            ملخص المصروفات حسب النوع
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">النوع</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">المبلغ</th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(expensesByType).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-8 text-muted-foreground">
                      لا توجد مصروفات
                    </td>
                  </tr>
                ) : (
                  Object.entries(expensesByType).map(([type, amount], index) => (
                    <tr 
                      key={type}
                      style={{ 
                        borderTop: '1px solid #f0f0ef',
                        backgroundColor: 'transparent'
                      }}
                      className="hover:bg-accent transition-colors"
                    >
                      <td className="p-4 text-foreground font-medium">{typeLabels[type] || type}</td>
                      <td className="p-4 text-foreground">{amount.toLocaleString()} ر.س</td>
                      <td className="p-4 text-foreground">
                        {totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))
                )}
                {Object.keys(expensesByType).length > 0 && (
                  <tr style={{ borderTop: '2px solid #f0f0ef', backgroundColor: '#f8f8f7' }}>
                    <td className="p-4 text-foreground font-bold">الإجمالي</td>
                    <td className="p-4 text-foreground font-bold">{totalExpenses.toLocaleString()} ر.س</td>
                    <td className="p-4 text-foreground font-bold">100%</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

