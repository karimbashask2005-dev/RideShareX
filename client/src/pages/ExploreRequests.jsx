import React, { useState, useEffect } from 'react';
import { requestService, verificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, MapPin, Calendar, Clock, Users, DollarSign, 
  Search, ShieldAlert, Send, CheckCircle, FileText, Loader,
  Bike, Car, Info
} from 'lucide-react';

export default function ExploreRequests() {
  const { user } = useAuth();
  
  // Data State
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search Filters
  const [sourceFilter, setSourceFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Offer Modal State
  const [selectedReq, setSelectedReq] = useState(null);
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [fare, setFare] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Pre-fill Vehicle Profile from Verification Center
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const status = await verificationService.getVerificationStatus();
        if (status && status.vehicle) {
          setVehicleType(status.vehicle.vehicleType || 'Sedan');
          setVehicleModel(status.vehicle.vehicleModel || '');
          setVehicleNumber(status.vehicle.vehicleNumber || '');
        }
      } catch (err) {
        console.warn('Could not fetch driver vehicle details for auto-fill:', err);
      }
    };
    if (user && (user.role === 'driver' || user.role === 'admin')) {
      fetchVehicleDetails();
    }
  }, [user]);

  const loadRequests = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (sourceFilter) params.source = sourceFilter;
      if (destFilter) params.destination = destFilter;
      if (dateFilter) params.date = dateFilter;

      const data = await requestService.search(params);
      setRequests(data);
    } catch (err) {
      console.error('Error fetching travel requests:', err);
      setErrorMsg('Failed to load travel requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRequests();
  };

  const handleClearFilters = () => {
    setSourceFilter('');
    setDestFilter('');
    setDateFilter('');
    setTimeout(() => {
      loadRequests();
    }, 50);
  };

  const openOfferModal = (req) => {
    setSelectedReq(req);
    setFare(req.budget.toString()); // pre-fill budget as suggested fare
    setErrorMsg('');
    setSuccessMsg('');
  };

  const closeOfferModal = () => {
    setSelectedReq(null);
    setNotes('');
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleType || !vehicleModel || !fare) {
      setErrorMsg('Please fill in vehicle details and fare quote.');
      return;
    }

    setSubmittingOffer(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await requestService.submitOffer(selectedReq.id || selectedReq._id, {
        vehicleType,
        vehicleModel,
        vehicleNumber,
        fare: Number(fare),
        notes
      });

      setSuccessMsg('Commute offer submitted successfully to the passenger!');
      setTimeout(() => {
        closeOfferModal();
        loadRequests(); // Refresh requests marketplace
      }, 1500);
    } catch (err) {
      console.error('Submit offer error:', err);
      setErrorMsg(err.message || 'Failed to submit offer. Please check details.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight">
          Explore Passenger Requests
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Review trip requirements posted by passengers and submit custom commute offers.
        </p>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-premium grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Source */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Departure Landmark / City</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="E.g. Guntur"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Destination */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Arrival Landmark / City</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="E.g. Hyderabad"
              value={destFilter}
              onChange={(e) => setDestFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Travel Date</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Search Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl transition-colors"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Main Grid Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-sm font-bold text-slate-500">Scanning pre-booked requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-premium space-y-4 max-w-lg mx-auto">
          <Compass className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="font-outfit font-extrabold text-lg text-slate-700">No Open Travel Requests</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            There are no passengers requesting rides matching your filters right now. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => {
            const passenger = req.passenger || {};
            // Check if driver has already made an offer
            const hasMadeOffer = (req.offers || []).some(o => o.driverId === user.id || (o.driver && (o.driver._id === user.id || o.driver.id === user.id)));

            return (
              <div 
                key={req.id || req._id}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4.5">
                  {/* Passenger Card header */}
                  <div className="flex items-center space-x-3">
                    <img 
                      src={passenger.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                      alt={passenger.name || 'Passenger'} 
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-50"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 leading-tight">{passenger.name || 'Anonymous Passenger'}</h4>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <span className="text-[10px] font-bold text-amber-500">★ {passenger.averageRating?.toFixed(1) || '5.0'}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({passenger.ratingCount || 5} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Route details */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3.5 space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wide leading-none">From Landmark</p>
                        <p className="text-xs font-bold text-slate-700 mt-1 leading-snug truncate max-w-[210px]">{req.pickupPoint}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wide leading-none">To Landmark</p>
                        <p className="text-xs font-bold text-slate-700 mt-1 leading-snug truncate max-w-[210px]">{req.dropPoint}</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-2 gap-3.5 text-slate-650">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.preferredTime}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.seatsNeeded} Seat{req.seatsNeeded > 1 ? 's' : ''} needed</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs font-extrabold text-brand-650">
                      <DollarSign className="w-3.5 h-3.5 text-brand-400" />
                      <span>Budget: ₹{req.budget}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {req.notes && (
                    <div className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-2.5 leading-relaxed italic">
                      " {req.notes} "
                    </div>
                  )}
                </div>

                {/* Offer Action Button */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  {hasMadeOffer ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1 border border-emerald-100"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Offer Submitted</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => openOfferModal(req)}
                      className="w-full py-2.5 bg-brand-50 hover:bg-brand-500 hover:text-white text-brand-600 font-extrabold text-xs rounded-xl transition-all duration-200 shadow-sm"
                    >
                      🚗 Send Commute Offer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Send Offer Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-[32px] w-full max-w-md shadow-2xl p-6 md:p-8 space-y-6 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-outfit font-extrabold text-xl text-slate-800">Send Commute Offer</h3>
                <p className="text-xs text-slate-400">Offer a ride quote for this travel request.</p>
              </div>
              <button 
                onClick={closeOfferModal} 
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 animate-bounce" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleOfferSubmit} className="space-y-4">
              
              {/* Vehicle Type Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Vehicle Type</label>
                <div className="relative">
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
                    required
                  >
                    <option value="Sedan">Sedan (Car)</option>
                    <option value="SUV">SUV (Car)</option>
                    <option value="Hatchback">Hatchback (Car)</option>
                    <option value="Bike">Bike / Motorcycle</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Scooty">Scooty</option>
                  </select>
                </div>
              </div>

              {/* Vehicle Model & Registration Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Vehicle Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Honda City"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Reg Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. AP 07 CR 1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>

              {/* Quote Price per seat */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Quote Fare Per Seat (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-extrabold text-slate-450">₹</span>
                  <input
                    type="number"
                    placeholder="E.g. 450"
                    value={fare}
                    onChange={(e) => setFare(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-800 text-xs font-extrabold focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
                    min="10"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1 mt-1">
                  <Info className="w-3 h-3 text-slate-400" />
                  <span>Passenger's target budget is ₹{selectedReq.budget}</span>
                </p>
              </div>

              {/* Offer notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Offer Notes / Instructions</label>
                <textarea
                  placeholder="E.g. AC works perfectly, can carry 1 backpack, will wear helmet."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-150 rounded-xl text-slate-850 text-xs font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200 min-h-[70px] max-h-[140px]"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeOfferModal}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5"
                >
                  {submittingOffer ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Offer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Offer</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
