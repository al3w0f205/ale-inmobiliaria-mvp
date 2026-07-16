'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Connect to Django Channels WebSocket using dynamic proxy route
    // Usamos 'general' como sala por defecto para el MVP
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${window.location.host}/ws/chat/general/`);

    ws.current.onopen = () => {
      console.log('Connected to chat');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, {
        id: Date.now(),
        sender: data.sender || 'Sistema',
        content: data.message,
        timestamp: new Date().toISOString()
      }]);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !ws.current) return;
    
    // Optimistic update for sender
    const currentMessage = inputValue;
    setMessages((prev) => [...prev, {
      id: Date.now(),
      sender: 'Me',
      content: currentMessage,
      timestamp: new Date().toISOString()
    }]);

    ws.current.send(JSON.stringify({
      message: currentMessage
    }));
    
    setInputValue('');
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-brand text-white rounded-full shadow-xl hover:bg-brand-hover transition-all hover:scale-110 shadow-brand/30 z-50 group"
        >
          <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 h-[500px] max-h-[80vh] shadow-brand/10 transform transition-all duration-300">
          <div className="p-4 bg-brand text-white flex justify-between items-center shadow-sm">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Soporte Inmobiliario
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-background">
            {messages.length === 0 ? (
              <div className="text-center text-muted text-sm mt-10">
                Aún no hay mensajes. ¡Escribe algo para empezar!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.sender === 'Me' ? 'bg-brand text-white self-end rounded-br-sm' : 'bg-surface border border-border text-foreground self-start rounded-bl-sm'}`}>
                  <p className="font-bold text-[10px] opacity-75 mb-1 tracking-wide uppercase">{msg.sender === 'Me' ? 'Tú' : msg.sender}</p>
                  <p className="leading-relaxed">{msg.content}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 border-t border-border bg-surface flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 transition-shadow"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 bg-brand text-white rounded-full hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 disabled:active:scale-100 shadow-md shadow-brand/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
