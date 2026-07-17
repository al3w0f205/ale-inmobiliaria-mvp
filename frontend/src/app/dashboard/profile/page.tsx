'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      // Create FormData to handle possible avatar upload in the future
      const formData = new FormData();
      formData.append('bio', profile.bio || '');
      formData.append('phone_number', profile.phone_number || '');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, {
        method: 'PATCH',
        body: formData,
        credentials: 'include'
      });

      if (res.ok) {
        setMessage('Perfil actualizado correctamente.');
      } else {
        const data = await res.json();
        setError(data.detail || 'Error al actualizar el perfil.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
          <h1 className="text-3xl font-black text-foreground mb-8">Mi Perfil</h1>

          {error && <div className="mb-6 p-4 bg-red-500/10 text-red-500 rounded-xl font-medium">{error}</div>}
          {message && <div className="mb-6 p-4 bg-green-500/10 text-green-500 rounded-xl font-medium">{message}</div>}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={profile?.username || ''} 
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-muted cursor-not-allowed font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={profile?.email || ''} 
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-muted cursor-not-allowed font-medium" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Teléfono</label>
              <input 
                type="text" 
                value={profile?.phone_number || ''}
                onChange={e => setProfile({...profile, phone_number: e.target.value})}
                placeholder="+56 9 1234 5678"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Biografía (Bio)</label>
              <textarea 
                value={profile?.bio || ''}
                onChange={e => setProfile({...profile, bio: e.target.value})}
                placeholder="Cuéntanos un poco sobre ti..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 focus:bg-background focus:ring-2 focus:ring-brand/30 outline-none font-medium transition-all resize-none" 
              />
            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
