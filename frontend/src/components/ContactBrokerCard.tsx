'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ContactBrokerCard({ broker, propertyId, propertyTitle }: { broker: any, propertyId: string, propertyTitle: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'whatsapp' | 'message' | null>(null);
  
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [message, setMessage] = useState(`Hola, me interesa la propiedad: ${propertyTitle}`);
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  const executeWhatsApp = () => {
    const phone = broker?.whatsapp_number || broker?.phone || "593999999999";
    const text = encodeURIComponent(`Hola, vi la propiedad "${propertyTitle}" en el MVP Inmobiliario y quisiera más información.`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  const [loggedInUsername, setLoggedInUsername] = useState<string | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setLoggedInUsername(data.username);
        } else {
          setLoggedInUsername(null);
        }
      } catch (err) {
        setLoggedInUsername(null);
      }
    };
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  const handleWhatsApp = () => {
    if (!loggedInUsername) {
      setPendingAction('whatsapp');
      setShowAuthModal(true);
      return;
    }
    executeWhatsApp();
  };

  const handleSendMessageClick = () => {
    if (!loggedInUsername) {
      setPendingAction('message');
      setShowAuthModal(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        window.dispatchEvent(new Event('authChange'));
        setShowAuthModal(false);
        if (pendingAction === 'whatsapp') {
          executeWhatsApp();
        } else if (pendingAction === 'message') {
          setIsModalOpen(true);
        }
      } else {
        setLoginError(data.detail || 'Credenciales inválidas');
      }
    } catch (err) {
      setLoginError('Error de conexión');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSendMessage = async () => {
    setIsSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          receiver: broker.id,
          property: propertyId,
          content: message
        })
      });

      if (res.ok) {
        alert("Mensaje enviado exitosamente. El corredor se pondrá en contacto pronto.");
        setIsModalOpen(false);
      } else {
        alert("Hubo un error al enviar el mensaje.");
      }
    } catch (err) {
      alert("Error de red al enviar el mensaje.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 mt-3 mb-5 p-4 rounded-2xl bg-background/30 border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-brand-light flex items-center justify-center text-brand font-bold text-xl border border-border shrink-0">
            {broker?.avatar ? (
              <img src={broker.avatar} alt={broker.name || broker.username} className="w-full h-full object-cover" />
            ) : (
              (broker?.name?.charAt(0) || broker?.username?.charAt(0) || 'C').toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground flex items-center gap-1.5 truncate">
              {broker?.name || broker?.username || 'Corredor Anónimo'}
              {broker?.identity_verified && (
                <svg className="w-4 h-4 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24">
                  <title>Identidad Verificada</title>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              )}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase border ${
                broker?.identity_verified ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted/10 text-muted border-border'
              }`}>
                {broker?.identity_verified ? 'Verificado' : 'Registrado'}
              </span>
              <span className="text-muted/30 text-xs">•</span>
              <div className="flex items-center text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span className="text-xs font-bold text-foreground ml-1">{broker?.average_rating > 0 ? broker.average_rating : 'Nuevo'}</span>
                <span className="text-xs text-muted ml-0.5">{broker?.review_count > 0 ? `(${broker.review_count})` : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles de la Empresa */}
        {(broker?.company_name || broker?.office_address) && (
          <div className="pt-3 border-t border-border/50 text-xs space-y-2 text-muted">
            {broker?.company_name && (
              <div className="flex items-center gap-2">
                {broker?.company_logo ? (
                  <img src={broker.company_logo} alt={broker.company_name} className="w-5 h-5 rounded object-contain border border-border" />
                ) : (
                  <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                )}
                <span className="font-semibold text-foreground">{broker.company_name}</span>
              </div>
            )}
            {broker?.office_address && (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-muted shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="leading-snug">{broker.office_address}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={handleWhatsApp}
        className="w-full bg-[#25D366] text-white font-semibold py-3.5 rounded-xl hover:bg-[#1DA851] transition-all active:scale-95 shadow-md mb-3 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        Escribir por WhatsApp
      </button>

      <button 
        onClick={handleSendMessageClick}
        className="w-full bg-surface border border-border text-foreground font-semibold py-3.5 rounded-xl hover:bg-background transition-all active:scale-95 flex items-center justify-center gap-2 mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        Mensaje Interno
      </button>

      {/* Redes Sociales del Corredor */}
      {(broker?.instagram_username || broker?.facebook_url) && (
        <div className="flex items-center justify-center gap-4 py-2 text-muted border-t border-border/50">
          <span className="text-[11px] font-bold uppercase tracking-wider">Redes:</span>
          {broker?.instagram_username && (
            <a 
              href={`https://instagram.com/${broker.instagram_username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-muted/10 hover:text-pink-600 transition-colors"
              title="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          )}
          {broker?.facebook_url && (
            <a 
              href={broker.facebook_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-muted/10 hover:text-blue-600 transition-colors"
              title="Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold mb-2">Enviar Mensaje</h3>
            <p className="text-sm text-muted mb-4">Contactando a {broker?.name || broker?.username}.</p>
            
            <textarea
              className="w-full bg-background border border-border rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all mb-4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
            ></textarea>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-muted/20 text-foreground font-semibold rounded-xl hover:bg-muted/30 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={isSending || !message.trim()}
                className="flex-1 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50"
              >
                {isSending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface border border-border rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3 className="text-2xl font-black mb-1">Inicia sesión</h3>
            <p className="text-sm text-muted mb-6">Para contactar al corredor necesitas una cuenta.</p>
            
            {loginError && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium">{loginError}</div>}
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Usuario"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
                  required
                />
              </div>
              <div>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition-all active:scale-95 shadow-lg shadow-brand/20 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isLoggingIn ? 'Verificando...' : 'Acceder y continuar'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm font-medium text-muted">
              ¿No tienes cuenta? <Link href="/register" className="text-brand hover:underline">Regístrate rápido</Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
