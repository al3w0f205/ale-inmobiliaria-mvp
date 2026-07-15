'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPaymentsTable() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${id}/${action}`, {
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
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted uppercase bg-background border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">ID / Ref</th>
              <th className="px-6 py-4 font-medium">Monto</th>
              <th className="px-6 py-4 font-medium">Método</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="block font-medium text-foreground">Pago #{p.id}</span>
                  {p.transaction_id && <span className="text-xs text-muted font-mono">{p.transaction_id}</span>}
                </td>
                <td className="px-6 py-4 font-bold text-foreground">
                  ${p.amount}
                </td>
                <td className="px-6 py-4">
                  {p.payment_method}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    p.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 
                    p.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {p.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => handleAction(p.id, 'approve')}
                        className="px-3 py-1.5 text-xs font-medium text-green-500 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors"
                      >
                        Aprobar
                      </button>
                      <button 
                        onClick={() => handleAction(p.id, 'reject')}
                        className="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {p.status !== 'PENDING' && (
                    <span className="text-xs text-muted">Sin acciones</span>
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
