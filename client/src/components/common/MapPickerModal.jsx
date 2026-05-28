import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Loader, CheckCircle, ShieldAlert } from 'lucide-react';

export default function MapPickerModal({ isOpen, onClose, onSelect, initialLat, initialLon }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [resolving, setResolving] = useState(false);

  const [selectedCoords, setSelectedCoords] = useState({
    lat: initialLat || 17.3850,
    lon: initialLon || 78.4867
  });

  const [resolvedAddress, setResolvedAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState({
    city: '',
    state: '',
    district: '',
    landmark: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically load Leaflet CDN assets
  useEffect(() => {
    if (!isOpen) return;

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const jsScript = document.createElement('script');
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    jsScript.onload = () => setLeafletLoaded(true);
    document.head.appendChild(jsScript);
  }, [isOpen]);

  // Reverse Geocode coordinates to address details
  const reverseGeocode = async (lat, lon) => {
    setResolving(true);
    setErrorMsg('');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        
        const landmark = data.display_name.split(',')[0].trim();
        const city = addr.city || addr.town || addr.village || addr.suburb || '';
        const state = addr.state || '';
        const district = addr.state_district || addr.county || '';
        
        // Context string format
        const areaContext = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || '';
        const contextString = [areaContext, city, state].filter(Boolean).slice(0, 2).join(', ');
        
        const emoji = getEmojiForClass(data.class, data.type, data.display_name);
        const fullLabel = `${emoji} ${landmark}${contextString ? ' (' + contextString + ')' : ''}`;

        setResolvedAddress(fullLabel);
        setAddressDetails({
          city,
          state,
          district,
          landmark,
          emoji
        });
      } else {
        setResolvedAddress(`📍 Picked Location (Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)})`);
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
      setResolvedAddress(`📍 Picked Location (Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)})`);
    } finally {
      setResolving(false);
    }
  };

  const getEmojiForClass = (cls, type, nameStr) => {
    const name = (nameStr || '').toLowerCase();
    const c = (cls || '').toLowerCase();
    const t = (type || '').toLowerCase();
    
    if (c === 'amenity' && t === 'place_of_worship' || name.includes('temple') || name.includes('mandir') || name.includes('masjid') || name.includes('church') || name.includes('gurudwara') || name.includes('shrine')) {
      return '🛕';
    } else if (c === 'amenity' && ['restaurant', 'cafe', 'fast_food', 'food_court', 'pub', 'bar'].includes(t) || name.includes('restaurant') || name.includes('cafe') || name.includes('dhaba') || name.includes('biryani') || name.includes('bakers')) {
      return '🍔';
    } else if (c === 'shop' || t === 'supermarket' || name.includes('mall') || name.includes('d-mart') || name.includes('dmart') || name.includes('supermarket')) {
      return '🛍️';
    } else if (c === 'amenity' && ['university', 'college', 'school'].includes(t) || name.includes('college') || name.includes('university') || name.includes('campus')) {
      return '🏫';
    } else if (c === 'amenity' && ['hospital', 'clinic'].includes(t) || name.includes('hospital') || name.includes('medical')) {
      return '🏥';
    } else if (c === 'railway' || c === 'highway' || ['bus_station', 'bus_stop', 'airport'].includes(t) || name.includes('station') || name.includes('bus stand') || name.includes('airport') || name.includes('metro')) {
      return '🚉';
    }
    return '📍';
  };

  // Map Initialization
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !isOpen) return;

    const L = window.L;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([selectedCoords.lat, selectedCoords.lon], 13);

      // Google Maps standard tile layer directly inside Leaflet
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google Maps',
        maxZoom: 20
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-8 h-8 bg-brand-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center ring-4 ring-brand-500/20"><span class="text-sm">📍</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([selectedCoords.lat, selectedCoords.lon], {
        icon: customIcon,
        draggable: true
      }).addTo(map);

      // Update position on dragend
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setSelectedCoords({ lat: position.lat, lon: position.lng });
        reverseGeocode(position.lat, position.lng);
      });

      // Update position on map click
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setSelectedCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Seed initial location geocoding
      reverseGeocode(selectedCoords.lat, selectedCoords.lon);
    } else {
      // If modal is re-opened, reset map view & marker coordinates
      const map = mapInstanceRef.current;
      const marker = markerRef.current;
      const newCenter = [selectedCoords.lat, selectedCoords.lon];
      map.setView(newCenter, 13);
      marker.setLatLng(newCenter);
      reverseGeocode(selectedCoords.lat, selectedCoords.lon);
    }

    // Cleanup map on unmount
    return () => {
      // Don't destroy inside useEffect to allow fast reopen, but keep reference clean
    };
  }, [leafletLoaded, isOpen]);

  // Search/Pan Handler
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setErrorMsg('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon } = data[0];
          const latitude = Number(lat);
          const longitude = Number(lon);

          setSelectedCoords({ lat: latitude, lon: longitude });

          if (mapInstanceRef.current && markerRef.current) {
            const center = [latitude, longitude];
            mapInstanceRef.current.setView(center, 14);
            markerRef.current.setLatLng(center);
          }

          reverseGeocode(latitude, longitude);
        } else {
          setErrorMsg('No location matches found in India.');
        }
      }
    } catch (err) {
      console.error('Search query fetch error:', err);
      setErrorMsg('Failed to fetch search results.');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    onSelect({
      address: resolvedAddress,
      lat: selectedCoords.lat,
      lon: selectedCoords.lon,
      city: addressDetails.city || resolvedAddress.split('(')[0].trim(),
      state: addressDetails.state,
      district: addressDetails.district,
      landmark: addressDetails.landmark,
      emoji: addressDetails.emoji
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-100 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-scale-up">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white flex-shrink-0">
          <div className="space-y-1">
            <h3 className="font-outfit font-extrabold text-lg text-slate-800 flex items-center space-x-1.5">
              <span>🗺️ Select Location on Google Maps</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Click on the map or drag the marker to target your commute location.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Search Bar inside Modal */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search town, landmark, highway, or sector (e.g. Birla Mandir Hyderabad)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1"
            >
              {searching ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-2 text-[10px] text-rose-600 font-bold flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-slate-100 min-h-0">
          {!leafletLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-sm z-[99]">
              <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-brand-500 animate-spin"></div>
              <span className="mt-3.5 text-xs text-slate-500 font-bold uppercase tracking-wider">Mounting Map Engine...</span>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }} />
        </div>

        {/* Address Display & Confirm Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex-shrink-0 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex items-start space-x-2.5">
            <MapPin className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wide leading-none">Resolved Location</p>
              {resolving ? (
                <div className="flex items-center space-x-1.5 mt-2">
                  <Loader className="w-3 h-3 text-brand-500 animate-spin" />
                  <span className="text-xs font-bold text-slate-400 italic">Reverse-geocoding coordinates...</span>
                </div>
              ) : (
                <p className="text-xs font-extrabold text-slate-700 mt-1.5 leading-snug break-words">
                  {resolvedAddress || 'Click map to resolve address details'}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-650 font-extrabold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={resolving || !resolvedAddress}
              className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-350 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
