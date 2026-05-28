import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, Calendar, Clock, Users, DollarSign, 
  FileText, Loader, ArrowRight, Compass, ShieldAlert 
} from 'lucide-react';
import MapPickerModal from '../components/common/MapPickerModal';

export default function PreBookRide() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [pickupPoint, setPickupPoint] = useState('');
  const [dropPoint, setDropPoint] = useState('');
  const [sourceCity, setSourceCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [sourceState, setSourceState] = useState('');
  const [sourceDistrict, setSourceDistrict] = useState('');
  const [sourceLandmark, setSourceLandmark] = useState('');
  const [destState, setDestState] = useState('');
  const [destDistrict, setDestDistrict] = useState('');
  const [destLandmark, setDestLandmark] = useState('');
  const [sourceLat, setSourceLat] = useState(17.3850);
  const [sourceLon, setSourceLon] = useState(78.4867);
  const [destLat, setDestLat] = useState(16.3067);
  const [destLon, setDestLon] = useState(80.4365);
  
  const [date, setDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [seatsNeeded, setSeatsNeeded] = useState(1);
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');

  // Autocomplete & UI States
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [fetchingGeo, setFetchingGeo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Map Picker Modal States
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState('pickup');

  const openMapPicker = (target) => {
    setMapPickerTarget(target);
    setIsMapPickerOpen(true);
  };

  const handleSelectMapLocation = (s) => {
    if (mapPickerTarget === 'pickup') {
      setPickupPoint(s.address);
      setSourceCity(s.city || 'Unknown');
      setSourceState(s.state || '');
      setSourceDistrict(s.district || '');
      setSourceLandmark(s.landmark || '');
      setSourceLat(s.lat);
      setSourceLon(s.lon);
    } else {
      setDropPoint(s.address);
      setDestinationCity(s.city || 'Unknown');
      setDestState(s.state || '');
      setDestDistrict(s.district || '');
      setDestLandmark(s.landmark || '');
      setDestLat(s.lat);
      setDestLon(s.lon);
    }
  };

  // Autocomplete fetcher
  const fetchSuggestions = async (input, setList) => {
    if (input.length < 3) {
      setList([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&countrycodes=in&addressdetails=1&limit=6`, 
        { headers: { 'Accept-Language': 'en' } }
      );
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
          if (cls === 'amenity' && type === 'place_of_worship' || name.includes('temple') || name.includes('mandir') || name.includes('masjid') || name.includes('church') || name.includes('gurudwara') || name.includes('shrine')) {
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

          const cityVal = addr.city || addr.town || addr.village || '';
          const stateVal = addr.state || '';
          const districtVal = addr.state_district || addr.county || '';
          const areaContext = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || '';
          const contextString = [areaContext, cityVal, stateVal].filter(Boolean).slice(0, 2).join(', ');
          const fullLabel = `${emoji} ${placeName}${contextString ? ' (' + contextString + ')' : ''}`;

          return {
            displayName: item.display_name,
            fullLabel,
            placeName,
            city: cityVal,
            state: stateVal,
            district: districtVal,
            lat: item.lat,
            lon: item.lon
          };
        });
        const unique = Array.from(new Map(formatted.map(item => [item.fullLabel, item])).values());
        setList(unique);
      }
    } catch (err) {
      console.error('[Nominatim API] autocomplete error:', err);
    }
  };

  // Debounced input fetchers
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pickupPoint && !pickupPoint.startsWith('📍')) {
        fetchSuggestions(pickupPoint, setSourceSuggestions);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [pickupPoint]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dropPoint && !dropPoint.startsWith('📍')) {
        fetchSuggestions(dropPoint, setDestSuggestions);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [dropPoint]);

  // Geolocation Handler
  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setFetchingGeo(true);
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setSourceLat(latitude);
        setSourceLon(longitude);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (response.ok) {
            const data = await response.json();
            const addr = data.address;
            
            const landmarkVal = data.display_name.split(',')[0].trim();
            const cityVal = addr.city || addr.town || addr.village || addr.suburb || 'Hyderabad';
            const stateVal = addr.state || '';
            const districtVal = addr.state_district || addr.county || '';
            
            const labelAddress = `📍 Live: ${landmarkVal} (${cityVal})`;
            
            setPickupPoint(labelAddress);
            setSourceCity(cityVal);
            setSourceState(stateVal);
            setSourceDistrict(districtVal);
            setSourceLandmark(landmarkVal);
          } else {
            setPickupPoint(`📍 Live Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            setSourceCity('Hyderabad');
            setSourceLandmark('Live Location');
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setPickupPoint(`📍 Live Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          setSourceCity('Hyderabad');
        } finally {
          setFetchingGeo(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setErrorMsg(`Failed to get live location: ${err.message}`);
        setFetchingGeo(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSelectSource = (s) => {
    setPickupPoint(s.fullLabel);
    setSourceCity(s.city || s.placeName || 'Unknown');
    setSourceState(s.state || '');
    setSourceDistrict(s.district || '');
    setSourceLandmark(s.placeName || '');
    setSourceLat(Number(s.lat));
    setSourceLon(Number(s.lon));
    setSourceSuggestions([]);
    setShowSourceDropdown(false);
  };

  const handleSelectDest = (s) => {
    setDropPoint(s.fullLabel);
    setDestinationCity(s.city || s.placeName || 'Unknown');
    setDestState(s.state || '');
    setDestDistrict(s.district || '');
    setDestLandmark(s.placeName || '');
    setDestLat(Number(s.lat));
    setDestLon(Number(s.lon));
    setDestSuggestions([]);
    setShowDestDropdown(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!pickupPoint || !dropPoint || !date || !preferredTime || !seatsNeeded || !budget) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }
    
    // Ensure we have resolved some city name
    const finalSourceCity = sourceCity || pickupPoint.split(',')[0].replace('📍', '').replace('🏡', '').trim();
    const finalDestCity = destinationCity || dropPoint.split(',')[0].replace('📍', '').replace('🏡', '').trim();

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await requestService.create({
        sourceCity: finalSourceCity,
        destinationCity: finalDestCity,
        pickupPoint,
        dropPoint,
        date,
        preferredTime,
        seatsNeeded: Number(seatsNeeded),
        budget: Number(budget),
        notes,
        sourceState,
        sourceDistrict,
        sourceLandmark,
        destState,
        destDistrict,
        destLandmark,
        sourceLat,
        sourceLon,
        destLat,
        destLon
      });

      setSuccessMsg('Your travel request has been posted successfully! Redirecting...');
      setTimeout(() => {
        navigate('/my-requests');
      }, 2000);
    } catch (err) {
      console.error('Submit request error:', err);
      setErrorMsg(err.message || 'Failed to submit travel request. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="font-outfit font-extrabold text-3xl text-slate-800 tracking-tight">
          Request / Pre-Book a Ride
        </h1>
        <p className="text-sm text-slate-500">
          Can't find an active ride? Post your trip details and receive quotes from verified drivers going your way.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-2xl flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center space-x-2">
          <Compass className="w-4 h-4 flex-shrink-0 animate-spin" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Request Form */}
      <form onSubmit={handleFormSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-premium space-y-6">
        
        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Pickup Location */}
          <div className="relative space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Pickup Landmark / Point *</label>
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={handleUseLiveLocation}
                  disabled={fetchingGeo}
                  className="text-[10px] font-extrabold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                >
                  {fetchingGeo ? (
                    <>
                      <Loader className="w-3 h-3 animate-spin" />
                      <span>Locating...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3 h-3 text-brand-500" />
                      <span>📍 Use Live Location</span>
                    </>
                  )}
                </button>
                <span className="text-slate-200 text-[10px] font-bold">|</span>
                <button
                  type="button"
                  onClick={() => openMapPicker('pickup')}
                  className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-755 flex items-center space-x-1"
                >
                  <span>🗺️ Select on Map</span>
                </button>
              </div>
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search college, temple, mall, or stop..."
                value={pickupPoint}
                onChange={(e) => {
                  setPickupPoint(e.target.value);
                  setShowSourceDropdown(true);
                }}
                onFocus={() => setShowSourceDropdown(true)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
                required
              />
            </div>

            {/* Dropdown Suggestions */}
            {showSourceDropdown && sourceSuggestions.length > 0 && (
              <div className="absolute z-20 w-full left-0 mt-1.5 bg-white border border-slate-150 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-50">
                {sourceSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSource(s)}
                    className="w-full text-left px-4 py-3.5 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center space-x-2"
                  >
                    <span className="truncate">{s.fullLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Drop Location */}
          <div className="relative space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Drop Landmark / Point *</label>
              <button
                type="button"
                onClick={() => openMapPicker('drop')}
                className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-755 flex items-center space-x-1"
              >
                <span>🗺️ Select on Map</span>
              </button>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search destination landmark, village, or town..."
                value={dropPoint}
                onChange={(e) => {
                  setDropPoint(e.target.value);
                  setShowDestDropdown(true);
                }}
                onFocus={() => setShowDestDropdown(true)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
                required
              />
            </div>

            {/* Dropdown Suggestions */}
            {showDestDropdown && destSuggestions.length > 0 && (
              <div className="absolute z-20 w-full left-0 mt-1.5 bg-white border border-slate-150 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-50">
                {destSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDest(s)}
                    className="w-full text-left px-4 py-3.5 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center space-x-2"
                  >
                    <span className="truncate">{s.fullLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Travel Date *</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Preferred Departure Time *</label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. 10:00 AM or Evening"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
                required
              />
            </div>
          </div>
        </div>

        {/* Seats & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seats Needed */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Seats Required *</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <select
                value={seatsNeeded}
                onChange={(e) => setSeatsNeeded(Number(e.target.value))}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
                required
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Seat{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Target Budget Per Seat (₹) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="number"
                placeholder="e.g. 450"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200"
                min="10"
                required
              />
            </div>
          </div>
        </div>

        {/* Travel Instructions */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">Additional Trip Notes</label>
          <div className="relative">
            <FileText className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <textarea
              placeholder="E.g. Carrying 1 medium bag, need female driver only, flexible on time, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all duration-200 min-h-[90px] max-h-[200px]"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center space-x-2 py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-350 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all duration-200 active:scale-98"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Posting Request...</span>
              </>
            ) : (
              <>
                <span>Publish Travel Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>
      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelect={handleSelectMapLocation}
        initialLat={mapPickerTarget === 'pickup' ? sourceLat : destLat}
        initialLon={mapPickerTarget === 'pickup' ? sourceLon : destLon}
      />
    </div>
  );
}
