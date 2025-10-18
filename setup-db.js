const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// استخدام POSTGRES_URL_NON_POOLING للاتصال المباشر
const connectionString = "postgres://postgres.fhijotuxhsigcbadknzq:wETzd0ChImYmmUB1@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

async function setupDatabase() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    
    // إنشاء enum types
    await sql`CREATE TYPE IF NOT EXISTS user_role AS ENUM ('user', 'admin')`;
    await sql`CREATE TYPE IF NOT EXISTS expense_type AS ENUM ('salary', 'operational', 'marketing', 'other')`;
    console.log('✅ تم إنشاء enum types');

    // جدول المستخدمين
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name TEXT,
        email VARCHAR(320),
        "loginMethod" VARCHAR(64),
        role user_role DEFAULT 'user' NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "lastSignedIn" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ تم إنشاء جدول users');

    // جدول الموظفين الرسميين
    await sql`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        "baseSalary" INTEGER NOT NULL DEFAULT 0,
        "socialInsurance" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ تم إنشاء جدول employees');

    // جدول المتعاونين
    await sql`
      CREATE TABLE IF NOT EXISTS contractors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        salary INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ تم إنشاء جدول contractors');

    // جدول مسير رواتب الموظفين الرسميين
    await sql`
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
      )
    `;
    console.log('✅ تم إنشاء جدول employeePayrolls');

    // جدول مسير رواتب المتعاونين
    await sql`
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
      )
    `;
    console.log('✅ تم إنشاء جدول contractorPayrolls');

    // جدول المصروفات والميزانية
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        type expense_type NOT NULL,
        description TEXT,
        amount INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ تم إنشاء جدول expenses');

    // التحقق من وجود بيانات
    const existingEmployees = await sql`SELECT COUNT(*) FROM employees`;
    const count = parseInt(existingEmployees[0].count);
    
    if (count === 0) {
      // إضافة بيانات تجريبية للموظفين
      await sql`
        INSERT INTO employees (name, position, "baseSalary", "socialInsurance", "isActive") VALUES
        ('أحمد محمد', 'رئيس التحرير', 15000, 1350, true),
        ('فاطمة علي', 'محررة أولى', 12000, 1080, true),
        ('خالد سعيد', 'مصمم جرافيك', 10000, 900, true),
        ('نورة عبدالله', 'محررة', 9000, 810, true),
        ('محمد حسن', 'مصور صحفي', 8500, 765, true)
      `;
      console.log('✅ تم إضافة بيانات تجريبية للموظفين');

      // إضافة بيانات تجريبية للمتعاونين
      await sql`
        INSERT INTO contractors (name, position, salary, "isActive") VALUES
        ('سارة إبراهيم', 'كاتبة مستقلة', 5000, true),
        ('عمر يوسف', 'مصور فوتوغرافي', 4500, true),
        ('ليلى أحمد', 'مترجمة', 4000, true)
      `;
      console.log('✅ تم إضافة بيانات تجريبية للمتعاونين');
    } else {
      console.log(`ℹ️  يوجد بالفعل ${count} موظفين في قاعدة البيانات`);
    }

    console.log('\n✨ تم إعداد قاعدة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

setupDatabase();

