'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { POI } from '@/components/NearbyPOIsList';

// Fix for default marker icon in Leaflet + Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Property {
  id: number;
  title: string;
  price: string;
  location: { type: string; coordinates: [number, number] }; // GeoJSON Point [lon, lat]
}

interface MapComponentProps {
  properties?: Property[];
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

function LocationPicker({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}>
      <Popup>Ubicación seleccionada</Popup>
    </Marker>
  );
}

// Componente auxiliar para detectar clics en el mapa y resetear el pin activo
function MapClickReset({ onReset }: { onReset: () => void }) {
  useMapEvents({
    click: () => onReset()
  });
  return null;
}

// Componente interno para cargar POIs reales asincrónicamente
function RealPOIs({ lat, lng, propId, isActive }: { lat: number, lng: number, propId: number, isActive: boolean }) {
  const [pois, setPois] = useState<POI[]>([]);

  React.useEffect(() => {
    if (!isActive) {
      setPois([]); // Limpiar cuando ya no está activo
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${propId}/pois/`)
      .then(res => res.json())
      .then(data => setPois(data))
      .catch(err => console.error("Error fetching POIs", err));
  }, [lat, lng, isActive]);

  if (!isActive) return null;

  return (
    <>
      {pois.map(poi => {
        const poiIcon = L.divIcon({
          html: `<div style="font-size: 16px; background: ${poi.hexColor}; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: transform 0.2s;">${poi.icon}</div>`,
          className: 'poi-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        return (
          <Marker key={`poi-${propId}-${poi.id}`} position={[poi.lat, poi.lng]} icon={poiIcon}>
            <Popup>
              <div className="font-sans text-center text-foreground">
                <span className="text-2xl block mb-1">{poi.icon}</span>
                <p className="font-bold text-sm">{poi.name}</p>
                <p className="text-xs text-muted">{poi.type} (Real)</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default function MapComponent({ properties = [], onLocationSelect, interactive = false }: MapComponentProps) {
  // Center of Ecuador roughly
  const center: [number, number] = properties.length === 1 
    ? [properties[0].location.coordinates[1], properties[0].location.coordinates[0]]
    : [-1.8312, -78.1834];
    
  const zoom = properties.length === 1 ? 16 : 6;
  const [activePropertyId, setActivePropertyId] = useState<number | null>(properties.length === 1 ? properties[0].id : null);

  return (
    <div className="w-full h-full min-h-[400px] z-0 relative overflow-hidden bg-surface">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full absolute inset-0">
        <MapClickReset onReset={() => setActivePropertyId(null)} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {properties.map((prop) => {
          const lat = prop.location.coordinates[1];
          const lng = prop.location.coordinates[0];
          
          // Google Maps Directions Link
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

          return (
            <React.Fragment key={prop.id}>
              <Marker 
                position={[lat, lng]} 
                icon={customIcon}
                eventHandlers={{
                  click: (e) => {
                    setActivePropertyId(prop.id);
                    const map = e.target._map;
                    map.flyTo(e.latlng, 17, { duration: 1.5 });
                  }
                }}
              >
                <Popup eventHandlers={{ remove: () => setActivePropertyId(null) }}>
                  <div className="font-sans text-foreground">
                    <h3 className="font-semibold text-base">{prop.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">${prop.price}</p>
                    <p className="text-xs text-brand mt-1 font-medium">✨ Ubicación verificada</p>
                    <div className="mt-3">
                      <a 
                        href={directionsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full bg-brand text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-brand-hover transition-colors"
                      >
                        📍 Cómo llegar (Google Maps)
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Cargar POIs Reales SOLO si esta propiedad fue clickeada */}
              <RealPOIs lat={lat} lng={lng} propId={prop.id} isActive={activePropertyId === prop.id} />
              
            </React.Fragment>
          );
        })}

        {interactive && <LocationPicker onLocationSelect={onLocationSelect} />}
      </MapContainer>
    </div>
  );
}
