import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-brand/20 selection:text-brand relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Header />

      <main className="flex-1 flex flex-col justify-center items-center px-6 relative z-10">
        <section className="w-full max-w-5xl mx-auto py-20 md:py-32 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand text-sm font-semibold tracking-wide border border-brand/20">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              MVP Inmobiliario v1.0
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              El nuevo estándar para <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">conectar hogares.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl mx-auto md:mx-0">
              Descubre, publica y gestiona propiedades con una experiencia moderna. Diseñado para simplificar el proceso inmobiliario tanto para corredores como para compradores.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-brand text-white font-semibold rounded-2xl hover:bg-brand-hover hover:shadow-xl hover:shadow-brand/20 transition-all active:scale-95 text-center text-lg flex items-center justify-center gap-2"
              >
                Ingresar al Portal
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden glass border border-border/50 shadow-2xl relative z-10 group">
              <img 
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" 
                alt="Propiedad Moderna" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <div className="glass p-5 rounded-2xl border border-white/10 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-1">Rápido. Seguro.</h3>
                  <p className="text-sm text-white/80">Conecta directamente con corredores verificados y descubre tu próximo hogar.</p>
                </div>
              </div>
            </div>
            
            {/* Decoración flotante */}
            <div className="absolute -top-6 -right-6 glass p-4 rounded-2xl border border-border/50 shadow-xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                  <p className="text-xs text-muted font-medium">Comisión 0%</p>
                  <p className="text-sm font-bold text-foreground">Trato Directo</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Ventajas Competitivas / Por qué elegirnos */}
        <section className="w-full max-w-6xl mx-auto py-24 md:py-32 relative z-10 border-t border-border/50">
          <div className="text-center mb-16 md:mb-24 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              No es solo buscar casa. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">Es encontrarla de forma inteligente.</span>
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Diseñamos este MVP no para ser uno más del montón, sino para destruir las fricciones clásicas del mercado inmobiliario. Menos intermediarios innecesarios, más herramientas de poder para ti.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Ventaja 1 */}
            <div className="flex flex-col gap-4 p-8 rounded-3xl bg-surface/50 border border-border/50 hover:bg-surface hover:border-brand/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground">Tratos sin ruido</h3>
              <p className="text-muted leading-relaxed">
                Olvida las interminables cadenas de correos y llamadas ignoradas. Nuestro sistema de mensajería interna y WhatsApp integrado te pone cara a cara con el corredor en segundos. Velocidad pura.
              </p>
            </div>

            {/* Ventaja 2 */}
            <div className="flex flex-col gap-4 p-8 rounded-3xl bg-surface/50 border border-border/50 hover:bg-surface hover:border-brand/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-4-4"/></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground">Visión Geográfica Real</h3>
              <p className="text-muted leading-relaxed">
                Navega el mercado como un estratega. Cada propiedad está mapeada milimétricamente con tecnología PostGIS. Encuentra esa joya oculta antes de que alguien más descubra su ubicación.
              </p>
            </div>

            {/* Ventaja 3 */}
            <div className="flex flex-col gap-4 p-8 rounded-3xl bg-surface/50 border border-border/50 hover:bg-surface hover:border-brand/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground">Foco en la rentabilidad</h3>
              <p className="text-muted leading-relaxed">
                Tanto si compras como si publicas, la eficiencia es dinero. Perfil de corredor verificado, pagos instantáneos con Payphone y analíticas claras. Hacemos que el negocio fluya sin fricción.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
