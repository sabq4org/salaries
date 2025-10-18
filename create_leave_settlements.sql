-- إنشاء enum لنوع التذاكر
DO $$ BEGIN
  CREATE TYPE tickets_entitlement AS ENUM ('employee', 'family4');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- إنشاء جدول تصفية الإجازات
CREATE TABLE IF NOT EXISTS "leaveSettlements" (
  "id" SERIAL PRIMARY KEY,
  "employeeId" INTEGER NOT NULL,
  "joinDate" TIMESTAMP NOT NULL,
  "leaveStartDate" TIMESTAMP NOT NULL,
  "leaveEndDate" TIMESTAMP,
  "leaveDays" INTEGER,
  "previousBalanceDays" INTEGER NOT NULL DEFAULT 0,
  "ticketsEntitlement" tickets_entitlement NOT NULL DEFAULT 'employee',
  "visasCount" INTEGER NOT NULL DEFAULT 0,
  "deductionsAmount" INTEGER NOT NULL DEFAULT 0,
  
  -- الحسابات المحسوبة
  "serviceDays" INTEGER NOT NULL DEFAULT 0,
  "accruedDays" INTEGER NOT NULL DEFAULT 0,
  "balanceBeforeDeduction" INTEGER NOT NULL DEFAULT 0,
  "currentLeaveDays" INTEGER NOT NULL DEFAULT 0,
  "balanceAfterDeduction" INTEGER NOT NULL DEFAULT 0,
  "ticketsCount" INTEGER NOT NULL DEFAULT 0,
  "netPayable" INTEGER NOT NULL DEFAULT 0,
  
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- إنشاء فهرس على employeeId لتحسين الأداء
CREATE INDEX IF NOT EXISTS "idx_leaveSettlements_employeeId" ON "leaveSettlements"("employeeId");

