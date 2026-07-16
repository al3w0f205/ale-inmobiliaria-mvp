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
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden">
      {/* Fondo Dinámico Premium (Grid + Aurora) */}
      <div className="fixed inset-0 pointer-events-none -z-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-brand/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-accent/15 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '15s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-brand-light/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '5s' }}></div>
      </div>

      <Header />

      <main className="flex-1 w-full relative z-10">
        
        {/* HERO SECTION */}
        <section className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 lg:py-40 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <RevealOnScroll className="flex-1 space-y-8 z-10 relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 backdrop-blur-md text-brand text-sm font-semibold tracking-wide border border-brand/20 shadow-[0_0_15px_rgba(var(--color-brand),0.15)]">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              Acceso Anticipado
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.95]">
              El trato <br/>
              es <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand via-brand to-accent">directo.</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted leading-relaxed max-w-xl font-medium">
              El marketplace inmobiliario donde no pagas comisiones por conectar. Compradores y corredores negociando sin fricción.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-foreground text-background font-bold rounded-2xl hover:bg-brand hover:text-white hover:shadow-xl hover:shadow-brand/20 transition-all active:scale-95 text-center text-lg"
              >
                Ingresar al Portal
              </Link>
              <a 
                href="#explorar" 
                className="w-full sm:w-auto px-8 py-4 bg-surface border border-border text-foreground font-bold rounded-2xl hover:bg-muted/5 transition-all active:scale-95 text-center text-lg"
              >
                Explorar Propiedades
              </a>
            </div>
          </RevealOnScroll>
          
          <RevealOnScroll delay={200} className="flex-1 w-full relative">
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square w-full max-w-2xl mx-auto lg:ml-auto">
              <div className="absolute top-0 right-0 w-3/4 h-3/4 rounded-[3rem] bg-brand/10 -rotate-6 transform origin-bottom-left transition-transform duration-700 hover:rotate-0"></div>
              <div className="absolute bottom-0 left-0 w-3/4 h-3/4 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-background z-10 hover:scale-[1.02] transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80" 
                  alt="Propiedad Moderna" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute top-1/4 -left-6 glass p-5 rounded-3xl border border-white/20 shadow-2xl z-20 hidden md:block">
                <p className="text-sm font-bold text-foreground">Comisión 0%</p>
                <p className="text-2xl font-black text-brand">Ahorra Miles</p>
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* PROPERTY GRID SECTION */}
        <section id="explorar" className="w-full bg-surface border-y border-border/50 py-24">
          <RevealOnScroll className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                  Encuentra tu próximo hogar
                </h2>
                <p className="text-lg text-muted max-w-2xl">
                  Explora las propiedades más recientes publicadas por corredores verificados. Negocia directamente con ellos sin intermediarios.
                </p>
              </div>
              <Link href="/properties" className="inline-flex items-center gap-2 font-bold text-brand hover:text-brand-hover transition-colors group">
                Ver todo el catálogo
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            </div>

            {displayProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayProperties.map((prop: any) => (
                  <Link key={prop.id} href={`/property/${prop.id}`} className="group flex flex-col gap-4 cursor-pointer">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-muted/10 relative">
                      <img 
                        src={prop.image_url} 
                        alt={prop.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out-expo" 
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-foreground text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm">
                          {prop.property_type}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-foreground line-clamp-1 group-hover:text-brand transition-colors">{prop.title}</h3>
                      <p className="text-muted text-sm line-clamp-2 mt-1">{prop.description}</p>
                      <p className="text-2xl font-black text-foreground mt-3">${prop.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl bg-background">
                 <h3 className="text-xl font-bold text-muted">Aún no hay propiedades publicadas.</h3>
              </div>
            )}
          </RevealOnScroll>
        </section>

        {/* FEATURES SECTION */}
        <section className="w-full relative py-24 md:py-32 lg:py-40 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <RevealOnScroll className="text-center mb-20 md:mb-32">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
                Diseñado para destruir las fricciones del mercado.
              </h2>
            </RevealOnScroll>

            <div className="flex flex-col gap-24 lg:gap-40">
              
              <RevealOnScroll className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                <div className="flex-1 lg:order-2 space-y-6">
                  <h3 className="text-3xl lg:text-4xl font-bold tracking-tight">Tratos sin ruido.</h3>
                  <p className="text-lg text-muted leading-relaxed">
                    Olvida las interminables cadenas de correos y llamadas ignoradas. Nuestro sistema te pone cara a cara con el corredor en segundos. Velocidad pura para cerrar el trato.
                  </p>
                </div>
                <div className="flex-1 w-full max-w-md lg:order-1 perspective-1000">
                  <div className="bg-surface/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-6 overflow-hidden relative transform transition-all duration-700 hover:-translate-y-2 hover:rotate-1 hover:shadow-brand/20 group">
                    <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-4 relative z-10">
                      <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center font-bold text-xl">A</div>
                      <div>
                        <p className="font-bold">Alejandro (Corredor)</p>
                        <p className="text-xs text-brand">En línea ahora</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-muted/10 p-4 rounded-2xl rounded-tl-sm max-w-[80%]">
                        <p className="text-sm">¡Hola! ¿Aún está disponible la casa esquinera?</p>
                      </div>
                      <div className="bg-brand text-white p-4 rounded-2xl rounded-tr-sm max-w-[80%] ml-auto">
                        <p className="text-sm">Hola, sí. ¿Te gustaría agendar una visita mañana?</p>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                <div className="flex-1 space-y-6">
                  <h3 className="text-3xl lg:text-4xl font-bold tracking-tight">Visión geográfica real.</h3>
                  <p className="text-lg text-muted leading-relaxed">
                    Navega el mercado como un estratega. Cada propiedad está mapeada milimétricamente. Encuentra esa joya oculta antes de que alguien más descubra su ubicación.
                  </p>
                </div>
                <div className="flex-1 w-full max-w-md perspective-1000">
                  <div className="bg-surface/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-4 overflow-hidden relative h-[320px] transform transition-all duration-700 hover:-translate-y-2 hover:-rotate-1 hover:shadow-brand/20 group">
                    <div className="absolute inset-0 bg-muted/10 opacity-50" style={{ backgroundImage: 'radial-gradient(var(--color-border) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
                    
                    <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-4 h-4 bg-brand rounded-full border-2 border-white shadow-lg"></div>
                    </div>
                    <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-brand rounded-full border-2 border-white shadow-lg"></div>
                    </div>
                    
                    <div className="absolute top-1/3 left-1/3 bg-white p-3 rounded-xl shadow-xl border border-border w-48 z-10">
                      <div className="w-full h-20 bg-muted/20 rounded-lg mb-2"></div>
                      <p className="font-bold text-sm">$150,000</p>
                      <p className="text-xs text-muted">Casa Moderna</p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>

            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="w-full bg-foreground text-background py-24 md:py-32 lg:py-40 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-brand blur-[150px] rounded-full opacity-20 pointer-events-none"></div>
          
          <RevealOnScroll className="max-w-4xl mx-auto px-6 text-center space-y-10 relative z-10">
            <div className="inline-block mb-4">
              <span className="px-6 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white/80 font-semibold tracking-widest uppercase text-sm">
                Únete al Futuro
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              ¿Eres Corredor? <br/>
              Multiplica tu rentabilidad.
            </h2>
            <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Cero comisiones por venta. Perfil verificado, pagos instantáneos y control total sobre tus clientes. Únete al estándar del futuro hoy mismo.
            </p>
            <div className="pt-8">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-3 px-10 py-5 bg-brand text-white font-bold rounded-2xl hover:bg-brand-light hover:text-foreground transition-colors text-xl"
              >
                Crear Cuenta de Corredor
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </RevealOnScroll>
        </section>

      </main>
    </div>
  );
}
