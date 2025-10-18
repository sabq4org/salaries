-- إنشاء enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE expense_type AS ENUM ('salary', 'operational', 'marketing', 'other');

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role user_role DEFAULT 'user' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "lastSignedIn" TIMESTAMP DEFAULT NOW()
);

-- جدول الموظفين الرسميين
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  "baseSalary" INTEGER NOT NULL DEFAULT 0,
  "socialInsurance" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- جدول المتعاونين
CREATE TABLE IF NOT EXISTS contractors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  salary INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- جدول مسير رواتب الموظفين الرسميين
CREATE TABLE IF NOT EXISTS "employeePayrolls" (
  id SERIAL PRIMARY KEY,
  "employeeId" INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  "baseSalary" INTEGER NOT NULL DEFAULT 0,
  "socialInsurance" INTEGER NOT NULL DEFAULT 0,
  deduction INTEGER NOT NULL DEFAULT 0,
  bonus INTEGER NOT NULL DEFAULT 0,
  "netSalary" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- جدول مسير رواتب المتعاونين
CREATE TABLE IF NOT EXISTS "contractorPayrolls" (
  id SERIAL PRIMARY KEY,
  "contractorId" INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  salary INTEGER NOT NULL DEFAULT 0,
  deduction INTEGER NOT NULL DEFAULT 0,
  bonus INTEGER NOT NULL DEFAULT 0,
  "netSalary" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- جدول المصروفات والميزانية
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  type expense_type NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- إضافة بيانات تجريبية للموظفين
INSERT INTO employees (name, position, "baseSalary", "socialInsurance", "isActive") VALUES
  ('أحمد محمد', 'رئيس التحرير', 15000, 1350, true),
  ('فاطمة علي', 'محررة أولى', 12000, 1080, true),
  ('خالد سعيد', 'مصمم جرافيك', 10000, 900, true),
  ('نورة عبدالله', 'محررة', 9000, 810, true),
  ('محمد حسن', 'مصور صحفي', 8500, 765, true);

-- إضافة بيانات تجريبية للمتعاونين
INSERT INTO contractors (name, position, salary, "isActive") VALUES
  ('سارة إبراهيم', 'كاتبة مستقلة', 5000, true),
  ('عمر يوسف', 'مصور فوتوغرافي', 4500, true),
  ('ليلى أحمد', 'مترجمة', 4000, true);

