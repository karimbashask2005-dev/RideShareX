import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideService, bookingService, CITIES } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/admin/StatsCard';
import { MapPin, Calendar, Users, IndianRupee, Compass, ToggleLeft, ToggleRight, Sparkles, Check, X, ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';
import MapPickerModal from '../components/common/MapPickerModal';

export default function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('publish'); // 'publish' | 'rides' | 'requests'
  const [rides, setRides] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Publish Form fields
  const [sourceCity, setSourceCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [dropPoint, setDropPoint] = useState('');
  const [intermediateStops, setIntermediateStops] = useState('');
  const [date, setDate] = useState('');
  const [departureTime, setDepartureTime] = useState('08:00 AM');
  const [estimatedArrivalTime, setEstimatedArrivalTime] = useState('02:00 PM');
  const [totalSeats, setTotalSeats] = useState(4);
  const [pricePerSeat, setPricePerSeat] = useState(400);
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [instantBooking, setInstantBooking] = useState(true);
  const [womenOnly, setWomenOnly] = useState(false);
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Custom All-India Village/Landmark Location Fields
  const [sourceIsCustom, setSourceIsCustom] = useState(false);
  const [destIsCustom, setDestIsCustom] = useState(false);
  const [sourceState, setSourceState] = useState('');
  const [sourceDistrict, setSourceDistrict] = useState('');
  const [sourceLandmark, setSourceLandmark] = useState('');
  const [destState, setDestState] = useState('');
  const [destDistrict, setDestDistrict] = useState('');
  const [destLandmark, setDestLandmark] = useState('');

  // Nominatim Autocomplete & Coordinates States
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [sourceLat, setSourceLat] = useState(17.3850);
  const [sourceLon, setSourceLon] = useState(78.4867);
  const [destLat, setDestLat] = useState(16.3067);
  const [destLon, setDestLon] = useState(80.4365);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [destPickerOpen, setDestPickerOpen] = useState(false);

  const handleSelectSourceMap = (loc) => {
    setSourceCity(loc.address);
    setSourceState(loc.state || '');
    setSourceDistrict(loc.district || '');
    setSourceLandmark(loc.landmark || '');
    setSourceLat(loc.lat);
    setSourceLon(loc.lon);
    setSourceIsCustom(true);
  };

  const handleSelectDestMap = (loc) => {
    setDestinationCity(loc.address);
    setDestState(loc.state || '');
    setDestDistrict(loc.district || '');
    setDestLandmark(loc.landmark || '');
    setDestLat(loc.lat);
    setDestLon(loc.lon);
    setDestIsCustom(true);
  };

  const handleCitySearch = async (input, setVal, setSuggestions) => {
    setVal(input);
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&countrycodes=in&addressdetails=1&limit=6`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map(item => {
          const addr = item.address;
          const parts = item.display_name.split(',');
          let placeName = parts[0].trim();
          
          if (/^\d+$/.test(placeName) && parts.length > 1) {
            placeName = `${placeName}, ${parts[1].trim()}`;
          }

          const cls = (item.class || '').toLowerCase();
          const type = (item.type || '').toLowerCase();
          const name = (item.display_name || '').toLowerCase();
          
          let emoji = '📍';
          if (cls === 'amenity' && type === 'place_of_worship' || name.includes('temple') || name.includes('mandir') || name.includes('masjid') || name.includes('church') || name.includes('gurudwara') || name.includes('shrine') || name.includes('tempe')) {
            emoji = '🛕';
          } else if (cls === 'amenity' && ['restaurant', 'cafe', 'fast_food', 'food_court', 'pub', 'bar'].includes(type) || name.includes('restaurant') || name.includes('cafe') || name.includes('dhaba') || name.includes('biryani') || name.includes('bakers') || name.includes('sweets') || name.includes('canteen') || name.includes('food') || name.includes('mess')) {
            emoji = '🍔';
          } else if (cls === 'shop' || type === 'supermarket' || name.includes('mall') || name.includes('d-mart') || name.includes('dmart') || name.includes('supermarket') || name.includes('hypermarket') || name.includes('bazaar') || name.includes('store') || name.includes('reliance smart') || name.includes('more retail') || name.includes('spencers')) {
            emoji = '🛍️';
          } else if (cls === 'amenity' && ['university', 'college', 'school'].includes(type) || name.includes('college') || name.includes('university') || name.includes('school') || name.includes('iit') || name.includes('nit') || name.includes('iiit') || name.includes('campus') || name.includes('institute')) {
            emoji = '🏫';
          } else if (cls === 'amenity' && ['hospital', 'clinic', 'doctors'].includes(type) || name.includes('hospital') || name.includes('clinic') || name.includes('medical')) {
            emoji = '🏥';
          } else if (cls === 'railway' || cls === 'highway' || ['bus_station', 'bus_stop', 'airport'].includes(type) || name.includes('station') || name.includes('bus stand') || name.includes('bus stop') || name.includes('terminal') || name.includes('airport') || name.includes('metro') || name.includes('highway')) {
            emoji = '🚉';
          } else if (name.includes('village') || name.includes('town') || name.includes('city') || cls === 'boundary' || type === 'administrative') {
            emoji = '🏡';
          }

          const state = addr.state || '';
          const district = addr.state_district || addr.county || '';
          const areaContext = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.village || addr.town || addr.city || '';
          const contextString = [areaContext, state].filter(Boolean).join(', ');
          const fullLabel = `${emoji} ${placeName}${contextString ? ' (' + contextString + ')' : ''}`;

          return {
            displayName: item.display_name,
            fullLabel,
            placeName: `${emoji} ${placeName}`,
            state,
            district,
            lat: item.lat,
            lon: item.lon
          };
        });
        const unique = Array.from(new Map(formatted.map(item => [item.fullLabel, item])).values());
        setSuggestions(unique);
      }
    } catch (err) {
      console.error('[Nominatim API] autocomplete error:', err);
    }
  };

  // Suggested price estimator
  const [suggestedFare, setSuggestedFare] = useState(null);

  const fetchDriverData = async () => {
    setLoading(true);
    try {
      const myRides = await rideService.getMyRides();
      setRides(myRides.filter(r => r.driverId === user.id));

      const pendingReqs = await bookingService.getRequests();
      setRequests(pendingReqs.filter(b => b.driverId === user.id));
    } catch (err) {
      console.error('[DriverDashboard] Data loading error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [activeTab]);

  // Suggested fare calculator (suggests Distance * ₹3)
  const calculateSuggestedFare = (source, dest) => {
    if (!source || !dest) return null;
    const src = source.toLowerCase();
    const dst = dest.toLowerCase();
    
    // Explicit popular Indian routes
    if (src.includes('hyderabad') && dst.includes('guntur')) return 270 * 3;
    if (src.includes('guntur') && dst.includes('hyderabad')) return 270 * 3;
    if (src.includes('vijayawada') && dst.includes('ongole')) return 150 * 3;
    if (src.includes('ongole') && dst.includes('vijayawada')) return 150 * 3;
    if (src.includes('hyderabad') && dst.includes('bengaluru')) return 570 * 3;
    if (src.includes('bengaluru') && dst.includes('hyderabad')) return 570 * 3;
    if (src.includes('warangal') && dst.includes('hyderabad')) return 145 * 3;
    if (src.includes('hyderabad') && dst.includes('warangal')) return 145 * 3;
    
    // Fallback based on string hash
    const sumLen = src.length + dst.length;
    const distance = Math.max(50, (sumLen * 18) % 450); 
    return distance * 3;
  };

  useEffect(() => {
    const recommended = calculateSuggestedFare(sourceCity, destinationCity);
    setSuggestedFare(recommended);
  }, [sourceCity, destinationCity]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (publishing) return;
    setPublishing(true);
    try {
      const result = await rideService.create({
        sourceCity,
        destinationCity,
        pickupPoint,
        dropPoint,
        intermediateStops,
        date,
        departureTime,
        estimatedArrivalTime,
        totalSeats: Number(totalSeats),
        pricePerSeat: Number(pricePerSeat),
        vehicleType,
        vehicleModel,
        vehicleNumber,
        instantBooking,
        womenOnly,
        description,
        sourceState,
        sourceDistrict,
        sourceLandmark,
        destState,
        destDistrict,
        destLandmark,
        isTownOrVillage: sourceIsCustom || destIsCustom,
        sourceLat: Number(sourceLat),
        sourceLon: Number(sourceLon),
        destLat: Number(destLat),
        destLon: Number(destLon)
      });
      alert('Ride published successfully!');
      
      // Reset form
      setSourceCity('');
      setDestinationCity('');
      setPickupPoint('');
      setDropPoint('');
      setIntermediateStops('');
      setDate('');
      setVehicleModel('');
      setVehicleNumber('');
      setSourceState('');
      setSourceDistrict('');
      setSourceLandmark('');
      setDestState('');
      setDestDistrict('');
      setDestLandmark('');
      setSourceIsCustom(false);
      setDestIsCustom(false);
      setSourceLat(17.3850);
      setSourceLon(78.4867);
      setDestLat(16.3067);
      setDestLon(80.4365);

      // Navigate to the newly published ride details
      navigate(`/ride/${result.id || result._id}`);
    } catch (err) {
      alert(err.message || 'Error publishing ride');
    } finally {
      setPublishing(false);
    }
  };

  const handleRequestAction = async (bookingId, action) => {
    try {
      await bookingService.updateStatus(bookingId, action);
      alert(`Booking request ${action}ed successfully.`);
      fetchDriverData();
    } catch (err) {
      alert(err.message || 'Error processing request');
    }
  };

  // Driver Earnings statistics
  const confirmedBookings = requests.filter(b => b.status === 'confirmed');
  const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (b.fareAmount || 0), 0);

  return (
    <>
      <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Offered Trips" 
          value={rides.length} 
          icon={Compass} 
          description="Total active and completed rides"
        />
        <StatsCard 
          title="Passenger Seats Confirmed" 
          value={confirmedBookings.reduce((sum, b) => sum + b.seatsBooked, 0)} 
          icon={Users} 
          description="Seats reserved across active routes"
        />
        <StatsCard 
          title="My Earnings" 
          value={`₹${totalEarnings}`} 
          icon={IndianRupee} 
          description="Held securely in escrow ledger"
          trend="+18%"
          trendType="positive"
        />
      </div>

      {/* Tab controls */}
      <div className="border-b border-slate-100 flex space-x-6 text-sm font-bold tracking-wide">
        <button 
          onClick={() => setActiveTab('publish')}
          className={`pb-4 border-b-2 transition-all ${activeTab === 'publish' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Publish a Ride
        </button>
        <button 
          onClick={() => setActiveTab('rides')}
          className={`pb-4 border-b-2 transition-all ${activeTab === 'rides' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          My Rides ({rides.length})
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`pb-4 border-b-2 transition-all ${activeTab === 'requests' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Booking Requests ({requests.filter(r => r.status === 'pending').length})
        </button>
      </div>

      {activeTab === 'publish' && (!user?.isIdentityVerified || !user?.isDriverVerified) && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-premium flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-outfit font-extrabold text-slate-800 text-xl">Verification Required to Publish Rides</h3>
            <p className="text-xs text-slate-505 max-w-md">
              To ensure safety and trust within our community across India, you must complete identity and driver verification before you can offer rides.
            </p>
          </div>

          {/* Publishing Instructions Section */}
          <div className="w-full bg-slate-50 rounded-2xl p-6 text-left border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-brand-500" />
              Publishing Instructions & Safety Guidelines
            </h4>
            <ul className="text-xs text-slate-600 space-y-2.5 list-disc list-inside">
              <li><span className="font-semibold text-slate-850">Complete Profile Verification:</span> Add your real full name, gender, and bio. Verify your phone and email.</li>
              <li><span className="font-semibold text-slate-850">Upload Govt ID & Driving Specs:</span> Upload a valid government document (Aadhaar/PAN/Passport) and driver license/RC vehicle files in the Verification Center.</li>
              <li><span className="font-semibold text-slate-850">Clear Route Details:</span> Mention exact pickup and drop landmarks (especially for villages, mandals, and highway intersections).</li>
              <li><span className="font-semibold text-slate-850">Set Fair Prices:</span> Follow RideShareX suggested fare settings (suggested price is ₹3 per seat per kilometer).</li>
              <li><span className="font-semibold text-slate-850">Account Security & Trust:</span> Misleading routes, fake pricing, or vehicle mismatches will lead to immediate account suspension.</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/verification-center')}
            className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-8 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-premium"
          >
            Become a Verified Ride Publisher
          </button>
        </div>
      )}

      {activeTab === 'publish' && user?.isIdentityVerified && user?.isDriverVerified && (
        <form onSubmit={handlePublish} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
            <div className="space-y-1">
              <h3 className="font-outfit font-extrabold text-slate-800 text-lg">Offer an Intercity Commute</h3>
              <p className="text-xs text-slate-400">Share your car seats and travel expenses. Set route stops and schedule details.</p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full border border-emerald-100 text-xs font-semibold self-start">
              <ShieldCheck className="h-4 w-4" /> Verified Ride Publisher
            </div>
          </div>

          {/* Guidelines Banner (collapsible/info box) */}
          <div className="p-4 bg-indigo-50/20 border border-indigo-50 rounded-2xl text-[11px] text-slate-650 leading-relaxed flex gap-2">
            <AlertCircle className="h-4.5 w-4.5 text-brand-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-700">Quick Guide:</span> Traveling between villages/mandals? Use the <span className="font-bold">Village/Mandal override</span> checkbox to type custom names. Specify recognizable local pickup/drop landmarks to help travelers locate you.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
            
            {/* Source Location */}
            <div className="space-y-1.5 md:col-span-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source Location</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSourcePickerOpen(true)}
                    className="text-[11px] text-brand-500 hover:text-brand-600 font-bold flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-150 transition-colors"
                  >
                    🗺️ Select on Map
                  </button>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={sourceIsCustom} 
                      onChange={(e) => {
                        setSourceIsCustom(e.target.checked);
                        setSourceCity('');
                      }}
                      className="rounded text-brand-500 border-slate-300 focus:ring-brand-400"
                    />
                    Village/Mandal override
                  </label>
                </div>
              </div>

              {!sourceIsCustom ? (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search departure city/village/town"
                    value={sourceCity}
                    onChange={(e) => handleCitySearch(e.target.value, setSourceCity, setSourceSuggestions)}
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-brand-500"
                    required
                  />
                  {sourceSuggestions.length > 0 && (
                    <ul className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl border border-slate-100 shadow-lg max-h-48 overflow-y-auto z-40">
                      {sourceSuggestions.map((item, idx) => (
                        <li 
                          key={idx}
                          onClick={() => {
                            setSourceCity(item.placeName);
                            setSourceState(item.state);
                            setSourceDistrict(item.district);
                            setSourceLat(item.lat);
                            setSourceLon(item.lon);
                            setSourceSuggestions([]);
                          }}
                          className="px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer transition-colors"
                        >
                          {item.fullLabel}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Enter Village / Town / Custom Point Name"
                    value={sourceCity}
                    onChange={(e) => setSourceCity(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 focus:outline-none"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="District (e.g. Guntur)"
                      value={sourceDistrict}
                      onChange={(e) => setSourceDistrict(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 focus:outline-none"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="State (e.g. Andhra Pradesh)"
                      value={sourceState}
                      onChange={(e) => setSourceState(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 focus:outline-none"
                      required
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Source Landmark (e.g. near RTC Bus Stand)"
                    value={sourceLandmark}
                    onChange={(e) => setSourceLandmark(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Destination Location */}
            <div className="space-y-1.5 md:col-span-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination Location</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDestPickerOpen(true)}
                    className="text-[11px] text-brand-500 hover:text-brand-600 font-bold flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-150 transition-colors"
                  >
                    🗺️ Select on Map
                  </button>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={destIsCustom} 
                      onChange={(e) => {
                        setDestIsCustom(e.target.checked);
                        setDestinationCity('');
                      }}
                      className="rounded text-brand-500 border-slate-300 focus:ring-brand-400"
                    />
                    Village/Mandal override
                  </label>
                </div>
              </div>

              {!destIsCustom ? (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search destination city/village/town"
                    value={destinationCity}
                    onChange={(e) => handleCitySearch(e.target.value, setDestinationCity, setDestSuggestions)}
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none focus:border-brand-500"
                    required
                  />
                  {destSuggestions.length > 0 && (
                    <ul className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl border border-slate-100 shadow-lg max-h-48 overflow-y-auto z-40">
                      {destSuggestions.map((item, idx) => (
                        <li 
                          key={idx}
                          onClick={() => {
                            setDestinationCity(item.placeName);
                            setDestState(item.state);
                            setDestDistrict(item.district);
                            setDestLat(item.lat);
                            setDestLon(item.lon);
                            setDestSuggestions([]);
                          }}
                          className="px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer transition-colors"
                        >
                          {item.fullLabel}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Enter Village / Town / Custom Point Name"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 focus:outline-none"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="District (e.g. Krishna)"
                      value={destDistrict}
                      onChange={(e) => setDestDistrict(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 focus:outline-none"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="State (e.g. Andhra Pradesh)"
                      value={destState}
                      onChange={(e) => setDestState(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 focus:outline-none"
                      required
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Destination Landmark (e.g. near Police Station)"
                    value={destLandmark}
                    onChange={(e) => setDestLandmark(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Pickup & Drop Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exact Pickup Point Description</label>
              <input 
                type="text" 
                placeholder="e.g. Bus Terminal Bypass, Metro Pillar 12"
                value={pickupPoint}
                onChange={(e) => setPickupPoint(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exact Drop Point Description</label>
              <input 
                type="text" 
                placeholder="e.g. Ring road exit, bus terminal"
                value={dropPoint}
                onChange={(e) => setDropPoint(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
                required
              />
            </div>

            {/* Date & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Travel Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Departure Time</label>
                <input 
                  type="text" 
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Arrival Time</label>
                <input 
                  type="text" 
                  value={estimatedArrivalTime}
                  onChange={(e) => setEstimatedArrivalTime(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
                />
              </div>
            </div>

            {/* Pricing & Seats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Seats</label>
                <input 
                  type="number" 
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
                  min="1"
                  max="8"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fare per seat (₹)</label>
                <input 
                  type="number" 
                  value={pricePerSeat}
                  onChange={(e) => setPricePerSeat(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
                  min="100"
                  max="4000"
                  required
                />
                {suggestedFare && (
                  <div className="flex items-center justify-between text-[10px] mt-1 bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg border border-indigo-100 font-semibold animate-fade-in">
                    <span>💡 Recommended: ₹{suggestedFare} (₹3/km)</span>
                    <button 
                      type="button" 
                      onClick={() => setPricePerSeat(suggestedFare)}
                      className="text-indigo-700 hover:underline font-bold"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Intermediate Stops */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Intermediate Highway Stops (Comma Separated)</label>
              <input 
                type="text" 
                placeholder="e.g. Suryapet bypass, Nalgonda intersection"
                value={intermediateStops}
                onChange={(e) => setIntermediateStops(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
              />
            </div>

            {/* Vehicle Profile */}
            <div className="grid grid-cols-3 gap-2 md:col-span-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Type</label>
                <select 
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4.5 py-3 focus:outline-none cursor-pointer"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Compact">Compact</option>
                  <option value="Bike">Bike</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Scooty">Scooty</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand / Model</label>
                <input 
                  type="text" 
                  placeholder="e.g. Honda City"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Reg No.</label>
                <input 
                  type="text" 
                  placeholder="e.g. TS09EX8888"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preferences toggles */}
          <div className="border-t border-slate-50 pt-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preferences</h4>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={instantBooking}
                  onChange={(e) => setInstantBooking(e.target.checked)}
                  className="w-4.5 h-4.5 text-brand-500 rounded border-slate-205 focus:ring-brand-400 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-800">⚡ Instant Booking</span>
                  <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Passengers bypass driver manual approvals</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={womenOnly}
                  onChange={(e) => setWomenOnly(e.target.checked)}
                  className="w-4.5 h-4.5 text-brand-500 rounded border-slate-205 focus:ring-brand-400 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-800">👩 Women-Only Co-Travel</span>
                  <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Only show this listing to female search feeds</span>
                </div>
              </label>
            </div>
          </div>

          {/* Bio Description */}
          <div className="space-y-1.5 border-t border-slate-50 pt-5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trip Description / Notes</label>
            <textarea 
              placeholder="e.g. Quiet highway driving, stopping at Suryapet plaza. Light bags preferred. Non-smoking trip."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs font-medium text-slate-750 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:outline-none min-h-[90px]"
            />
          </div>

          <button 
            type="submit"
            disabled={publishing}
            className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 px-8 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-premium hover:shadow-premium-hover flex items-center justify-center scale-100 active:scale-95"
          >
            {publishing ? 'Publishing...' : 'Publish Intercity Ride'}
          </button>
        </form>
      )}

      {activeTab === 'rides' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-4">
          <h3 className="font-outfit font-extrabold text-slate-800 text-lg">My Published Listings</h3>
          {rides.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-10">No rides offered yet. Select the 'Publish a Ride' tab.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Fare</th>
                    <th className="py-3 px-4">Seats Booked</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                  {rides.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-4">{r.sourceCity} → {r.destinationCity}</td>
                      <td className="py-4 px-4">{r.date} ({r.departureTime})</td>
                      <td className="py-4 px-4">₹{r.pricePerSeat}</td>
                      <td className="py-4 px-4">{r.totalSeats - r.availableSeats} / {r.totalSeats} seats</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-premium space-y-4">
          <h3 className="font-outfit font-extrabold text-slate-800 text-lg">Passenger Booking Approvals</h3>
          {requests.filter(r => r.status === 'pending').length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-10">No pending booking requests from passengers.</div>
          ) : (
            <div className="space-y-4.5">
              {requests.filter(r => r.status === 'pending').map((req) => (
                <div key={req.id} className="border border-slate-100 rounded-2xl p-4.5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 bg-slate-50/20">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <img src={req.passengerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-bold text-slate-800 text-sm">{req.passengerName}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Requested <span className="font-bold text-slate-700">{req.seatsBooked} seat(s)</span> for <span className="font-bold text-slate-700">{req.rideSource} → {req.rideDestination}</span> on {req.rideDate}
                    </p>
                    {req.notes && <p className="text-[10px] text-slate-450 italic bg-white p-2 rounded-lg border border-slate-100">"{req.notes}"</p>}
                  </div>

                  <div className="flex items-center space-x-3.5">
                    <button 
                      onClick={() => handleRequestAction(req.id, 'reject')}
                      className="p-2.5 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl text-rose-600 transition-colors border border-rose-100"
                      title="Decline Booking"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleRequestAction(req.id, 'confirm')}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-xl text-emerald-600 transition-colors border border-emerald-100"
                      title="Approve Booking"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
      
      <MapPickerModal
        isOpen={sourcePickerOpen}
        onClose={() => setSourcePickerOpen(false)}
        onSelect={handleSelectSourceMap}
      />
      
      <MapPickerModal
        isOpen={destPickerOpen}
        onClose={() => setDestPickerOpen(false)}
        onSelect={handleSelectDestMap}
      />
    </>
  );
}
