'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Mi Portfolio', href: '/dashboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    )},
    { name: 'Mensajes', href: '/dashboard/messages', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    )},
    { name: 'Publicar Propiedad', href: '/publish', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-brand/20 selection:text-brand">
      <Header />
      
      <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Premium */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="sticky top-24 bg-surface/80 backdrop-blur-2xl border border-border rounded-3xl p-4 shadow-2xl shadow-brand/5 space-y-2">
            <div className="px-4 py-4 mb-2">
              <p className="text-xs font-black text-brand uppercase tracking-widest mb-1">Panel de Control</p>
              <h2 className="text-2xl font-black tracking-tight text-foreground">Broker Center</h2>
            </div>
            
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold ${
                    isActive 
                      ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                      : 'text-muted hover:bg-muted/10 hover:text-foreground'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-muted'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}

            <div className="mt-8 pt-8 border-t border-border/50 px-4">
              <div className="bg-brand/5 rounded-2xl p-4 border border-brand/10">
                <p className="text-sm font-bold text-foreground mb-1">Plan Pro</p>
                <p className="text-xs text-muted font-medium mb-3">0% Comisión por venta.</p>
                <Link href="/checkout" className="text-xs font-black text-brand hover:underline">Gestionar Suscripción →</Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
        
      </div>
    </div>
  );
}
