-- ============================================
-- المرحلة الأولى - تحديثات قاعدة البيانات الشاملة
-- نظام الرواتب والإدارة المالية لصحيفة سبق
-- ============================================

-- تاريخ الإنشاء: 2025-01-19
-- الإصدار: 1.0.0
-- الوصف: يحتوي هذا الملف على جميع التحديثات المطلوبة للمرحلة الأولى

-- ============================================
-- 1. جدول سجل التدقيق (Audit Logs)
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL,
  user_id VARCHAR(64),
  user_name VARCHAR(255),
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- إضافة تعليقات
COMMENT ON TABLE audit_logs IS 'جدول سجل التدقيق - يسجل جميع العمليات المالية والإدارية';
COMMENT ON COLUMN audit_logs.entity_type IS 'نوع الكيان (employee, payroll, expense, revenue)';
COMMENT ON COLUMN audit_logs.entity_id IS 'معرف الكيان';
COMMENT ON COLUMN audit_logs.action IS 'نوع الإجراء (CREATE, UPDATE, DELETE)';
COMMENT ON COLUMN audit_logs.old_data IS 'البيانات القديمة قبل التحديث (JSON)';
COMMENT ON COLUMN audit_logs.new_data IS 'البيانات الجديدة بعد التحديث (JSON)';

-- ============================================
-- 2. جدول الموافقات المعلقة (Pending Approvals)
-- ============================================

