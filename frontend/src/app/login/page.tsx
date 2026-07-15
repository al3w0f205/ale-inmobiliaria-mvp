'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('username', username);
        if (data.user_type) {
            localStorage.setItem('user_type', data.user_type);
        }
        // Dispatch custom event to notify other components (like Header)
        window.dispatchEvent(new Event('authChange'));
        router.push('/properties');
      } else {
        setError(data.detail || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden selection:bg-brand/20 selection:text-brand">
      
      {/* Fondo Dinámico Premium (Grid + Aurora) */}
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
          <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Bienvenido de vuelta</h2>
          <p className="text-sm text-muted font-medium">Ingresa a tu cuenta para continuar</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej. alex_broker"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-muted uppercase tracking-widest">Contraseña</label>
              <Link href="#" className="text-xs font-bold text-brand hover:underline">¿Olvidaste tu clave?</Link>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
              required
            />
          </div>
          <button type="submit" className="w-full py-4 mt-2 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition-all active:scale-95 shadow-lg shadow-brand/20">
            Ingresar a la plataforma
          </button>
        </form>
        <p className="mt-8 text-center text-sm font-medium text-muted">
          ¿Aún no tienes cuenta? <Link href="/register" className="text-brand hover:underline font-bold">Regístrate gratis</Link>
        </p>
      </div>
    </div>
  );
}
