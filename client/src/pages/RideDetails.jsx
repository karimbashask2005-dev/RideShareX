import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rideService, bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingSummaryCard from '../components/ride/BookingSummaryCard';
import SkeletonCard from '../components/common/SkeletonCard';
import MapPreview from '../components/common/MapPreview';
import { 
  Star, ShieldCheck, MapPin, Calendar, Clock, 
  Car, Bike, AlertCircle, Compass, CheckCircle2 
} from 'lucide-react';

export default function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rideData, setRideData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seats, setSeats] = useState(1);
  const [bookingStep, setBookingStep] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await rideService.getById(id);
      setRideData(data);
    } catch (err) {
      setError(err.message || 'Error loading ride details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleBookProceed = async (bookingDetails) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingLoading(true);
    try {
      const result = await bookingService.create({
        rideId: id,
        ...bookingDetails
      });
      // Redirect to Bookings list
      navigate('/bookings?success=true&ref=' + result.bookingRef);
    } catch (err) {
      alert(err.message || 'Error booking seats. Check your wallet balance.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <SkeletonCard />
      </div>
    );
  }

  if (error || !rideData) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="font-outfit font-bold text-lg text-slate-800">Ride Not Found</h3>
        <p className="text-sm text-slate-500">{error || 'The requested ride does not exist or has been cancelled.'}</p>
        <button onClick={() => navigate('/search')} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm">Return to Search</button>
      </div>
    );
  }

  const isOwnRide = user && user.id === rideData.driverId;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details Info Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium space-y-6">
            
            {/* Header route name */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">INTERCITY TRIP</span>
                <h1 className="font-outfit font-extrabold text-2xl md:text-3xl text-slate-850 mt-1 flex items-center">
                  {rideData.sourceCity} <Compass className="w-5 h-5 mx-2 text-brand-400 rotate-90" /> {rideData.destinationCity}
                </h1>
                <p className="text-xs text-slate-400 mt-1">Scheduled for {rideData.date}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fare per seat</span>
                <span className="font-outfit font-extrabold text-2xl text-brand-600">₹{rideData.pricePerSeat}</span>
              </div>
            </div>

            {/* Travel Path timeline */}
            <div className="space-y-6 my-6 relative pl-5 border-l-2 border-dashed border-slate-200">
              <div className="relative">
                <div className="absolute -left-[27px] w-3.5 h-3.5 rounded-full bg-brand-500 ring-4 ring-indigo-50" />
                <h4 className="font-bold text-slate-800 text-sm">{rideData.departureTime}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Pickup: <span className="font-semibold text-slate-700">{rideData.pickupPoint}</span></p>
              </div>
              
              {rideData.intermediateStops && rideData.intermediateStops.length > 0 && (
                <div className="relative">
                  <div className="absolute -left-[27px] w-3 h-3 rounded-full bg-slate-300 ring-4 ring-slate-100" />
                  <h4 className="font-semibold text-slate-650 text-xs">Stops along the way:</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {rideData.intermediateStops.map((stop, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-slate-50 text-[10px] text-slate-500 font-bold border border-slate-100 rounded-md">
                        {stop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="absolute -left-[27px] w-3.5 h-3.5 rounded-full bg-accent-500 ring-4 ring-purple-50" />
                <h4 className="font-bold text-slate-800 text-sm">{rideData.estimatedArrivalTime}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Drop: <span className="font-semibold text-slate-700">{rideData.dropPoint}</span></p>
              </div>
            </div>

            {/* Map Route Preview */}
            <div className="border-t border-slate-100 pt-5 space-y-3.5">
              <h3 className="font-outfit font-bold text-slate-800">Route Map Preview (Google Maps Clone)</h3>
              <div className="h-72 w-full">
                <MapPreview 
                  sourceCity={rideData.sourceCity} 
                  destCity={rideData.destinationCity}
                  sourceCoords={{ lat: rideData.sourceLat, lon: rideData.sourceLon }}
                  destCoords={{ lat: rideData.destLat, lon: rideData.destLon }}
                />
              </div>
            </div>

            {/* Car details */}
            <div className="border-t border-slate-50 pt-5 space-y-4">
              <h3 className="font-outfit font-bold text-slate-800">Vehicle Information</h3>
              <div className="flex items-center space-x-4 bg-slate-50 p-4.5 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-brand-500">
                  {['Bike', 'Motorcycle', 'Scooter', 'Scooty'].includes(rideData.vehicleType) ? (
                    <Bike className="w-5.5 h-5.5" />
                  ) : (
                    <Car className="w-5.5 h-5.5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{rideData.vehicleModel} ({rideData.vehicleType})</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Reg Number: {rideData.vehicleNumber || 'Registered in India'}</p>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="border-t border-slate-50 pt-5 space-y-3.5">
              <h3 className="font-outfit font-bold text-slate-800">Ride Preferences & Rules</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl text-center space-y-1.5">
                  <span className="block">🧳</span>
                  <span className="font-bold text-slate-700">Luggage</span>
                  <span className="block text-[10px] text-slate-400">{rideData.luggageAllowed ? 'Allowed' : 'No heavy bags'}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl text-center space-y-1.5">
                  <span className="block">🚭</span>
                  <span className="font-bold text-slate-700">Smoking</span>
                  <span className="block text-[10px] text-slate-400">{rideData.smokingAllowed ? 'Allowed' : 'Strictly Prohibited'}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl text-center space-y-1.5">
                  <span className="block">🐾</span>
                  <span className="font-bold text-slate-700">Pets</span>
                  <span className="block text-[10px] text-slate-400">{rideData.petsAllowed ? 'Allowed' : 'Not Allowed'}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl text-center space-y-1.5">
                  <span className="block">⚡</span>
                  <span className="font-bold text-slate-700">Booking Style</span>
                  <span className="block text-[10px] text-slate-400">{rideData.instantBooking ? 'Instant Booking' : 'Manual Approval'}</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            {rideData.description && (
              <div className="border-t border-slate-50 pt-5 space-y-2">
                <h3 className="font-outfit font-bold text-slate-800">Driver Description</h3>
                <p className="text-xs text-slate-550 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 italic">
                  "{rideData.description}"
                </p>
              </div>
            )}
          </div>

          {/* Driver Testimonials / Reviews */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium space-y-5">
            <h3 className="font-outfit font-extrabold text-slate-800 text-lg">Reviews for {rideData.driverName}</h3>
            {rideData.reviews?.length === 0 ? (
              <div className="text-xs text-slate-400 py-4 text-center">No reviews submitted yet for this driver.</div>
            ) : (
              <div className="space-y-4">
                {rideData.reviews?.map((review, i) => (
                  <div key={i} className="p-4 border border-slate-100 rounded-2xl space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-slate-800">{review.reviewerName || 'Passenger'}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-slate-700 font-bold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-550">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Checkout / Booking Selector */}
        <div className="space-y-6">
          
          {/* Driver Quick Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-premium flex items-center space-x-4">
            <img 
              src={rideData.driverAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
              alt={rideData.driverName} 
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-50"
            />
            <div>
              <div className="flex items-center space-x-1">
                <h4 className="font-bold text-sm text-slate-800">{rideData.driverName}</h4>
                {rideData.driverVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
              </div>
              <div className="flex items-center space-x-1.5 mt-1.5">
                <span className="bg-brand-50 text-[10px] text-brand-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Driver</span>
                <span className="text-xs text-slate-400 font-semibold">{rideData.completedRidesCount || 24} rides done</span>
              </div>
            </div>
          </div>

          {/* Seat configuration card or Proceed Details */}
          {!bookingStep ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-5">
              <h3 className="font-outfit font-extrabold text-slate-850 text-lg">Reserve Your Seats</h3>
              <div className="flex justify-between items-center py-2.5 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Seats to book</span>
                <div className="flex items-center space-x-3.5">
                  <button 
                    disabled={seats <= 1}
                    onClick={() => setSeats(seats - 1)}
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-650 hover:bg-slate-50 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-sm text-slate-850">{seats}</span>
                  <button 
                    disabled={seats >= rideData.availableSeats}
                    onClick={() => setSeats(seats + 1)}
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-650 hover:bg-slate-50 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs font-medium text-slate-500">
                <div className="flex justify-between">
                  <span>Price per seat</span>
                  <span>₹{rideData.pricePerSeat}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available seats left</span>
                  <span className="font-bold text-slate-700">{rideData.availableSeats}</span>
                </div>
              </div>

              {isOwnRide ? (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-xs text-rose-700 leading-relaxed">
                  You are the driver of this ride. Drivers cannot book seats on their own published rides.
                </div>
              ) : (
                <button 
                  onClick={() => setBookingStep(true)}
                  disabled={rideData.availableSeats === 0}
                  className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-2xl text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-premium hover:shadow-premium-hover"
                >
                  {rideData.availableSeats === 0 ? 'Fully Booked' : 'Proceed to Checkout'}
                </button>
              )}
            </div>
          ) : (
            <BookingSummaryCard 
              ride={rideData}
              seats={seats}
              onProceed={handleBookProceed}
              loading={bookingLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
