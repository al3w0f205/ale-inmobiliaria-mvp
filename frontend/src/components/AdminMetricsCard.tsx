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
    <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/5 rounded-full blur-3xl group-hover:bg-brand/10 transition-colors pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-sm font-medium text-muted">{title}</h3>
        <span className="text-2xl bg-background p-2 rounded-lg border border-border/50">{icon}</span>
      </div>
      
      <div className="relative z-10">
        <p className="text-3xl font-bold text-foreground">{value}</p>
        
        {trend && (
          <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} />
            {isPositive ? '+' : '-'}{trend}
          </p>
        )}
      </div>
    </div>
  );
}
