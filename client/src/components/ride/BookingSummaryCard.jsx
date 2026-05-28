import React, { useState } from 'react';
import { ShieldCheck, MapPin, Calendar, Users, FileText } from 'lucide-react';
import MapPickerModal from '../common/MapPickerModal';

export default function BookingSummaryCard({ ride, seats, onProceed, loading }) {
  const [pickup, setPickup] = useState(ride.pickupPoint);
  const [drop, setDrop] = useState(ride.dropPoint);
  const [notes, setNotes] = useState('');
  const [fetchingGeo, setFetchingGeo] = useState(false);

  // Map Picker Modal States
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState('pickup');

  const openMapPicker = (target) => {
    setMapPickerTarget(target);
    setIsMapPickerOpen(true);
  };

  const handleSelectMapLocation = (s) => {
    if (mapPickerTarget === 'pickup') {
      setPickup(s.address);
    } else {
      setDrop(s.address);
    }
  };

  const fareAmount = ride.pricePerSeat * seats;
  const platformFee = Math.round(fareAmount * 0.12);
  const totalAmount = fareAmount + platformFee;

  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setFetchingGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (response.ok) {
            const data = await response.json();
            const addr = data.address;
            const name = data.display_name.split(',')[0].trim();
            const road = addr.road || '';
            const suburb = addr.suburb || addr.neighbourhood || '';
            const city = addr.city || addr.town || addr.village || '';
            
            const resolvedAddress = [name, road, suburb, city].filter(Boolean).slice(0, 3).join(', ');
            setPickup(`📍 Live: ${resolvedAddress}`);
          } else {
            setPickup(`📍 Live: Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setPickup(`📍 Live: Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`);
        } finally {
          setFetchingGeo(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert(`Failed to fetch your live location: ${err.message}`);
        setFetchingGeo(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onProceed({
      seatsBooked: seats,
      pickupPoint: pickup,
      dropPoint: drop,
      notes
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-6">
      <h3 className="font-outfit font-extrabold text-slate-800 text-xl">Booking Summary</h3>
      
      {/* Route Summary */}
      <div className="space-y-4 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-50">
        <div className="flex items-center space-x-3 text-sm">
          <MapPin className="w-4.5 h-4.5 text-brand-500 flex-shrink-0" />
          <span className="font-medium text-slate-700">{ride.sourceCity} to {ride.destinationCity}</span>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <Calendar className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-slate-700">{ride.date} at {ride.departureTime}</span>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <Users className="w-4.5 h-4.5 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-slate-700">{seats} {seats === 1 ? 'Seat' : 'Seats'} Requested</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Custom Pickup */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pickup Point</label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleUseLiveLocation}
                disabled={fetchingGeo}
                className="text-[11px] font-bold text-brand-500 hover:text-brand-650 transition-colors flex items-center gap-1 disabled:text-slate-400"
              >
                {fetchingGeo ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-brand-500 animate-spin inline-block"></span>
                    Locating...
                  </>
                ) : (
                  '📍 Use Live Location'
                )}
              </button>
              <span className="text-slate-200 text-[11px]">|</span>
              <button
                type="button"
                onClick={() => openMapPicker('pickup')}
                className="text-[11px] font-bold text-indigo-500 hover:text-indigo-655 transition-colors flex items-center gap-1"
              >
                🗺️ Select on Map
              </button>
            </div>
          </div>
          <input 
            type="text"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className="w-full text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400"
            required
          />
        </div>

        {/* Custom Drop */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drop Location</label>
            <button
              type="button"
              onClick={() => openMapPicker('drop')}
              className="text-[11px] font-bold text-indigo-500 hover:text-indigo-655 transition-colors flex items-center gap-1"
            >
              🗺️ Select on Map
            </button>
          </div>
          <input 
            type="text"
            value={drop}
            onChange={(e) => setDrop(e.target.value)}
            className="w-full text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400"
            required
          />
        </div>

        {/* Passenger Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message to Driver (Optional)</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Introduce yourself, mention luggage scale, or requested stop preferences..."
            className="w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[80px]"
          />
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-slate-100 pt-4 space-y-2.5">
          <div className="flex justify-between text-sm text-slate-500 font-medium">
            <span>Ride Fare ({seats} x ₹{ride.pricePerSeat})</span>
            <span>₹{fareAmount}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500 font-medium">
            <span>Platform Commission (12%)</span>
            <span>₹{platformFee}</span>
          </div>
          <div className="flex justify-between text-base text-slate-800 font-bold pt-2 border-t border-slate-100">
            <span>Total Payable</span>
            <span className="text-brand-600 font-outfit font-extrabold text-lg">₹{totalAmount}</span>
          </div>
        </div>

        {/* Trust Note */}
        <div className="flex items-start space-x-2 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-50 text-[11px] text-emerald-700 leading-relaxed">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>RideShareX Guarantee: Payment is held securely and only transferred to the driver after successful trip completion.</span>
        </div>

        {/* Submit */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-indigo-300 text-white rounded-2xl py-3.5 flex items-center justify-center font-semibold text-sm transition-all duration-200 shadow-premium hover:shadow-premium-hover hover:scale-[1.02] active:scale-95"
        >
          {loading ? 'Processing...' : 'Confirm & Pay from Wallet'}
        </button>
      </form>
      
      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelect={handleSelectMapLocation}
        initialLat={ride.sourceLat || 17.3850}
        initialLon={ride.sourceLon || 78.4867}
      />
    </div>
  );
}
