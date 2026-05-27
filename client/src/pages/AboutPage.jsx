import React from 'react';
import { ShieldCheck, Fuel, Users, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="font-outfit font-extrabold text-4xl text-slate-900 leading-tight">About RideShareX</h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          RideShareX is a final-year real-time project MERN application, designed to resolve intercity carpooling challenges across India, connecting verified drivers and budget-seeking commuters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-premium space-y-3.5">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-brand-500">
            <Fuel className="w-5.5 h-5.5" />
          </div>
          <h3 className="font-outfit font-bold text-slate-800 text-lg">Sustainable Split Costs</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            By sharing travel costs, car owners reduce weekly fuel costs while passengers secure reliable intercity commuting at split fares.
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-premium space-y-3.5">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <h3 className="font-outfit font-bold text-slate-800 text-lg">Premium Verification Ledger</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verify profiles with mock OTP sms, phone verifications, and ratings reviews that allow co-travelers to inspect user profiles with complete trust.
          </p>
        </div>
      </div>
    </div>
  );
}
