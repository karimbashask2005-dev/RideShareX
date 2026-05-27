import React from 'react';

export default function StatsCard({ title, value, icon: Icon, description, trend, trendType = 'neutral' }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-premium flex items-center justify-between hover:shadow-premium-hover transition-all duration-300">
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{title}</span>
        <h3 className="font-outfit font-extrabold text-2xl text-slate-900 leading-none">{value}</h3>
        {description && (
          <div className="flex items-center space-x-1.5 mt-2">
            {trend && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                trendType === 'positive' ? 'bg-emerald-50 text-emerald-600' :
                trendType === 'negative' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
              }`}>
                {trend}
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-semibold">{description}</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-100 flex-shrink-0 ml-4">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
