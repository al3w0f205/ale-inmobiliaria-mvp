'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminRevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/chart_data`, {
          credentials: 'include'
        });
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="h-72 flex items-center justify-center text-muted animate-pulse">Cargando gráfico...</div>;
  }

  if (data.length === 0) {
    return <div className="h-72 flex items-center justify-center text-muted border border-dashed border-border rounded-xl">No hay suficientes datos financieros aún.</div>;
  }

  return (
    <div className="h-80 w-full font-sans">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F46633" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#F46633" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(var(--surface-rgb), 0.8)', 
              backdropFilter: 'blur(16px)',
              borderColor: 'var(--border)',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
              color: 'var(--foreground)',
              fontWeight: 'bold',
              border: '1px solid var(--border)'
            }}
            itemStyle={{ color: 'var(--foreground)', fontWeight: '900', fontSize: '1.25rem' }}
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Ingresos']}
            labelStyle={{ color: 'var(--muted)', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#F46633" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            activeDot={{ r: 8, fill: '#F46633', stroke: 'var(--surface)', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
