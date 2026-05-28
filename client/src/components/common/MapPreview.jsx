import React, { useEffect, useRef, useState } from 'react';

export default function MapPreview({ 
  sourceCity, 
  destCity, 
  sourceCoords, // { lat: number, lon: number }
  destCoords,   // { lat: number, lon: number }
  isLiveTracking = false,
  trackingProgress = 0, // 0 to 100 percentage of trip completed
  vehicleType = 'Car'
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const carMarkerRef = useRef(null);

  // Dynamically load Leaflet CDN assets
  useEffect(() => {
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
  }, []);

  // Initialize and update Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    // Default coordinates for India if not provided
    const defaultSource = sourceCoords || { lat: 17.3850, lon: 78.4867 }; // Hyderabad
    const defaultDest = destCoords || { lat: 16.3067, lon: 80.4365 }; // Guntur

    const sLat = parseFloat(defaultSource.lat || 17.3850);
    const sLon = parseFloat(defaultSource.lon || 78.4867);
    const dLat = parseFloat(defaultDest.lat || 16.3067);
    const dLon = parseFloat(defaultDest.lon || 80.4365);

    const L = window.L;

    if (!mapInstanceRef.current) {
      // Create map instance
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      });

      // CartoDB Voyager styled tiles (clean Google Maps style clone)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers and paths
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Create custom styled HTML markers
    const sourceIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-7 h-7 bg-brand-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-[11px] text-white font-extrabold ring-2 ring-brand-500/20">A</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const destIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-7 h-7 bg-rose-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-[11px] text-white font-extrabold ring-2 ring-rose-500/20">B</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    L.marker([sLat, sLon], { icon: sourceIcon }).addTo(map)
      .bindPopup(`<b>Start Point</b><br/>${sourceCity || 'Departure Location'}`);

    L.marker([dLat, dLon], { icon: destIcon }).addTo(map)
      .bindPopup(`<b>Destination Point</b><br/>${destCity || 'Arrival Location'}`);

    // Draw route line
    const pathPoints = [[sLat, sLon], [dLat, dLon]];
    L.polyline(pathPoints, {
      color: '#4f46e5', // Indigo-600
      weight: 5,
      opacity: 0.8,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Live Tracking Marker setup
    if (isLiveTracking) {
      const isBike = vehicleType === 'Bike' || vehicleType === 'Motorcycle' || vehicleType === 'Scooter' || vehicleType === 'Scooty';
      const emoji = (vehicleType === 'Scooter' || vehicleType === 'Scooty') ? '🛵' : (isBike ? '🏍️' : '🚗');
      const label = isBike ? 'Two-Wheeler' : 'Car';

      const carIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-9 h-9 bg-slate-900 border-2 border-white rounded-2xl shadow-xl flex items-center justify-center text-lg animate-bounce ring-4 ring-indigo-500/20">${emoji}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      // Interpolate coordinates based on trackingProgress (0-100)
      const currentLat = sLat + (dLat - sLat) * (trackingProgress / 100);
      const currentLon = sLon + (dLon - sLon) * (trackingProgress / 100);

      const carMarker = L.marker([currentLat, currentLon], { icon: carIcon }).addTo(map)
        .bindPopup(`<b>Live ${label} Tracking Active</b><br/>Commute completed: ${Math.round(trackingProgress)}%`)
        .openPopup();
      
      carMarkerRef.current = carMarker;
      map.setView([currentLat, currentLon], Math.max(map.getZoom(), 11));
    } else {
      // Fit map to route bounds
      const bounds = L.latLngBounds([sLat, sLon], [dLat, dLon]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [leafletLoaded, sourceCity, destCity, sourceCoords, destCoords, isLiveTracking, trackingProgress]);

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden border border-slate-100 shadow-premium min-h-[300px] bg-slate-50">
      {!leafletLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-sm z-50">
          <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
          <span className="mt-3.5 text-xs text-slate-500 font-bold uppercase tracking-wider">Loading Map Network...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[300px]" style={{ zIndex: 1 }} />
    </div>
  );
}
