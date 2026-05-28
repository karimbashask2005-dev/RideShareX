import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestService, walletService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardList, MapPin, Calendar, Clock, Users, DollarSign,
  User, CheckCircle, XCircle, ChevronDown, ChevronUp, Loader,
  ShieldAlert, ShieldCheck, CreditCard, Sparkles, Bike, Car
} from 'lucide-react';

export default function MyRequests() {
  const { user, reloadUser } = useAuth();
  const navigate = useNavigate();

  // Data State
  const [requests, setRequests] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // UI accordion status (stores expanded request IDs)
  const [expandedReqs, setExpandedReqs] = useState({});

  // Checkout Modal State
  const [selectedReq, setSelectedReq] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const loadRequestsAndWallet = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await requestService.getMyRequests();
      setRequests(data);

      const wallet = await walletService.getWallet();
      setWalletBalance(wallet.balance || 0);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setErrorMsg('Failed to load travel requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequestsAndWallet();
  }, []);

  const toggleAccordion = (id) => {
    setExpandedReqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenCheckout = (req, offer) => {
    setSelectedReq(req);
    setSelectedOffer(offer);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCloseCheckout = () => {
    setSelectedReq(null);
    setSelectedOffer(null);
  };

  const handleAcceptOfferConfirm = async () => {
    if (!selectedReq || !selectedOffer) return;

    const baseFare = selectedOffer.fare * selectedReq.seatsNeeded;
    const platformFee = Math.round(baseFare * 0.12);
    const totalCost = baseFare + platformFee;

    if (walletBalance < totalCost) {
      setErrorMsg('Insufficient wallet balance. Please add funds to your wallet.');
      return;
    }

    setCheckoutLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await requestService.acceptOffer(selectedReq.id || selectedReq._id, selectedOffer.id || selectedOffer._id);
      
      setSuccessMsg('Booking confirmed! Seat reserved successfully.');
      
      // Reload auth user state for wallet update
      if (reloadUser) reloadUser();
      
      setTimeout(() => {
        handleCloseCheckout();
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      console.error('Accept offer confirmation error:', err);
      setErrorMsg(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleRejectOffer = async (reqId, offerId) => {
    if (!window.confirm('Are you sure you want to decline this commute offer?')) return;
    try {
      await requestService.rejectOffer(reqId, offerId);
      alert('Offer declined successfully');
      loadRequestsAndWallet();
    } catch (err) {
      console.error('Reject offer error:', err);
      alert(err.message || 'Failed to reject offer');
    }
  };

  // Cost calculation helper variables
  let checkoutBaseFare = 0;
  let checkoutPlatformFee = 0;
  let checkoutTotal = 0;
  let isBalanceSufficient = false;

  if (selectedReq && selectedOffer) {
    checkoutBaseFare = selectedOffer.fare * selectedReq.seatsNeeded;
    checkoutPlatformFee = Math.round(checkoutBaseFare * 0.12);
    checkoutTotal = checkoutBaseFare + checkoutPlatformFee;
    isBalanceSufficient = walletBalance >= checkoutTotal;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight">
            My Travel Requests
          </h1>
          <p className="text-sm text-slate-500">
            Manage your pre-booked travel listings and review custom quotes sent by drivers.
          </p>
        </div>
        <Link
          to="/pre-book"
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
        >
          + Post New Request
        </Link>
      </div>

      {errorMsg && !selectedReq && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-2xl flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-sm font-bold text-slate-500">Retrieving your requests marketplace...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-premium space-y-5 max-w-lg mx-auto">
          <ClipboardList className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="font-outfit font-extrabold text-lg text-slate-700">No Travel Requests Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            You haven't posted any pre-booked requests yet. Drivers will offer you seat sharing once you request a ride!
          </p>
          <div className="pt-2">
            <Link
              to="/pre-book"
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors inline-block"
            >
              Request a Ride Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4.5">
          {requests.map((req) => {
            const reqId = req.id || req._id;
            const isExpanded = expandedReqs[reqId];
            const offers = req.offers || [];
            const openOffers = offers.filter(o => o.status === 'pending');
            const acceptedOffer = offers.find(o => o.status === 'accepted');

            return (
              <div 
                key={reqId}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-premium transition-all duration-300"
              >
                {/* Request Header Summary */}
                <div 
                  onClick={() => toggleAccordion(reqId)}
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-3 flex-1">
                    {/* Routes */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-800">{req.pickupPoint.replace(/^(🚗|🏍️|🛵|📍)\s*/, '')}</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-extrabold text-slate-800">{req.dropPoint.replace(/^(🚗|🏍️|🛵|📍)\s*/, '')}</span>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.preferredTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.seatsNeeded} seat{req.seatsNeeded > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-brand-650 font-bold">
                        <DollarSign className="w-3.5 h-3.5 text-brand-400" />
                        <span>Budget: ₹{req.budget}</span>
                      </div>
                    </div>
                  </div>

                  {/* Offers status & Toggle button */}
                  <div className="flex items-center space-x-4 self-end md:self-auto">
                    {req.status === 'confirmed' ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                        Confirmed Trip
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        openOffers.length > 0 
                          ? 'bg-indigo-50 text-brand-700 border-indigo-100 animate-pulse' 
                          : 'bg-slate-50 text-slate-550 border-slate-100'
                      }`}>
                        {openOffers.length} Offer{openOffers.length !== 1 ? 's' : ''} Received
                      </span>
                    )}
                    
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-450" /> : <ChevronDown className="w-4 h-4 text-slate-450" />}
                  </div>
                </div>

                {/* Expanded Section (Offers list) */}
                {isExpanded && (
                  <div className="border-t border-slate-50 bg-slate-50/20 p-5 space-y-4">
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      {req.status === 'confirmed' ? 'Accepted Commute Offer' : 'Submitted Driver Offers'}
                    </h4>

                    {req.status === 'confirmed' && acceptedOffer ? (
                      /* Accepted Offer Display */
                      <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4.5 space-y-3 max-w-xl">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={acceptedOffer.driver?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                              alt={acceptedOffer.driver?.name} 
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                            <div>
                              <h5 className="font-bold text-xs text-slate-800">{acceptedOffer.driver?.name}</h5>
                              <p className="text-[10px] text-slate-400 font-bold">★ {acceptedOffer.driver?.averageRating?.toFixed(1) || '5.0'} Rating</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wide">Accepted Offer</p>
                            <p className="text-sm font-extrabold text-slate-800 mt-1">₹{acceptedOffer.fare} / Seat</p>
                          </div>
                        </div>

                        {/* Vehicle details */}
                        <div className="text-xs text-slate-600 font-medium flex items-center space-x-2 bg-white/70 rounded-xl p-2.5 border border-slate-100">
                          {acceptedOffer.vehicleType?.toLowerCase().includes('bike') || acceptedOffer.vehicleType?.toLowerCase().includes('scooter') || acceptedOffer.vehicleType?.toLowerCase().includes('scooty') ? (
                            <Bike className="w-4 h-4 text-slate-500" />
                          ) : (
                            <Car className="w-4 h-4 text-slate-500" />
                          )}
                          <span>
                            {acceptedOffer.vehicleModel} ({acceptedOffer.vehicleType}) - <strong className="text-slate-800">{acceptedOffer.vehicleNumber || 'No Plate'}</strong>
                          </span>
                        </div>

                        {acceptedOffer.notes && (
                          <p className="text-xs text-slate-500 italic bg-white/40 p-2.5 rounded-xl border border-slate-100">
                            " {acceptedOffer.notes} "
                          </p>
                        )}

                        <div className="pt-1.5 flex items-center space-x-2 text-[10px] font-bold text-emerald-700">
                          <CheckCircle className="w-4.5 h-4.5" />
                          <span>This pre-booking request has been confirmed. View coordinates & ride maps under "My Bookings".</span>
                        </div>
                      </div>
                    ) : openOffers.length === 0 ? (
                      <p className="text-xs text-slate-450 italic py-4">Waiting for drivers to submit quotes...</p>
                    ) : (
                      /* Active Offers List */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {openOffers.map((offer) => (
                          <div 
                            key={offer.id || offer._id}
                            className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm space-y-3.5 flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              {/* Driver Info */}
                              <div className="flex items-center space-x-2.5">
                                <img 
                                  src={offer.driver?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                                  alt={offer.driver?.name} 
                                  className="w-9 h-9 rounded-xl object-cover"
                                />
                                <div>
                                  <h5 className="font-bold text-xs text-slate-800">{offer.driver?.name}</h5>
                                  <p className="text-[10px] text-amber-500 font-bold">★ {offer.driver?.averageRating?.toFixed(1) || '5.0'}</p>
                                </div>
                              </div>

                              {/* Offer Details */}
                              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 font-semibold">
                                <div className="flex justify-between">
                                  <span>Vehicle:</span>
                                  <span className="text-slate-850">{offer.vehicleModel}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Vehicle Type:</span>
                                  <span className="text-slate-850">{offer.vehicleType}</span>
                                </div>
                                <div className="flex justify-between text-brand-650 font-bold">
                                  <span>Quote:</span>
                                  <span>₹{offer.fare} / Seat</span>
                                </div>
                              </div>

                              {offer.notes && (
                                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                                  " {offer.notes} "
                                </p>
                              )}
                            </div>

                            {/* Offer Action Buttons */}
                            <div className="flex gap-2 pt-2 border-t border-slate-50">
                              <button
                                onClick={() => handleRejectOffer(reqId, offer.id || offer._id)}
                                className="px-3 py-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-extrabold text-[10px] rounded-lg transition-colors flex items-center justify-center space-x-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Decline</span>
                              </button>
                              
                              <button
                                onClick={() => handleOpenCheckout(req, offer)}
                                className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Accept & Pay</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Accept & Pay Checkout Modal */}
      {selectedReq && selectedOffer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-[32px] w-full max-w-md shadow-2xl p-6 md:p-8 space-y-6 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-outfit font-extrabold text-xl text-slate-800">Booking Checkout</h3>
                <p className="text-xs text-slate-400 font-medium">Review fare breakout and pay securely from wallet escrow.</p>
              </div>
              <button 
                onClick={handleCloseCheckout} 
                className="text-slate-450 hover:text-slate-650 text-lg font-bold"
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
                <ShieldCheck className="w-3.5 h-3.5 animate-bounce" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Bill Breakout Details */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Base Fare ({selectedOffer.fare} × {selectedReq.seatsNeeded} Seat{selectedReq.seatsNeeded > 1 ? 's' : ''})</span>
                <span className="text-slate-800">₹{checkoutBaseFare}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                <span>Platform Commission (12%)</span>
                <span className="text-slate-800">₹{checkoutPlatformFee}</span>
              </div>
              
              <div className="border-t border-slate-200/80 pt-3 flex justify-between items-center text-sm font-extrabold text-slate-800">
                <span className="flex items-center space-x-1 text-slate-850">
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  <span>Total Amount</span>
                </span>
                <span className="text-brand-650">₹{checkoutTotal}</span>
              </div>
            </div>

            {/* Wallet status */}
            <div className="bg-indigo-50/50 border border-indigo-100/60 rounded-2xl p-4.5 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wide leading-none">Your Wallet Balance</p>
                <p className="text-sm font-extrabold text-indigo-750 mt-1">₹{walletBalance}</p>
              </div>
              
              {isBalanceSufficient ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-extrabold uppercase tracking-wide">
                  Sufficient Funds
                </span>
              ) : (
                <div className="text-right">
                  <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-[9px] font-extrabold uppercase tracking-wide block mb-1">
                    Low Balance
                  </span>
                  <Link 
                    to="/wallet" 
                    className="text-[9px] font-extrabold text-brand-650 hover:underline block"
                  >
                    + Add Money
                  </Link>
                </div>
              )}
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseCheckout}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleAcceptOfferConfirm}
                disabled={checkoutLoading || !isBalanceSufficient}
                className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5"
              >
                {checkoutLoading ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Confirm & Pay</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Inline ArrowRight helper
function ArrowRightIcon({ className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2.5} 
      stroke="currentColor" 
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
