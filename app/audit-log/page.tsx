"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FileText, Filter, Download, Eye } from 'lucide-react';

interface AuditLog {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  userId: string | null;
  userName: string | null;
  oldData: string | null;
  newData: string | null;
  changes: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    startDate: '',
    endDate: '',
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({
      entityType: '',
      action: '',
      startDate: '',
      endDate: '',
    });
    setTimeout(() => fetchLogs(), 100);
  };

  const viewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'APPROVE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'REJECT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'LOCK': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'UNLOCK': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      employee: 'موظف',
      contractor: 'متعاون',
      payroll: 'مسير رواتب',
      expense: 'مصروف',
      revenue: 'إيراد',
      budget: 'ميزانية',
      leave_settlement: 'تصفية إجازة',
      reminder: 'تذكير',
      user: 'مستخدم',
      expense_category: 'فئة مصروف',
    };
    return labels[type] || type;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE: 'إنشاء',
      UPDATE: 'تعديل',
      DELETE: 'حذف',
      APPROVE: 'موافقة',
      REJECT: 'رفض',
      LOCK: 'قفل',
      UNLOCK: 'فتح',
    };
    return labels[action] || action;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">سجل التدقيق</h1>
            <p className="text-muted-foreground mt-1">
              سجل كامل لجميع العمليات والتغييرات في النظام
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">الفلاتر</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                نوع الكيان
              </label>
              <select
                value={filters.entityType}
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground"
              >
                <option value="">الكل</option>
                <option value="expense">مصروف</option>
                <option value="revenue">إيراد</option>
                <option value="employee">موظف</option>
                <option value="contractor">متعاون</option>
                <option value="payroll">مسير رواتب</option>
                <option value="leave_settlement">تصفية إجازة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                نوع العملية
              </label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground"
              >
                <option value="">الكل</option>
                <option value="CREATE">إنشاء</option>
                <option value="UPDATE">تعديل</option>
                <option value="DELETE">حذف</option>
                <option value="APPROVE">موافقة</option>
                <option value="REJECT">رفض</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              تطبيق الفلاتر
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              إعادة تعيين
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    التاريخ والوقت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    المستخدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    نوع الكيان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    العملية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      جاري التحميل...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      لا توجد سجلات
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {new Date(log.timestamp).toLocaleString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {log.userName || 'نظام'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {getEntityTypeLabel(log.entityType)} #{log.entityId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                        {log.ipAddress || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewDetails(log)}
                          className="text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetails && selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">تفاصيل السجل</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">التاريخ والوقت</p>
                      <p className="text-foreground font-medium">
                        {new Date(selectedLog.timestamp).toLocaleString('ar-SA')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">المستخدم</p>
                      <p className="text-foreground font-medium">{selectedLog.userName || 'نظام'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">نوع الكيان</p>
                      <p className="text-foreground font-medium">
                        {getEntityTypeLabel(selectedLog.entityType)} #{selectedLog.entityId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">العملية</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getActionColor(selectedLog.action)}`}>
                        {getActionLabel(selectedLog.action)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">IP Address</p>
                      <p className="text-foreground font-mono">{selectedLog.ipAddress || '-'}</p>
                    </div>
                  </div>

                  {selectedLog.changes && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">التغييرات</p>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(JSON.parse(selectedLog.changes), null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.oldData && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">البيانات القديمة</p>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(JSON.parse(selectedLog.oldData), null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.newData && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">البيانات الجديدة</p>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(JSON.parse(selectedLog.newData), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

