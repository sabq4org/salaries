# نظام الميزانية والرواتب - صحيفة سبق

نظام شامل لإدارة الموظفين والرواتب والميزانية لصحيفة سبق، مبني باستخدام Next.js 15 و TypeScript و Supabase.

## 🌐 الموقع المباشر

**الرابط:** https://salaries-gamma.vercel.app

## ✨ المميزات

### 1. **الصفحة الرئيسية (Dashboard)**
- عرض إحصائيات شاملة:
  - عدد الموظفين الرسميين
  - عدد المتعاونين
  - إجمالي الرواتب الشهرية
  - متوسط الراتب
- روابط سريعة لجميع الأقسام

### 2. **إدارة الموظفين الرسميين**
- عرض قائمة الموظفين مع:
  - الاسم الكامل
  - المنصب الوظيفي
  - الراتب الأساسي
  - التأمينات الاجتماعية
- إضافة موظف جديد
- تعديل بيانات الموظف
- حذف موظف (مع تأكيد)
- حساب التأمينات تلقائياً (9% من الراتب الأساسي)

### 3. **إدارة المتعاونين**
- عرض قائمة المتعاونين
- إضافة متعاون جديد
- تعديل بيانات المتعاون
- حذف متعاون

### 4. **مسير الرواتب الشهرية**
- اختيار الشهر والسنة
- عرض تفاصيل الرواتب:
  - الراتب الأساسي
  - البدلات
  - المكافآت
  - الخصومات
  - صافي الراتب
- حساب صافي الراتب تلقائياً
- عرض إجمالي الرواتب الشهرية

### 5. **الميزانية السنوية**
- تسجيل المصروفات حسب النوع:
  - رواتب
  - تشغيلية
  - تسويق
  - أخرى
- عرض المصروفات الشهرية في رسم بياني
- إحصائيات المصروفات حسب النوع
- إجمالي المصروفات السنوية

### 6. **التقارير**
- عرض تقارير شاملة:
  - قائمة الموظفين والرواتب
  - قائمة المتعاونين
  - مسير الرواتب الشهرية
  - المصروفات السنوية
- تحميل التقرير كملف نصي

### 7. **نظام تسجيل الدخول**
- صفحة تسجيل دخول بسيطة
- **بيانات الدخول للاختبار:**
  - اسم المستخدم: `admin`
  - كلمة المرور: `admin123`

## 🛠️ التقنيات المستخدمة

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **UI Components:** Shadcn/ui + Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **ORM:** Drizzle ORM
- **Deployment:** Vercel
- **Icons:** Lucide React

## 📦 التثبيت المحلي

### المتطلبات
- Node.js 18+
- npm أو pnpm

### الخطوات

1. **استنساخ المشروع:**
```bash
git clone https://github.com/sabq4org/salaries.git
cd salaries
```

2. **تثبيت الحزم:**
```bash
npm install
# أو
pnpm install
```

3. **إعداد متغيرات البيئة:**

أنشئ ملف `.env.local` في جذر المشروع وأضف:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
POSTGRES_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

4. **إنشاء قاعدة البيانات:**

نفذ SQL التالي في Supabase SQL Editor (راجع ملف `create_tables.sql`)

5. **تشغيل المشروع:**
```bash
npm run dev
# أو
pnpm dev
```

6. **افتح المتصفح:**
```
http://localhost:3000
```

## 📁 هيكل المشروع

```
sabq-payroll-nextjs/
├── app/
│   ├── api/              # API Routes
│   │   ├── employees/    # Employees API
│   │   ├── contractors/  # Contractors API
│   │   ├── payroll/      # Payroll API
│   │   └── expenses/     # Expenses API
│   ├── employees/        # Employees page
│   ├── contractors/      # Contractors page
│   ├── payroll/          # Payroll page
│   ├── budget/           # Budget page
│   ├── reports/          # Reports page
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage (Dashboard)
├── components/
│   └── ui/               # Shadcn UI components
├── lib/
│   ├── db.ts             # Database functions
│   └── utils.ts          # Utility functions
├── drizzle/
│   └── schema.ts         # Database schema
├── hooks/
│   └── useComposition.ts # Composition hook
└── public/               # Static assets
```

## 🔒 الأمان

- جميع API endpoints محمية
- التحقق من المدخلات في الخادم
- استخدام Prepared Statements لمنع SQL Injection
- تشفير كلمات المرور (TODO: تطبيق bcrypt)

## 🚀 النشر على Vercel

1. **ربط المشروع بـ GitHub**
2. **استيراد المشروع في Vercel**
3. **إضافة متغيرات البيئة في Vercel Dashboard**
4. **النشر التلقائي عند كل push**

## 📝 ملاحظات

- النظام يستخدم اللغة العربية بشكل كامل
- التصميم متجاوب (Responsive) ويعمل على جميع الأجهزة
- الألوان فاتحة وجذابة حسب المتطلبات
- جميع الحسابات تتم تلقائياً

## 🔮 التطويرات المستقبلية

- [ ] تطبيق نظام مصادقة حقيقي مع bcrypt
- [ ] إضافة صلاحيات المستخدمين (Admin/User)
- [ ] تصدير التقارير إلى PDF و Excel
- [ ] إضافة رسوم بيانية تفاعلية
- [ ] إضافة نظام الإشعارات
- [ ] إضافة سجل التغييرات (Audit Log)
- [ ] تحسين الأداء مع Server Components
- [ ] إضافة اختبارات (Unit & Integration Tests)

## 👨‍💻 المطور

تم تطوير النظام بواسطة Manus AI لصالح صحيفة سبق

## 📄 الترخيص

جميع الحقوق محفوظة © 2025 صحيفة سبق

---

**للدعم والاستفسارات:**
- GitHub Issues: https://github.com/sabq4org/salaries/issues
- الموقع: https://salaries-gamma.vercel.app

