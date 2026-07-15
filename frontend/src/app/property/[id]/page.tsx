import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContactBrokerCard from '@/components/ContactBrokerCard';
import dynamic from 'next/dynamic';
import NearbyPOIsList from '@/components/NearbyPOIsList';
import RevealOnScroll from '@/components/RevealOnScroll';

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
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-brand/20 selection:text-brand">
      {/* Header simple translucido */}
      <header className="fixed top-0 inset-x-0 z-50 flex h-20 items-center px-6 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-[2px]">
        <Link href="/properties" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors font-medium text-sm mix-blend-difference">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Volver a propiedades
        </Link>
      </header>

      <main className="flex-1 w-full pb-20">
        
        {/* Galería / Imagen Principal (Hero Inmersivo) */}
        <RevealOnScroll delay={0}>
          <div className="w-full h-[60vh] md:h-[75vh] overflow-hidden relative">
          <img 
            src={property.image_url} 
            alt={property.title} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:px-24">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.tags.map((tag: string) => (
                    <span key={tag} className="px-4 py-1.5 bg-brand text-white text-xs font-black tracking-widest uppercase rounded-full shadow-lg shadow-brand/20">
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-sm mb-2">{property.title}</h1>
                <p className="text-xl md:text-2xl text-white/80 font-medium tracking-wide flex items-center gap-2">
                  {property.property_type.toUpperCase()}
                  <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                  <span className="font-bold text-white">${property.price}</span>
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* Detalles y Sidebar */}
        <div className="max-w-5xl mx-auto px-6 lg:px-0 grid md:grid-cols-3 gap-12 mt-12">
          
          {/* Columna Izquierda: Detalles */}
          <div className="md:col-span-2 space-y-16">
            <RevealOnScroll delay={200}>
              <section className="prose prose-lg prose-zinc dark:prose-invert max-w-none">
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                  Acerca de la propiedad
                  <div className="h-px flex-1 bg-border ml-4"></div>
                </h2>
                <p className="text-muted leading-relaxed text-lg font-medium">
                  {property.description}
                </p>
              </section>
            </RevealOnScroll>

            {/* Simulación Mapa Estático o Info Adicional */}
            <RevealOnScroll delay={300}>
              <section className="p-8 rounded-[2rem] bg-surface/50 border border-border shadow-2xl shadow-brand/5 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>
                <h3 className="font-black text-2xl mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Ubicación aproximada
                </h3>
                <div className="aspect-video bg-muted/10 rounded-2xl overflow-hidden relative shadow-inner mb-6">
                  <MapComponent properties={[property]} />
                </div>
                
                <NearbyPOIsList lat={property.location.coordinates[1]} lng={property.location.coordinates[0]} />
              </section>
            </RevealOnScroll>
          </div>

          {/* Columna Derecha: Tarjeta de Contacto / Precio */}
          <aside>
            <RevealOnScroll delay={400}>
              <div className="sticky top-24 p-8 rounded-[2rem] bg-surface/80 backdrop-blur-xl border border-border shadow-2xl shadow-brand/5 space-y-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/10 rounded-full blur-2xl pointer-events-none"></div>
                <div>
                  <p className="text-xs font-black text-brand uppercase tracking-widest mb-2">Precio de venta</p>
                  <p className="text-5xl font-black text-foreground tracking-tight">${property.price}</p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent w-full"></div>

                <div>
                  <p className="font-bold text-lg mb-4">Contacta al corredor</p>
                  
                  <ContactBrokerCard 
                    broker={property.broker} 
                    propertyId={property.id} 
                    propertyTitle={property.title} 
                  />
                </div>
              </div>
            </RevealOnScroll>
          </aside>

        </div>
      </main>
    </div>
  );
}
