'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const uid = searchParams?.get('uid');
  const token = searchParams?.get('token');
  const router = useRouter();

  useEffect(() => {
    if (!uid || !token) {
      setError('Enlace inválido o incompleto. Por favor, solicita un nuevo enlace de recuperación.');
    }
  }, [uid, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password-reset-confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Contraseña actualizada correctamente. Redirigiendo al login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Ocurrió un error al actualizar la contraseña. Es posible que el enlace haya expirado.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden selection:bg-brand/20 selection:text-brand">
      {/* Fondo Dinámico Premium */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand/20 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md p-8 sm:p-10 bg-surface/80 backdrop-blur-2xl rounded-[2rem] border border-border shadow-2xl shadow-brand/5 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-black tracking-tighter text-foreground">
              MVP <span className="text-brand">Inmobiliario</span>
            </span>
          </Link>
          <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Nueva Contraseña</h2>
          <p className="text-sm text-muted font-medium">Ingresa tu nueva contraseña para acceder a tu cuenta</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Nueva Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
              required
              disabled={!uid || !token || isLoading || message !== ''}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Confirmar Contraseña</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
              required
              disabled={!uid || !token || isLoading || message !== ''}
            />
          </div>
          <button 
            type="submit" 
            disabled={!uid || !token || isLoading || message !== ''}
            className="w-full py-4 mt-2 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition-all active:scale-95 shadow-lg shadow-brand/20 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoading ? 'Actualizando...' : 'Guardar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden selection:bg-brand/20 selection:text-brand">
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand/20 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <Suspense fallback={<div className="relative z-10 w-full max-w-md p-8 bg-surface/80 backdrop-blur-2xl rounded-[2rem] border border-border text-center">Cargando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
