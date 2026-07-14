import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContactBrokerCard from '@/components/ContactBrokerCard';
import dynamic from 'next/dynamic';
import NearbyPOIsList from '@/components/NearbyPOIsList';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

async function getProperty(id: string) {
  try {
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/properties/${id}/`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data;
  } catch (error) {
    return null;
  }
}

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header simple */}
      <header className="glass sticky top-0 z-50 flex h-16 items-center px-6 border-b border-border">
        <Link href="/properties" className="flex items-center gap-2 text-muted hover:text-brand transition-colors font-medium text-sm">
          ← Volver a propiedades
        </Link>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 space-y-10">
        
        {/* Galería / Imagen Principal */}
        <div className="w-full h-[40vh] md:h-[60vh] rounded-3xl overflow-hidden relative shadow-lg shadow-brand/5">
          <img 
            src={property.image_url} 
            alt={property.title} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex gap-2 mb-3">
              {property.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-wide uppercase rounded-md border border-white/20">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{property.title}</h1>
          </div>
        </div>

        {/* Detalles y Sidebar */}
        <div className="grid md:grid-cols-3 gap-10">
          
          {/* Columna Izquierda: Detalles */}
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Acerca de la propiedad</h2>
              <p className="text-muted leading-relaxed text-lg">
                {property.description}
              </p>
            </section>

            {/* Simulación Mapa Estático o Info Adicional */}
            <section className="p-6 rounded-2xl bg-surface border border-border">
              <h3 className="font-semibold text-lg mb-2">Ubicación aproximada</h3>
              <div className="aspect-video bg-surface rounded-xl overflow-hidden relative">
                <MapComponent properties={[property]} />
              </div>
              
              <NearbyPOIsList lat={property.location.coordinates[1]} lng={property.location.coordinates[0]} />
            </section>
          </div>

          {/* Columna Derecha: Tarjeta de Contacto / Precio */}
          <aside>
            <div className="sticky top-24 p-6 rounded-3xl bg-surface border border-border shadow-xl shadow-brand/5 space-y-6">
              <div>
                <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-1">Precio de venta</p>
                <p className="text-4xl font-bold text-brand">${property.price}</p>
              </div>

              <div className="h-px bg-border w-full"></div>

              <div>
                <p className="font-medium mb-1">Contacta al corredor</p>
                
                <ContactBrokerCard 
                  broker={property.broker} 
                  propertyId={property.id} 
                  propertyTitle={property.title} 
                />
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
