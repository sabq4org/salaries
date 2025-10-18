import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "red" | "orange";
}

const colorClasses = {
  blue: { bg: "#eff6ff", text: "#2563eb" },
  green: { bg: "#f0fdf4", text: "#16a34a" },
  purple: { bg: "#faf5ff", text: "#9333ea" },
  red: { bg: "#fef2f2", text: "#dc2626" },
  orange: { bg: "#fff7ed", text: "#ea580c" },
};

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = "blue" 
}: StatsCardProps) {
  const colors = colorClasses[color];
  
  return (
    <div 
      className="p-6 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #f0f0ef'
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {value}
          </h3>
          {trend && (
            <div className="flex items-center gap-1">
              <span 
                className="text-xs font-medium"
                style={{ color: trend.isPositive ? '#16a34a' : '#dc2626' }}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">
                من الشهر الماضي
              </span>
            </div>
          )}
        </div>
        
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: colors.bg,
            color: colors.text
          }}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

