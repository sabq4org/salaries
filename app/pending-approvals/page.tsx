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
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingApproval {
  id: number;
  entityType: string;
  entityId: number | null;
  operation: string;
  requestData: string;
  currentData: string | null;
  status: string;
  makerId: string | null;
  makerName: string | null;
  checkerId: string | null;
  checkerName: string | null;
  makerComment: string | null;
  checkerComment: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
}

export default function PendingApprovalsPage() {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionComment, setRejectionComment] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/approvals");
      if (!response.ok) throw new Error("فشل في تحميل الموافقات المعلقة");
      const data = await response.json();
      setApprovals(data);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الموافقات المعلقة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;

    try {
      setProcessing(true);
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId: selectedApproval.id,
          action: "approve",
          checkerId: "admin",
          checkerName: "المسؤول",
          checkerComment: "",
        }),
      });

      if (!response.ok) throw new Error("فشل في الموافقة على الطلب");

      toast({
        title: "تمت الموافقة",
        description: "تمت الموافقة على الطلب بنجاح",
      });

      setShowApproveDialog(false);
      setSelectedApproval(null);
      fetchApprovals();
    } catch (error) {
      console.error("Error approving:", error);
      toast({
        title: "خطأ",
        description: "فشل في الموافقة على الطلب",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval || !rejectionComment.trim()) {
      toast({
        title: "تنبيه",
        description: "يرجى إدخال سبب الرفض",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId: selectedApproval.id,
          action: "reject",
          checkerId: "admin",
          checkerName: "المسؤول",
          checkerComment: rejectionComment,
        }),
      });

      if (!response.ok) throw new Error("فشل في رفض الطلب");

      toast({
        title: "تم الرفض",
        description: "تم رفض الطلب بنجاح",
      });

      setShowRejectDialog(false);
      setSelectedApproval(null);
      setRejectionComment("");
      fetchApprovals();
    } catch (error) {
      console.error("Error rejecting:", error);
      toast({
        title: "خطأ",
        description: "فشل في رفض الطلب",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getOperationLabel = (operation: string) => {
    const labels: Record<string, string> = {
      CREATE: "إضافة",
      UPDATE: "تعديل",
      DELETE: "حذف",
    };
    return labels[operation] || operation;
  };

  const getEntityTypeLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      employee: "موظف",
      contractor: "متعاون",
      employeePayroll: "راتب موظف",
      contractorPayroll: "راتب متعاون",
      expense: "مصروف",
      revenue: "إيراد",
      leaveSettlement: "تصفية إجازة",
    };
    return labels[entityType] || entityType;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    
    const labels: Record<string, string> = {
      pending: "معلق",
      approved: "موافق عليه",
      rejected: "مرفوض",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderDataComparison = (requestData: string, currentData: string | null, operation: string) => {
    let parsedRequestData, parsedCurrentData;
    
    try {
      parsedRequestData = JSON.parse(requestData);
    } catch {
      parsedRequestData = requestData;
    }

    try {
      parsedCurrentData = currentData ? JSON.parse(currentData) : null;
    } catch {
      parsedCurrentData = currentData;
    }

    if (operation === "CREATE") {
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">البيانات المطلوب إضافتها:</h4>
          <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-60 text-right" dir="ltr">
            {JSON.stringify(parsedRequestData, null, 2)}
          </pre>
        </div>
      );
    }

    if (operation === "DELETE") {
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">البيانات المطلوب حذفها:</h4>
          <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-60 text-right" dir="ltr">
            {JSON.stringify(parsedCurrentData, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">البيانات الحالية:</h4>
          <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-60 text-right" dir="ltr">
            {JSON.stringify(parsedCurrentData, null, 2)}
          </pre>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">البيانات المطلوب تعديلها:</h4>
          <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-60 text-right" dir="ltr">
            {JSON.stringify(parsedRequestData, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الموافقات المعلقة</h1>
            <p className="text-muted-foreground mt-1">
              مراجعة والموافقة على العمليات المالية المعلقة
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">معلقة</p>
                <p className="text-2xl font-bold text-foreground">
                  {approvals.filter(a => a.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">موافق عليها</p>
                <p className="text-2xl font-bold text-foreground">
                  {approvals.filter(a => a.status === "approved").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مرفوضة</p>
                <p className="text-2xl font-bold text-foreground">
                  {approvals.filter(a => a.status === "rejected").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Approvals Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              جاري التحميل...
            </div>
          ) : approvals.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              لا توجد موافقات معلقة
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">العملية</TableHead>
                  <TableHead className="text-right">طلب بواسطة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell className="font-medium">
                      {getEntityTypeLabel(approval.entityType)}
                    </TableCell>
                    <TableCell>
                      {getOperationLabel(approval.operation)}
                    </TableCell>
                    <TableCell>{approval.makerName || "غير محدد"}</TableCell>
                    <TableCell>{formatDate(approval.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(approval.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedApproval(approval);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Button>
                        {approval.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedApproval(approval);
                                setShowApproveDialog(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 ml-1" />
                              موافقة
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedApproval(approval);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 ml-1" />
                              رفض
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
            <DialogDescription>
              مراجعة تفاصيل الطلب والبيانات المرتبطة به
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">النوع</p>
                  <p className="text-foreground">{getEntityTypeLabel(selectedApproval.entityType)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">العملية</p>
                  <p className="text-foreground">{getOperationLabel(selectedApproval.operation)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">طلب بواسطة</p>
                  <p className="text-foreground">{selectedApproval.makerName || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">التاريخ</p>
                  <p className="text-foreground">{formatDate(selectedApproval.createdAt)}</p>
                </div>
              </div>
              {selectedApproval.makerComment && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">تعليق الطالب:</h4>
                  <p className="bg-muted p-3 rounded-md text-sm">{selectedApproval.makerComment}</p>
                </div>
              )}
              {renderDataComparison(
                selectedApproval.requestData,
                selectedApproval.currentData,
                selectedApproval.operation
              )}
              {selectedApproval.checkerComment && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">تعليق المراجع:</h4>
                  <p className="bg-muted p-3 rounded-md text-sm">{selectedApproval.checkerComment}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الموافقة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من الموافقة على هذا الطلب؟ سيتم تنفيذ العملية فوراً.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={processing}
            >
              إلغاء
            </Button>
            <Button onClick={handleApprove} disabled={processing}>
              {processing ? "جاري المعالجة..." : "موافقة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الرفض</DialogTitle>
            <DialogDescription>
              يرجى إدخال سبب رفض هذا الطلب
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="أدخل سبب الرفض..."
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionComment("");
              }}
              disabled={processing}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? "جاري المعالجة..." : "رفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

