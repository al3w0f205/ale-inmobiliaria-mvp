export interface POI {
  id: number;
  lat: number;
  lng: number;
  name: string;
  type: string;
  icon: string;
  hexColor: string; // Para el mapa (Leaflet/HTML div)
  textColor: string; // Tailwind class para UI
  bgColor: string; // Tailwind class para UI
}

export async function fetchNearbyPOIs(lat: number, lng: number): Promise<POI[]> {
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
  
  const res = await fetch(url);
  const data = await res.json();
  
  if (!data.elements) return [];

  return data.elements.map((el: any) => {
    let type = 'Lugar';
    let icon = '📍';
    let hexColor = '#ffffff';
    let textColor = 'text-gray-500';
    let bgColor = 'bg-gray-500/10';

    if (el.tags.amenity === 'hospital') { type = 'Salud'; icon = '🏥'; hexColor = '#ef4444'; textColor = 'text-red-500'; bgColor = 'bg-red-500/10'; }
    if (el.tags.amenity === 'cafe') { type = 'Cafetería'; icon = '☕'; hexColor = '#f97316'; textColor = 'text-orange-500'; bgColor = 'bg-orange-500/10'; }
    if (el.tags.shop === 'supermarket') { type = 'Supermercado'; icon = '🛒'; hexColor = '#3b82f6'; textColor = 'text-blue-500'; bgColor = 'bg-blue-500/10'; }
    if (el.tags.highway === 'bus_stop') { type = 'Transporte'; icon = '🚌'; hexColor = '#6b7280'; textColor = 'text-gray-600'; bgColor = 'bg-gray-600/10'; }
    if (el.tags.leisure === 'park') { type = 'Parque'; icon = '🌳'; hexColor = '#22c55e'; textColor = 'text-green-500'; bgColor = 'bg-green-500/10'; }
    
    return {
      id: el.id,
      lat: el.lat,
      lng: el.lon,
      name: el.tags.name || type,
      type,
      icon,
      hexColor,
      textColor,
      bgColor
    };
  });
}
