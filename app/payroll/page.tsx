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
import { Plus, Pencil, Trash2, DollarSign, Calendar, Users, UserCheck, Shield } from "lucide-react";
import { toast } from "sonner";

interface EmployeePayroll {
  id: number;
  employeeId: number;
  employeeName?: string;
  year: number;
  month: number;
  baseSalary: number;
  socialInsurance: number;
  deduction: number;
  bonus: number;
  netSalary: number;
}

interface ContractorPayroll {
  id: number;
  contractorId: number;
  contractorName?: string;
  year: number;
  month: number;
  salary: number;
  deduction: number;
  bonus: number;
  netSalary: number;
}

interface Employee {
  id: number;
  name: string;
  baseSalary: number;
  socialInsurance: number;
}

interface Contractor {
  id: number;
  name: string;
  salary: number;
}

export default function PayrollPage() {
  const [employeePayrolls, setEmployeePayrolls] = useState<EmployeePayroll[]>([]);
  const [contractorPayrolls, setContractorPayrolls] = useState<ContractorPayroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openContractor, setOpenContractor] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [editingContractorId, setEditingContractorId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  const [employeeFormData, setEmployeeFormData] = useState({
    employeeId: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    baseSalary: 0,
    socialInsurance: 0,
    deduction: 0,
    bonus: 0,
  });
  
  const [contractorFormData, setContractorFormData] = useState({
    contractorId: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    salary: 0,
    deduction: 0,
    bonus: 0,
  });

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch employees
      const empRes = await fetch('/api/employees');
      const empData = await empRes.json();
      setEmployees(empData);

      // Fetch contractors
      const conRes = await fetch('/api/contractors');
      const conData = await conRes.json();
      setContractors(conData);

      // Fetch employee payrolls
      const empPayRes = await fetch(`/api/payroll?year=${selectedYear}&month=${selectedMonth}`);
      const empPayData = await empPayRes.json();
      const enrichedEmpPay = empPayData.map((p: any) => ({
        ...p,
        employeeName: empData.find((e: Employee) => e.id === p.employeeId)?.name || 'غير معروف',
      }));
      setEmployeePayrolls(enrichedEmpPay);

      // Fetch contractor payrolls
      const conPayRes = await fetch(`/api/contractor-payroll?year=${selectedYear}&month=${selectedMonth}`);
      const conPayData = await conPayRes.json();
      setContractorPayrolls(conPayData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEmployeeId ? `/api/payroll?id=${editingEmployeeId}` : '/api/payroll';
      const method = editingEmployeeId ? 'PUT' : 'POST';
      
      // Calculate net salary
      const netSalary = employeeFormData.baseSalary - employeeFormData.socialInsurance - employeeFormData.deduction + employeeFormData.bonus;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...employeeFormData, netSalary }),
      });

      if (!response.ok) throw new Error('Failed to save employee payroll');

      toast.success(editingEmployeeId ? 'تم تحديث الراتب بنجاح' : 'تم إضافة الراتب بنجاح');
      setOpenEmployee(false);
      setEditingEmployeeId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving employee payroll:', error);
      toast.error('فشل في حفظ الراتب');
    }
  };

  const handleContractorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingContractorId ? `/api/contractor-payroll?id=${editingContractorId}` : '/api/contractor-payroll';
      const method = editingContractorId ? 'PUT' : 'POST';
      
      // Calculate net salary
      const netSalary = contractorFormData.salary - contractorFormData.deduction + contractorFormData.bonus;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contractorFormData, netSalary }),
      });

      if (!response.ok) throw new Error('Failed to save contractor payroll');

      toast.success(editingContractorId ? 'تم تحديث الراتب بنجاح' : 'تم إضافة الراتب بنجاح');
      setOpenContractor(false);
      setEditingContractorId(null);
      fetchData();
    } catch (error) {
      console.error('Error saving contractor payroll:', error);
      toast.error('فشل في حفظ الراتب');
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الراتب؟')) return;
    
    try {
      const response = await fetch(`/api/payroll?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success('تم حذف الراتب بنجاح');
      fetchData();
    } catch (error) {
      console.error('Error deleting employee payroll:', error);
      toast.error('فشل في حذف الراتب');
    }
  };

  const handleDeleteContractor = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الراتب؟')) return;
    
    try {
      const response = await fetch(`/api/contractor-payroll?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success('تم حذف الراتب بنجاح');
      fetchData();
    } catch (error) {
      console.error('Error deleting contractor payroll:', error);
      toast.error('فشل في حذف الراتب');
    }
  };

  const totalEmployeeSalaries = employeePayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalContractorSalaries = contractorPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalSocialInsurance = employeePayrolls.reduce((sum, p) => sum + p.socialInsurance, 0);
  const grandTotal = totalEmployeeSalaries + totalContractorSalaries;

  const months = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">مسير الرواتب الشهرية</h1>
          <p className="text-gray-600 mt-2">إدارة رواتب الموظفين والمتعاونين</p>
        </div>

        {/* Month/Year Selector */}
        <div className="flex gap-4 items-center">
          <div>
            <Label>السنة</Label>
            <Input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-32"
            />
          </div>
          <div>
            <Label>الشهر</Label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-40 px-3 py-2 border border-gray-300 rounded-md"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-[#f0f0ef] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">رواتب الموظفين</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmployeeSalaries.toLocaleString()} ر.س</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#f0f0ef] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">رواتب المتعاونين</p>
                <p className="text-2xl font-bold text-gray-900">{totalContractorSalaries.toLocaleString()} ر.س</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#f0f0ef] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">الإجمالي الشامل</p>
                <p className="text-2xl font-bold text-gray-900">{grandTotal.toLocaleString()} ر.س</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#f0f0ef] p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">مجموع التأمينات</p>
                <p className="text-2xl font-bold text-gray-900">{totalSocialInsurance.toLocaleString()} ر.س</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Payrolls Section */}
        <div className="bg-white rounded-xl border border-[#f0f0ef] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">رواتب الموظفين الرسميين</h2>
            <Dialog open={openEmployee} onOpenChange={setOpenEmployee}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة راتب موظف
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingEmployeeId ? 'تعديل راتب موظف' : 'إضافة راتب موظف جديد'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                  <div>
                    <Label>الموظف</Label>
                    <select
                      value={employeeFormData.employeeId}
                      onChange={(e) => {
                        const empId = parseInt(e.target.value);
                        const emp = employees.find(e => e.id === empId);
                        setEmployeeFormData({
                          ...employeeFormData,
                          employeeId: empId,
                          baseSalary: emp?.baseSalary || 0,
                          socialInsurance: emp?.socialInsurance || 0,
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value={0}>اختر موظف</option>
                      {employees
                        .filter(emp => !employeePayrolls.some(p => p.employeeId === emp.id))
                        .map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>السنة</Label>
                      <Input
                        type="number"
                        value={employeeFormData.year}
                        onChange={(e) => setEmployeeFormData({ ...employeeFormData, year: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label>الشهر</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={employeeFormData.month}
                        onChange={(e) => setEmployeeFormData({ ...employeeFormData, month: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>الراتب الأساسي</Label>
                    <Input
                      type="number"
                      value={employeeFormData.baseSalary}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, baseSalary: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>التأمينات الاجتماعية</Label>
                    <Input
                      type="number"
                      value={employeeFormData.socialInsurance}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, socialInsurance: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>الخصومات</Label>
                    <Input
                      type="number"
                      value={employeeFormData.deduction}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, deduction: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>المكافآت</Label>
                    <Input
                      type="number"
                      value={employeeFormData.bonus}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, bonus: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">حفظ</Button>
                    <Button type="button" variant="outline" onClick={() => setOpenEmployee(false)}>إلغاء</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {employeePayrolls.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد بيانات لهذا الشهر</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#f8f8f7' }}>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الموظف</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الراتب الأساسي</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">التأمينات</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الخصومات</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المكافآت</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">صافي الراتب</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {employeePayrolls.map((payroll) => (
                    <tr key={payroll.id} style={{ borderBottom: '1px solid #f0f0ef' }}>
                      <td className="px-4 py-3 text-sm text-gray-900">{payroll.employeeName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payroll.baseSalary.toLocaleString()} ر.س</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payroll.socialInsurance.toLocaleString()} ر.س</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payroll.deduction.toLocaleString()} ر.س</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payroll.bonus.toLocaleString()} ر.س</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{payroll.netSalary.toLocaleString()} ر.س</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteEmployee(payroll.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contractor Payrolls Section */}
        <div className="bg-white rounded-xl border border-[#f0f0ef] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">رواتب المتعاونين</h2>
            <Dialog open={openContractor} onOpenChange={setOpenContractor}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة راتب متعاون
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingContractorId ? 'تعديل راتب متعاون' : 'إضافة راتب متعاون جديد'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleContractorSubmit} className="space-y-4">
                  <div>
                    <Label>المتعاون</Label>
                    <select
                      value={contractorFormData.contractorId}
                      onChange={(e) => {
                        const conId = parseInt(e.target.value);
                        const con = contractors.find(c => c.id === conId);
                        setContractorFormData({
                          ...contractorFormData,
                          contractorId: conId,
                          salary: con?.salary || 0,
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value={0}>اختر متعاون</option>
                      {contractors
                        .filter(con => !contractorPayrolls.some(p => p.contractorId === con.id))
                        .map(con => (
                          <option key={con.id} value={con.id}>{con.name}</option>
                        ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>السنة</Label>
                      <Input
                        type="number"
                        value={contractorFormData.year}
                        onChange={(e) => setContractorFormData({ ...contractorFormData, year: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label>الشهر</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={contractorFormData.month}
                        onChange={(e) => setContractorFormData({ ...contractorFormData, month: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label>الراتب</Label>
                    <Input
                      type="number"
                      value={contractorFormData.salary}
                      onChange={(e) => setContractorFormData({ ...contractorFormData, salary: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>الخصومات</Label>
                    <Input
                      type="number"
                      value={contractorFormData.deduction}
                      onChange={(e) => setContractorFormData({ ...contractorFormData, deduction: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>المكافآت</Label>
                    <Input
                      type="number"
                      value={contractorFormData.bonus}
                      onChange={(e) => setContractorFormData({ ...contractorFormData, bonus: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">حفظ</Button>
                    <Button type="button" variant="outline" onClick={() => setOpenContractor(false)}>إلغاء</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {contractorPayrolls.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد بيانات لهذا الشهر</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#f8f8f7' }}>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المتعاون</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الراتب</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الخصومات</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المكافآت</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">صافي الراتب</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {contractorPayrolls.map((payroll) => (
                    <tr key={payroll.id} style={{ borderBottom: '1px solid #f0f0ef' }}>
                      <td className="px-4 py-3 text-sm text-gray-900">{payroll.contractorName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payroll.salary.toLocaleString()} ر.س</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payroll.deduction.toLocaleString()} ر.س</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payroll.bonus.toLocaleString()} ر.س</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{payroll.netSalary.toLocaleString()} ر.س</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteContractor(payroll.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

