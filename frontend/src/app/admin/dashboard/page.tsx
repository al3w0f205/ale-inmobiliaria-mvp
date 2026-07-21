'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AdminPaymentsTable from '@/components/AdminPaymentsTable';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AdminStats {
  total_revenue: number;
  total_brokers: number;
  total_clients: number;
  active_subscriptions: number;
  published_properties: number;
  pending_payments: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [resMe, resStats, resChart] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, { credentials: 'include' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/stats/`, { credentials: 'include' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/chart_data/`, { credentials: 'include' })
        ]);

        if (resMe.ok) {
          const user = await resMe.json();
          if (resStats.ok && resChart.ok) {
            const dataStats = await resStats.json();
            const dataChart = await resChart.json();
            setStats(dataStats);
            setChartData(dataChart);
          } else {
            router.push('/');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        setError('Error de red al cargar el dashboard de administración.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background selection:bg-brand/20 selection:text-brand">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 px-6 py-4 rounded-2xl max-w-lg text-center">
            <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
            <p className="font-medium text-sm">{error || 'No tienes permisos de administrador para visualizar esta página.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-brand/20 selection:text-brand">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Platform Overview</h1>
          <p className="text-muted text-lg font-medium">Control general, ingresos y crecimiento de usuarios.</p>
        </header>

        {/* KPIs Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Ingresos */}
          <div className="p-8 rounded-[2.5rem] bg-surface border border-border shadow-2xl shadow-brand/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Ingresos Totales (30d)</p>
              <p className="text-5xl font-black tracking-tighter text-brand">${stats.total_revenue}</p>
            </div>
          </div>
          
          {/* Suscripciones */}
          <div className="p-8 rounded-[2.5rem] bg-surface border border-border shadow-2xl shadow-brand/5">
            <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Suscripciones Activas</p>
            <p className="text-5xl font-black tracking-tighter">{stats.active_subscriptions}</p>
          </div>

          {/* Pagos Pendientes */}
          <div className={`p-8 rounded-[2.5rem] border shadow-2xl ${stats.pending_payments > 0 ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 shadow-[#f59e0b]/10' : 'bg-surface border-border shadow-brand/5'}`}>
            <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${stats.pending_payments > 0 ? 'text-[#b45309]' : 'text-muted'}`}>Pagos Pendientes</p>
            <p className={`text-5xl font-black tracking-tighter ${stats.pending_payments > 0 ? 'text-[#b45309]' : 'text-foreground'}`}>{stats.pending_payments}</p>
          </div>

          {/* Corredores */}
          <div className="p-8 rounded-[2.5rem] bg-surface border border-border shadow-2xl shadow-brand/5">
            <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Corredores Registrados</p>
            <p className="text-5xl font-black tracking-tighter">{stats.total_brokers}</p>
          </div>

          {/* Clientes */}
          <div className="p-8 rounded-[2.5rem] bg-surface border border-border shadow-2xl shadow-brand/5">
            <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Clientes Registrados</p>
            <p className="text-5xl font-black tracking-tighter">{stats.total_clients}</p>
          </div>

          {/* Propiedades */}
          <div className="p-8 rounded-[2.5rem] bg-surface border border-border shadow-2xl shadow-brand/5">
            <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Propiedades Publicadas</p>
            <p className="text-5xl font-black tracking-tighter">{stats.published_properties}</p>
          </div>
        </section>

        {/* Charts Section */}
        <section className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-2xl shadow-brand/5">
          <div className="mb-8 flex items-center justify-between">
             <div>
               <h2 className="text-2xl font-black tracking-tight">Evolución de Ingresos</h2>
               <p className="text-muted font-medium text-sm">Últimos 30 días</p>
             </div>
          </div>
          
          <div className="h-[400px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--muted)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--muted)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--surface)', 
                      borderColor: 'var(--border)', 
                      borderRadius: '1rem',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                    }} 
                    itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                    labelStyle={{ color: 'var(--muted)', marginBottom: '0.25rem' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--brand)" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted border-2 border-dashed border-border rounded-2xl">
                <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-semibold">No hay datos de ingresos en este periodo.</p>
              </div>
            )}
          </div>
        </section>

        {/* Pagos Recientes */}
        <section className="mt-12">
          <AdminPaymentsTable />
        </section>
      </main>
    </div>
  );
}