CREATE TABLE IF NOT EXISTS pending_approvals (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL,
  requested_by VARCHAR(64) NOT NULL,
  requested_by_name VARCHAR(255) NOT NULL,
  approved_by VARCHAR(64),
  approved_by_name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  data JSONB NOT NULL,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_pending_approvals_status ON pending_approvals(status);
CREATE INDEX IF NOT EXISTS idx_pending_approvals_entity ON pending_approvals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_pending_approvals_requested_by ON pending_approvals(requested_by);

-- إضافة قيود
ALTER TABLE pending_approvals ADD CONSTRAINT chk_approval_status 
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- إضافة تعليقات
COMMENT ON TABLE pending_approvals IS 'جدول الموافقات المعلقة - يدير آلية Maker/Checker';
COMMENT ON COLUMN pending_approvals.status IS 'حالة الموافقة (pending, approved, rejected)';
COMMENT ON COLUMN pending_approvals.data IS 'بيانات العملية المطلوب الموافقة عليها (JSON)';

-- ============================================
-- 3. جدول قفل الفترات المالية (Period Locks)
-- ============================================

CREATE TABLE IF NOT EXISTS period_locks (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  locked_by VARCHAR(64),
  locked_by_name VARCHAR(255),
  locked_at TIMESTAMP,
  reason TEXT,
  unlocked_by VARCHAR(64),
  unlocked_by_name VARCHAR(255),
  unlocked_at TIMESTAMP,
  unlock_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(year, month)
);

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_period_locks_year_month ON period_locks(year, month);
CREATE INDEX IF NOT EXISTS idx_period_locks_is_locked ON period_locks(is_locked);

-- إضافة قيود
ALTER TABLE period_locks ADD CONSTRAINT chk_period_month 
  CHECK (month >= 1 AND month <= 12);
ALTER TABLE period_locks ADD CONSTRAINT chk_period_year 
  CHECK (year >= 2020 AND year <= 2100);

-- إضافة تعليقات
COMMENT ON TABLE period_locks IS 'جدول قفل الفترات المالية - يمنع التعديلات على الفترات المقفلة';
COMMENT ON COLUMN period_locks.is_locked IS 'هل الفترة مقفلة';
COMMENT ON COLUMN period_locks.reason IS 'سبب القفل';
COMMENT ON COLUMN period_locks.unlock_reason IS 'سبب الفتح';

-- ============================================
-- 4. جدول إعدادات النظام (System Settings)
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  data_type VARCHAR(50) NOT NULL DEFAULT 'string',
  is_editable BOOLEAN NOT NULL DEFAULT true,
  updated_by VARCHAR(64) REFERENCES users(id),
  updated_by_name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- إضافة تعليقات
COMMENT ON TABLE system_settings IS 'جدول إعدادات النظام - يخزن الإعدادات القابلة للتخصيص';
COMMENT ON COLUMN system_settings.key IS 'مفتاح الإعداد الفريد';
COMMENT ON COLUMN system_settings.category IS 'فئة الإعداد (insurance, tax, leave, deduction, general)';
COMMENT ON COLUMN system_settings.data_type IS 'نوع البيانات (string, number, boolean, json)';
COMMENT ON COLUMN system_settings.is_editable IS 'هل يمكن تعديل هذا الإعداد من واجهة المستخدم';

-- ============================================
-- 5. إدراج الإعدادات الافتراضية
-- ============================================

-- إعدادات التأمينات الاجتماعية
INSERT INTO system_settings (key, value, category, label, description, data_type) VALUES
('insurance.social_rate', '9', 'insurance', 'نسبة التأمينات الاجتماعية (%)', 'النسبة المئوية المقتطعة من راتب الموظف للتأمينات الاجتماعية', 'number'),
('insurance.medical_rate', '0', 'insurance', 'نسبة التأمين الطبي (%)', 'النسبة المئوية المقتطعة من راتب الموظف للتأمين الطبي', 'number'),
('insurance.employer_contribution', '12', 'insurance', 'مساهمة صاحب العمل في التأمينات (%)', 'النسبة المئوية التي يدفعها صاحب العمل للتأمينات الاجتماعية', 'number')
ON CONFLICT (key) DO NOTHING;

-- إعدادات الضرائب
INSERT INTO system_settings (key, value, category, label, description, data_type) VALUES
('tax.vat_rate', '15', 'tax', 'نسبة ضريبة القيمة المضافة (%)', 'النسبة المئوية لضريبة القيمة المضافة المطبقة على الخدمات', 'number'),
('tax.withholding_rate', '0', 'tax', 'نسبة الضريبة المقتطعة (%)', 'النسبة المئوية للضريبة المقتطعة من رواتب المتعاونين', 'number')
ON CONFLICT (key) DO NOTHING;

-- إعدادات الإجازات
INSERT INTO system_settings (key, value, category, label, description, data_type) VALUES
('leave.annual_days', '21', 'leave', 'عدد أيام الإجازة السنوية', 'عدد أيام الإجازة السنوية المستحقة للموظف', 'number'),
('leave.sick_days', '30', 'leave', 'عدد أيام الإجازة المرضية', 'عدد أيام الإجازة المرضية المسموح بها سنوياً', 'number'),
('leave.settlement_rate', '1', 'leave', 'معامل احتساب تصفية الإجازة', 'المعامل المستخدم في حساب مبلغ تصفية الإجازة (1 = راتب يوم كامل)', 'number'),
('leave.max_accumulation_days', '60', 'leave', 'الحد الأقصى لتراكم الإجازات', 'الحد الأقصى لعدد أيام الإجازة التي يمكن تراكمها', 'number')
ON CONFLICT (key) DO NOTHING;

-- إعدادات الخصومات
INSERT INTO system_settings (key, value, category, label, description, data_type) VALUES
('deduction.late_penalty', '100', 'deduction', 'غرامة التأخير (ريال)', 'المبلغ المقتطع عن كل يوم تأخير', 'number'),
('deduction.absence_penalty', '300', 'deduction', 'غرامة الغياب (ريال)', 'المبلغ المقتطع عن كل يوم غياب', 'number')
ON CONFLICT (key) DO NOTHING;

-- إعدادات عامة
INSERT INTO system_settings (key, value, category, label, description, data_type) VALUES
('general.company_name', 'صحيفة سبق', 'general', 'اسم الشركة', 'الاسم الرسمي للشركة', 'string'),
('general.company_name_en', 'Sabq Newspaper', 'general', 'اسم الشركة بالإنجليزية', 'الاسم الرسمي للشركة بالإنجليزية', 'string'),
('general.commercial_register', '', 'general', 'رقم السجل التجاري', 'رقم السجل التجاري للشركة', 'string'),
('general.tax_number', '', 'general', 'الرقم الضريبي', 'الرقم الضريبي للشركة', 'string'),
('general.fiscal_year_start', '1', 'general', 'بداية السنة المالية (شهر)', 'الشهر الذي تبدأ فيه السنة المالية (1-12)', 'number'),
('general.currency', 'SAR', 'general', 'العملة', 'العملة المستخدمة في النظام', 'string'),
('general.working_days_per_month', '30', 'general', 'عدد أيام العمل في الشهر', 'عدد الأيام المستخدمة في حساب الرواتب اليومية', 'number')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 6. إنشاء دوال مساعدة
-- ============================================

-- دالة للتحقق من قفل الفترة
CREATE OR REPLACE FUNCTION is_period_locked(p_year INTEGER, p_month INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_locked BOOLEAN;
BEGIN
  SELECT is_locked INTO v_is_locked
  FROM period_locks
  WHERE year = p_year AND month = p_month;
  
  RETURN COALESCE(v_is_locked, FALSE);
END;
$$ LANGUAGE plpgsql;

-- دالة للحصول على قيمة إعداد
CREATE OR REPLACE FUNCTION get_setting(p_key VARCHAR)
RETURNS TEXT AS $$
DECLARE
  v_value TEXT;
BEGIN
  SELECT value INTO v_value
  FROM system_settings
  WHERE key = p_key;
  
  RETURN v_value;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. إنشاء مشغلات (Triggers)
-- ============================================

-- مشغل لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق المشغل على الجداول
DROP TRIGGER IF EXISTS update_pending_approvals_updated_at ON pending_approvals;
CREATE TRIGGER update_pending_approvals_updated_at
  BEFORE UPDATE ON pending_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_period_locks_updated_at ON period_locks;
CREATE TRIGGER update_period_locks_updated_at
  BEFORE UPDATE ON period_locks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. منح الصلاحيات (إذا لزم الأمر)
-- ============================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON pending_approvals TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON period_locks TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON system_settings TO app_user;

-- ============================================
-- 9. التحقق من التثبيت
-- ============================================

-- التحقق من إنشاء الجداول
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    RAISE NOTICE 'جدول audit_logs تم إنشاؤه بنجاح';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_approvals') THEN
    RAISE NOTICE 'جدول pending_approvals تم إنشاؤه بنجاح';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'period_locks') THEN
    RAISE NOTICE 'جدول period_locks تم إنشاؤه بنجاح';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings') THEN
    RAISE NOTICE 'جدول system_settings تم إنشاؤه بنجاح';
  END IF;
END $$;

-- عرض عدد الإعدادات المدرجة
SELECT 
  category,
  COUNT(*) as count
FROM system_settings
GROUP BY category
ORDER BY category;

-- ============================================
-- انتهى التثبيت
-- ============================================

-- ملاحظات:
-- 1. تأكد من عمل نسخة احتياطية من قاعدة البيانات قبل تنفيذ هذا الملف
-- 2. قد تحتاج إلى تعديل صلاحيات المستخدمين حسب احتياجاتك
-- 3. يمكنك تخصيص القيم الافتراضية للإعدادات حسب احتياجات شركتك
-- 4. للتراجع عن التثبيت، قم بحذف الجداول الأربعة المذكورة أعلاه

RAISE NOTICE 'تم إكمال تثبيت المرحلة الأولى بنجاح!';

