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
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/stats/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
          <p className="text-muted mt-2">Visión general del estado financiero y operativo de la plataforma.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
          {/* Main Chart */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Crecimiento de Ingresos</h2>
                  <p className="text-sm text-muted mt-1">Últimos 30 días</p>
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
          <div className="space-y-6">
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">Demografía de Usuarios</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted">Corredores Registrados</span>
                    <span className="font-semibold">{stats.total_brokers}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 border border-border">
                    <div className="bg-brand h-2 rounded-full" style={{ width: `${(stats.total_brokers / (stats.total_brokers + stats.total_clients)) * 100 || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted">Clientes Buscadores</span>
                    <span className="font-semibold">{stats.total_clients}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 border border-border">
                    <div className="bg-foreground/20 h-2 rounded-full" style={{ width: `${(stats.total_clients / (stats.total_brokers + stats.total_clients)) * 100 || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand to-brand-hover p-6 rounded-2xl shadow-lg text-white">
              <h3 className="text-lg font-bold mb-2">Sistema en Producción</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Todas las transacciones y pagos reflejados en este panel están en vivo. 
                Recuerda revisar los comprobantes antes de aprobar pagos manuales.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
