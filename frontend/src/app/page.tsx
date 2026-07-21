import React from 'react';
import Link from 'next/link';

async function getRecentProperties() {
  try {
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const res = await fetch(`${apiUrl}/properties/`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch properties for landing:', error);
    return [];
  }
}

export default async function LandingPage() {
  const properties = await getRecentProperties();
  const displayProperties = properties.slice(0, 2); // Tomamos las 2 destacadas del mockup

  return (
    <div className="min-h-screen bg-[#070913] text-foreground flex flex-col selection:bg-brand/20 selection:text-brand relative overflow-x-hidden">
      
      {/* Aurora Glow Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Grid de Fondo Tecnológico */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-25"></div>

      <main className="w-full max-w-[1600px] mx-auto px-4 py-8 md:px-8 md:py-12 flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* COLUMNA IZQUIERDA: HERO INMERSIVO (5/12 COLS) */}
        <section className="lg:col-span-5 flex flex-col justify-between rounded-[2.5rem] overflow-hidden relative border border-white/10 min-h-[70vh] lg:min-h-[85vh] bg-cover bg-center shadow-2xl group" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/95 z-0"></div>
          
          {/* Header simple e integrado en el Hero */}
          <header className="relative z-10 p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand/35">L</div>
              <span className="text-xl font-black text-white tracking-tight">LibreCasa</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-xs font-bold text-white/80 hover:text-white uppercase tracking-widest transition-colors">Portal</Link>
              <Link href="/properties" className="px-5 py-2.5 bg-brand text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-brand-light hover:text-foreground transition-all shadow-lg shadow-brand/10 hover:shadow-brand/20 active:scale-95">Catálogo</Link>
            </div>
          </header>

          {/* Contenido Hero */}
          <div className="relative z-10 p-8 md:p-12 space-y-6 mt-auto">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-none">
              El trato es <br/>
              <span className="text-brand">directo.</span>
            </h1>
            <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-md font-medium">
              El marketplace inmobiliario sin comisiones. Conecta directamente con corredores verificados y descubre propiedades excepcionales.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/login" className="px-6 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-brand hover:text-white transition-all text-xs uppercase tracking-widest active:scale-95 shadow-lg">
                Ingresar al Portal
              </Link>
              <Link href="/properties" className="px-6 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-xs uppercase tracking-widest">
                Explorar Catálogo
              </Link>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: SECCIONES Y ENTORNO TECNOLÓGICO (7/12 COLS) */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Faja Superior: Manifesto */}
          <div className="p-8 rounded-[2rem] bg-[#0c0f1e]/40 border border-white/5 shadow-2xl relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-brand/5 to-blue-500/5 opacity-50 pointer-events-none"></div>
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand/10 rounded-full blur-2xl"></div>
            <p className="text-base md:text-xl font-bold tracking-wide text-white/90 text-center leading-relaxed max-w-2xl relative z-10">
              &ldquo;Diseñado para eliminar el ruido del mercado. Negociaciones transparentes, mapas precisos y comunicación instantánea.&rdquo;
            </p>
          </div>

          {/* Subgrid: Selección Destacada */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Selección Destacada
                <span className="w-2 h-2 rounded-full bg-brand animate-ping"></span>
              </h2>
              <Link href="/properties" className="text-xs font-bold text-brand hover:underline flex items-center gap-1 uppercase tracking-widest">
                Ver todo el catálogo
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayProperties.length > 0 ? (
                displayProperties.map((prop: any) => (
                  <Link key={prop.id} href={`/property/${prop.id}`} className="group flex flex-col bg-[#0b0e1b]/70 border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-brand/40 transition-all duration-300">
                    <div className="aspect-[4/3] w-full overflow-hidden relative bg-muted/10">
                      <img 
                        src={prop.image_url} 
                        alt={prop.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                          {prop.property_type}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-black text-white">${prop.price}</p>
                        {prop.broker?.identity_verified && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                            Verificado
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-brand transition-colors">{prop.title}</h3>
                        <p className="text-xs text-muted line-clamp-2 mt-1 font-medium">{prop.description}</p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                // Fallback Mock Cards from Image to match the layout exactly
                <>
                  <div className="flex flex-col bg-[#0b0e1b]/70 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                    <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-800">
                      <img 
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" 
                        alt="Costa del Sol Villa" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                          Venta
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-black text-white">$540,000</p>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                          Verificado
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Costa del Sol Luxury Villa</h3>
                        <p className="text-xs text-muted font-medium">Ubicación privilegiada con vistas inigualables al océano pacífico.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col bg-[#0b0e1b]/70 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                    <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-800">
                      <img 
                        src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" 
                        alt="Penthouse Quito" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                          Renta
                        </span>
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-black text-white">$1,200 / mes</p>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                          Verificado
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Penthouse de Lujo Moderno</h3>
                        <p className="text-xs text-muted font-medium">Ubicado en el norte de Quito con amplias terrazas y automatización completa.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Subgrid inferior: Precisión Geográfica y CTA */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Tarjeta Precisión Geográfica (5/12 cols) */}
            <div className="md:col-span-5 p-6 rounded-[2rem] bg-[#0b0e1b]/70 border border-white/5 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-white">Precisión Geográfica</h3>
                <p className="text-xs text-muted leading-relaxed font-medium">
                  Cada propiedad está mapeada milimétricamente en tiempo real con geolocalización.
                </p>
              </div>
            </div>

            {/* Tarjeta de CTA: Multiplica tu rentabilidad (7/12 cols) */}
            <div className="md:col-span-7 p-6 rounded-[2rem] bg-gradient-to-br from-brand/10 to-blue-600/5 border border-brand/20 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--color-brand),0.1),transparent_50%)] pointer-events-none"></div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white tracking-tight leading-none">
                  Multiplica tu <span className="text-brand">rentabilidad.</span>
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-medium">
                  Cero comisiones por venta. Perfil verificado, pagos inmediatos y control absoluto sobre tus clientes. Únete como corredor.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-all text-xs uppercase tracking-widest active:scale-95 w-full md:w-auto">
                  Crear Cuenta
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}
