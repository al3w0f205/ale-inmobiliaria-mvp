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
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md p-8 glass rounded-2xl border border-border shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-foreground">Iniciar Sesión</h2>
        {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-brand/30 outline-none" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-brand/30 outline-none" 
              required
            />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-hover transition-colors">
            Ingresar
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          ¿No tienes cuenta? <Link href="/register" className="text-brand hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
