'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function CheckoutPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'payphone' | 'deuna' | 'transfer'>('payphone');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManualPayment = async (method: 'DEUNA' | 'TRANSFER') => {
    if (!file) {
      alert('Por favor adjunta tu comprobante de pago.');
      return;
    }

    setIsSubmitting(true);
    const username = localStorage.getItem('username');
    
    if (!username) {
      router.push('/login');
      return;
    }

    const formData = new FormData();
    formData.append('amount', '29.99');
    formData.append('payment_method', method);
    formData.append('receipt_image', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (res.ok) {
        alert('Comprobante enviado exitosamente. Un administrador lo revisará pronto.');
        router.push('/dashboard');
      } else {
        alert('Hubo un error al enviar tu comprobante.');
      }
    } catch (err) {
      alert('Error de conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayPhoneClick = async () => {
    setIsSubmitting(true);
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Here we would integrate the actual PayPhone button with data.clientTxId and data.amount
        alert(`ID de Transacción PayPhone generado: ${data.clientTxId}. (Simulación exitosa)`);
      } else {
        alert('Error conectando con Payphone.');
      }
    } catch (err) {
      alert('Error de red.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-brand/20 selection:text-brand">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">Finaliza tu Compra</h1>
          <p className="text-muted text-lg">Estás a un paso de publicar inmuebles ilimitados.</p>
        </header>

        <div className="bg-surface border border-border shadow-2xl shadow-brand/5 rounded-3xl overflow-hidden flex flex-col md:flex-row">
          {/* Order Summary */}
          <div className="md:w-1/3 bg-muted/5 p-8 border-b md:border-b-0 md:border-r border-border flex flex-col">
            <h2 className="text-xl font-bold mb-6">Resumen del Plan</h2>
            <div className="flex justify-between items-center mb-4 text-foreground/80">
              <span>Suscripción Mensual</span>
              <span className="font-semibold">$29.99</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-foreground/80">
              <span>Impuestos (15%)</span>
              <span className="font-semibold">$4.50</span>
            </div>
            <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-brand">$34.49</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="md:w-2/3 p-8">
            <h2 className="text-xl font-bold mb-6">Método de Pago</h2>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-muted/10 p-1.5 rounded-2xl">
              <button 
                onClick={() => setActiveTab('payphone')}
                className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all ${activeTab === 'payphone' ? 'bg-white shadow-sm text-brand' : 'text-muted hover:text-foreground'}`}
              >
                Tarjeta (PayPhone)
              </button>
              <button 
                onClick={() => setActiveTab('deuna')}
                className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all ${activeTab === 'deuna' ? 'bg-white shadow-sm text-brand' : 'text-muted hover:text-foreground'}`}
              >
                DeUna!
              </button>
              <button 
                onClick={() => setActiveTab('transfer')}
                className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all ${activeTab === 'transfer' ? 'bg-white shadow-sm text-brand' : 'text-muted hover:text-foreground'}`}
              >
                Transferencia
              </button>
            </div>

            {/* PayPhone Content */}
            {activeTab === 'payphone' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-muted mb-6">Paga de forma segura y automática con tu tarjeta de crédito o débito a través de PayPhone.</p>
                <div className="bg-muted/10 border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <span className="text-2xl font-bold text-[#F46633]">P</span>
                  </div>
                  <button 
                    onClick={handlePayPhoneClick}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#F46633] text-white font-bold rounded-xl hover:bg-[#D95525] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Procesando...' : 'Pagar con PayPhone'}
                  </button>
                  <p className="text-xs text-muted mt-4">Transacción 100% segura y encriptada.</p>
                </div>
              </div>
            )}

            {/* DeUna Content */}
            {activeTab === 'deuna' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-muted mb-6">Escanea el código QR desde tu app DeUna! y sube el comprobante.</p>
                
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex-shrink-0 mx-auto sm:mx-0">
                    <div className="w-40 h-40 bg-muted/20 flex items-center justify-center border-2 border-dashed border-border rounded-xl">
                      <span className="text-muted text-sm font-semibold">QR de Empresa</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-semibold mb-2">Sube tu comprobante</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                      className="block w-full text-sm text-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 transition-all border border-border rounded-xl p-2 bg-surface"
                    />
                    <button 
                      onClick={() => handleManualPayment('DEUNA')}
                      disabled={isSubmitting || !file}
                      className="w-full mt-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Enviando...' : 'Confirmar Pago'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Content */}
            {activeTab === 'transfer' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-muted mb-6">Realiza una transferencia directa a nuestras cuentas y sube el recibo.</p>
                
                <div className="bg-muted/10 border border-border rounded-2xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted">Banco</p>
                      <p className="font-semibold text-foreground">Banco Pichincha</p>
                    </div>
                    <div>
                      <p className="text-muted">Tipo de Cuenta</p>
                      <p className="font-semibold text-foreground">Corriente</p>
                    </div>
                    <div>
                      <p className="text-muted">Número</p>
                      <p className="font-semibold text-foreground">2100xxxxxx</p>
                    </div>
                    <div>
                      <p className="text-muted">Titular</p>
                      <p className="font-semibold text-foreground">Inmobiliaria S.A.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Sube tu comprobante</label>
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="block w-full text-sm text-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 transition-all border border-border rounded-xl p-2 bg-surface"
                  />
                  <button 
                    onClick={() => handleManualPayment('TRANSFER')}
                    disabled={isSubmitting || !file}
                    className="w-full mt-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Enviando...' : 'Confirmar Pago'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
