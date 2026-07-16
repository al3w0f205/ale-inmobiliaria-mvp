import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import RevealOnScroll from '@/components/RevealOnScroll';

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
  const displayProperties = properties.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen bg-background relative selection:bg-brand/20 selection:text-brand">
      
      {/* HERO SECTION - Full bleed image */}
      <section className="relative w-full h-[90vh] flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=80" 
            alt="Arquitectura moderna y espacios abiertos" 
            className="w-full h-full object-cover scale-105 animate-[slow-zoom_30s_ease-in-out_infinite_alternate]"
          />
          {/* Stark contrast overlay for premium feel */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90"></div>
        </div>

        <div className="relative z-10 w-full">
          <Header isTransparent={true} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-24 md:pb-32 flex flex-col items-center text-center">
          <RevealOnScroll className="space-y-8 max-w-4xl mx-auto flex flex-col items-center">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9]">
              El trato es <br/>
              <span className="text-brand">directo.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-2xl font-medium">
              El marketplace inmobiliario sin comisiones. Conecta directamente con corredores verificados y descubre propiedades excepcionales.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-10 py-4 bg-brand text-white font-bold rounded-full hover:bg-brand-light hover:text-foreground transition-colors text-lg shadow-2xl shadow-brand/20"
              >
                Ingresar al Portal
              </Link>
              <a 
                href="#explorar" 
                className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all text-lg"
              >
                Explorar Catálogo
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <main className="flex-1 w-full relative z-10 bg-background">
        
        {/* STATEMENT SECTION */}
        <section className="w-full py-24 md:py-32 border-b border-border">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <RevealOnScroll>
              <p className="text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Diseñado para eliminar el ruido del mercado. Negociaciones transparentes, mapas precisos y comunicación instantánea.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        {/* PROPERTY GRID SECTION */}
        <section id="explorar" className="w-full py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <RevealOnScroll className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
                  Selección Destacada
                </h2>
                <p className="text-lg text-muted max-w-2xl font-medium">
                  Explora las propiedades más recientes publicadas por corredores verificados en la red.
                </p>
              </div>
              <Link href="/properties" className="inline-flex items-center gap-2 font-bold text-brand hover:text-brand-hover transition-colors group text-lg">
                Ver todo el catálogo
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            </RevealOnScroll>

            {displayProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {displayProperties.map((prop: any, i: number) => (
                  <RevealOnScroll key={prop.id} delay={i * 100}>
                    <Link href={`/property/${prop.id}`} className="group flex flex-col gap-6 cursor-pointer">
                      <div className="aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-muted/10 relative">
                        <img 
                          src={prop.image_url} 
                          alt={prop.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out-expo" 
                        />
                        <div className="absolute top-6 left-6">
                          <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-foreground text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            {prop.property_type}
                          </span>
                        </div>
                      </div>
                      <div className="px-2">
                        <h3 className="font-bold text-2xl text-foreground line-clamp-1 group-hover:text-brand transition-colors">{prop.title}</h3>
                        <p className="text-muted text-base line-clamp-2 mt-2 leading-relaxed font-medium">{prop.description}</p>
                        <p className="text-3xl font-black text-foreground mt-4">${prop.price}</p>
                      </div>
                    </Link>
                  </RevealOnScroll>
                ))}
              </div>
            ) : (
              <RevealOnScroll className="py-24 text-center border border-border rounded-[3rem] bg-surface">
                 <h3 className="text-2xl font-bold text-muted mb-2">Aún no hay propiedades publicadas.</h3>
                 <p className="text-muted/60 font-medium">Sé el primero en publicar una propiedad en el marketplace.</p>
              </RevealOnScroll>
            )}
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="w-full py-24 md:py-32 bg-surface border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              
              <RevealOnScroll className="space-y-8">
                <div className="w-16 h-16 bg-brand/10 text-brand rounded-3xl flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                </div>
                <h3 className="text-4xl md:text-5xl font-black tracking-tight">Comunicación Inmediata.</h3>
                <p className="text-xl text-muted leading-relaxed font-medium">
                  El sistema te pone cara a cara con el corredor en segundos. Velocidad pura para cerrar el trato sin intermediarios que ralenticen el proceso.
                </p>
              </RevealOnScroll>

              <RevealOnScroll className="space-y-8">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                </div>
                <h3 className="text-4xl md:text-5xl font-black tracking-tight">Precisión Geográfica.</h3>
                <p className="text-xl text-muted leading-relaxed font-medium">
                  Cada propiedad está mapeada milimétricamente. Navega el mercado visualmente y descubre esa joya oculta antes que nadie.
                </p>
              </RevealOnScroll>

            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="w-full py-32 md:py-48 text-center px-6">
          <RevealOnScroll className="max-w-3xl mx-auto space-y-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]">
              Multiplica tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">rentabilidad.</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted leading-relaxed font-medium">
              Cero comisiones por venta. Perfil verificado, pagos instantáneos y control total sobre tus clientes. Únete como corredor hoy.
            </p>
            <div className="pt-8">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-foreground text-background font-bold rounded-full hover:bg-brand hover:text-white transition-all text-xl shadow-2xl hover:shadow-brand/20 active:scale-95"
              >
                Crear Cuenta
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </RevealOnScroll>
        </section>

      </main>
    </div>
  );
}
