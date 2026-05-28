import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingService } from '../services/api';
import EmptyState from '../components/common/EmptyState';
import SkeletonCard from '../components/common/SkeletonCard';
import { Calendar, Clock, MapPin, MessageSquare, AlertCircle, CheckCircle2, XCircle, X } from 'lucide-react';
import MapPreview from '../components/common/MapPreview';

export default function MyBookings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const [trackingBooking, setTrackingBooking] = useState(null);
  const [trackingProgress, setTrackingProgress] = useState(0);

  useEffect(() => {
    let interval;
    if (trackingBooking) {
      setTrackingProgress(0);
      interval = setInterval(() => {
        setTrackingProgress((prev) => {
          if (prev >= 100) return 0; // Loop tracking for simulation
          return prev + 2;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [trackingBooking]);

  const showSuccess = searchParams.get('success') === 'true';
  const refCode = searchParams.get('ref') || '';

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error('[MyBookings] Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? A partial refund of fare & platform fees may apply.')) return;
    try {
      await bookingService.updateStatus(bookingId, 'cancelled');
      alert('Booking cancelled successfully. Refund credited to your wallet.');
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Error cancelling booking');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-650 border-emerald-100';
      case 'pending': return 'bg-amber-50 text-amber-650 border-amber-100';
      case 'rejected': return 'bg-rose-50 text-rose-650 border-rose-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-250';
    }
  };

  return (
    <div className="space-y-6">
      {/* Booking Success Banner */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-start space-x-4 max-w-2xl">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="font-outfit font-bold text-emerald-800 text-lg">Booking Reservation Completed</h3>
            <p className="text-xs text-emerald-600 leading-normal">
              Your seats are secured under reference <span className="font-bold">{refCode}</span>. 
              Payment is held securely in the platform ledger. You can now coordinate pickup with the driver.
            </p>
          </div>
        </div>
      )}

      {/* Header and tab controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="font-outfit font-extrabold text-2xl text-slate-800">My Booked Trips</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage and track your active, completed, or cancelled rides</p>
        </div>

        {/* Tab filters */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-205 flex-wrap">
          {['all', 'confirmed', 'pending', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState 
          title="No Bookings Recorded"
          description={`You have no booked trips under status filter: ${activeTab.toUpperCase()}.`}
          action={
            <button onClick={() => navigate('/search')} className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold">
              Find a Ride
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((bk) => (
            <div 
              key={bk.id} 
              className="bg-white border border-slate-100 rounded-3xl p-5 hover:shadow-premium transition-all duration-300 space-y-4 flex flex-col justify-between"
            >
              {/* Header: Ref & Status */}
              <div>
                <div className="flex justify-between items-center pb-3.5 border-b border-slate-50">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Booking Reference</span>
                    <span className="font-outfit font-extrabold text-sm text-slate-800">{bk.bookingRef}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(bk.status)}`}>
                    {bk.status}
                  </span>
                </div>

                {/* Ride Route Details */}
                <div className="space-y-3.5 my-4">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                    <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span>{bk.rideSource} → {bk.rideDestination}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bk.rideDate}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bk.rideTime}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Pickup: <span className="font-bold text-slate-650">{bk.pickupPoint}</span> <br />
                    Dropoff: <span className="font-bold text-slate-650">{bk.dropPoint}</span>
                  </div>
                  
                  {/* Notes */}
                  {bk.notes && (
                    <p className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      Notes: "{bk.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Driver and actions */}
              <div className="pt-3.5 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Driver</span>
                  <span className="text-xs font-semibold text-slate-800">{bk.driverName}</span>
                </div>

                <div className="flex items-center space-x-2.5">
                  {/* Live Tracking Trigger */}
                  {bk.status === 'confirmed' && (
                    <button 
                      onClick={() => setTrackingBooking(bk)}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-600 border border-emerald-100 text-emerald-700 hover:text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      title="Live Track"
                    >
                      Live Track
                    </button>
                  )}
                  {/* Chat trigger */}
                  {['confirmed', 'pending'].includes(bk.status) && (
                    <button 
                      onClick={() => navigate(`/chat?room=room_${bk.rideId}_${bk.passengerId}&otherName=${bk.driverName}&otherAvatar=${bk.driverAvatar}`)}
                      className="p-2 bg-indigo-50 hover:bg-brand-500 hover:text-white rounded-xl text-brand-600 transition-colors shadow-sm"
                      title="Chat with Driver"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                  {/* Cancel booking */}
                  {['confirmed', 'pending'].includes(bk.status) && (
                    <button 
                      onClick={() => handleCancel(bk.id)}
                      className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all"
                    >
                      Cancel Trip
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Live Tracking Modal */}
      {trackingBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            {/* Map Area */}
            <div className="w-full md:w-3/5 h-80 md:h-[450px]">
              <MapPreview
                sourceCity={trackingBooking.rideSource}
                destCity={trackingBooking.rideDestination}
                sourceCoords={trackingBooking.rideSourceCoords}
                destCoords={trackingBooking.rideDestCoords}
                isLiveTracking={true}
                trackingProgress={trackingProgress}
                vehicleType={trackingBooking.vehicleType}
              />
            </div>
            
            {/* Control & Tracking Stats Panel */}
            <div className="w-full md:w-2/5 p-6 flex flex-col justify-between bg-slate-50 border-l border-slate-100">
              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Live tracking active</span>
                    <h3 className="font-outfit font-extrabold text-slate-800 text-lg mt-0.5">{trackingBooking.rideSource} to {trackingBooking.rideDestination}</h3>
                  </div>
                  <button 
                    onClick={() => setTrackingBooking(null)}
                    className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center space-x-3 text-emerald-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider">Driver is on Route</span>
                </div>

                {/* Progress Stats */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between font-semibold text-slate-500">
                    <span>Trip Progress</span>
                    <span className="text-slate-800 font-extrabold">{Math.round(trackingProgress)}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${trackingProgress}%` }}
                    />
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-3 bg-white p-4 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Ride Vehicle</span>
                    <span className="text-slate-700 font-bold">{trackingBooking.vehicleModel || 'Honda City'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Vehicle Number</span>
                    <span className="text-slate-700 font-bold uppercase">{trackingBooking.vehicleNumber || 'AP-07-CR-4321'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Driver Name</span>
                    <span className="text-slate-700 font-bold">{trackingBooking.driverName}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTrackingBooking(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider mt-6"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
