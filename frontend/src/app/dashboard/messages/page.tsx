'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else if (res.status === 401) {
        localStorage.removeItem('access_token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem('access_token');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${id}/mark_read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchMessages(); // refresh
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-brand/20 selection:text-brand">
      <Header />

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 flex flex-col md:flex-row gap-10">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/10 transition-colors text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Resumen
          </Link>
          <Link href="/dashboard/properties" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/10 transition-colors text-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Mis Propiedades
          </Link>
          <Link href="/dashboard/messages" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand/10 text-brand font-semibold transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Mensajes
          </Link>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bandeja de Entrada</h1>
            <p className="text-muted">Revisa las consultas de tus prospectos.</p>
          </header>

          <div className="bg-surface border border-border shadow-2xl shadow-brand/5 rounded-3xl overflow-hidden min-h-[500px]">
            {loading ? (
              <div className="p-10 text-center text-muted animate-pulse">
                Cargando mensajes...
              </div>
            ) : messages.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mb-4 text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">No hay mensajes aún</h3>
                <p className="text-muted max-w-sm">
                  Cuando los clientes interesados te envíen un mensaje interno, aparecerá aquí.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`p-6 transition-colors ${msg.is_read ? 'bg-transparent hover:bg-muted/5' : 'bg-brand/5 hover:bg-brand/10'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold">
                          {msg.sender_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{msg.sender_name}</p>
                          <p className="text-xs text-muted">{new Date(msg.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      {!msg.is_read && (
                        <button 
                          onClick={() => markAsRead(msg.id)}
                          className="text-xs font-semibold text-brand hover:underline"
                        >
                          Marcar como leído
                        </button>
                      )}
                    </div>
                    <p className="text-foreground/90 mt-4 leading-relaxed bg-white border border-border p-4 rounded-xl shadow-sm">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
