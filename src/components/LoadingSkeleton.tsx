import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-[16px] p-5 md:p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="w-11 h-11 bg-slate-100 rounded-xl" />
      <div className="w-14 h-5 bg-slate-100 rounded-full" />
    </div>
    <div className="mt-4 space-y-2">
      <div className="w-24 h-4 bg-slate-100 rounded" />
      <div className="w-32 h-8 bg-slate-100 rounded" />
      <div className="w-20 h-3 bg-slate-100 rounded" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white border border-slate-200 rounded-[16px] overflow-hidden animate-pulse">
    <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center px-6 gap-4">
      <div className="w-20 h-4 bg-slate-200 rounded" />
      <div className="w-32 h-4 bg-slate-200 rounded" />
      <div className="w-24 h-4 bg-slate-200 rounded hidden md:block" />
      <div className="w-28 h-4 bg-slate-200 rounded hidden lg:block" />
      <div className="w-16 h-4 bg-slate-200 rounded ml-auto" />
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 flex items-center px-6 gap-4">
          <div className="w-16 h-4 bg-slate-100 rounded" />
          <div className="w-36 h-4 bg-slate-100 rounded" />
          <div className="w-28 h-4 bg-slate-100 rounded hidden md:block" />
          <div className="w-24 h-4 bg-slate-100 rounded hidden lg:block" />
          <div className="w-20 h-6 bg-slate-100 rounded-full ml-auto" />
        </div>
      ))}
    </div>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-[16px] p-6 space-y-4 animate-pulse">
    <div className="w-40 h-6 bg-slate-100 rounded" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
      <div className="space-y-2">
        <div className="w-24 h-4 bg-slate-100 rounded" />
        <div className="w-full h-11 bg-slate-100 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="w-24 h-4 bg-slate-100 rounded" />
        <div className="w-full h-11 bg-slate-100 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="w-24 h-4 bg-slate-100 rounded" />
        <div className="w-full h-11 bg-slate-100 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="w-24 h-4 bg-slate-100 rounded" />
        <div className="w-full h-11 bg-slate-100 rounded-xl" />
      </div>
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-[16px] p-6 animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div className="w-36 h-5 bg-slate-100 rounded" />
      <div className="w-20 h-4 bg-slate-100 rounded" />
    </div>
    <div className="h-56 bg-slate-50 rounded-xl flex items-end justify-between p-4 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="w-full bg-slate-200 rounded-t"
          style={{ height: `${25 + (i * 12) % 65}%` }}
        />
      ))}
    </div>
  </div>
);
