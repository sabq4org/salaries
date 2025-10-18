"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Clock, Bell, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";

interface Reminder {
  id: number;
  title: string;
  type: string;
  employeeName: string | null;
  dueDate: string;
  status: string;
}

const reminderTypes: Record<string, string> = {
  residence_expiry: "انتهاء إقامة",
  leave_start: "بداية إجازة",
  leave_end: "نهاية إجازة",
  insurance_payment: "استحقاق تأمينات",
  contract_renewal: "تجديد عقد",
  document_expiry: "انتهاء وثيقة",
  other: "أخرى",
};

const statusConfig = {
  overdue: {
    icon: AlertCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    textColor: "text-red-800",
    iconColor: "text-red-600",
    label: "متأخر",
  },
  due_soon: {
    icon: Clock,
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    textColor: "text-orange-800",
    iconColor: "text-orange-600",
    label: "قريب",
  },
  pending: {
    icon: Bell,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-600",
    label: "قادم",
  },
};

export default function RemindersAlert() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
    // Load dismissed IDs from localStorage
    const stored = localStorage.getItem("dismissedReminders");
    if (stored) {
      try {
        setDismissedIds(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse dismissed reminders:", e);
      }
    }
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch("/api/reminders?active=true");
      const data = await response.json();
      
      // Filter to show only overdue and due_soon reminders
      const urgentReminders = data.filter(
        (r: Reminder) => r.status === "overdue" || r.status === "due_soon"
      );
      
      setReminders(urgentReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (id: number) => {
    const newDismissedIds = [...dismissedIds, id];
    setDismissedIds(newDismissedIds);
    localStorage.setItem("dismissedReminders", JSON.stringify(newDismissedIds));
  };

  if (loading) {
    return null;
  }

  const visibleReminders = reminders.filter(
    (r) => !dismissedIds.includes(r.id)
  );

  if (visibleReminders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleReminders.map((reminder) => {
        const config =
          statusConfig[reminder.status as keyof typeof statusConfig];
        if (!config) return null;

        const Icon = config.icon;

        return (
          <div
            key={reminder.id}
            className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-4 shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${config.textColor}`}>
                      {reminder.title}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <span className={config.textColor}>
                        <strong>النوع:</strong>{" "}
                        {reminderTypes[reminder.type] || reminder.type}
                      </span>
                      {reminder.employeeName && (
                        <span className={config.textColor}>
                          <strong>الموظف:</strong> {reminder.employeeName}
                        </span>
                      )}
                      <span className={config.textColor}>
                        <strong>الموعد:</strong>{" "}
                        {format(new Date(reminder.dueDate), "d MMMM yyyy", {
                          locale: ar,
                        })}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismiss(reminder.id)}
                    className={`p-1 rounded hover:bg-white/50 transition-colors ${config.textColor}`}
                    aria-label="إغلاق التنبيه"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {visibleReminders.length > 0 && (
        <div className="text-center">
          <Link
            href="/reminders"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            عرض جميع التذكيرات ←
          </Link>
        </div>
      )}
    </div>
  );
}

