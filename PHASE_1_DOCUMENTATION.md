# توثيق المرحلة الأولى - نظام الرواتب والإدارة المالية لصحيفة سبق

## نظرة عامة

تم إكمال المرحلة الأولى (90 يوماً) من خارطة طريق تطوير نظام الرواتب والإدارة المالية لصحيفة سبق. هذه المرحلة تركز على **تعزيز الأمان والشفافية والتحكم** من خلال أربع ميزات رئيسية.

## الميزات المنجزة

### 1. سجل التدقيق والموافقات المعلقة (Audit Log + Maker/Checker)

#### الوصف
نظام شامل لتسجيل جميع العمليات المالية والإدارية مع آلية موافقات ثنائية (Maker/Checker) لضمان الشفافية والمساءلة.

#### المكونات المنفذة

**قاعدة البيانات:**
- جدول `audit_logs`: يسجل جميع العمليات (إنشاء، تحديث، حذف)
- جدول `pending_approvals`: يدير الموافقات المعلقة

**الملفات المضافة:**
- `lib/audit.ts`: مكتبة تسجيل التدقيق
- `lib/maker-checker.ts`: مكتبة إدارة الموافقات
- `app/audit-log/page.tsx`: صفحة عرض سجل التدقيق
- `app/pending-approvals/page.tsx`: صفحة الموافقات المعلقة
- `app/api/approvals/route.ts`: API endpoints للموافقات

**الميزات:**
- تسجيل تلقائي لجميع العمليات المالية
- عرض البيانات القديمة والجديدة لكل عملية
- تتبع المستخدم، IP Address، User Agent
- فلترة حسب النوع، الإجراء، التاريخ
- واجهة مستخدم احترافية مع جداول منظمة

#### الاستخدام

```typescript
// تسجيل عملية في audit log
await logAudit({
  entityType: 'employee',
  entityId: employeeId,
  action: 'CREATE',
  userId: 'admin',
  userName: 'المسؤول',
  newData: employeeData,
  ipAddress: getClientIp(request),
  userAgent: getUserAgent(request),
});

// إنشاء طلب موافقة
await createApprovalRequest({
  entityType: 'expense',
  entityId: expenseId,
  action: 'CREATE',
  requestedBy: 'user1',
  requestedByName: 'أحمد محمد',
  data: expenseData,
});
```

---

### 2. نظام قفل الفترات المالية (Period Lock)

#### الوصف
نظام يمنع التعديلات على الفترات المالية المقفلة لضمان سلامة البيانات المالية والامتثال للمعايير المحاسبية.

#### المكونات المنفذة

**قاعدة البيانات:**
- جدول `period_locks`: يدير حالة قفل الفترات المالية

**الملفات المضافة:**
- `lib/period-lock.ts`: مكتبة إدارة قفل الفترات
- `app/period-locks/page.tsx`: صفحة إدارة الفترات المالية
- `app/api/period-locks/route.ts`: API endpoints لقفل/فتح الفترات

**التحديثات على الملفات الموجودة:**
- `app/api/payroll/route.ts`: إضافة فحص القفل
- `app/api/expenses/route.ts`: إضافة فحص القفل
- `app/api/revenues/route.ts`: إضافة فحص القفل

**الميزات:**
- قفل/فتح الفترات المالية (شهر/سنة)
- منع جميع العمليات على الفترات المقفلة
- تسجيل جميع عمليات القفل/الفتح في audit log
- واجهة مستخدم بسيطة وواضحة
- رسائل خطأ واضحة عند محاولة التعديل على فترة مقفلة

#### الاستخدام

```typescript
// التحقق من أن الفترة غير مقفلة
await validatePeriodNotLocked(year, month);

// قفل فترة مالية
await lockPeriod(year, month, 'admin', 'المسؤول', 'إقفال نهاية الشهر');

// فتح فترة مالية
await unlockPeriod(year, month, 'admin', 'المسؤول', 'تصحيح خطأ');

// التحقق من حالة القفل
const isLocked = await isPeriodLocked(year, month);
```

---

### 3. نظام الإعدادات القابلة للتخصيص (Configurable Settings)

#### الوصف
نظام شامل لإدارة جميع الإعدادات القابلة للتخصيص في النظام مع واجهة مستخدم سهلة الاستخدام.

#### المكونات المنفذة

**قاعدة البيانات:**
- جدول `system_settings`: يخزن جميع الإعدادات

**الملفات المضافة:**
- `lib/settings.ts`: مكتبة إدارة الإعدادات
- `app/system-settings/page.tsx`: صفحة إعدادات النظام
- `app/api/settings/route.ts`: API endpoints للإعدادات

