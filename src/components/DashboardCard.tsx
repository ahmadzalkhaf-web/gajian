import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  iconColor?: string;
  iconBg?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
}) => {
  return (
    <div
      id={id}
      className="bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 shadow-xs hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend.isPositive !== false
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs md:text-sm font-medium text-slate-600 tracking-wide">{title}</p>
        <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-600 mt-1 font-normal">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
