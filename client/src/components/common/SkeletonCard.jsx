import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-premium animate-pulse space-y-4">
      <div className="flex items-center space-x-3.5">
        <div className="w-11 h-11 bg-slate-200 rounded-2xl" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-1/5" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-8 bg-slate-200 rounded w-1/5" />
      </div>
    </div>
  );
}
