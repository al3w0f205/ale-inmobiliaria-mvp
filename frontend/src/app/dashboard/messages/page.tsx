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
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${id}/mark_read/`, {
        method: 'POST',
        credentials: 'include'
      });
      fetchMessages(); // refresh
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <div className="w-full h-[800px] flex flex-col bg-surface border border-border shadow-2xl shadow-brand/5 rounded-3xl overflow-hidden relative">
      <header className="px-8 py-6 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-2xl font-bold mb-1">Centro de Mensajes</h1>
        <p className="text-muted text-sm font-medium">Chat en vivo con clientes potenciales.</p>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted font-medium animate-pulse">
            Sincronizando mensajes...
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
            <div className="flex flex-col">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`p-6 border-b border-border/50 transition-all ${msg.is_read ? 'bg-transparent hover:bg-muted/5' : 'bg-brand/5 border-l-4 border-l-brand hover:bg-brand/10'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand to-accent text-white flex items-center justify-center font-bold text-lg shadow-md">
                        {msg.sender_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-lg">{msg.sender_name}</p>
                        <p className="text-xs text-muted font-medium">{new Date(msg.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    {!msg.is_read && (
                      <button 
                        onClick={() => markAsRead(msg.id)}
                        className="text-xs font-bold text-brand hover:text-brand-hover bg-brand/10 px-3 py-1.5 rounded-full transition-colors"
                      >
                        Marcar como leído
                      </button>
                    )}
                  </div>
                  <div className="ml-16">
                    <p className="text-foreground/90 leading-relaxed bg-background border border-border p-5 rounded-2xl rounded-tl-sm shadow-sm relative">
                      <span className="absolute -left-2 top-0 w-4 h-4 bg-background border-l border-t border-border rotate-[-45deg] transform origin-top-right"></span>
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
