'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('client');
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
          user_type: userType 
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
          const loginData = await loginRes.json();
          localStorage.setItem('access_token', loginData.access);
          localStorage.setItem('refresh_token', loginData.refresh);
          localStorage.setItem('username', username);
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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md p-8 glass rounded-2xl border border-border shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-foreground">Crear Cuenta</h2>
        {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm break-all">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
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
            <label className="block text-sm font-medium text-muted mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Tipo de Cuenta</label>
            <select 
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-brand/30 outline-none cursor-pointer"
            >
              <option value="client">Cliente (Busco Propiedades)</option>
              <option value="broker">Corredor (Publico Propiedades)</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-hover transition-colors">
            Registrar
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tienes cuenta? <Link href="/login" className="text-brand hover:underline">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}
