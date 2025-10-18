'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Calculator, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Employee {
  id: number;
  name: string;
  position?: string;
}

interface LeaveSettlement {
  id: number;
  employeeId: number;
  employeeName?: string;
  joinDate: string;
  leaveStartDate: string;
  leaveEndDate?: string;
  leaveDays?: number;
  previousBalanceDays: number;
  ticketsEntitlement: 'employee' | 'family4';
  visasCount: number;
  deductionsAmount: number;
  serviceDays: number;
  accruedDays: number;
  balanceBeforeDeduction: number;
  currentLeaveDays: number;
  balanceAfterDeduction: number;
  ticketsCount: number;
  netPayable: number;
}

interface CalculationResult {
  serviceDays: number;
  serviceYears: number;
  serviceMonths: number;
  serviceDaysRemainder: number;
  accruedDays: number;
  balanceBeforeDeduction: number;
  currentLeaveDays: number;
  balanceAfterDeduction: number;
  ticketsCount: number;
  visasCount: number;
  netPayable: number;
  isBalanceSufficient: boolean;
}

export default function LeaveSettlementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [settlements, setSettlements] = useState<LeaveSettlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  
  // حقول الإدخال
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [joinDate, setJoinDate] = useState<Date>();
  const [leaveStartDate, setLeaveStartDate] = useState<Date>();
  const [leaveEndDate, setLeaveEndDate] = useState<Date>();
  const [leaveDays, setLeaveDays] = useState<string>('');
  const [leaveInputType, setLeaveInputType] = useState<'days' | 'endDate'>('days');
  const [previousBalanceDays, setPreviousBalanceDays] = useState<string>('0');
  const [ticketsEntitlement, setTicketsEntitlement] = useState<'employee' | 'family4'>('employee');
  const [visasCount, setVisasCount] = useState<string>('0');
  const [deductionsAmount, setDeductionsAmount] = useState<string>('0');

  // جلب الموظفين
  useEffect(() => {
    fetchEmployees();
    fetchSettlements();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchSettlements = async () => {
    try {
      const response = await fetch('/api/leave-settlements');
      if (response.ok) {
        const data = await response.json();
        setSettlements(data);
      }
    } catch (error) {
      console.error('Error fetching settlements:', error);
    }
  };

  const handleCalculate = async () => {
    // التحقق من البيانات المطلوبة
    if (!selectedEmployeeId || !joinDate || !leaveStartDate) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (leaveInputType === 'days' && !leaveDays) {
      toast.error('يرجى إدخال مدة الإجازة');
      return;
    }

    if (leaveInputType === 'endDate' && !leaveEndDate) {
      toast.error('يرجى اختيار تاريخ نهاية الإجازة');
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        employeeId: parseInt(selectedEmployeeId),
        joinDate: joinDate.toISOString(),
        leaveStartDate: leaveStartDate.toISOString(),
        leaveEndDate: leaveInputType === 'endDate' && leaveEndDate ? leaveEndDate.toISOString() : null,
        leaveDays: leaveInputType === 'days' ? parseInt(leaveDays) : null,
        previousBalanceDays: parseInt(previousBalanceDays) || 0,
        ticketsEntitlement,
        visasCount: parseInt(visasCount) || 0,
        deductionsAmount: parseInt(deductionsAmount) || 0,
      };

      const response = await fetch('/api/leave-settlements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setCalculationResult(data.calculation);
        toast.success('تم حساب التصفية بنجاح');
        fetchSettlements();
        
        // إعادة تعيين النموذج
        resetForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'فشل في حساب التصفية');
      }
    } catch (error) {
      console.error('Error calculating settlement:', error);
      toast.error('حدث خطأ أثناء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedEmployeeId('');
    setJoinDate(undefined);
    setLeaveStartDate(undefined);
    setLeaveEndDate(undefined);
    setLeaveDays('');
    setPreviousBalanceDays('0');
    setTicketsEntitlement('employee');
    setVisasCount('0');
    setDeductionsAmount('0');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه التصفية؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/leave-settlements?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('تم حذف التصفية بنجاح');
        fetchSettlements();
      } else {
        toast.error('فشل في حذف التصفية');
      }
    } catch (error) {
      console.error('Error deleting settlement:', error);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'غير معروف';
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تصفية إجازة</h1>
          <p className="text-muted-foreground mt-2">
            حساب واستحقاق إجازات الموظفين مع التفاصيل الكاملة
          </p>
        </div>
      </div>

      {/* لوحة الإدخال */}
      <Card>
        <CardHeader>
          <CardTitle>إضافة تصفية إجازة جديدة</CardTitle>
          <CardDescription>
            أدخل بيانات الموظف والإجازة لحساب الاستحقاق
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* اختيار الموظف */}
            <div className="space-y-2">
              <Label htmlFor="employee">الموظف *</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name} {emp.position && `- ${emp.position}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* تاريخ مباشرة العمل */}
            <div className="space-y-2">
              <Label>تاريخ مباشرة العمل *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-right font-normal',
                      !joinDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {joinDate ? format(joinDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={joinDate}
                    onSelect={setJoinDate}
                    initialFocus
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* بداية الإجازة الحالية */}
            <div className="space-y-2">
              <Label>بداية الإجازة الحالية *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-right font-normal',
                      !leaveStartDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {leaveStartDate ? format(leaveStartDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={leaveStartDate}
                    onSelect={setLeaveStartDate}
                    initialFocus
                    locale={ar}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* نوع إدخال مدة الإجازة */}
            <div className="space-y-2">
              <Label>طريقة إدخال مدة الإجازة</Label>
              <Select value={leaveInputType} onValueChange={(v) => setLeaveInputType(v as 'days' | 'endDate')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">عدد الأيام</SelectItem>
                  <SelectItem value="endDate">تاريخ النهاية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* مدة الإجازة (أيام أو تاريخ نهاية) */}
            {leaveInputType === 'days' ? (
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
                <Label>تاريخ نهاية الإجازة *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-right font-normal',
                        !leaveEndDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="ml-2 h-4 w-4" />
                      {leaveEndDate ? format(leaveEndDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={leaveEndDate}
                      onSelect={setLeaveEndDate}
                      initialFocus
                      locale={ar}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* رصيد سابق */}
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

            {/* التذاكر */}
            <div className="space-y-2">
              <Label htmlFor="tickets">عدد أفراد التذاكر</Label>
              <Select value={ticketsEntitlement} onValueChange={(v) => setTicketsEntitlement(v as 'employee' | 'family4')}>
                <SelectTrigger id="tickets">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">موظف فقط (1 تذكرة)</SelectItem>
                  <SelectItem value="family4">موظف + زوج/زوجة + طفلين (4 تذاكر)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* التأشيرات */}
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

            {/* الخصومات */}
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

          <div className="flex gap-4">
            <Button
              onClick={handleCalculate}
              disabled={loading}
              className="flex-1"
              size="lg"
            >
              <Calculator className="ml-2 h-5 w-5" />
              {loading ? 'جارٍ الحساب...' : 'احسب الاستحقاق'}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              size="lg"
            >
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* لوحة النتائج */}
      {calculationResult && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>نتيجة الحساب</span>
              {calculationResult.isBalanceSufficient ? (
                <span className="text-sm font-normal px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  رصيد كافٍ
                </span>
              ) : (
                <span className="text-sm font-normal px-3 py-1 bg-red-100 text-red-800 rounded-full">
                  رصيد غير كافٍ
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    مدة الخدمة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculationResult.serviceYears} سنة {calculationResult.serviceMonths} شهر {calculationResult.serviceDaysRemainder} يوم
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    إجمالي: {calculationResult.serviceDays.toLocaleString('ar-SA')} يوم
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    الرصيد المستحق
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {calculationResult.accruedDays.toLocaleString('ar-SA')} يوم
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    من مدة الخدمة
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    الرصيد قبل الخصم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {calculationResult.balanceBeforeDeduction.toLocaleString('ar-SA')} يوم
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    شامل الرصيد السابق
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    الإجازة الحالية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {calculationResult.currentLeaveDays.toLocaleString('ar-SA')} يوم
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    سيتم خصمها
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    الرصيد المتبقي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    calculationResult.balanceAfterDeduction >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {calculationResult.balanceAfterDeduction.toLocaleString('ar-SA')} يوم
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    بعد خصم الإجازة
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    التذاكر والتأشيرات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculationResult.ticketsCount} / {calculationResult.visasCount}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    تذاكر / تأشيرات
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة التصفيات السابقة */}
      <Card>
        <CardHeader>
          <CardTitle>التصفيات السابقة</CardTitle>
          <CardDescription>
            جميع تصفيات الإجازات المسجلة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settlements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              لا توجد تصفيات مسجلة
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3">الموظف</th>
                    <th className="text-right p-3">تاريخ المباشرة</th>
                    <th className="text-right p-3">بداية الإجازة</th>
                    <th className="text-right p-3">مدة الإجازة</th>
                    <th className="text-right p-3">الرصيد المستحق</th>
                    <th className="text-right p-3">الرصيد المتبقي</th>
                    <th className="text-right p-3">التذاكر</th>
                    <th className="text-right p-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((settlement) => (
                    <tr key={settlement.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{getEmployeeName(settlement.employeeId)}</td>
                      <td className="p-3">{format(new Date(settlement.joinDate), 'yyyy-MM-dd')}</td>
                      <td className="p-3">{format(new Date(settlement.leaveStartDate), 'yyyy-MM-dd')}</td>
                      <td className="p-3">{settlement.currentLeaveDays} يوم</td>
                      <td className="p-3">{settlement.accruedDays} يوم</td>
                      <td className={cn(
                        "p-3 font-semibold",
                        settlement.balanceAfterDeduction >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {settlement.balanceAfterDeduction} يوم
                      </td>
                      <td className="p-3">{settlement.ticketsCount}</td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(settlement.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

