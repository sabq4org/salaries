"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, DollarSign, TrendingUp, FileText, PieChart, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

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
  quarter: number;
  type: string;
  amount: number;
}

interface Revenue {
  id: number;
  year: number;
  month: number;
  quarter: number;
  source: string;
  amount: number;
}

export default function ReportsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [empRes, conRes, payRes, expRes, revRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/contractors'),
        fetch(`/api/payroll?year=${selectedYear}`),
        fetch(`/api/expenses?year=${selectedYear}`),
        fetch(`/api/revenues?year=${selectedYear}`),
      ]);

      if (empRes.ok) setEmployees(await empRes.json());
      if (conRes.ok) setContractors(await conRes.json());
      if (payRes.ok) setPayroll(await payRes.json());
      if (expRes.ok) setExpenses(await expRes.json());
      if (revRes.ok) setRevenues(await revRes.json());
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
  const totalRevenues = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalCost = totalPayroll + totalExpenses;

  // Data for employee distribution pie chart
  const employeeDistributionData = [
    { name: 'موظفون رسميون', value: employees.length, color: '#3b82f6' },
    { name: 'متعاونون', value: contractors.length, color: '#10b981' },
  ];

  // Data for expenses by type
  const expensesByType = expenses.reduce((acc, exp) => {
    acc[exp.type] = (acc[exp.type] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const expensesChartData = Object.entries(expensesByType).map(([type, amount]) => ({
    name: type,
    value: amount,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Data for monthly expenses and revenues
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthExpenses = expenses
      .filter(e => e.month === month)
      .reduce((sum, e) => sum + e.amount, 0);
    const monthRevenues = revenues
      .filter(r => r.month === month)
      .reduce((sum, r) => sum + r.amount, 0);
    
    return {
      month: `${month}`,
      monthName: new Date(2025, i, 1).toLocaleDateString('ar-SA', { month: 'short' }),
      expenses: monthExpenses,
      revenues: monthRevenues,
    };
  });

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
          <p className="text-muted-foreground">ملخص شامل للموظفين والرواتب والمصروفات والإيرادات</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي الموظفين</p>
                <p className="text-3xl font-bold text-foreground">{employees.length + contractors.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalRevenues.toLocaleString()} ر.س</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalCost.toLocaleString()} ر.س</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">صافي الربح/الخسارة</p>
                <p className={`text-2xl font-bold ${totalRevenues - totalCost >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {(totalRevenues - totalCost).toLocaleString()} ر.س
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${totalRevenues - totalCost >= 0 ? 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'}`}>
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Employee Distribution Chart */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
              <PieChart className="ml-2" size={24} />
              توزيع الموظفين
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={employeeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {employeeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Expenses by Type Chart */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
              <BarChart3 className="ml-2" size={24} />
              توزيع المصروفات حسب الفئة
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={expensesChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} ر.س`} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Expenses and Revenues Chart */}
        <div className="p-6 rounded-xl bg-card border border-border mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
            <TrendingUp className="ml-2" size={24} />
            المصروفات والإيرادات الشهرية
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} ر.س`} />
              <Legend />
              <Line type="monotone" dataKey="revenues" stroke="#10b981" strokeWidth={2} name="الإيرادات" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="المصروفات" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by Type Bar Chart */}
        <div className="p-6 rounded-xl bg-card border border-border mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
            <BarChart3 className="ml-2" size={24} />
            المصروفات حسب الفئة (تفصيلي)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={expensesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} ر.س`} />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="المبلغ" />
            </BarChart>
          </ResponsiveContainer>
        </div>


      </div>
    </DashboardLayout>
  );
}

