'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import AdminPaymentsTable from '@/components/AdminPaymentsTable';
import { AdminStats, ChartPoint, User, Property } from '@/types';

const AdminDashboardChart = dynamic(() => import('@/components/AdminDashboardChart'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-muted animate-pulse">Cargando estadísticas de ingresos...</div>
});


export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para pestañas y gestión
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'users' | 'properties'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const resMe = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, { credentials: 'include' });
        
        if (!resMe.ok) {
          router.push('/login');
          return;
        }

        const user = await resMe.json();
        
        // Validar privilegios de administrador antes de hacer más peticiones
        if (!user.is_staff && !user.is_superuser) {
          router.push('/');
          return;
        }

        // Ejecutar las llamadas de estadísticas en paralelo solo si está autenticado y es admin
        const [resStats, resChart] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/stats/`, { credentials: 'include' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/chart_data/`, { credentials: 'include' })
        ]);

        if (resStats.ok && resChart.ok) {
          const dataStats = await resStats.json();
          const dataChart = await resChart.json();
          setStats(dataStats);
          setChartData(dataChart);
        } else {
          setError('Error al cargar datos administrativos del servidor.');
        }
      } catch (err) {
        setError('Error de red al cargar el dashboard de administración.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [router]);


  // Carga de datos de pestañas activas
  useEffect(() => {
    if (activeTab === 'users') {
      const fetchUsers = async () => {
        setUsersLoading(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/users/`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setUsers(data);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setUsersLoading(false);
        }
      };
      fetchUsers();
    } else if (activeTab === 'properties') {
      const fetchProperties = async () => {
        setPropertiesLoading(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/properties/`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setProperties(data);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setPropertiesLoading(false);
        }
      };
      fetchProperties();
    }
  }, [activeTab]);

  const handleToggleUserActive = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/${id}/toggle_user_active/`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === id ? { ...u, is_active: data.is_active } : u));
      } else {
        const data = await res.json();
        alert(data.error || 'Error al modificar estado de usuario');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePropertyPublished = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/${id}/toggle_property_published/`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setProperties(properties.map(p => p.id === id ? { ...p, is_published: data.is_published } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleUserVerification = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/${id}/toggle_user_verification/`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === id ? { ...u, identity_verified: data.identity_verified } : u));
      }
    } catch (e) {
      console.error(e);
    }
  };

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

        {/* Tabs Navigation */}
        <div className="flex border-b border-border mb-8 gap-6 text-sm font-bold overflow-x-auto pb-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`pb-4 border-b-2 transition-all ${activeTab === 'overview' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-foreground'}`}
          >
            Resumen
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`pb-4 border-b-2 transition-all ${activeTab === 'payments' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-foreground'}`}
          >
            Pagos
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-4 border-b-2 transition-all ${activeTab === 'users' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-foreground'}`}
          >
            Usuarios
          </button>
          <button 
            onClick={() => setActiveTab('properties')}
            className={`pb-4 border-b-2 transition-all ${activeTab === 'properties' ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-foreground'}`}
          >
            Propiedades
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
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
                <AdminDashboardChart chartData={chartData} />
              </div>
            </section>
          </>
        )}

        {activeTab === 'payments' && (
          <section>
            <AdminPaymentsTable />
          </section>
        )}

        {activeTab === 'users' && (
          <section>
            {usersLoading ? (
              <div className="p-12 text-center text-muted animate-pulse">Cargando usuarios...</div>
            ) : (
              <div className="bg-surface/80 backdrop-blur-2xl border border-border rounded-[2rem] overflow-hidden shadow-2xl shadow-brand/5">
                <div className="p-6 border-b border-border bg-background/50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-foreground tracking-tight">Gestión de Usuarios</h3>
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">{users.length} Cuentas</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted uppercase bg-background border-b border-border">
                      <tr>
                        <th className="px-6 py-5 font-black tracking-widest">Usuario / Email</th>
                        <th className="px-6 py-5 font-black tracking-widest">Cédula</th>
                        <th className="px-6 py-5 font-black tracking-widest">Rol</th>
                        <th className="px-6 py-5 font-black tracking-widest">Fecha Registro</th>
                        <th className="px-6 py-5 font-black tracking-widest">Estado</th>
                        <th className="px-6 py-5 font-black tracking-widest">Verificación</th>
                        <th className="px-6 py-5 font-black tracking-widest text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-background/80 transition-colors group">
                          <td className="px-6 py-5">
                            <span className="block font-black text-foreground">{u.username}</span>
                            <span className="text-xs text-muted font-bold font-mono tracking-wider">{u.email}</span>
                          </td>
                          <td className="px-6 py-5 font-bold text-foreground">
                            {u.cedula || 'N/A'}
                          </td>
                          <td className="px-6 py-5 font-bold text-muted capitalize">
                            {u.user_type === 'broker' ? 'Corredor' : 'Cliente'}
                          </td>
                          <td className="px-6 py-5 font-bold text-muted">
                            {u.date_joined}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 text-xs font-black tracking-widest uppercase rounded-lg border ${
                              u.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                              {u.is_active ? 'Activo' : 'Desactivado'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 text-xs font-black tracking-widest uppercase rounded-lg border ${
                              u.identity_verified ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                              {u.identity_verified ? 'Verificado' : 'Sin Verificar'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                            <button 
                              onClick={() => handleToggleUserActive(u.id)}
                              className={`px-4 py-2 text-xs font-black uppercase tracking-widest border rounded-xl transition-all active:scale-95 ${
                                u.is_active ? 'text-red-500 bg-red-500/10 hover:bg-red-50 hover:text-white border-red-500/20' : 'text-green-500 bg-green-500/10 hover:bg-green-50 hover:text-white border-green-500/20'
                              }`}
                            >
                              {u.is_active ? 'Desactivar' : 'Activar'}
                            </button>
                            <button 
                              onClick={() => handleToggleUserVerification(u.id)}
                              className={`px-4 py-2 text-xs font-black uppercase tracking-widest border rounded-xl transition-all active:scale-95 ${
                                u.identity_verified ? 'text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500 hover:text-white border-yellow-500/20' : 'text-green-500 bg-green-500/10 hover:bg-green-50 hover:text-white border-green-500/20'
                              }`}
                            >
                              {u.identity_verified ? 'Desverificar' : 'Verificar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-muted">
                            No hay usuarios registrados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'properties' && (
          <section>
            {propertiesLoading ? (
              <div className="p-12 text-center text-muted animate-pulse">Cargando propiedades...</div>
            ) : (
              <div className="bg-surface/80 backdrop-blur-2xl border border-border rounded-[2rem] overflow-hidden shadow-2xl shadow-brand/5">
                <div className="p-6 border-b border-border bg-background/50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-foreground tracking-tight">Control de Inmuebles</h3>
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">{properties.length} Propiedades</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted uppercase bg-background border-b border-border">
                      <tr>
                        <th className="px-6 py-5 font-black tracking-widest">Propiedad</th>
                        <th className="px-6 py-5 font-black tracking-widest">Precio</th>
                        <th className="px-6 py-5 font-black tracking-widest">Creador (Email)</th>
                        <th className="px-6 py-5 font-black tracking-widest">Vistas</th>
                        <th className="px-6 py-5 font-black tracking-widest">Estado</th>
                        <th className="px-6 py-5 font-black tracking-widest text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {properties.map((p) => (
                        <tr key={p.id} className="hover:bg-background/80 transition-colors group">
                          <td className="px-6 py-5">
                            <span className="block font-black text-foreground">{p.title}</span>
                            <span className="text-xs text-muted font-bold font-mono tracking-wider capitalize">{p.property_type}</span>
                          </td>
                          <td className="px-6 py-5 font-black text-foreground text-lg">
                            ${p.price}
                          </td>
                          <td className="px-6 py-5 font-bold text-muted">
                            {p.broker?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-5 font-bold text-muted">
                            {p.views_count}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1.5 text-xs font-black tracking-widest uppercase rounded-lg border ${
                              p.is_published ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                              {p.is_published ? 'Publicado' : 'Oculto'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleTogglePropertyPublished(p.id)}
                              className={`px-4 py-2 text-xs font-black uppercase tracking-widest border rounded-xl transition-all active:scale-95 ${
                                p.is_published ? 'text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500 hover:text-white border-yellow-500/20' : 'text-green-500 bg-green-500/10 hover:bg-green-50 hover:text-white border-green-500/20'
                              }`}
                            >
                              {p.is_published ? 'Ocultar' : 'Publicar'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {properties.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-muted">
                            No hay propiedades registradas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
