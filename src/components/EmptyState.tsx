import React from 'react';
import { LucideIcon, FileText } from 'lucide-react';

interface EmptyStateProps {
  id?: string;
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  id,
  icon: Icon = FileText,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div
      id={id}
      className="bg-white border border-slate-200 rounded-[16px] p-8 md:p-12 text-center flex flex-col items-center justify-center shadow-xs"
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs hover:shadow transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
