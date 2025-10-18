import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
};

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  color = "blue" 
}: StatsCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </h3>
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                من الشهر الماضي
              </span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

