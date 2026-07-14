'use client';

import React, { useState, useEffect } from 'react';

export default function NearbyPOIsList({ lat, lng }: { lat: number, lng: number }) {
  const [pois, setPois] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:500,${lat},${lng});
        node["amenity"="cafe"](around:500,${lat},${lng});
        node["shop"="supermarket"](around:500,${lat},${lng});
        node["highway"="bus_stop"](around:500,${lat},${lng});
        node["leisure"="park"](around:500,${lat},${lng});
      );
      out body 10;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.elements) {
          const formattedPois = data.elements.map((el: any) => {
            let type = 'Lugar';
            let icon = '📍';
            let color = 'bg-gray-500';
            let textColor = 'text-gray-500';
            let bgColor = 'bg-gray-500/10';

            if (el.tags.amenity === 'hospital') { type = 'Salud'; icon = '🏥'; color = 'bg-red-500'; textColor = 'text-red-500'; bgColor = 'bg-red-500/10'; }
            if (el.tags.amenity === 'cafe') { type = 'Cafetería'; icon = '☕'; color = 'bg-orange-500'; textColor = 'text-orange-500'; bgColor = 'bg-orange-500/10'; }
            if (el.tags.shop === 'supermarket') { type = 'Supermercado'; icon = '🛒'; color = 'bg-blue-500'; textColor = 'text-blue-500'; bgColor = 'bg-blue-500/10'; }
            if (el.tags.highway === 'bus_stop') { type = 'Transporte'; icon = '🚌'; color = 'bg-gray-600'; textColor = 'text-gray-600'; bgColor = 'bg-gray-600/10'; }
            if (el.tags.leisure === 'park') { type = 'Parque'; icon = '🌳'; color = 'bg-green-500'; textColor = 'text-green-500'; bgColor = 'bg-green-500/10'; }
            
            return {
              id: el.id,
              name: el.tags.name || type,
              type,
              icon,
              color,
              textColor,
              bgColor
            };
          });
          setPois(formattedPois);
        }
      })
      .catch(err => console.error("Error fetching POIs", err))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  if (loading) {
    return <div className="animate-pulse flex gap-4 overflow-x-auto py-4">
      {[1, 2, 3].map(i => <div key={i} className="h-16 w-48 bg-muted/20 rounded-2xl flex-shrink-0"></div>)}
    </div>;
  }

  if (pois.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="font-semibold text-base mb-3">Lugares de interés a 500m</h4>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {pois.map(poi => (
          <div key={poi.id} className={`flex items-center gap-3 p-3 rounded-2xl border border-border ${poi.bgColor} min-w-[200px] flex-shrink-0`}>
            <div className="text-2xl">{poi.icon}</div>
            <div>
              <p className="font-bold text-sm truncate max-w-[140px]" title={poi.name}>{poi.name}</p>
              <p className={`text-xs font-medium ${poi.textColor}`}>{poi.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
