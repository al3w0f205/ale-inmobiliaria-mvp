'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ChatWidget from '@/components/ChatWidget';
import Header from '@/components/Header';
// import { properties } from '@/lib/data';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

export default function Home() {
  const [searchLoc, setSearchLoc] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (searchLoc) queryParams.append('search', searchLoc);
        if (filterType) queryParams.append('type', filterType);
        if (filterPrice) queryParams.append('max_price', filterPrice);

        const host = typeof window === 'undefined' ? 'http://backend:8000' : '';
        const res = await fetch(`${host}${process.env.NEXT_PUBLIC_API_URL}/properties?${queryParams.toString()}`);
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
  }, [searchLoc, filterType, filterPrice]);

  const filteredProperties = properties; // Filtering is now done on the backend!

  return (
    <div className="flex flex-col h-screen overflow-hidden selection:bg-brand/20 selection:text-brand">
      <Header />


      <main className="flex flex-1 overflow-hidden relative">
        {/* Panel lateral de filtros y listado */}
        <section className="flex w-full flex-col lg:w-[55%] xl:w-[50%] overflow-y-auto bg-background z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-border">
          
          {/* Navegador de Filtro */}
          <div className="sticky top-0 z-20 glass p-6 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Encuentra tu hogar ideal</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <input 
                type="text" 
                placeholder="Ubicación o palabra clave..." 
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 transition-shadow" 
                value={searchLoc}
                onChange={e => setSearchLoc(e.target.value)}
              />
              <select 
                className="px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 transition-shadow cursor-pointer"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
              >
                <option value="">Tipo</option>
                <option value="casa">Casa</option>
                <option value="dep">Departamento</option>
              </select>
              <select 
                className="px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 transition-shadow cursor-pointer"
                value={filterPrice}
                onChange={e => setFilterPrice(e.target.value)}
              >
                <option value="">Precio Max</option>
                <option value="100000">$100,000</option>
                <option value="200000">$200,000</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-muted">{filteredProperties.length} propiedades encontradas</span>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredProperties.map((prop) => (
                <Link href={`/property/${prop.id}`} key={prop.id} className="h-full block">
                  <article className="group flex flex-col gap-3 p-3 transition-all duration-300 rounded-2xl border border-border bg-surface hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 cursor-pointer h-full">
                    <div className="aspect-[4/3] bg-muted/10 rounded-xl overflow-hidden relative">
                      <img src={prop.image_url} alt={prop.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="px-1 pb-1 flex flex-col flex-1">
                      <div className="flex gap-2 mb-2">
                        {prop.tags.map((tag: string) => (
                          <span key={tag} className="px-2 py-1 bg-brand-light text-brand text-[10px] font-semibold tracking-wide uppercase rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-semibold text-foreground text-lg leading-tight mb-1 group-hover:text-brand transition-colors">{prop.title}</h3>
                      <div className="flex items-center text-yellow-500 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span className="text-xs font-bold text-foreground ml-1">4.9</span>
                        <span className="text-xs text-muted ml-0.5">(24)</span>
                      </div>
                      <p className="text-sm text-muted line-clamp-2 leading-relaxed flex-1">{prop.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-bold text-xl text-foreground">${prop.price}</span>
                        <span 
                          className="px-3 py-1.5 text-xs font-semibold text-brand transition-colors bg-brand-light rounded-full group-hover:bg-brand group-hover:text-white"
                        >
                          Ver más
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
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
