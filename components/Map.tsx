import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Info, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { MapLocation } from '../types';

// We need to declare the L variable from the global scope (Leaflet)
declare global {
  interface Window {
    L: any;
  }
}

const MapComponent: React.FC = () => {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState<MapLocation | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('locations').select('*');
    if (data) {
      setLocations(data as MapLocation[]);
    }
    setLoading(false);
  };

  // Initialize Map
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapInstanceRef.current) return;

    if (window.L) {
      // Initialize map centered on IIT Mandi North Campus roughly
      const map = window.L.map(mapContainerRef.current).setView([31.777, 76.986], 16);
      
      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading]);

  // Add markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || locations.length === 0) return;
    
    // Clear existing markers if any (rudimentary clean up for this example)
    // In a full app, we'd track markers.
    
    locations.forEach(loc => {
      const marker = window.L.marker([loc.lat, loc.lng]).addTo(mapInstanceRef.current);
      
      // Create a custom popup
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-sm text-slate-800">${loc.name}</h3>
          <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-1 rounded">${loc.type}</span>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      marker.on('click', () => {
        setActiveLocation(loc);
      });
    });

  }, [locations]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Pathfinder's Map
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">Live</span>
          </h2>
          <p className="text-slate-500">Geospatial overview of the North Campus Citadel.</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => {
                if(mapInstanceRef.current) mapInstanceRef.current.setView([31.777, 76.986], 16);
                setActiveLocation(null);
              }}
              className="bg-white p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              title="Reset View"
            >
              <Navigation className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative">
          {loading && (
             <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/80">
                <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
             </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full" id="map"></div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-y-auto hidden lg:block p-4">
           {activeLocation ? (
             <div className="space-y-4 animate-in slide-in-from-right duration-300">
               <div className="h-32 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-10 h-10 text-slate-300" />
               </div>
               <div>
                 <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-lg mb-2 inline-block">{activeLocation.type}</span>
                 <h3 className="text-xl font-bold text-slate-800">{activeLocation.name}</h3>
               </div>
               <p className="text-slate-600 text-sm leading-relaxed">
                 {activeLocation.description}
               </p>
               <div className="pt-4 border-t border-slate-100">
                 <p className="text-xs text-slate-400">Coordinates</p>
                 <p className="text-sm font-mono text-slate-600">{activeLocation.lat.toFixed(4)}, {activeLocation.lng.toFixed(4)}</p>
               </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
               <div className="p-4 bg-slate-50 rounded-full">
                  <Info className="w-8 h-8 text-slate-300" />
               </div>
               <p className="text-sm">Select a location marker on the map to view detailed intelligence.</p>
               
               <div className="w-full pt-8 px-4">
                 <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Known Points</p>
                 <div className="space-y-2 text-left">
                    {locations.map(loc => (
                      <button 
                        key={loc.id}
                        onClick={() => {
                          setActiveLocation(loc);
                          if(mapInstanceRef.current) {
                            mapInstanceRef.current.setView([loc.lat, loc.lng], 18);
                          }
                        }}
                        className="w-full block p-2 text-sm text-slate-600 hover:bg-slate-50 rounded transition-colors truncate"
                      >
                        {loc.name}
                      </button>
                    ))}
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;