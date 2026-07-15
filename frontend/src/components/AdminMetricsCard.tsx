import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  isPositive?: boolean;
}

export default function AdminMetricsCard({ title, value, icon, trend, isPositive }: Props) {
  return (
    <div className="bg-surface/80 backdrop-blur-2xl border border-border p-8 rounded-[2rem] shadow-2xl shadow-brand/5 hover:shadow-brand/10 transition-all duration-500 relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/10 rounded-full blur-[40px] group-hover:bg-brand/20 group-hover:scale-110 transition-all duration-700 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/5 rounded-full blur-[40px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xs font-black text-muted uppercase tracking-widest">{title}</h3>
        <span className="text-2xl bg-white p-3 rounded-2xl border border-border shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{icon}</span>
      </div>
      
      <div className="relative z-10">
        <p className="text-5xl font-black tracking-tighter text-foreground mb-3">{value}</p>
        
        {trend && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border">
            <span className={`inline-block w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
            <p className={`text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '↑' : '↓'} {trend}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