**فئات الإعدادات:**

1. **التأمينات الاجتماعية (Insurance)**
   - نسبة التأمينات الاجتماعية (9%)
   - نسبة التأمين الطبي (0%)
   - مساهمة صاحب العمل (12%)

2. **الضرائب (Tax)**
   - نسبة ضريبة القيمة المضافة (15%)
   - نسبة الضريبة المقتطعة (0%)

3. **الإجازات (Leave)**
   - عدد أيام الإجازة السنوية (21)
   - عدد أيام الإجازة المرضية (30)
   - معامل احتساب تصفية الإجازة (1)
   - الحد الأقصى لتراكم الإجازات (60)

4. **الخصومات (Deduction)**
   - غرامة التأخير (100 ريال)
   - غرامة الغياب (300 ريال)

5. **إعدادات عامة (General)**
   - اسم الشركة
   - رقم السجل التجاري
   - الرقم الضريبي
   - بداية السنة المالية
   - العملة
   - عدد أيام العمل في الشهر

**الميزات:**
- واجهة مستخدم مع تبويبات منظمة
- حفظ كل إعداد على حدة أو الكل معاً
- دعم أنواع بيانات متعددة (string, number, boolean, json)
- تسجيل جميع التغييرات في audit log
- إمكانية تحديد الإعدادات القابلة للتعديل

#### الاستخدام

```typescript
// الحصول على قيمة إعداد
const vatRate = await getSettingAsNumber('tax.vat_rate', 15);

// تحديث إعداد
await updateSetting('tax.vat_rate', '15', 'admin', 'المسؤول');

// الحصول على معدلات التأمينات
const insuranceRates = await getInsuranceRates();

// الحصول على إعدادات الإجازات
const leaveSettings = await getLeaveSettings();
```

---

### 4. دفتر الأستاذ للموظفين (Employee Ledger)

#### الوصف
نظام شامل لعرض السجل المالي الكامل لكل موظف بما في ذلك الرواتب وتصفية الإجازات والمكافآت والخصومات.

#### المكونات المنفذة

**الملفات المضافة:**
- `lib/employee-ledger.ts`: مكتبة إدارة دفتر الأستاذ
- `app/employee-ledger/page.tsx`: صفحة دفتر الأستاذ
- `app/api/employee-ledger/route.ts`: API endpoint لدفتر الأستاذ

**الميزات:**
- عرض جميع العمليات المالية للموظف
- فلترة حسب الموظف، السنة، الشهر
- بطاقات إحصائية تعرض الملخص المالي
- تصدير دفتر الأستاذ إلى CSV
- واجهة مستخدم احترافية مع جداول منظمة
- عرض تفاصيل كل عملية مالية

**أنواع السجلات:**
- راتب (Salary)
- تصفية إجازة (Leave Settlement)
- مكافأة (Bonus)
- خصم (Deduction)

#### الاستخدام

```typescript
// الحصول على دفتر الأستاذ لموظف
const ledger = await getEmployeeLedger(employeeId, year, month);

// الحصول على ملخص جميع الموظفين
const summaries = await getAllEmployeesLedgerSummary(year);

// تصدير إلى CSV
const csv = exportLedgerToCSV(ledger);
```

---

## تحديثات قاعدة البيانات

### الجداول الجديدة

1. **audit_logs**
   - تسجيل جميع العمليات المالية والإدارية
   - الحقول: id, entity_type, entity_id, action, user_id, user_name, old_data, new_data, ip_address, user_agent, timestamp

2. **pending_approvals**
   - إدارة الموافقات المعلقة
   - الحقول: id, entity_type, entity_id, action, requested_by, requested_by_name, approved_by, approved_by_name, status, data, reason, created_at, updated_at

3. **period_locks**
   - إدارة قفل الفترات المالية
   - الحقول: id, year, month, is_locked, locked_by, locked_by_name, locked_at, reason, unlocked_by, unlocked_by_name, unlocked_at, unlock_reason

4. **system_settings**
   - تخزين الإعدادات القابلة للتخصيص
   - الحقول: id, key, value, category, label, description, data_type, is_editable, updated_by, updated_by_name, created_at, updated_at

### ملفات SQL

تم إنشاء ملفات SQL لإضافة الجداول الجديدة:
- `/home/ubuntu/add_audit_logs_table.sql`
- `/home/ubuntu/add_pending_approvals_table.sql`
- `/home/ubuntu/add_period_locks_table.sql`
- `/home/ubuntu/add_system_settings_table.sql`

---

