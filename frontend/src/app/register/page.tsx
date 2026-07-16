'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('client');
  const [brokerCode, setBrokerCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          user_type: userType,
          broker_code: brokerCode
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Auto-login after register
        const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        if (loginRes.ok) {
          window.dispatchEvent(new Event('authChange'));
          router.push('/');
        } else {
          router.push('/login');
        }
      } else {
        // Extraer el primer error del objeto JSON de forma amigable
        let errorMsg = 'Error en el registro';
        if (data && typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          errorMsg = `${firstKey}: ${data[firstKey][0]}`;
        }
        setError(errorMsg);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden selection:bg-brand/20 selection:text-brand">
      
      {/* Fondo Dinámico Premium (Grid + Aurora) */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand/20 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md p-8 sm:p-10 bg-surface/80 backdrop-blur-2xl rounded-[2rem] border border-border shadow-2xl shadow-brand/5 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 my-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-black tracking-tighter text-foreground">
              MVP <span className="text-brand">Inmobiliario</span>
            </span>
          </Link>
          <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Crear Cuenta</h2>
          <p className="text-sm text-muted font-medium">Únete a la plataforma inmobiliaria líder</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium break-all">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
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
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Tipo de Cuenta</label>
            <select 
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all cursor-pointer appearance-none"
            >
              <option value="client">Cliente (Busco Propiedades)</option>
              <option value="broker">Corredor (Publico Propiedades)</option>
            </select>
          </div>
          {userType === 'broker' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-black text-brand uppercase tracking-widest mb-2">Código de Invitación (VIP2026)</label>
              <input 
                type="text" 
                value={brokerCode}
                onChange={(e) => setBrokerCode(e.target.value)}
                placeholder="Ingresa tu código"
                className="w-full px-4 py-3.5 rounded-xl border border-brand/30 bg-brand/5 focus:bg-brand/10 focus:ring-2 focus:ring-brand/40 outline-none font-bold text-brand transition-all" 
                required
              />
            </div>
          )}
          <button type="submit" className="w-full py-4 mt-4 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition-all active:scale-95 shadow-lg shadow-brand/20">
            Completar Registro
          </button>
        </form>
        <p className="mt-8 text-center text-sm font-medium text-muted">
          ¿Ya tienes cuenta? <Link href="/login" className="text-brand hover:underline font-bold">Inicia Sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
