'use client';

import React, { useState, useEffect } from 'react';
import { fetchNearbyPOIs, POI } from '@/utils/osm';

export default function NearbyPOIsList({ lat, lng }: { lat: number, lng: number }) {
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNearbyPOIs(lat, lng)
      .then(data => setPois(data))
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