## تحديثات القائمة الجانبية

تم إضافة الروابط التالية إلى القائمة الجانبية:
- **سجل التدقيق** (`/audit-log`)
- **الموافقات المعلقة** (`/pending-approvals`)
- **إدارة الفترات المالية** (`/period-locks`)
- **إعدادات النظام** (`/system-settings`)
- **دفتر الأستاذ** (`/employee-ledger`)

---

## التحديثات على APIs الموجودة

تم تحديث APIs التالية لدعم الميزات الجديدة:

1. **app/api/payroll/route.ts**
   - إضافة فحص قفل الفترات
   - تحسين معالجة الأخطاء

2. **app/api/expenses/route.ts**
   - إضافة فحص قفل الفترات
   - تسجيل العمليات في audit log

3. **app/api/revenues/route.ts**
   - إضافة فحص قفل الفترات
   - تحسين معالجة الأخطاء

---

## خطوات التطبيق

### 1. تحديث قاعدة البيانات

قم بتنفيذ ملفات SQL التالية بالترتيب:

```bash
psql -U postgres -d salaries_db -f add_audit_logs_table.sql
psql -U postgres -d salaries_db -f add_pending_approvals_table.sql
psql -U postgres -d salaries_db -f add_period_locks_table.sql
psql -U postgres -d salaries_db -f add_system_settings_table.sql
```

### 2. تحديث الكود

```bash
cd /home/ubuntu/salaries
git pull origin main
```

### 3. تثبيت التبعيات (إذا لزم الأمر)

```bash
pnpm install
```

### 4. تشغيل التطبيق

```bash
pnpm dev
```

---

## الاختبارات الموصى بها

### 1. اختبار سجل التدقيق
- [ ] إنشاء موظف جديد والتحقق من تسجيل العملية
- [ ] تحديث بيانات موظف والتحقق من تسجيل البيانات القديمة والجديدة
- [ ] حذف موظف والتحقق من تسجيل العملية
- [ ] فلترة السجلات حسب النوع والإجراء والتاريخ

### 2. اختبار قفل الفترات
- [ ] قفل فترة مالية والتحقق من منع التعديلات
- [ ] محاولة إضافة راتب لفترة مقفلة والتحقق من رسالة الخطأ
- [ ] فتح فترة مقفلة والتحقق من إمكانية التعديل
- [ ] التحقق من تسجيل عمليات القفل/الفتح في audit log

### 3. اختبار الإعدادات
- [ ] تحديث نسبة التأمينات الاجتماعية والتحقق من الحفظ
- [ ] تحديث نسبة ضريبة القيمة المضافة والتحقق من الحفظ
- [ ] التحقق من تسجيل التغييرات في audit log
- [ ] اختبار حفظ جميع الإعدادات في فئة واحدة

### 4. اختبار دفتر الأستاذ
- [ ] اختيار موظف وعرض سجله المالي
- [ ] فلترة حسب السنة والشهر
- [ ] التحقق من صحة الإحصائيات المعروضة
- [ ] تصدير دفتر الأستاذ إلى CSV

---

## الأداء والأمان

### الأداء
- استخدام indexes على الحقول المستخدمة في البحث والفلترة
- تحسين استعلامات قاعدة البيانات
- استخدام pagination في عرض السجلات الكبيرة

### الأمان
- تسجيل جميع العمليات الحساسة في audit log
- التحقق من صلاحيات المستخدم قبل تنفيذ العمليات
- منع التعديلات على الفترات المقفلة
- تشفير البيانات الحساسة

---

## الخطوات التالية (المرحلة الثانية)

1. **تطوير لوحة التحكم التفاعلية**
   - مؤشرات الأداء الرئيسية (KPIs)
   - الرسوم البيانية التفاعلية
   - التنبيهات الذكية

2. **تحسين نظام التقارير**
   - تقارير مخصصة
   - جدولة التقارير
   - تصدير بصيغ متعددة

3. **إضافة ميزات متقدمة**
   - التكامل مع الأنظمة الخارجية
   - الإشعارات الفورية
   - النسخ الاحتياطي التلقائي

---

## الدعم والمساعدة

للحصول على الدعم أو الإبلاغ عن مشاكل، يرجى التواصل عبر:
- GitHub Issues: https://github.com/sabq4org/salaries/issues
- البريد الإلكتروني: support@sabq.org

---

## الترخيص

هذا المشروع مملوك لصحيفة سبق ومحمي بحقوق الطبع والنشر.

---

**تاريخ الإصدار:** 2025-01-19  
**الإصدار:** 1.0.0  
**المطور:** Manus AI Agent

