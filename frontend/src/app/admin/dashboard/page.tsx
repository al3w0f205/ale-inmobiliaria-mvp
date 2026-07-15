'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AdminMetricsCard from '@/components/AdminMetricsCard';
import AdminPaymentsTable from '@/components/AdminPaymentsTable';
import AdminRevenueChart from '@/components/AdminRevenueChart';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/stats`, {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          // If 401/403, redirect to home
          router.push('/');
        }
      } catch (error) {
        console.error(error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 selection:bg-brand/20 selection:text-brand relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full"></div>
      </div>

      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">Panel de Administración</h1>
          <p className="text-muted mt-3 text-lg font-medium">Visión general del estado financiero y operativo de la plataforma.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <AdminMetricsCard 
            title="Ingresos Totales" 
            value={`$${stats.total_revenue?.toFixed(2) || '0.00'}`} 
            icon="💰" 
            trend="12% vs mes anterior"
            isPositive={true}
          />
          <AdminMetricsCard 
            title="Pagos Pendientes" 
            value={stats.pending_payments} 
            icon="⏳" 
            trend="Atención requerida"
            isPositive={false}
          />
          <AdminMetricsCard 
            title="Suscripciones Activas" 
            value={stats.active_subscriptions} 
            icon="⭐" 
            trend="Estable"
            isPositive={true}
          />
          <AdminMetricsCard 
            title="Propiedades Publicadas" 
            value={stats.published_properties} 
            icon="🏠" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <div className="bg-surface/80 backdrop-blur-2xl border border-border p-8 rounded-[2rem] shadow-2xl shadow-brand/5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Crecimiento de Ingresos</h2>
                  <p className="text-sm text-muted mt-1 font-bold uppercase tracking-widest">Últimos 30 días</p>
                </div>
              </div>
              <AdminRevenueChart />
            </div>
            
            {/* Payments Table */}
            <div>
              <div className="flex items-center justify-between mb-4 mt-8">
                <h2 className="text-xl font-bold text-foreground">Gestión de Pagos</h2>
                <span className="text-sm px-3 py-1 bg-brand/10 text-brand font-medium rounded-full">Recientes</span>
              </div>
              <AdminPaymentsTable />
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-8">
            <div className="bg-surface/80 backdrop-blur-2xl border border-border p-8 rounded-[2rem] shadow-2xl shadow-brand/5">
              <h3 className="text-xl font-black text-foreground mb-6 tracking-tight">Demografía</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
                    <span className="text-muted">Corredores Registrados</span>
                    <span className="text-foreground">{stats.total_brokers}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-3 border border-border overflow-hidden">
                    <div className="bg-brand h-full" style={{ width: `${(stats.total_brokers / (stats.total_brokers + stats.total_clients)) * 100 || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
                    <span className="text-muted">Clientes Buscadores</span>
                    <span className="text-foreground">{stats.total_clients}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-3 border border-border overflow-hidden">
                    <div className="bg-accent h-full" style={{ width: `${(stats.total_clients / (stats.total_brokers + stats.total_clients)) * 100 || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative p-8 rounded-[2rem] overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand to-accent opacity-90 transition-opacity group-hover:opacity-100"></div>
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
              <div className="relative z-10 text-white">
                <h3 className="text-xl font-black mb-3 tracking-tight flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Sistema en Producción
                </h3>
                <p className="text-sm font-medium text-white/90 leading-relaxed">
                  Todas las transacciones y pagos reflejados en este panel están en vivo. 
                  Recuerda revisar cuidadosamente los comprobantes antes de aprobar pagos manuales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
