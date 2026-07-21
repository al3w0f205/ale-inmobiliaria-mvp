'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ChatWidget from '@/components/ChatWidget';
import Header from '@/components/Header';
import RevealOnScroll from '@/components/RevealOnScroll';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function Home() {
  const [searchLoc, setSearchLoc] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterBedrooms, setFilterBedrooms] = useState('');
  const [filterBathrooms, setFilterBathrooms] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('search')) setSearchLoc(params.get('search')!);
      if (params.get('type')) setFilterType(params.get('type')!);
      if (params.get('max_price')) setFilterPrice(params.get('max_price')!);
      if (params.get('min_bedrooms')) setFilterBedrooms(params.get('min_bedrooms')!);
      if (params.get('min_bathrooms')) setFilterBathrooms(params.get('min_bathrooms')!);
      if (params.get('min_area')) setFilterArea(params.get('min_area')!);
    }
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (searchLoc) queryParams.append('search', searchLoc);
        if (filterType) queryParams.append('type', filterType);
        if (filterPrice) queryParams.append('max_price', filterPrice);
        if (filterBedrooms) queryParams.append('min_bedrooms', filterBedrooms);
        if (filterBathrooms) queryParams.append('min_bathrooms', filterBathrooms);
        if (filterArea) queryParams.append('min_area', filterArea);

        const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
        window.history.replaceState({}, '', newUrl);

        const apiBase = typeof window === 'undefined'
          ? (process.env.INTERNAL_API_URL || 'http://backend-api:8000/api')
          : (process.env.NEXT_PUBLIC_API_URL || '/api');
        const res = await fetch(`${apiBase}/properties/?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProperties(data);
        } else {
          setError('No se pudieron cargar las propiedades');
        }
      } catch (err) {
        setError('Error de conexión al servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchLoc, filterType, filterPrice, filterBedrooms, filterBathrooms, filterArea]);

  const filteredProperties = properties; // Filtering is now done on the backend!

  return (
    <div className="flex flex-col h-screen overflow-hidden selection:bg-brand/20 selection:text-brand">
      <Header />


      <main className="flex flex-1 overflow-hidden relative">
        {/* Panel lateral de filtros y listado */}
        <section className="flex w-full flex-col lg:w-[55%] xl:w-[50%] overflow-y-auto bg-background z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-border">
          
          {/* Navegador de Filtro */}
          <div className="sticky top-0 z-20 bg-surface/80 backdrop-blur-xl p-6 space-y-4 border-b border-border/50">
            <h2 className="text-3xl font-black tracking-tight text-foreground">Encuentra tu hogar ideal</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <div className="relative flex-1 min-w-[200px]">
                <input 
                  type="text" 
                  placeholder="Ubicación o palabra clave..." 
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background text-sm font-medium focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all shadow-sm" 
                  onChange={e => setSearchLoc(e.target.value)}
                />
                <svg className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <select 
                className="px-5 py-3 rounded-2xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer shadow-sm appearance-none"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="">Cualquier Tipo</option>
                <option value="casa">Casa</option>
                <option value="dep">Departamento</option>
              </select>
              <select 
                className="px-5 py-3 rounded-2xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer shadow-sm appearance-none"
                value={filterPrice}
                onChange={e => setFilterPrice(e.target.value)}
              >
                <option value="">Precio Max</option>
                <option value="100000">$100,000</option>
                <option value="200000">$200,000</option>
              </select>
              <select 
                className="px-5 py-3 rounded-2xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer shadow-sm appearance-none"
                value={filterBedrooms}
                onChange={e => setFilterBedrooms(e.target.value)}
              >
                <option value="">Habitaciones</option>
                <option value="1">1+ hab</option>
                <option value="2">2+ hab</option>
                <option value="3">3+ hab</option>
                <option value="4">4+ hab</option>
              </select>
              <select 
                className="px-5 py-3 rounded-2xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer shadow-sm appearance-none"
                value={filterBathrooms}
                onChange={e => setFilterBathrooms(e.target.value)}
              >
                <option value="">Baños</option>
                <option value="1">1+ baños</option>
                <option value="2">2+ baños</option>
                <option value="3">3+ baños</option>
              </select>
              <select 
                className="px-5 py-3 rounded-2xl border border-border bg-background text-sm font-semibold focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all cursor-pointer shadow-sm appearance-none"
                value={filterArea}
                onChange={e => setFilterArea(e.target.value)}
              >
                <option value="">Área (m²)</option>
                <option value="50">50+ m²</option>
                <option value="100">100+ m²</option>
                <option value="200">200+ m²</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-muted">{filteredProperties.length} propiedades encontradas</span>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2">
              {filteredProperties.map((prop, index) => (
                <RevealOnScroll key={prop.id} delay={index * 100}>
                  <Link href={`/property/${prop.id}`} className="h-full block group perspective-1000">
                    <article className="flex flex-col gap-4 p-4 transition-all duration-500 rounded-[2rem] border border-transparent bg-surface hover:border-border hover:shadow-2xl hover:shadow-brand/5 hover:-translate-y-2 cursor-pointer h-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="aspect-[4/3] bg-muted/10 rounded-2xl overflow-hidden relative z-10">
                        <img src={prop.image_url} alt={prop.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out-expo" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-foreground text-[10px] font-black tracking-widest uppercase rounded-lg shadow-sm">
                            {prop.property_type}
                          </span>
                        </div>
                      </div>
                      <div className="px-2 pb-2 flex flex-col flex-1 z-10">
                        <h3 className="font-bold text-foreground text-xl leading-tight mb-2 group-hover:text-brand transition-colors line-clamp-1">{prop.title}</h3>
                        
                        <p className="text-sm text-muted line-clamp-2 leading-relaxed flex-1 font-medium">{prop.description}</p>
                        
                        <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-muted">
                          {prop.bedrooms > 0 && <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>{prop.bedrooms} hab</span>}
                          {prop.bathrooms > 0 && <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>{prop.bathrooms} ba</span>}
                          {prop.area_sqm > 0 && <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>{prop.area_sqm} m²</span>}
                        </div>

                        <div className="flex items-end justify-between mt-6 pt-4 border-t border-border/50">
                          <div>
                            <span className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Precio</span>
                            <span className="font-black text-2xl text-foreground">${prop.price}</span>
                          </div>
                          <span 
                            className="inline-flex items-center justify-center w-10 h-10 bg-brand/10 text-brand rounded-full group-hover:bg-brand group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
        
        {/* Mapa interactivo */}
        <aside className="hidden lg:block lg:flex-1 relative bg-surface">
          <div className="absolute inset-0 z-0">
             {/* MapComponent con wrapper para que ocupe todo el espacio */}
            <div className="h-full w-full [&>div]:!h-full [&>div]:!rounded-none">
              <MapComponent properties={filteredProperties} />
            </div>
          </div>
        </aside>
      </main>

      <ChatWidget />
    </div>
  );
}
