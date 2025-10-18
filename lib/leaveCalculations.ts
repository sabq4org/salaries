/**
 * وظائف حساب استحقاق الإجازات
 * 
 * القاعدة الأساسية: 30 يوم إجازة لكل 330 يوم عمل (11 شهر عمل + 1 شهر إجازة)
 * معدل الاستحقاق اليومي = 30 ÷ 330 = 0.090909 يوم/يوم عمل
 */

export interface LeaveCalculationInput {
  joinDate: Date;
  leaveStartDate: Date;
  leaveEndDate?: Date;
  leaveDays?: number;
  previousBalanceDays: number;
  ticketsEntitlement: 'employee' | 'family4';
  visasCount: number;
  deductionsAmount: number;
}

export interface LeaveCalculationResult {
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

/**
 * حساب عدد الأيام بين تاريخين
 */
function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * تحويل الأيام إلى سنوات وأشهر وأيام
 */
function convertDaysToYearsMonthsDays(totalDays: number): { years: number; months: number; days: number } {
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;
  
  return { years, months, days };
}

/**
 * حساب الرصيد المستحق من مدة الخدمة
 * القاعدة: 30 يوم إجازة لكل 330 يوم عمل
 */
function calculateAccruedLeave(serviceDays: number): number {
  const ANNUAL_LEAVE_DAYS = 30;
  const WORKING_DAYS_PER_YEAR = 330;
  
  return (serviceDays * ANNUAL_LEAVE_DAYS) / WORKING_DAYS_PER_YEAR;
}

/**
 * حساب عدد التذاكر المستحقة
 */
function calculateTicketsCount(ticketsEntitlement: 'employee' | 'family4'): number {
  return ticketsEntitlement === 'employee' ? 1 : 4;
}

/**
 * الدالة الرئيسية لحساب تصفية الإجازة
 */
export function calculateLeaveSettlement(input: LeaveCalculationInput): LeaveCalculationResult {
  // 1. حساب مدة الخدمة حتى بداية الإجازة
  const serviceDays = calculateDaysBetween(input.joinDate, input.leaveStartDate);
  const { years: serviceYears, months: serviceMonths, days: serviceDaysRemainder } = 
    convertDaysToYearsMonthsDays(serviceDays);
  
  // 2. احتساب الرصيد المستحق من مدة الخدمة
  const accruedDays = calculateAccruedLeave(serviceDays);
  
  // 3. إضافة الرصيد السابق
  const balanceBeforeDeduction = accruedDays + input.previousBalanceDays;
  
  // 4. حساب أيام الإجازة الحالية
  let currentLeaveDays: number;
  if (input.leaveDays !== undefined && input.leaveDays !== null) {
    currentLeaveDays = input.leaveDays;
  } else if (input.leaveEndDate) {
    currentLeaveDays = calculateDaysBetween(input.leaveStartDate, input.leaveEndDate);
  } else {
    currentLeaveDays = 0;
  }
  
  // 5. خصم الإجازة الحالية
  const balanceAfterDeduction = balanceBeforeDeduction - currentLeaveDays;
  
  // 6. حساب عدد التذاكر
  const ticketsCount = calculateTicketsCount(input.ticketsEntitlement);
  
  // 7. حساب الصافي المستحق (يمكن إضافة تسعير للتذاكر والتأشيرات لاحقاً)
  // حالياً نطرح الخصومات فقط
  const netPayable = -input.deductionsAmount; // سالب لأنها خصومات
  
  // 8. التحقق من كفاية الرصيد
  const isBalanceSufficient = balanceAfterDeduction >= 0;
  
  return {
    serviceDays,
    serviceYears,
    serviceMonths,
    serviceDaysRemainder,
    accruedDays: Math.round(accruedDays * 10) / 10, // تقريب لرقم عشري واحد
    balanceBeforeDeduction: Math.round(balanceBeforeDeduction * 10) / 10,
    currentLeaveDays,
    balanceAfterDeduction: Math.round(balanceAfterDeduction * 10) / 10,
    ticketsCount,
    visasCount: input.visasCount,
    netPayable,
    isBalanceSufficient,
  };
}

