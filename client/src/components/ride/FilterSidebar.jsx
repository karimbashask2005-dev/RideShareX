import React from 'react';
import { SlidersHorizontal, ArrowUpDown, ShieldCheck, Zap } from 'lucide-react';

export default function FilterSidebar({ 
  maxPrice, setMaxPrice, 
  womenOnly, setWomenOnly, 
  instant, setInstant, 
  sort, setSort 
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-6 flex-shrink-0 w-full lg:w-72">
      {/* Title */}
      <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
        <SlidersHorizontal className="w-5 h-5 text-brand-500" />
        <h3 className="font-outfit font-bold text-slate-800 text-lg">Filters & Sort</h3>
      </div>

      {/* Sort selection */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sort By</label>
        <div className="relative">
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            className="w-full text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 focus:outline-none cursor-pointer appearance-none"
          >
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="departure">Departure Time</option>
            <option value="rating">Driver Rating</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <ArrowUpDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Price filter */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Max Price per Seat</label>
          <span className="text-sm font-extrabold text-brand-600">₹{maxPrice}</span>
        </div>
        <input 
          type="range"
          min="100"
          max="3000"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-500 focus:outline-none"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold">
          <span>₹100</span>
          <span>₹3,000</span>
        </div>
      </div>

      {/* Trust Toggle switches */}
      <div className="space-y-4 pt-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Preferences</label>
        
        {/* Instant Booking */}
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center space-x-2.5">
            <Zap className="w-4 h-4 text-brand-500 fill-indigo-50" />
            <span className="text-sm font-medium text-slate-650 group-hover:text-slate-800">Instant Booking</span>
          </div>
          <input 
            type="checkbox" 
            checked={instant}
            onChange={(e) => setInstant(e.target.checked)}
            className="w-4.5 h-4.5 text-brand-500 rounded border-slate-200 focus:ring-brand-400 cursor-pointer"
          />
        </label>

        {/* Women Only */}
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center space-x-2.5">
            <span className="text-sm">👩</span>
            <span className="text-sm font-medium text-slate-650 group-hover:text-slate-800">Women Only</span>
          </div>
          <input 
            type="checkbox" 
            checked={womenOnly}
            onChange={(e) => setWomenOnly(e.target.checked)}
            className="w-4.5 h-4.5 text-brand-500 rounded border-slate-200 focus:ring-brand-400 cursor-pointer"
          />
        </label>
      </div>

      {/* Button to clear */}
      <button 
        onClick={() => {
          setMaxPrice(1500);
          setWomenOnly(false);
          setInstant(false);
          setSort('price_low');
        }}
        className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100/80 py-3 rounded-2xl transition-colors mt-2"
      >
        Reset Filters
      </button>
    </div>
  );
}
