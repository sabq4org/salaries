import { db } from './db';
import { systemSettings, type SystemSetting, type InsertSystemSetting } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { logAudit } from './audit';

/**
 * الحصول على قيمة إعداد معين
 */
export async function getSetting(key: string): Promise<string | null> {
  const result = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, key))
    .limit(1);

  return result[0]?.value || null;
}

/**
 * الحصول على قيمة إعداد كرقم
 */
export async function getSettingAsNumber(key: string, defaultValue: number = 0): Promise<number> {
  const value = await getSetting(key);
  return value ? parseFloat(value) : defaultValue;
}

/**
 * الحصول على قيمة إعداد كقيمة منطقية
 */
export async function getSettingAsBoolean(key: string, defaultValue: boolean = false): Promise<boolean> {
  const value = await getSetting(key);
  if (!value) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * الحصول على جميع الإعدادات
 */
export async function getAllSettings(): Promise<SystemSetting[]> {
  return await db.select().from(systemSettings).orderBy(systemSettings.category, systemSettings.key);
}

/**
 * الحصول على الإعدادات حسب الفئة
 */
export async function getSettingsByCategory(category: string): Promise<SystemSetting[]> {
  return await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.category, category))
    .orderBy(systemSettings.key);
}

/**
 * تحديث قيمة إعداد
 */
export async function updateSetting(
  key: string,
  value: string,
  userId?: string,
  userName?: string
): Promise<{ success: boolean; error?: string; setting?: SystemSetting }> {
  try {
    // الحصول على الإعداد الحالي
    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    if (!existing[0]) {
      return { success: false, error: 'الإعداد غير موجود' };
    }

    if (!existing[0].isEditable) {
      return { success: false, error: 'هذا الإعداد غير قابل للتعديل' };
    }

    // تحديث الإعداد
    const updated = await db
      .update(systemSettings)
      .set({
        value,
        updatedBy: userId,
        updatedByName: userName,
        updatedAt: new Date(),
      })
      .where(eq(systemSettings.key, key))
      .returning();

    // تسجيل في audit log
    await logAudit({
      entityType: 'user',
      entityId: existing[0].id,
      action: 'UPDATE',
      userId,
      userName,
      oldData: existing[0],
      newData: updated[0],
    });

    return { success: true, setting: updated[0] };
  } catch (error) {
    console.error('Error updating setting:', error);
    return { success: false, error: 'فشل في تحديث الإعداد' };
  }
}

/**
 * إنشاء إعداد جديد
 */
export async function createSetting(
  data: InsertSystemSetting
): Promise<{ success: boolean; error?: string; setting?: SystemSetting }> {
  try {
    const result = await db.insert(systemSettings).values(data).returning();
    return { success: true, setting: result[0] };
  } catch (error: any) {
    console.error('Error creating setting:', error);
    if (error.code === '23505') {
      return { success: false, error: 'مفتاح الإعداد موجود بالفعل' };
    }
    return { success: false, error: 'فشل في إنشاء الإعداد' };
  }
}

/**
 * حذف إعداد
 */
export async function deleteSetting(
  key: string,
  userId?: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // الحصول على الإعداد
    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    if (!existing[0]) {
      return { success: false, error: 'الإعداد غير موجود' };
    }

    if (!existing[0].isEditable) {
      return { success: false, error: 'هذا الإعداد غير قابل للحذف' };
    }

    // حذف الإعداد
    await db.delete(systemSettings).where(eq(systemSettings.key, key));

    // تسجيل في audit log
    await logAudit({
      entityType: 'user',
      entityId: existing[0].id,
      action: 'DELETE',
      userId,
      userName,
      oldData: existing[0],
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting setting:', error);
    return { success: false, error: 'فشل في حذف الإعداد' };
  }
}

/**
 * الحصول على معدلات التأمينات
 */
export async function getInsuranceRates() {
  return {
    socialRate: await getSettingAsNumber('insurance.social_rate', 9),
    medicalRate: await getSettingAsNumber('insurance.medical_rate', 0),
    employerContribution: await getSettingAsNumber('insurance.employer_contribution', 12),
  };
}

/**
 * الحصول على معدلات الضرائب
 */
export async function getTaxRates() {
  return {
    vatRate: await getSettingAsNumber('tax.vat_rate', 15),
    withholdingRate: await getSettingAsNumber('tax.withholding_rate', 0),
  };
}

/**
 * الحصول على إعدادات الإجازات
 */
export async function getLeaveSettings() {
  return {
    annualDays: await getSettingAsNumber('leave.annual_days', 21),
    sickDays: await getSettingAsNumber('leave.sick_days', 30),
    settlementRate: await getSettingAsNumber('leave.settlement_rate', 1),
    maxAccumulationDays: await getSettingAsNumber('leave.max_accumulation_days', 60),
  };
}

/**
 * الحصول على إعدادات الخصومات
 */
export async function getDeductionSettings() {
  return {
    latePenalty: await getSettingAsNumber('deduction.late_penalty', 100),
    absencePenalty: await getSettingAsNumber('deduction.absence_penalty', 300),
  };
}

/**
 * الحصول على الإعدادات العامة
 */
export async function getGeneralSettings() {
  return {
    companyName: await getSetting('general.company_name') || 'صحيفة سبق',
    companyNameEn: await getSetting('general.company_name_en') || 'Sabq Newspaper',
    commercialRegister: await getSetting('general.commercial_register') || '',
    taxNumber: await getSetting('general.tax_number') || '',
    fiscalYearStart: await getSettingAsNumber('general.fiscal_year_start', 1),
    currency: await getSetting('general.currency') || 'SAR',
    workingDaysPerMonth: await getSettingAsNumber('general.working_days_per_month', 30),
  };
}

