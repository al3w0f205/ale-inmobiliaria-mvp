'use client';

import React from 'react';
import { ChartPoint } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AdminDashboardChartProps {
  chartData: ChartPoint[];
}

export default function AdminDashboardChart({ chartData }: AdminDashboardChartProps) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted border-2 border-dashed border-border rounded-2xl">
        <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="font-semibold">No hay datos de ingresos en este periodo.</p>
      </div>
    );
  }

  return (
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
  );
}
