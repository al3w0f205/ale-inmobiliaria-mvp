'use client';

import React, { useState } from 'react';

export default function ContactBrokerCard({ broker, propertyId, propertyTitle }: { broker: any, propertyId: string, propertyTitle: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState(`Hola, me interesa la propiedad: ${propertyTitle}`);
  const [isSending, setIsSending] = useState(false);

  const handleWhatsApp = () => {
    // Si el corredor tiene teléfono lo usamos, caso contrario un default
    const phone = broker?.phone_number || "593999999999";
    const text = encodeURIComponent(`Hola, vi la propiedad "${propertyTitle}" en el MVP Inmobiliario y quisiera más información.`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
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
      <div className="flex items-center gap-3 mt-3 mb-5">
        <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-lg">
          {broker?.name?.charAt(0) || broker?.username?.charAt(0) || 'C'}
        </div>
        <div>
          <p className="font-bold">{broker?.name || broker?.username || 'Corredor Anónimo'}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted">Agente Verificado</span>
            <span className="text-muted/30 text-xs">•</span>
            <div className="flex items-center text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-xs font-bold text-foreground ml-1">4.9</span>
              <span className="text-xs text-muted ml-0.5">(24)</span>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleWhatsApp}
        className="w-full bg-[#25D366] text-white font-semibold py-3.5 rounded-xl hover:bg-[#1DA851] transition-all active:scale-95 shadow-md mb-3 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        Escribir por WhatsApp
      </button>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-surface border border-border text-foreground font-semibold py-3.5 rounded-xl hover:bg-background transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        Mensaje Interno
      </button>

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
    </>
  );
}
