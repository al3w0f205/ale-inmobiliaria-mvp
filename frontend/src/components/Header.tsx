'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
          setAvatar(data.avatar);
          setIsAdmin(data.is_superuser || data.is_staff || false);
        } else {
          setUsername(null);
          setAvatar(null);
          setIsAdmin(false);
        }
      } catch (err) {
        setUsername(null);
        setIsAdmin(false);
      }
    };
    
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout/`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error('Logout error', e);
    }
    setUsername(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <header className="glass relative z-50 flex h-16 shrink-0 items-center justify-between px-6 shadow-sm border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Link href={username ? "/properties" : "/"} className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-lg shadow-brand/30 group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <path d="M9 21V10l4-2v13" />
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-tight text-foreground hidden sm:block group-hover:text-brand transition-colors">
            LibreCasa
          </h1>
        </Link>
      </div>
      <nav className="flex items-center gap-5">
        {isAdmin ? (
          <Link href="/admin/dashboard" className="text-sm font-medium text-muted hover:text-brand transition-colors hidden md:block">
            Panel Admin
          </Link>
        ) : (
          <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-brand transition-colors hidden md:block">
            Portal de Corredores
          </Link>
        )}
        {username ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-muted/10 transition-all border border-transparent hover:border-border active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-light to-brand/20 text-brand flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white overflow-hidden">
                {avatar ? <img src={avatar} alt={username} className="w-full h-full object-cover" /> : username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-foreground hidden sm:block">{username}</span>
              <svg className={`w-4 h-4 text-muted transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-surface rounded-2xl shadow-2xl border border-border/60 overflow-hidden z-50 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-border/60 bg-muted/5">
                  <p className="text-sm font-bold text-foreground truncate">{username}</p>
                  <p className="text-xs text-brand font-medium mt-0.5">{isAdmin ? 'Administrador' : 'Cuenta Activa'}</p>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <Link 
                    href={isAdmin ? "/admin/dashboard" : "/dashboard"}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-muted/10 rounded-xl transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Mi Dashboard
                  </Link>
                  <Link 
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-muted/10 rounded-xl transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Perfil
                  </Link>
                  <Link 
                    href="/publish"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-muted/10 rounded-xl transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Publicar Propiedad
                  </Link>
                  <ThemeToggle />
                </div>
                <div className="h-px bg-border/60 my-1"></div>
                <div className="p-1.5">
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link 
            href="/login"
            className="px-5 py-2 text-sm font-medium text-foreground transition-all hover:text-brand bg-surface border border-border rounded-full hover:shadow-md hover:border-brand/30 active:scale-95"
          >
            Ingresar
          </Link>
        )}
        <Link href="/publish" className="hidden sm:block px-5 py-2 text-sm font-semibold text-white transition-all bg-gradient-to-r from-brand to-brand-hover rounded-full hover:shadow-lg hover:shadow-brand/25 active:scale-95">
          Publicar
        </Link>
      </nav>
    </header>
  );
}
