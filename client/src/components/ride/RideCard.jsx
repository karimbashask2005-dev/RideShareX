import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Zap, User, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function RideCard({ ride }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 hover:shadow-premium-hover transition-all duration-300 group flex flex-col justify-between">
      <div>
        {/* Top Header: Driver Profile & Verification status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src={ride.driverAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
              alt={ride.driverName}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-50 group-hover:scale-105 transition-transform duration-200"
            />
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-slate-800 text-sm leading-none">{ride.driverName}</span>
                {ride.driverVerified && (
                  <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-50" title="Verified Driver" />
                )}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs text-slate-500 font-bold">{ride.driverRating?.toFixed(1) || '5.0'}</span>
              </div>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-col items-end space-y-1.5">
            {ride.instantBooking && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-brand-600 uppercase tracking-wide">
                <Zap className="w-3 h-3 mr-0.5 fill-brand-100" /> Instant
              </span>
            )}
            {ride.womenOnly && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-[10px] font-bold text-rose-600 uppercase tracking-wide">
                👩 Women Only
              </span>
            )}
          </div>
        </div>

        {/* Departure & Arrival visual track */}
        <div className="space-y-3.5 my-5 relative pl-4 border-l border-dashed border-slate-200">
          {/* Pickup */}
          <div className="relative">
            <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-indigo-50" />
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 text-sm">{ride.departureTime}</span>
              <span className="text-slate-400 font-semibold">{ride.sourceCity}</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{ride.pickupPoint}</p>
          </div>
          
          {/* Dropoff */}
          <div className="relative">
            <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-accent-500 ring-4 ring-purple-50" />
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 text-sm">{ride.estimatedArrivalTime}</span>
              <span className="text-slate-400 font-semibold">{ride.destinationCity}</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{ride.dropPoint}</p>
          </div>
        </div>

        {/* Stops Summary */}
        {ride.intermediateStops && ride.intermediateStops.length > 0 && (
          <p className="text-[11px] text-slate-400 mb-4 bg-slate-50 px-2.5 py-1 rounded-lg inline-block truncate max-w-full">
            Stops: {ride.intermediateStops.join(' → ')}
          </p>
        )}
      </div>

      {/* Footer Card Section */}
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        {/* Pricing details */}
        <div>
          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Fare per seat</span>
          <span className="text-lg font-outfit font-extrabold text-slate-900">₹{ride.pricePerSeat}</span>
        </div>
        
        {/* Action Button */}
        <div className="flex items-center space-x-3.5">
          <span className="text-xs text-slate-500 font-medium">
            {ride.availableSeats} / {ride.totalSeats} seats left
          </span>
          <Link 
            to={`/ride/${ride.id}`} 
            className="p-2.5 bg-slate-50 group-hover:bg-brand-500 rounded-xl text-slate-600 group-hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center scale-100 active:scale-95"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
