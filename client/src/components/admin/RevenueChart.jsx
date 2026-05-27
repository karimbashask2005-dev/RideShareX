import React, { useState } from 'react';
import { TrendingUp, Award, Landmark, Calendar } from 'lucide-react';

export default function RevenueChart({ data = [] }) {
  const [activeMetric, setActiveMetric] = useState('bookings'); // 'bookings' | 'commission' | 'subscriptions'

  const maxVal = Math.max(...data.map(d => d[activeMetric] || 1), 1000);
  const chartHeight = 150;
  const chartWidth = 500;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h3 className="font-outfit font-extrabold text-slate-800 text-lg">Financial Performance</h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time ledger analytics for commission & plans</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 flex-wrap">
          <button 
            onClick={() => setActiveMetric('bookings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeMetric === 'bookings' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-550 hover:text-slate-850'}`}
          >
            Gross Bookings
          </button>
          <button 
            onClick={() => setActiveMetric('commission')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeMetric === 'commission' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-550 hover:text-slate-850'}`}
          >
            Commissions
          </button>
          <button 
            onClick={() => setActiveMetric('subscriptions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeMetric === 'subscriptions' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-550 hover:text-slate-850'}`}
          >
            Subscriptions
          </button>
        </div>
      </div>

      {/* SVG Interactive Line Chart */}
      <div className="relative pt-4">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-44 overflow-visible"
        >
          {/* Grids */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight * ratio;
            return (
              <line 
                key={ratio}
                x1="0" 
                y1={y} 
                x2={chartWidth} 
                y2={y} 
                stroke="#f1f5f9" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
            );
          })}

          {/* SVG Data Points & Lines */}
          <polyline
            fill="none"
            stroke={activeMetric === 'bookings' ? '#6366f1' : activeMetric === 'commission' ? '#10b981' : '#f59e0b'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.map((d, index) => {
              const x = (chartWidth / (data.length - 1)) * index;
              const y = chartHeight - ((d[activeMetric] / maxVal) * (chartHeight - 20));
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* Markers */}
          {data.map((d, index) => {
            const x = (chartWidth / (data.length - 1)) * index;
            const y = chartHeight - ((d[activeMetric] / maxVal) * (chartHeight - 20));
            return (
              <g key={index} className="group cursor-pointer">
                <circle 
                  cx={x} 
                  cy={y} 
                  r="5" 
                  fill={activeMetric === 'bookings' ? '#6366f1' : activeMetric === 'commission' ? '#10b981' : '#f59e0b'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="hover:scale-125 transition-transform"
                />
                <text 
                  x={x} 
                  y={y - 12} 
                  textAnchor="middle" 
                  className="text-[10px] font-bold fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1"
                >
                  ₹{Math.round(d[activeMetric])}
                </text>
              </g>
            );
          })}
        </svg>

        {/* X Axis Labels */}
        <div className="flex justify-between mt-3 px-2">
          {data.map((d, index) => (
            <span key={index} className="text-[10px] font-bold text-slate-405">{d.month}</span>
          ))}
        </div>
      </div>
      
      {/* Footer detail panels */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 flex-shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Active Commission</span>
            <span className="text-xs font-bold text-slate-800">12% Default</span>
          </div>
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Gross Growth</span>
            <span className="text-xs font-bold text-slate-800">+28% MoM</span>
          </div>
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Subscription Ratio</span>
            <span className="text-xs font-bold text-slate-800">18.5% Premium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
