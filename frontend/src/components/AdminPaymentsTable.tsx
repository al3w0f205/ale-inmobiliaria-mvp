'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPaymentsTable() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${id}/${action}/`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        fetchPayments(); // Reload list
      } else {
        alert('Error al realizar la acción. Revisa consola.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted animate-pulse">Cargando pagos...</div>;

  return (
    <div className="bg-surface/80 backdrop-blur-2xl border border-border rounded-[2rem] overflow-hidden shadow-2xl shadow-brand/5">
      <div className="p-6 border-b border-border bg-background/50 flex justify-between items-center">
        <h3 className="text-xl font-black text-foreground tracking-tight">Pagos Recientes</h3>
        <span className="text-xs font-bold text-muted uppercase tracking-widest">{payments.length} Registros</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted uppercase bg-background border-b border-border">
            <tr>
              <th className="px-6 py-5 font-black tracking-widest">ID / Ref</th>
              <th className="px-6 py-5 font-black tracking-widest">Monto</th>
              <th className="px-6 py-5 font-black tracking-widest">Método</th>
              <th className="px-6 py-5 font-black tracking-widest">Estado</th>
              <th className="px-6 py-5 font-black tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-background/80 transition-colors group">
                <td className="px-6 py-5">
                  <span className="block font-black text-foreground">Pago #{p.id}</span>
                  {p.transaction_id && <span className="text-xs text-muted font-bold font-mono tracking-wider">{p.transaction_id}</span>}
                </td>
                <td className="px-6 py-5 font-black text-foreground text-lg">
                  ${p.amount}
                </td>
                <td className="px-6 py-5 font-bold text-muted">
                  {p.payment_method}
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1.5 text-xs font-black tracking-widest uppercase rounded-lg border ${
                    p.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    p.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleAction(p.id, 'approve')}
                        className="px-4 py-2 text-xs font-black uppercase tracking-widest text-green-500 bg-green-500/10 hover:bg-green-500 hover:text-white border border-green-500/20 rounded-xl transition-all active:scale-95"
                      >
                        Aprobar
                      </button>
                      <button 
                        onClick={() => handleAction(p.id, 'reject')}
                        className="px-4 py-2 text-xs font-black uppercase tracking-widest text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all active:scale-95"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {p.status !== 'PENDING' && (
                    <span className="text-xs font-bold text-muted uppercase tracking-widest">S/A</span>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted">
                  No hay pagos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
