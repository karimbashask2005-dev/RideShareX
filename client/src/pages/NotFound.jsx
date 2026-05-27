import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="font-outfit font-extrabold text-3xl text-slate-800">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm">The route you requested could not be resolved. It may have been relocated or cancelled.</p>
      <Link to="/" className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
        Return Home
      </Link>
    </div>
  );
}
