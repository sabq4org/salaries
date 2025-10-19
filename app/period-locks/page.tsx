"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Unlock, Calendar, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PeriodLock {
  id: number;
  year: number;
  month: number;
  isLocked: boolean;
  lockedBy: string | null;
  lockedByName: string | null;
  lockedAt: Date | null;
  lockReason: string | null;
  unlockedBy: string | null;
  unlockedByName: string | null;
  unlockedAt: Date | null;
  unlockReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function PeriodLocksPage() {
  const [locks, setLocks] = useState<PeriodLock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<{ year: number; month: number } | null>(null);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLocks();
  }, []);

  const fetchLocks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/period-locks");
      if (!response.ok) throw new Error("فشل في تحميل الفترات المقفلة");
      const data = await response.json();
      setLocks(data);
    } catch (error) {
      console.error("Error fetching locks:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الفترات المقفلة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async () => {
    if (!selectedPeriod) return;

    try {
      setProcessing(true);
      const response = await fetch("/api/period-locks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: selectedPeriod.year,
          month: selectedPeriod.month,
          action: "lock",
          userId: "admin",
          userName: "المسؤول",
          reason: reason.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في قفل الفترة");
      }

      toast({
        title: "تم القفل",
        description: `تم قفل فترة ${getMonthName(selectedPeriod.month)} ${selectedPeriod.year} بنجاح`,
      });

      setShowLockDialog(false);
      setSelectedPeriod(null);
      setReason("");
      fetchLocks();
    } catch (error: any) {
      console.error("Error locking period:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في قفل الفترة",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleUnlock = async () => {
    if (!selectedPeriod || !reason.trim()) {
      toast({
        title: "تنبيه",
        description: "يرجى إدخال سبب فتح القفل",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch("/api/period-locks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: selectedPeriod.year,
          month: selectedPeriod.month,
          action: "unlock",
          userId: "admin",
          userName: "المسؤول",
          reason: reason.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في فتح قفل الفترة");
      }

      toast({
        title: "تم فتح القفل",
        description: `تم فتح قفل فترة ${getMonthName(selectedPeriod.month)} ${selectedPeriod.year} بنجاح`,
      });

      setShowUnlockDialog(false);
      setSelectedPeriod(null);
      setReason("");
      fetchLocks();
    } catch (error: any) {
      console.error("Error unlocking period:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في فتح قفل الفترة",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    return months[month - 1];
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generatePeriods = () => {
    const currentYear = new Date().getFullYear();
    const periods: { year: number; month: number; lock?: PeriodLock }[] = [];

    // توليد آخر 24 شهر
    for (let i = 0; i < 24; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const lock = locks.find(l => l.year === year && l.month === month);
      periods.push({ year, month, lock });
    }

    return periods;
  };

  const periods = generatePeriods();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة الفترات المالية</h1>
            <p className="text-muted-foreground mt-1">
              قفل وفتح الفترات المالية لمنع التعديلات غير المصرح بها
            </p>
          </div>
        </div>

        {/* Warning Alert */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">تنبيه هام</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                قفل الفترة المالية يمنع جميع عمليات الإضافة والتعديل والحذف على البيانات المالية لتلك الفترة.
                يجب استخدام هذه الميزة بحذر وفقط بعد التأكد من صحة جميع البيانات المالية للفترة.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Lock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">فترات مقفلة</p>
                <p className="text-2xl font-bold text-foreground">
                  {locks.filter(l => l.isLocked).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Unlock className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">فترات مفتوحة</p>
                <p className="text-2xl font-bold text-foreground">
                  {periods.length - locks.filter(l => l.isLocked).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Periods Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              جاري التحميل...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الفترة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">قفل بواسطة</TableHead>
                  <TableHead className="text-right">تاريخ القفل</TableHead>
                  <TableHead className="text-right">السبب</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={`${period.year}-${period.month}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {getMonthName(period.month)} {period.year}
                      </div>
                    </TableCell>
                    <TableCell>
                      {period.lock?.isLocked ? (
                        <Badge variant="destructive">
                          <Lock className="h-3 w-3 ml-1" />
                          مقفل
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          <Unlock className="h-3 w-3 ml-1" />
                          مفتوح
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {period.lock?.lockedByName || "-"}
                    </TableCell>
                    <TableCell>
                      {formatDate(period.lock?.lockedAt || null)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {period.lock?.lockReason || "-"}
                    </TableCell>
                    <TableCell>
                      {period.lock?.isLocked ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPeriod({ year: period.year, month: period.month });
                            setShowUnlockDialog(true);
                          }}
                        >
                          <Unlock className="h-4 w-4 ml-1" />
                          فتح القفل
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedPeriod({ year: period.year, month: period.month });
                            setShowLockDialog(true);
                          }}
                        >
                          <Lock className="h-4 w-4 ml-1" />
                          قفل
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Lock Dialog */}
      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد قفل الفترة</DialogTitle>
            <DialogDescription>
              {selectedPeriod && (
                <>
                  هل أنت متأكد من قفل فترة <strong>{getMonthName(selectedPeriod.month)} {selectedPeriod.year}</strong>؟
                  لن يتمكن أي مستخدم من إضافة أو تعديل أو حذف البيانات المالية لهذه الفترة بعد القفل.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="سبب القفل (اختياري)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLockDialog(false);
                setReason("");
              }}
              disabled={processing}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleLock}
              disabled={processing}
            >
              {processing ? "جاري القفل..." : "قفل الفترة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlock Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد فتح القفل</DialogTitle>
            <DialogDescription>
              {selectedPeriod && (
                <>
                  هل أنت متأكد من فتح قفل فترة <strong>{getMonthName(selectedPeriod.month)} {selectedPeriod.year}</strong>؟
                  سيتمكن المستخدمون من التعديل على البيانات المالية لهذه الفترة بعد فتح القفل.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="سبب فتح القفل (مطلوب)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUnlockDialog(false);
                setReason("");
              }}
              disabled={processing}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={processing}
            >
              {processing ? "جاري فتح القفل..." : "فتح القفل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

