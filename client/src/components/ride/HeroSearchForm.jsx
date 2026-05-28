import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, ArrowRightLeft, Search } from 'lucide-react';
import { CITIES } from '../../services/api';

export default function HeroSearchForm({ initialValues = {} }) {
  const navigate = useNavigate();
  const [source, setSource] = useState(initialValues.source || '');
  const [destination, setDestination] = useState(initialValues.destination || '');
  const [date, setDate] = useState(initialValues.date || '');
  const [seats, setSeats] = useState(initialValues.seats || 1);
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!source || !destination) return;
    
    const params = new URLSearchParams({
      source,
      destination,
      date,
      seats: seats.toString()
    });
    
    navigate(`/search?${params.toString()}`);
  };

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleCitySearch = async (input, setVal, setSuggestions) => {
    setVal(input);
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&countrycodes=in&addressdetails=1&limit=6`, {
        headers: {
          'Accept-Language': 'en'
        }
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
          const areaContext = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.village || addr.town || addr.city || '';
          const contextString = [areaContext, state].filter(Boolean).join(', ');
          const fullLabel = `${emoji} ${placeName}${contextString ? ' (' + contextString + ')' : ''}`;

          return {
            displayName: item.display_name,
            fullLabel,
            lat: item.lat,
            lon: item.lon
          };
        });
        const unique = Array.from(new Map(formatted.map(item => [item.fullLabel, item])).values());
        setSuggestions(unique);
      }
    } catch (err) {
      console.error('[Nominatim API] autocomplete error:', err);
      const filtered = CITIES.filter(c => c.toLowerCase().includes(input.toLowerCase()))
        .map(c => ({ fullLabel: c, lat: '0', lon: '0' }));
      setSuggestions(filtered);
    }
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="w-full bg-white rounded-3xl md:rounded-full border border-slate-100 shadow-premium p-4 md:py-3.5 md:px-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 max-w-5xl mx-auto"
    >
      {/* Source Input */}
      <div className="w-full md:w-1/3 relative flex items-center space-x-3 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100">
        <MapPin className="w-5 h-5 text-brand-500 flex-shrink-0" />
        <div className="flex-grow">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leaving From</label>
          <input 
            type="text"
            placeholder="Guntur, Hyderabad..."
            value={source}
            onChange={(e) => handleCitySearch(e.target.value, setSource, setSourceSuggestions)}
            className="w-full text-sm font-semibold text-slate-800 focus:outline-none placeholder-slate-400 mt-0.5 bg-transparent"
            required
          />
        </div>
        
        {sourceSuggestions.length > 0 && (
          <ul className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl border border-slate-100 shadow-lg max-h-48 overflow-y-auto z-40">
            {sourceSuggestions.map((item, idx) => (
              <li 
                key={idx}
                onClick={() => { setSource(item.fullLabel); setSourceSuggestions([]); }}
                className="px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer transition-colors"
              >
                {item.fullLabel}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Swap Button */}
      <button 
        type="button"
        onClick={handleSwap}
        className="hidden md:flex p-2 hover:bg-slate-50 border border-slate-100 rounded-full text-slate-400 hover:text-brand-500 transition-colors shadow-sm"
      >
        <ArrowRightLeft className="w-4.5 h-4.5" />
      </button>

      {/* Destination Input */}
      <div className="w-full md:w-1/3 relative flex items-center space-x-3 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100">
        <MapPin className="w-5 h-5 text-accent-500 flex-shrink-0" />
        <div className="flex-grow">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Going To</label>
          <input 
            type="text"
            placeholder="Bengaluru, Chennai..."
            value={destination}
            onChange={(e) => handleCitySearch(e.target.value, setDestination, setDestSuggestions)}
            className="w-full text-sm font-semibold text-slate-800 focus:outline-none placeholder-slate-400 mt-0.5 bg-transparent"
            required
          />
        </div>

        {destSuggestions.length > 0 && (
          <ul className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl border border-slate-100 shadow-lg max-h-48 overflow-y-auto z-40">
            {destSuggestions.map((item, idx) => (
              <li 
                key={idx}
                onClick={() => { setDestination(item.fullLabel); setDestSuggestions([]); }}
                className="px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer transition-colors"
              >
                {item.fullLabel}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Date Input */}
      <div className="w-full md:w-1/4 flex items-center space-x-3 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-100">
        <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <div className="flex-grow">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full text-sm font-semibold text-slate-800 focus:outline-none mt-0.5 bg-transparent"
            required
          />
        </div>
      </div>

      {/* Passengers Count */}
      <div className="w-full md:w-1/6 flex items-center space-x-3 px-3 py-2 md:pr-4">
        <Users className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <div className="flex-grow">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passengers</label>
          <select 
            value={seats} 
            onChange={(e) => setSeats(Number(e.target.value))}
            className="w-full text-sm font-bold text-slate-800 focus:outline-none mt-0.5 bg-transparent cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'Seat' : 'Seats'}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Submit Button */}
      <button 
        type="submit"
        className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 text-white rounded-2xl md:rounded-full py-4.5 px-7 flex items-center justify-center font-semibold text-sm transition-all duration-200 shadow-premium hover:shadow-premium-hover flex-shrink-0 md:scale-105 hover:scale-110 active:scale-95"
      >
        <Search className="w-4.5 h-4.5 md:mr-2" />
        <span className="md:inline">Search</span>
      </button>
    </form>
  );
}
