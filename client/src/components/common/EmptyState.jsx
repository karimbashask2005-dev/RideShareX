import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function EmptyState({ title = 'No results found', description = 'Try adjusting your filters or search options to find rides.', icon: Icon = HelpCircle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-16 bg-white rounded-3xl border border-slate-100 shadow-premium max-w-lg mx-auto">
      <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-500 mb-5">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-outfit font-bold text-xl text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}
