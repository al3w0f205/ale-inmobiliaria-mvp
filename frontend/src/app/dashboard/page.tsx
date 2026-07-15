'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

export default function DashboardPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBroker, setIsBroker] = useState(false);

  useEffect(() => {
    const userType = localStorage.getItem('user_type');
    const username = localStorage.getItem('username');
    
    if (!username) {
      router.push('/login');
    } else if (userType !== 'broker') {
      router.push('/');
    } else {
      setIsBroker(true);
      fetchMyProperties();
    }
  }, [router]);

  const fetchMyProperties = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/me/`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      } else {
        setError('Error cargando tus propiedades.');
      }
    } catch (err) {
      setError('Error de conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/${id}/`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setProperties(properties.filter(p => p.id !== id));
      } else {
        alert('No se pudo eliminar la propiedad.');
      }
    } catch (err) {
      alert('Error de red al intentar eliminar.');
    }
  };

  if (!isBroker) return null; // Wait for redirect

  return (
    <div className="w-full">
      <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">Mi Portfolio</h1>
            <p className="text-muted text-lg max-w-xl">Gestiona tus propiedades publicadas, revisa métricas y atrae más prospectos.</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/dashboard/messages"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-border text-foreground font-bold rounded-2xl hover:bg-muted/10 transition-all active:scale-95 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Mensajes
            </Link>
            <Link 
              href="/publish"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-2xl hover:bg-brand-hover shadow-lg shadow-brand/25 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Propiedad
            </Link>
          </div>
        </header>

        {/* Resumen de estadísticas (Placeholder para MVP) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-xl shadow-brand/5">
            <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Total Publicadas</p>
            <p className="text-4xl font-bold text-brand">{properties.length}</p>
          </div>
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-xl shadow-brand/5 opacity-50 relative overflow-hidden group cursor-not-allowed">
             <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm">
                <span className="font-bold text-sm">Próximamente</span>
             </div>
            <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Vistas este mes</p>
            <p className="text-4xl font-bold text-foreground">--</p>
          </div>
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-xl shadow-brand/5 opacity-50 relative overflow-hidden group cursor-not-allowed">
             <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm">
                <span className="font-bold text-sm">Próximamente</span>
             </div>
            <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Prospectos</p>
            <p className="text-4xl font-bold text-foreground">--</p>
          </div>
        </section>

        {/* Lista de propiedades */}
        <section>
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold tracking-tight">Propiedades Activas</h2>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
               <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-6 py-4 rounded-2xl">
              <p className="font-semibold">{error}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-surface/50">
               <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6 text-muted">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                 </svg>
               </div>
               <h3 className="text-xl font-bold mb-2">Aún no tienes propiedades</h3>
               <p className="text-muted max-w-md mx-auto mb-8">Comienza a atraer clientes publicando tu primer inmueble en el Marketplace.</p>
               <Link href="/publish" className="inline-flex items-center px-6 py-2.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors">
                 Publicar ahora
               </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map(prop => (
                <article key={prop.id} className="group relative flex flex-col bg-surface border border-border rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-brand/5 hover:border-brand/30 transition-all duration-500">
                  <div className="aspect-[4/3] bg-muted/10 relative overflow-hidden">
                    <img src={prop.image_url} alt={prop.title} className="w-full h-full object-cover transition-transform duration-700" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-brand text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                        {prop.property_type}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-xl mb-1 text-foreground line-clamp-1">{prop.title}</h3>
                    <p className="text-2xl font-bold text-brand mb-4">${prop.price}</p>
                    
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
                      <Link 
                        href={`/property/${prop.id}`}
                        className="flex-1 text-center py-2.5 bg-muted/10 text-foreground font-semibold rounded-xl hover:bg-brand/10 hover:text-brand transition-colors"
                      >
                        Ver Detalle
                      </Link>
                      <button 
                        onClick={() => handleDelete(prop.id)}
                        className="p-2.5 text-muted hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                        title="Eliminar propiedad"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
    </div>
  );
}
