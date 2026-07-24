'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para la calculadora de comisiones
  const [propertyPrice, setPropertyPrice] = useState(150000);
  const [commissionRate, setCommissionRate] = useState(3); // 3% comisión promedio

  // FAQ State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/properties/`);
        if (res.ok) {
          const data = await res.json();
          setProperties(data.slice(0, 2));
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const savedAmount = (propertyPrice * commissionRate) / 100;

  const faqs = [
    {
      q: '¿Cómo funciona el trato directo en LibreCasa?',
      a: 'LibreCasa no actúa como intermediario. Los compradores interesados se conectan directamente con los corredores a través de WhatsApp o nuestro chat interno para negociar y coordinar visitas, sin comisiones por venta.'
    },
    {
      q: '¿El uso de la plataforma es realmente gratuito?',
      a: 'Sí, registrarte y explorar propiedades es 100% gratuito. Para los corredores que desean publicar anuncios de forma ilimitada, ofrecemos planes premium a un precio fijo mensual muy accesible.'
    },
    {
      q: '¿Qué es el sello de Identidad Verificada?',
      a: 'Es una insignia que otorgamos a los corredores después de que validamos su cédula de identidad de forma manual en nuestro panel administrativo. Esto asegura un ecosistema confiable y seguro para todos.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070913] text-foreground flex flex-col selection:bg-brand/20 selection:text-brand relative overflow-x-hidden">
      
      {/* Header Global Persistente */}
      <header className="sticky top-0 z-50 bg-[#070913]/70 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-lg shadow-brand/30">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
              <path d="M2 10L12 2L22 10V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12H15M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-xl font-black text-white tracking-tight">LibreCasa</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-xs font-bold text-white/80 hover:text-white uppercase tracking-widest transition-colors">Portal</Link>
          <Link href="/properties" className="px-5 py-2.5 bg-brand text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-brand-light hover:text-foreground transition-all shadow-lg shadow-brand/10 hover:shadow-brand/20 active:scale-95">Catálogo</Link>
        </div>
      </header>

      {/* Luces de Fondo (Aurora) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[40vh] left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid de Fondo Tecnológico */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20"></div>

      {/* FOLD 1: HERO SPLIT LAYOUT */}
      <main className="w-full max-w-[1600px] mx-auto px-4 py-8 md:px-8 md:py-12 flex-none flex flex-col lg:grid lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* COLUMNA IZQUIERDA: HERO CARD */}
        <section className="lg:col-span-5 flex flex-col justify-end rounded-[2.5rem] overflow-hidden relative border border-white/10 min-h-[70vh] lg:min-h-[85vh] bg-cover bg-center shadow-2xl group" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/95 z-0"></div>

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
              <a href="#proceso" className="px-6 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-xs uppercase tracking-widest">
                Cómo Funciona
              </a>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA: SECCIONES RAPIDAS */}
        <section className="lg:col-span-7 flex flex-col justify-between gap-8">
          
          <div className="p-8 rounded-[2rem] bg-[#0c0f1e]/40 border border-white/5 shadow-2xl relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-brand/5 to-blue-500/5 opacity-50 pointer-events-none"></div>
            <p className="text-base md:text-xl font-bold tracking-wide text-white/90 text-center leading-relaxed max-w-2xl relative z-10">
              &ldquo;Diseñado para eliminar el ruido del mercado. Negociaciones transparentes, mapas precisos y comunicación instantánea.&rdquo;
            </p>
          </div>

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
              {loading ? (
                <div className="col-span-2 py-12 text-center text-muted animate-pulse">Cargando propiedades...</div>
              ) : properties.length > 0 ? (
                properties.map((prop: any) => (
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 p-6 rounded-[2rem] bg-[#0b0e1b]/70 border border-white/5 flex flex-col justify-between shadow-xl">
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

            <div className="md:col-span-7 p-6 rounded-[2rem] bg-gradient-to-br from-brand/10 to-blue-600/5 border border-brand/20 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white tracking-tight leading-none">
                  Multiplica tu <span className="text-brand">rentabilidad.</span>
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-medium">
                  Cero comisiones por venta. Perfil verificado, pagos inmediatos y control absoluto sobre tus clientes.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-all text-xs uppercase tracking-widest active:scale-95 w-full md:w-auto">
                  Crear Cuenta
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          </div>

        </section>
      </main>

      {/* FOLD 2: CÓMO FUNCIONA (SCROLLABLE CONTENT) */}
      <section id="proceso" className="w-full py-24 md:py-32 bg-[#090b16] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">El Camino Más Corto a tu Nuevo Hogar</h2>
            <p className="text-muted text-base md:text-lg font-medium">Olvídate de las trabas burocráticas y comisiones abusivas. LibreCasa agiliza cada paso.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="p-8 rounded-[2rem] bg-[#0c0f1e]/60 border border-white/5 space-y-4 hover:border-brand/35 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-xl group-hover:bg-brand group-hover:text-white transition-all">
                01
              </div>
              <h3 className="text-xl font-bold text-white">Explora el Catálogo</h3>
              <p className="text-sm text-muted leading-relaxed font-medium">
                Navega en un mapa preciso sin anuncios molestos ni listados duplicados. Encuentra opciones reales cargadas directamente.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="p-8 rounded-[2rem] bg-[#0c0f1e]/60 border border-white/5 space-y-4 hover:border-brand/35 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-xl group-hover:bg-brand group-hover:text-white transition-all">
                02
              </div>
              <h3 className="text-xl font-bold text-white">Trato Directo Inmediato</h3>
              <p className="text-sm text-muted leading-relaxed font-medium">
                Accede al WhatsApp o envía un mensaje interno directo al corredor para hacer preguntas o coordinar una visita al instante.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="p-8 rounded-[2rem] bg-[#0c0f1e]/60 border border-white/5 space-y-4 hover:border-brand/35 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-xl group-hover:bg-brand group-hover:text-white transition-all">
                03
              </div>
              <h3 className="text-xl font-bold text-white">Cero Comisiones por Venta</h3>
              <p className="text-sm text-muted leading-relaxed font-medium">
                Al conectar directamente, se eliminan los intermediarios tradicionales. Todo el valor del inmueble permanece contigo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOLD 3: CALCULADORA DE COMISIONES */}
      <section className="w-full py-24 md:py-32 bg-[#070913] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Texto de Calculadora */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-black uppercase text-brand tracking-widest">¿Por qué usar LibreCasa?</span>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">Mira cuánto puedes ahorrar</h2>
              <p className="text-muted leading-relaxed font-medium">
                Las agencias inmobiliarias tradicionales cobran hasta el 5% del valor total de la transacción. Con LibreCasa, conectas de forma directa y ahorras ese dinero por completo.
              </p>
            </div>

            {/* Interfaz de Calculadora */}
            <div className="lg:col-span-7 p-8 md:p-10 rounded-[2.5rem] bg-[#0b0e1b]/80 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-2xl"></div>
              
              <div className="space-y-8">
                {/* Control de Precio */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-white">Valor de la Propiedad</span>
                    <span className="font-black text-brand text-lg font-mono">${propertyPrice.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="50000" 
                    max="600000" 
                    step="5000"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand"
                  />
                  <div className="flex justify-between text-[10px] text-muted font-bold font-mono">
                    <span>$50K</span>
                    <span>$300K</span>
                    <span>$600K</span>
                  </div>
                </div>

                {/* Control de % Comisión */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-white">% Comisión Tradicional</span>
                    <span className="font-black text-brand text-lg font-mono">{commissionRate}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="6" 
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand"
                  />
                  <div className="flex justify-between text-[10px] text-muted font-bold font-mono">
                    <span>2%</span>
                    <span>4%</span>
                    <span>6%</span>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full"></div>

                {/* Resultado de Ahorro */}
                <div className="flex items-center justify-between p-6 rounded-2xl bg-brand/5 border border-brand/20">
                  <div>
                    <p className="text-[10px] font-black uppercase text-brand tracking-widest mb-1">Tu Ahorro Estimado</p>
                    <p className="text-xs text-muted font-medium">Al no pagar comisión de corretaje</p>
                  </div>
                  <p className="text-3xl md:text-4xl font-black text-green-400 font-mono">${savedAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOLD 4: FAQ (PREGUNTAS FRECUENTES) */}
      <section className="w-full py-24 md:py-32 bg-[#090b16] border-t border-white/5 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-muted font-medium">Todo lo que necesitas saber sobre nuestra plataforma.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="p-6 rounded-2xl bg-[#0c0f1e]/60 border border-white/5 hover:border-brand/25 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm md:text-base text-white">{faq.q}</h3>
                  <svg className={`w-5 h-5 text-muted transition-transform duration-300 ${activeFaq === index ? 'rotate-180 text-brand' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {activeFaq === index && (
                  <p className="mt-4 text-xs md:text-sm text-muted leading-relaxed font-medium transition-all animate-in fade-in slide-in-from-top-2">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOLD 5: FOOTER */}
      <footer className="w-full py-12 bg-[#070913] border-t border-white/5 text-center text-muted relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-black text-sm">L</div>
            <span className="font-black text-white tracking-tight text-sm">LibreCasa</span>
          </div>
          <p className="text-xs font-medium">© {new Date().getFullYear()} LibreCasa. Todos los derechos reservados.</p>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
            <Link href="/properties" className="hover:text-white transition-colors">Propiedades</Link>
            <Link href="/login" className="hover:text-white transition-colors">Portal</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
